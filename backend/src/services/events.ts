import type { AttendeeStatus } from "../models/types";

interface Event {
	id: string;
	title: string;
	description?: string;
	event_date: string;
	location?: string;
	created_by: string;
	created_at?: string;
	updated_at?: string;
}

interface EventAttendee {
	id: string;
	event_id: string;
	user_username: string;
	attendance_token: string;
	status: AttendeeStatus;
	registered_at?: string;
}

interface EventAdmin {
	id: string;
	event_id: string;
	user_username: string;
	assigned_by: string;
	assigned_at?: string;
}

interface AttendanceScan {
	id: string;
	attendee_id: string;
	scanned_by: string;
	scanned_at?: string;
	latitude?: number;
	longitude?: number;
}

// Generate unique ID using crypto for security
function generateId(prefix: string): string {
	return `${prefix}-${crypto.randomUUID()}`;
}

// Generate secure random token for QR code
function generateToken(): string {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Event CRUD operations
export async function listEvents(
	db: D1Database,
	filters?: { created_by?: string; limit?: number; offset?: number }
): Promise<Event[]> {
	let query = "SELECT * FROM events";
	const params: any[] = [];

	if (filters?.created_by) {
		query += " WHERE created_by = ?";
		params.push(filters.created_by);
	}

	query += " ORDER BY event_date DESC";

	// Add pagination with sensible defaults
	const limit = filters?.limit ?? 50;
	const offset = filters?.offset ?? 0;
	query += " LIMIT ? OFFSET ?";
	params.push(limit, offset);

	const result = await db.prepare(query).bind(...params).all();
	return result.results as unknown as Event[];
}

export async function getEvent(db: D1Database, eventId: string): Promise<Event | null> {
	const result = await db
		.prepare("SELECT * FROM events WHERE id = ?")
		.bind(eventId)
		.first();
	return result as unknown as Event | null;
}

export async function createEvent(
	db: D1Database,
	data: { title: string; description?: string; event_date: string; location?: string; created_by: string }
): Promise<Event> {
	const id = generateId("event");
	const now = new Date().toISOString();

	await db
		.prepare(
			"INSERT INTO events (id, title, description, event_date, location, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
		)
		.bind(id, data.title, data.description || null, data.event_date, data.location || null, data.created_by, now, now)
		.run();

	const event = await getEvent(db, id);
	if (!event) throw new Error("Failed to create event");
	return event;
}

export async function updateEvent(
	db: D1Database,
	eventId: string,
	data: { title?: string; description?: string; event_date?: string; location?: string }
): Promise<Event> {
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
	if (data.event_date !== undefined) {
		fields.push("event_date = ?");
		values.push(data.event_date);
	}
	if (data.location !== undefined) {
		fields.push("location = ?");
		values.push(data.location);
	}

	fields.push("updated_at = ?");
	values.push(new Date().toISOString());

	const query = `UPDATE events SET ${fields.join(", ")} WHERE id = ?`;
	values.push(eventId);

	await db.prepare(query).bind(...values).run();

	const event = await getEvent(db, eventId);
	if (!event) throw new Error("Event not found");
	return event;
}

export async function deleteEvent(db: D1Database, eventId: string): Promise<void> {
	await db.prepare("DELETE FROM events WHERE id = ?").bind(eventId).run();
}

// Event attendee operations
export async function listEventAttendees(db: D1Database, eventId: string): Promise<EventAttendee[]> {
	const result = await db
		.prepare("SELECT * FROM event_attendees WHERE event_id = ? ORDER BY registered_at ASC")
		.bind(eventId)
		.all();
	return result.results as unknown as EventAttendee[];
}

export async function getEventAttendee(db: D1Database, attendeeId: string): Promise<EventAttendee | null> {
	const result = await db
		.prepare("SELECT * FROM event_attendees WHERE id = ?")
		.bind(attendeeId)
		.first();
	return result as unknown as EventAttendee | null;
}

export async function getEventAttendeeByToken(db: D1Database, token: string): Promise<EventAttendee | null> {
	const result = await db
		.prepare("SELECT * FROM event_attendees WHERE attendance_token = ?")
		.bind(token)
		.first();
	return result as unknown as EventAttendee | null;
}

export async function registerForEvent(
	db: D1Database,
	eventId: string,
	username: string
): Promise<EventAttendee> {
	// Check if user is already registered
	const existing = await db
		.prepare("SELECT * FROM event_attendees WHERE event_id = ? AND user_username = ?")
		.bind(eventId, username)
		.first();

	if (existing) {
		throw new Error("User already registered for this event");
	}

	const id = generateId("attendee");
	const token = generateToken();
	const now = new Date().toISOString();

	await db
		.prepare(
			"INSERT INTO event_attendees (id, event_id, user_username, attendance_token, status, registered_at) VALUES (?, ?, ?, ?, ?, ?)"
		)
		.bind(id, eventId, username, token, "registered", now)
		.run();

	const attendee = await getEventAttendee(db, id);
	if (!attendee) throw new Error("Failed to register for event");
	return attendee;
}

export async function updateAttendeeStatus(
	db: D1Database,
	attendeeId: string,
	status: AttendeeStatus
): Promise<EventAttendee> {
	await db
		.prepare("UPDATE event_attendees SET status = ? WHERE id = ?")
		.bind(status, attendeeId)
		.run();

	const attendee = await getEventAttendee(db, attendeeId);
	if (!attendee) throw new Error("Attendee not found");
	return attendee;
}

export async function unregisterFromEvent(db: D1Database, attendeeId: string): Promise<void> {
	await db.prepare("DELETE FROM event_attendees WHERE id = ?").bind(attendeeId).run();
}

// Event admin operations
export async function listEventAdmins(db: D1Database, eventId: string): Promise<EventAdmin[]> {
	const result = await db
		.prepare("SELECT * FROM event_admins WHERE event_id = ? ORDER BY assigned_at ASC")
		.bind(eventId)
		.all();
	return result.results as unknown as EventAdmin[];
}

export async function assignEventAdmin(
	db: D1Database,
	eventId: string,
	username: string,
	assignedBy: string
): Promise<EventAdmin> {
	// Check if user is already admin
	const existing = await db
		.prepare("SELECT * FROM event_admins WHERE event_id = ? AND user_username = ?")
		.bind(eventId, username)
		.first();

	if (existing) {
		throw new Error("User is already an admin for this event");
	}

	const id = generateId("eventadmin");
	const now = new Date().toISOString();

	await db
		.prepare(
			"INSERT INTO event_admins (id, event_id, user_username, assigned_by, assigned_at) VALUES (?, ?, ?, ?, ?)"
		)
		.bind(id, eventId, username, assignedBy, now)
		.run();

	const admin = await db
		.prepare("SELECT * FROM event_admins WHERE id = ?")
		.bind(id)
		.first();

	if (!admin) throw new Error("Failed to assign admin");
	return admin as unknown as EventAdmin;
}

export async function removeEventAdmin(db: D1Database, eventId: string, username: string): Promise<void> {
	await db
		.prepare("DELETE FROM event_admins WHERE event_id = ? AND user_username = ?")
		.bind(eventId, username)
		.run();
}

export async function isEventAdmin(db: D1Database, eventId: string, username: string): Promise<boolean> {
	// Single query to check both creator and admin status
	const result = await db
		.prepare(`
			SELECT 1 as is_admin FROM events 
			WHERE id = ? AND created_by = ?
			UNION ALL
			SELECT 1 as is_admin FROM event_admins 
			WHERE event_id = ? AND user_username = ?
			LIMIT 1
		`)
		.bind(eventId, username, eventId, username)
		.first();

	return !!result;
}

// Attendance scan operations
export async function recordAttendanceScan(
	db: D1Database,
	token: string,
	scannedBy: string,
	location?: { latitude: number; longitude: number }
): Promise<{ attendee: EventAttendee; scan: AttendanceScan; isFirstScan: boolean }> {
	// Find attendee by token
	const attendee = await getEventAttendeeByToken(db, token);
	if (!attendee) {
		throw new Error("Invalid attendance token");
	}

	// Check if this is the first scan
	const existingScans = await db
		.prepare("SELECT * FROM attendance_scans WHERE attendee_id = ?")
		.bind(attendee.id)
		.all();

	const isFirstScan = existingScans.results.length === 0;

	// Record the scan
	const scanId = generateId("scan");
	const now = new Date().toISOString();

	await db
		.prepare(
			"INSERT INTO attendance_scans (id, attendee_id, scanned_by, scanned_at, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)"
		)
		.bind(scanId, attendee.id, scannedBy, now, location?.latitude || null, location?.longitude || null)
		.run();

	// If first scan, update attendee status to 'present'
	if (isFirstScan) {
		await updateAttendeeStatus(db, attendee.id, "present");
	}

	const scan = await db
		.prepare("SELECT * FROM attendance_scans WHERE id = ?")
		.bind(scanId)
		.first();

	const updatedAttendee = await getEventAttendee(db, attendee.id);

	if (!scan || !updatedAttendee) {
		throw new Error("Failed to record attendance scan");
	}

	return {
		attendee: updatedAttendee,
		scan: scan as unknown as AttendanceScan,
		isFirstScan,
	};
}

export async function listAttendanceScans(db: D1Database, attendeeId: string): Promise<AttendanceScan[]> {
	const result = await db
		.prepare("SELECT * FROM attendance_scans WHERE attendee_id = ? ORDER BY scanned_at DESC")
		.bind(attendeeId)
		.all();
	return result.results as unknown as AttendanceScan[];
}

export async function getAttendeeWithScans(
	db: D1Database,
	attendeeId: string
): Promise<{ attendee: EventAttendee; scans: AttendanceScan[] } | null> {
	const attendee = await getEventAttendee(db, attendeeId);
	if (!attendee) return null;

	const scans = await listAttendanceScans(db, attendeeId);

	return { attendee, scans };
}

// Get all scans for an event with attendee information
export async function listAllEventScans(db: D1Database, eventId: string): Promise<Array<AttendanceScan & {
	attendee_username: string;
	attendee_status: string;
}>> {
	const result = await db
		.prepare(`
			SELECT 
				s.id,
				s.attendee_id,
				s.scanned_by,
				s.scanned_at,
				s.latitude,
				s.longitude,
				a.user_username as attendee_username,
				a.status as attendee_status
			FROM attendance_scans s
			JOIN event_attendees a ON s.attendee_id = a.id
			WHERE a.event_id = ?
			ORDER BY s.scanned_at ASC
		`)
		.bind(eventId)
		.all();
	return result.results as unknown as Array<AttendanceScan & { attendee_username: string; attendee_status: string }>;
}
