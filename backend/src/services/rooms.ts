import { z } from "zod";
import { Room, RoomCreateSchema, RoomUpdateSchema } from "../models/types";

export type RoomRecord = z.infer<typeof Room>;

let initializedPromise: Promise<void> | undefined;

const ensureInitialized = async (db: D1Database) => {
	if (!initializedPromise) {
		initializedPromise = (async () => {
			await db.batch([
				db.prepare(`
					CREATE TABLE IF NOT EXISTS rooms (
						id TEXT PRIMARY KEY,
						name TEXT NOT NULL,
						capacity INTEGER NOT NULL,
						description TEXT,
						available INTEGER NOT NULL DEFAULT 1,
						created_at TEXT DEFAULT CURRENT_TIMESTAMP,
						updated_at TEXT DEFAULT CURRENT_TIMESTAMP
					)
				`),
				db.prepare(`
					CREATE TRIGGER IF NOT EXISTS rooms_updated_at
					AFTER UPDATE ON rooms
					FOR EACH ROW
					BEGIN
						UPDATE rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
					END
				`),
			]);
		})();
	}

	await initializedPromise;
};

const toRoom = (row: Record<string, unknown>): RoomRecord => {
	const normalized: Record<string, unknown> = {
		id: row.id,
		name: row.name,
		capacity: row.capacity,
		description: row.description ?? undefined,
		available: Boolean(row.available),
		created_at: row.created_at ?? undefined,
		updated_at: row.updated_at ?? undefined,
	};

	const parsed = Room.safeParse(normalized);
	if (!parsed.success) {
		throw new Error("Data ruangan tidak valid di database");
	}

	return parsed.data;
};

export const listRooms = async (
	db: D1Database,
	options: { available?: boolean | undefined; limit?: number; offset?: number } = {},
) => {
	await ensureInitialized(db);

	const { available, limit = 50, offset = 0 } = options;

	let query = "SELECT id, name, capacity, description, available, created_at, updated_at FROM rooms";
	const bindings: unknown[] = [];

	if (typeof available === "boolean") {
		query += " WHERE available = ?";
		bindings.push(available ? 1 : 0);
	}

	query += " ORDER BY name LIMIT ? OFFSET ?";
	bindings.push(limit, offset);

	const { results } = await db.prepare(query).bind(...bindings).all();

	return (results ?? []).map((row) => toRoom(row as Record<string, unknown>));
};

export const getRoom = async (db: D1Database, id: string) => {
	await ensureInitialized(db);
	const row = await db
		.prepare(
			"SELECT id, name, capacity, description, available, created_at, updated_at FROM rooms WHERE id = ?",
		)
		.bind(id)
		.first();

	return row ? toRoom(row as Record<string, unknown>) : undefined;
};

export const createRoom = async (
	db: D1Database,
	input: z.infer<typeof RoomCreateSchema>,
) => {
	await ensureInitialized(db);
	const data = RoomCreateSchema.parse(input);

	// Generate unique ID using crypto for security
	const roomId = `room-${crypto.randomUUID()}`;

	try {
		await db
			.prepare(
				"INSERT INTO rooms (id, name, capacity, description, available) VALUES (?, ?, ?, ?, ?)",
			)
			.bind(roomId, data.name, data.capacity, data.description ?? null, data.available ? 1 : 0)
			.run();

		return roomId;
	} catch (error) {
		if (error instanceof Error && error.message.includes("UNIQUE")) {
			throw new Error("ID ruangan sudah digunakan");
		}
		throw error;
	}

	const room = await getRoom(db, roomId);
	if (!room) {
		throw new Error("Gagal mengambil data ruangan setelah membuat");
	}

	return room;
};

export const updateRoom = async (
	db: D1Database,
	id: string,
	input: z.infer<typeof RoomUpdateSchema>,
) => {
	await ensureInitialized(db);
	const updates = RoomUpdateSchema.parse(input);

	const setFragments: string[] = [];
	const values: unknown[] = [];

	if (typeof updates.name === "string") {
		setFragments.push("name = ?");
		values.push(updates.name);
	}

	if (typeof updates.capacity === "number") {
		setFragments.push("capacity = ?");
		values.push(updates.capacity);
	}

	if (typeof updates.description === "string") {
		setFragments.push("description = ?");
		values.push(updates.description);
	}

	if (typeof updates.available === "boolean") {
		setFragments.push("available = ?");
		values.push(updates.available ? 1 : 0);
	}

	if (setFragments.length === 0) {
		throw new Error("Minimal satu field harus diisi");
	}

	values.push(id);

	const statement = `UPDATE rooms SET ${setFragments.join(", ")} WHERE id = ?`;
	const result = await db.prepare(statement).bind(...values).run();

	if ((result.meta?.changes ?? 0) === 0) {
		throw new Error("Ruangan tidak ditemukan");
	}

	const room = await getRoom(db, id);
	if (!room) {
		throw new Error("Gagal mengambil data ruangan setelah pembaruan");
	}

	return room;
};

export const deleteRoom = async (db: D1Database, id: string) => {
	await ensureInitialized(db);
	const existing = await getRoom(db, id);
	if (!existing) {
		throw new Error("Ruangan tidak ditemukan");
	}

	await db.prepare("DELETE FROM rooms WHERE id = ?").bind(id).run();
	return existing;
};
