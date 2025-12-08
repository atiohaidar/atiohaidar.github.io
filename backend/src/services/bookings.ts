import { z } from "zod";
import {
	Booking,
	BookingCreateSchema,
	BookingUpdateSchema,
	type BookingStatus,
} from "../models/types";

export type BookingRecord = z.infer<typeof Booking>;

let initializedPromise: Promise<void> | undefined;

const ensureInitialized = async (db: D1Database) => {
	if (!initializedPromise) {
		initializedPromise = (async () => {
			await db.batch([
				db.prepare(`
					CREATE TABLE IF NOT EXISTS bookings (
						id TEXT PRIMARY KEY,
						room_id TEXT NOT NULL,
						user_username TEXT NOT NULL,
						start_time TEXT NOT NULL,
						end_time TEXT NOT NULL,
						status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
						purpose TEXT,
						created_at TEXT DEFAULT CURRENT_TIMESTAMP,
						updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
						FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
						FOREIGN KEY (user_username) REFERENCES users(username) ON DELETE CASCADE
					)
				`),
				db.prepare(`
					CREATE TRIGGER IF NOT EXISTS bookings_updated_at
					AFTER UPDATE ON bookings
					FOR EACH ROW
					BEGIN
						UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
					END
				`),
				db.prepare(`CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id)`),
				db.prepare(`CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_username)`),
				db.prepare(`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`),
				db.prepare(`CREATE INDEX IF NOT EXISTS idx_bookings_time ON bookings(start_time, end_time)`),
			]);
		})();
	}

	await initializedPromise;
};

const toBooking = (row: Record<string, unknown>): BookingRecord => {
	const normalized: Record<string, unknown> = {
		id: row.id,
		room_id: row.room_id,
		user_username: row.user_username,
		start_time: row.start_time,
		end_time: row.end_time,
		status: row.status,
		title: row.purpose ?? 'Untitled Booking', // Map purpose to title
		description: row.purpose ?? undefined, // Also use as description for now
		created_at: row.created_at ?? undefined,
		updated_at: row.updated_at ?? undefined,
	};

	const parsed = Booking.safeParse(normalized);
	if (!parsed.success) {
		throw new Error("Data peminjaman tidak valid di database");
	}

	return parsed.data;
};

/**
 * Generate a unique booking ID using crypto for security
 */
const generateBookingId = () => {
	return `booking-${crypto.randomUUID()}`;
};

/**
 * Check if a room is available for the given time slot
 */
export const checkRoomAvailability = async (
	db: D1Database,
	roomId: string,
	startTime: string,
	endTime: string,
	excludeBookingId?: string,
): Promise<boolean> => {
	await ensureInitialized(db);

	// Check if room exists and is available
	const room = await db
		.prepare("SELECT available FROM rooms WHERE id = ?")
		.bind(roomId)
		.first();

	if (!room || !room.available) {
		return false;
	}

	// Check for overlapping bookings (excluding cancelled and rejected)
	let query = `
		SELECT COUNT(*) as count FROM bookings 
		WHERE room_id = ? 
		AND status IN ('pending', 'approved')
		AND (
			(start_time < ? AND end_time > ?) OR
			(start_time < ? AND end_time > ?) OR
			(start_time >= ? AND end_time <= ?)
		)
	`;
	const bindings: unknown[] = [roomId, endTime, startTime, endTime, startTime, startTime, endTime];

	if (excludeBookingId) {
		query += " AND id != ?";
		bindings.push(excludeBookingId);
	}

	const result = await db.prepare(query).bind(...bindings).first();

	return (result?.count as number) === 0;
};

export const listBookings = async (
	db: D1Database,
	options: {
		username?: string;
		roomId?: string;
		status?: BookingStatus;
	} = {},
) => {
	await ensureInitialized(db);

	const { username, roomId, status } = options;

	let query =
		"SELECT id, room_id, user_username, start_time, end_time, status, purpose, created_at, updated_at FROM bookings WHERE 1=1";
	const bindings: unknown[] = [];

	if (username) {
		query += " AND user_username = ?";
		bindings.push(username);
	}

	if (roomId) {
		query += " AND room_id = ?";
		bindings.push(roomId);
	}

	if (status) {
		query += " AND status = ?";
		bindings.push(status);
	}

	query += " ORDER BY start_time DESC";

	const { results } = await db.prepare(query).bind(...bindings).all();

	return (results ?? []).map((row) => toBooking(row as Record<string, unknown>));
};

export const getBooking = async (db: D1Database, id: string) => {
	await ensureInitialized(db);
	const row = await db
		.prepare(
			"SELECT id, room_id, user_username, start_time, end_time, status, purpose, created_at, updated_at FROM bookings WHERE id = ?",
		)
		.bind(id)
		.first();

	return row ? toBooking(row as Record<string, unknown>) : undefined;
};

