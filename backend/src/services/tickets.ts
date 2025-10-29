import type { D1Database } from "@cloudflare/workers-types";
import { z } from "zod";
import { TicketCreateSchema, TicketUpdateSchema, TicketCommentCreateSchema, TicketAssignSchema } from "../models/types";

// Helper function to generate unique ticket token
function generateTicketToken(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let token = "TKT-";
	for (let i = 0; i < 8; i++) {
		token += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return token;
}

// Category operations
export async function listCategories(db: D1Database) {
	const result = await db.prepare("SELECT * FROM ticket_categories ORDER BY name").all();
	return result.results;
}

export async function getCategory(db: D1Database, categoryId: number) {
	const result = await db.prepare("SELECT * FROM ticket_categories WHERE id = ?").bind(categoryId).first();
	return result;
}

// Ticket operations
export async function listTickets(
	db: D1Database,
	options: {
		page?: number;
		status?: string;
		categoryId?: number;
		assignedTo?: string;
		searchQuery?: string;
	} = {}
) {
	const { page = 0, status, categoryId, assignedTo, searchQuery } = options;
	const limit = 20;
	const offset = page * limit;

	let query = `
		SELECT t.*, tc.name as category_name 
		FROM tickets t
		LEFT JOIN ticket_categories tc ON t.category_id = tc.id
		WHERE 1=1
	`;
	const params: any[] = [];

	if (status) {
		query += " AND t.status = ?";
		params.push(status);
	}

	if (categoryId) {
		query += " AND t.category_id = ?";
		params.push(categoryId);
	}

	if (assignedTo) {
		query += " AND t.assigned_to = ?";
		params.push(assignedTo);
	}

	if (searchQuery) {
		query += " AND (t.title LIKE ? OR t.description LIKE ?)";
		params.push(`%${searchQuery}%`, `%${searchQuery}%`);
	}

	query += " ORDER BY t.created_at DESC LIMIT ? OFFSET ?";
	params.push(limit, offset);

	const stmt = db.prepare(query);
	const result = await stmt.bind(...params).all();
	return result.results;
}

export async function getTicket(db: D1Database, ticketId: number) {
	const result = await db
		.prepare(
			`SELECT t.*, tc.name as category_name 
			FROM tickets t
			LEFT JOIN ticket_categories tc ON t.category_id = tc.id
			WHERE t.id = ?`
		)
		.bind(ticketId)
		.first();
	return result;
}

export async function getTicketByToken(db: D1Database, token: string) {
	const result = await db
		.prepare(
			`SELECT t.*, tc.name as category_name 
			FROM tickets t
			LEFT JOIN ticket_categories tc ON t.category_id = tc.id
			WHERE t.token = ?`
		)
		.bind(token)
		.first();
	return result;
}

export async function createTicket(
	db: D1Database,
	data: z.infer<typeof TicketCreateSchema>,
	createdBy?: string
) {
	const token = generateTicketToken();
	const now = new Date().toISOString();

	// Validate category exists
	const category = await getCategory(db, data.category_id);
	if (!category) {
		throw new Error("Category not found");
	}

	const result = await db
		.prepare(
			`INSERT INTO tickets (
				token, title, description, category_id, status, priority,
				submitter_name, submitter_email, reference_link, assigned_to,
				created_at, updated_at
			) VALUES (?, ?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?)
			RETURNING *`
		)
		.bind(
			token,
			data.title,
			data.description,
			data.category_id,
			data.priority || "medium",
			data.submitter_name || null,
			data.submitter_email || null,
			data.reference_link || null,
			createdBy || null,
			now,
			now
		)
		.first();

	return result;
}

export async function updateTicket(
	db: D1Database,
	ticketId: number,
	data: z.infer<typeof TicketUpdateSchema>
) {
	const existing = await getTicket(db, ticketId);
	if (!existing) {
		throw new Error("Ticket not found");
	}

	// Validate category if being updated
	if (data.category_id) {
		const category = await getCategory(db, data.category_id);
		if (!category) {
			throw new Error("Category not found");
		}
	}

	const fields: string[] = [];
	const values: any[] = [];

	if (data.title !== undefined) {
		fields.push("title = ?");
		values.push(data.title);
	}
	if (data.description !== undefined) {
		fields.push("description = ?");
		values.push(data.description);
	}
	if (data.category_id !== undefined) {
		fields.push("category_id = ?");
		values.push(data.category_id);
	}
	if (data.status !== undefined) {
		fields.push("status = ?");
		values.push(data.status);
	}
	if (data.priority !== undefined) {
		fields.push("priority = ?");
		values.push(data.priority);
	}
	if (data.assigned_to !== undefined) {
		fields.push("assigned_to = ?");
		values.push(data.assigned_to);
	}

	fields.push("updated_at = ?");
	values.push(new Date().toISOString());

	values.push(ticketId);

	const query = `UPDATE tickets SET ${fields.join(", ")} WHERE id = ? RETURNING *`;
	const result = await db.prepare(query).bind(...values).first();

	return result;
}

export async function deleteTicket(db: D1Database, ticketId: number) {
	const existing = await getTicket(db, ticketId);
	if (!existing) {
		throw new Error("Ticket not found");
	}

	await db.prepare("DELETE FROM tickets WHERE id = ?").bind(ticketId).run();
	return existing;
}

// Comment operations
export async function listTicketComments(db: D1Database, ticketId: number, includeInternal = false) {
	let query = "SELECT * FROM ticket_comments WHERE ticket_id = ?";
	const params: any[] = [ticketId];

	if (!includeInternal) {
		query += " AND is_internal = 0";
	}

	query += " ORDER BY created_at ASC";

	const result = await db.prepare(query).bind(...params).all();
	return result.results;
}

export async function createTicketComment(
	db: D1Database,
	ticketId: number,
	data: z.infer<typeof TicketCommentCreateSchema>,
	commenterType: "guest" | "user",
	commenterName: string
) {
	const ticket = await getTicket(db, ticketId);
	if (!ticket) {
		throw new Error("Ticket not found");
	}

	// Don't allow comments on solved tickets
	if (ticket.status === "solved") {
		throw new Error("Cannot comment on solved tickets");
	}

	const now = new Date().toISOString();

	const result = await db
		.prepare(
			`INSERT INTO ticket_comments (
				ticket_id, commenter_type, commenter_name, comment_text, is_internal, created_at
			) VALUES (?, ?, ?, ?, ?, ?)
			RETURNING *`
		)
		.bind(ticketId, commenterType, commenterName, data.comment_text, data.is_internal ? 1 : 0, now)
		.first();

	// Update ticket's updated_at timestamp
	await db.prepare("UPDATE tickets SET updated_at = ? WHERE id = ?").bind(now, ticketId).run();

	return result;
}

// Assignment operations
export async function listTicketAssignments(db: D1Database, ticketId: number) {
	const result = await db
		.prepare("SELECT * FROM ticket_assignments WHERE ticket_id = ? ORDER BY created_at DESC")
		.bind(ticketId)
		.all();
	return result.results;
}

export async function assignTicket(
	db: D1Database,
	ticketId: number,
	data: z.infer<typeof TicketAssignSchema>,
	assignedBy: string
) {
	const ticket = await getTicket(db, ticketId);
	if (!ticket) {
		throw new Error("Ticket not found");
	}

	const now = new Date().toISOString();

	// Create assignment record
	const assignment = await db
		.prepare(
			`INSERT INTO ticket_assignments (
				ticket_id, assigned_from, assigned_to, assigned_by, notes, created_at
			) VALUES (?, ?, ?, ?, ?, ?)
			RETURNING *`
		)
		.bind(ticketId, ticket.assigned_to || null, data.assigned_to, assignedBy, data.notes || null, now)
		.first();

	// Update ticket
	await db
		.prepare("UPDATE tickets SET assigned_to = ?, updated_at = ? WHERE id = ?")
		.bind(data.assigned_to, now, ticketId)
		.run();

	return assignment;
}

// Stats
export async function getTicketStats(db: D1Database, assignedTo?: string) {
	let query = `
		SELECT 
			COUNT(*) as total,
			SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
			SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
			SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END) as waiting,
			SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) as solved
		FROM tickets
	`;

	const params: any[] = [];
	if (assignedTo) {
		query += " WHERE assigned_to = ?";
		params.push(assignedTo);
	}

	const result = await db.prepare(query).bind(...params).first();
	return result;
}
