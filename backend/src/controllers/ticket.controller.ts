import { Bool, Num, Str } from "chanfana";
import { z } from "zod";
import {
	listCategories,
	listTickets,
	getTicket,
	getTicketByToken,
	createTicket,
	updateTicket,
	deleteTicket,
	listTicketComments,
	createTicketComment,
	listTicketAssignments,
	assignTicket,
	getTicketStats,
} from "../services/tickets";
import {
	type AppContext,
	Ticket,
	TicketCategory,
	TicketCreateSchema,
	TicketUpdateSchema,
	TicketComment,
	TicketCommentCreateSchema,
	TicketAssignment,
	TicketAssignSchema,
} from "../models/types";
import { getTokenPayloadFromRequest } from "../middlewares/auth";

// Category Controllers
export class CategoryList {
	static schema = {
		tags: ["Tickets"],
		summary: "List ticket categories",
		responses: {
			"200": {
				description: "Returns list of ticket categories",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							categories: TicketCategory.array(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const categories = await listCategories(c.env.DB);
		return c.json({ success: true, categories });
	}
}

// Ticket Controllers (Authenticated)
export class TicketList {
	static schema = {
		tags: ["Tickets"],
		summary: "List tickets (authenticated users)",
		request: {
			query: z.object({
				page: z.coerce.number().int().nonnegative().optional(),
				status: z.enum(["open", "in_progress", "waiting", "solved"]).optional(),
				categoryId: z.coerce.number().int().positive().optional(),
				assignedTo: Str({ required: false }),
				searchQuery: Str({ required: false }),
			}),
		},
		responses: {
			"200": {
				description: "Returns list of tickets",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							tickets: Ticket.array(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const query = c.req.query();
		const options: any = {
			page: query.page ? Number(query.page) : 0,
			status: query.status,
			categoryId: query.categoryId ? Number(query.categoryId) : undefined,
			searchQuery: query.searchQuery,
		};

		// Non-admin users only see their assigned tickets
		if (payload.role !== "admin") {
			options.assignedTo = payload.sub;
		} else if (query.assignedTo) {
			options.assignedTo = query.assignedTo;
		}

		const tickets = await listTickets(c.env.DB, options);
		return c.json({ success: true, tickets });
	}
}

export class TicketGet {
	static schema = {
		tags: ["Tickets"],
		summary: "Get a ticket by ID (authenticated users)",
		request: {
			params: z.object({
				ticketId: z.coerce.number().int().positive(),
			}),
		},
		responses: {
			"200": {
				description: "Returns the ticket",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							ticket: Ticket,
						}),
					},
				},
			},
			"404": {
				description: "Ticket not found",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: Str(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const { ticketId } = c.req.param();
		const ticket = await getTicket(c.env.DB, Number(ticketId));

		if (!ticket) {
			return c.json({ success: false, message: "Ticket not found" }, 404);
		}

		// Non-admin users can only access their assigned tickets
		if (payload.role !== "admin" && ticket.assigned_to !== payload.sub) {
			return c.json({ success: false, message: "Access denied" }, 403);
		}

		return c.json({ success: true, ticket });
	}
}

export class TicketUpdate {
	static schema = {
		tags: ["Tickets"],
		summary: "Update a ticket",
		request: {
			params: z.object({
				ticketId: z.coerce.number().int().positive(),
			}),
			body: {
				content: {
					"application/json": {
						schema: TicketUpdateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns the updated ticket",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							ticket: Ticket,
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const { ticketId } = c.req.param();
		const body = await c.req.json();

		const ticket = await getTicket(c.env.DB, Number(ticketId));
		if (!ticket) {
			return c.json({ success: false, message: "Ticket not found" }, 404);
		}

		// Non-admin users can only update their assigned tickets
		if (payload.role !== "admin" && ticket.assigned_to !== payload.sub) {
			return c.json({ success: false, message: "Access denied" }, 403);
		}

		try {
			const updated = await updateTicket(c.env.DB, Number(ticketId), body);
			return c.json({ success: true, ticket: updated });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update ticket";
			return c.json({ success: false, message }, 400);
		}
	}
}

export class TicketDelete {
	static schema = {
		tags: ["Tickets"],
		summary: "Delete a ticket (admin only)",
		request: {
			params: z.object({
				ticketId: z.coerce.number().int().positive(),
			}),
		},
		responses: {
			"200": {
				description: "Returns the deleted ticket",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							ticket: Ticket,
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload || payload.role !== "admin") {
			return c.json({ success: false, message: "Admin access required" }, 403);
		}

		const { ticketId } = c.req.param();

		try {
			const ticket = await deleteTicket(c.env.DB, Number(ticketId));
			return c.json({ success: true, ticket });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete ticket";
			const status = message.includes("not found") ? 404 : 400;
			return c.json({ success: false, message }, status);
		}
	}
}

// Comment Controllers (Authenticated)
export class TicketCommentList {
	static schema = {
		tags: ["Tickets"],
		summary: "List ticket comments",
		request: {
			params: z.object({
				ticketId: z.coerce.number().int().positive(),
			}),
			query: z.object({
				includeInternal: Bool({ required: false }),
			}),
		},
		responses: {
			"200": {
				description: "Returns list of comments",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							comments: TicketComment.array(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const { ticketId } = c.req.param();
		const query = c.req.query();
		const includeInternal = query.includeInternal === "true" && payload.role === "admin";

		const comments = await listTicketComments(c.env.DB, Number(ticketId), includeInternal);
		return c.json({ success: true, comments });
	}
}

export class TicketCommentCreate {
	static schema = {
		tags: ["Tickets"],
		summary: "Add a comment to a ticket",
		request: {
			params: z.object({
				ticketId: z.coerce.number().int().positive(),
			}),
			body: {
				content: {
					"application/json": {
						schema: TicketCommentCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Returns the created comment",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							comment: TicketComment,
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const { ticketId } = c.req.param();
		const body = await c.req.json();

		try {
			const comment = await createTicketComment(
				c.env.DB,
				Number(ticketId),
				body,
				"user",
				payload.sub
			);
			return c.json({ success: true, comment }, 201);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to create comment";
			return c.json({ success: false, message }, 400);
		}
	}
}

// Assignment Controllers
export class TicketAssignmentList {
	static schema = {
		tags: ["Tickets"],
		summary: "List ticket assignment history",
		request: {
			params: z.object({
				ticketId: z.coerce.number().int().positive(),
			}),
		},
		responses: {
			"200": {
				description: "Returns list of assignments",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							assignments: TicketAssignment.array(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const { ticketId } = c.req.param();
		const assignments = await listTicketAssignments(c.env.DB, Number(ticketId));
		return c.json({ success: true, assignments });
	}
}

export class TicketAssign {
	static schema = {
		tags: ["Tickets"],
		summary: "Assign a ticket to a user",
		request: {
			params: z.object({
				ticketId: z.coerce.number().int().positive(),
			}),
			body: {
				content: {
					"application/json": {
						schema: TicketAssignSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Returns the assignment record",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							assignment: TicketAssignment,
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const { ticketId } = c.req.param();
		const body = await c.req.json();

		try {
			const assignment = await assignTicket(c.env.DB, Number(ticketId), body, payload.sub);
			return c.json({ success: true, assignment }, 201);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to assign ticket";
			return c.json({ success: false, message }, 400);
		}
	}
}

// Stats Controller
export class TicketStatsGet {
	static schema = {
		tags: ["Tickets"],
		summary: "Get ticket statistics",
		request: {
			query: z.object({
				assignedTo: Str({ required: false }),
			}),
		},
		responses: {
			"200": {
				description: "Returns ticket statistics",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							stats: z.object({
								total: Num(),
								open: Num(),
								in_progress: Num(),
								waiting: Num(),
								solved: Num(),
							}),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const query = c.req.query();
		const assignedTo = payload.role === "admin" && query.assignedTo ? query.assignedTo : payload.sub;

		const stats = await getTicketStats(c.env.DB, assignedTo);
		return c.json({ success: true, stats });
	}
}

// Public Controllers (for guests)
export class PublicTicketCreate {
	static schema = {
		tags: ["Tickets - Public"],
		summary: "Submit a ticket (no authentication required)",
		request: {
			body: {
				content: {
					"application/json": {
						schema: TicketCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Returns the created ticket with token",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							ticket: Ticket,
							message: Str(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const body = await c.req.json();

		try {
			const ticket = await createTicket(c.env.DB, body);
			return c.json(
				{
					success: true,
					ticket,
					message: `Ticket created successfully. Use token ${ticket.token} to track your ticket.`,
				},
				201
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to create ticket";
			return c.json({ success: false, message }, 400);
		}
	}
}

export class PublicTicketGetByToken {
	static schema = {
		tags: ["Tickets - Public"],
		summary: "Get ticket details by token (no authentication required)",
		request: {
			params: z.object({
				token: Str(),
			}),
		},
		responses: {
			"200": {
				description: "Returns the ticket details",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							ticket: Ticket,
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const { token } = c.req.param();
		const ticket = await getTicketByToken(c.env.DB, token);

		if (!ticket) {
			return c.json({ success: false, message: "Ticket not found" }, 404);
		}

		return c.json({ success: true, ticket });
	}
}

export class PublicTicketCommentCreate {
	static schema = {
		tags: ["Tickets - Public"],
		summary: "Add a comment to a ticket using token (no authentication required)",
		request: {
			params: z.object({
				token: Str(),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							comment_text: Str(),
							commenter_name: Str({ required: false }),
						}),
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Returns the created comment",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							comment: TicketComment,
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const { token } = c.req.param();
		const body = await c.req.json();

		const ticket = await getTicketByToken(c.env.DB, token);
		if (!ticket) {
			return c.json({ success: false, message: "Ticket not found" }, 404);
		}

		try {
			const comment = await createTicketComment(
				c.env.DB,
				ticket.id as number,
				{ comment_text: body.comment_text, is_internal: false },
				"guest",
				body.commenter_name || ticket.submitter_name || "Guest"
			);
			return c.json({ success: true, comment }, 201);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to create comment";
			return c.json({ success: false, message }, 400);
		}
	}
}

export class PublicTicketCommentList {
	static schema = {
		tags: ["Tickets - Public"],
		summary: "List ticket comments by token (no authentication required)",
		request: {
			params: z.object({
				token: Str(),
			}),
		},
		responses: {
			"200": {
				description: "Returns list of comments",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							comments: TicketComment.array(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const { token } = c.req.param();

		const ticket = await getTicketByToken(c.env.DB, token);
		if (!ticket) {
			return c.json({ success: false, message: "Ticket not found" }, 404);
		}

		// Only show non-internal comments to public
		const comments = await listTicketComments(c.env.DB, ticket.id as number, false);
		return c.json({ success: true, comments });
	}
}