export const createBooking = async (
	db: D1Database,
	username: string,
	input: z.infer<typeof BookingCreateSchema>,
) => {
	await ensureInitialized(db);
	const data = BookingCreateSchema.parse(input);

	// Validate time range
	const startTime = new Date(data.start_time);
	const endTime = new Date(data.end_time);

	if (startTime >= endTime) {
		throw new Error("Waktu mulai harus sebelum waktu selesai");
	}

	if (startTime < new Date()) {
		throw new Error("Waktu mulai tidak boleh di masa lalu");
	}

	// Check room availability
	const isAvailable = await checkRoomAvailability(
		db,
		data.room_id,
		data.start_time,
		data.end_time,
	);

	if (!isAvailable) {
		throw new Error("Ruangan tidak tersedia untuk waktu yang dipilih");
	}

	const bookingId = generateBookingId();

	try {
		await db
			.prepare(
				"INSERT INTO bookings (id, room_id, user_username, start_time, end_time, status, purpose) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
			)
			.bind(bookingId, data.room_id, username, data.start_time, data.end_time, data.title ?? 'Untitled Booking')
			.run();
	} catch (error) {
		throw new Error("Gagal membuat peminjaman");
	}

	const booking = await getBooking(db, bookingId);
	if (!booking) {
		throw new Error("Gagal mengambil data peminjaman setelah membuat");
	}

	return booking;
};

export const updateBooking = async (
	db: D1Database,
	id: string,
	username: string,
	input: z.infer<typeof BookingCreateSchema>,
	role: "admin" | "member",
) => {
	await ensureInitialized(db);
	const updates = BookingCreateSchema.parse(input);

	const existing = await getBooking(db, id);
	if (!existing) {
		throw new Error("Peminjaman tidak ditemukan");
	}

	if (role !== "admin" && existing.user_username !== username) {
		throw new Error("Anda tidak memiliki izin untuk memperbarui booking ini");
	}

	const startTime = new Date(updates.start_time);
	const endTime = new Date(updates.end_time);

	if (startTime >= endTime) {
		throw new Error("Waktu mulai harus sebelum waktu selesai");
	}

	if (startTime < new Date()) {
		throw new Error("Waktu mulai tidak boleh di masa lalu");
	}

	const isAvailable = await checkRoomAvailability(
		db,
		updates.room_id,
		updates.start_time,
		updates.end_time,
		id,
	);

	if (!isAvailable) {
		throw new Error("Ruangan tidak tersedia untuk waktu yang dipilih");
	}

	const result = await db
		.prepare(
			"UPDATE bookings SET room_id = ?, start_time = ?, end_time = ?, purpose = ? WHERE id = ?",
		)
		.bind(
			updates.room_id,
			updates.start_time,
			updates.end_time,
			updates.title ?? existing.title ?? "Untitled Booking",
			id,
		)
		.run();

	if ((result.meta?.changes ?? 0) === 0) {
		throw new Error("Peminjaman tidak ditemukan");
	}

	const booking = await getBooking(db, id);
	if (!booking) {
		throw new Error("Gagal mengambil data peminjaman setelah pembaruan");
	}

	return booking;
};

export const updateBookingStatus = async (
	db: D1Database,
	id: string,
	input: z.infer<typeof BookingUpdateSchema>,
) => {
	await ensureInitialized(db);
	const updates = BookingUpdateSchema.parse(input);

	const result = await db
		.prepare("UPDATE bookings SET status = ? WHERE id = ?")
		.bind(updates.status, id)
		.run();

	if ((result.meta?.changes ?? 0) === 0) {
		throw new Error("Peminjaman tidak ditemukan");
	}

	const booking = await getBooking(db, id);
	if (!booking) {
		throw new Error("Gagal mengambil data peminjaman setelah pembaruan");
	}

	return booking;
};

export const cancelBooking = async (db: D1Database, id: string, username: string) => {
	await ensureInitialized(db);

	// Check if booking exists and belongs to user
	const booking = await getBooking(db, id);
	if (!booking) {
		throw new Error("Peminjaman tidak ditemukan");
	}

	if (booking.user_username !== username) {
		throw new Error("Anda tidak memiliki izin untuk membatalkan peminjaman ini");
	}

	if (booking.status === "cancelled" || booking.status === "rejected") {
		throw new Error("Peminjaman sudah dibatalkan atau ditolak");
	}

	const result = await db
		.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?")
		.bind(id)
		.run();

	if ((result.meta?.changes ?? 0) === 0) {
		throw new Error("Gagal membatalkan peminjaman");
	}

	const updated = await getBooking(db, id);
	if (!updated) {
		throw new Error("Gagal mengambil data peminjaman setelah pembatalan");
	}

	return updated;
};
