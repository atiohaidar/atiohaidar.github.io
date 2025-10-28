import { z } from "zod";
import {
	UserCreateSchema,
	UserPublicSchema,
	UserRoleSchema,
	UserUpdateSchema,
	type UserPublic,
	type UserRole,
} from "../models/types";

const PublicRowSchema = z.object({
	username: z.string(),
	name: z.string(),
	role: UserRoleSchema,
});

const UserRecordSchema = PublicRowSchema.extend({
	password: z.string(),
	created_at: z.string().optional(),
});

export type UserRecord = z.infer<typeof UserRecordSchema>;

let initializedPromise: Promise<void> | undefined;

const ensureInitialized = async (db: D1Database) => {
	if (!initializedPromise) {
		initializedPromise = (async () => {
			// Use batch for multiple statements
			await db.batch([
				db.prepare(`
					CREATE TABLE IF NOT EXISTS users (
						username TEXT PRIMARY KEY,
						name TEXT NOT NULL,
						password TEXT NOT NULL,
						role TEXT NOT NULL CHECK(role IN ('admin', 'member')),
						created_at TEXT DEFAULT CURRENT_TIMESTAMP
					)
				`),
				db.prepare(`INSERT OR IGNORE INTO users (username, name, password, role) VALUES ('admin', 'Administrator', 'admin123', 'admin')`),
				db.prepare(`INSERT OR IGNORE INTO users (username, name, password, role) VALUES ('user', 'Sample Member', 'user123', 'member')`)
			]);
		})();
	}

	await initializedPromise;
};

const mapPublic = (row: unknown): UserPublic => {
	const parsed = PublicRowSchema.safeParse(row);
	if (!parsed.success) {
		throw new Error("Data pengguna tidak valid di database");
	}
	return parsed.data;
};

const mapRecord = (row: unknown): UserRecord => {
	const parsed = UserRecordSchema.safeParse(row);
	if (!parsed.success) {
		throw new Error("Data pengguna tidak valid di database");
	}
	return parsed.data;
};

export const listUsers = async (db: D1Database): Promise<UserPublic[]> => {
	await ensureInitialized(db);
	const { results } = await db
		.prepare("SELECT username, name, role FROM users ORDER BY username")
		.all();

	return (results ?? []).map(mapPublic);
};

export const getUser = async (db: D1Database, username: string): Promise<UserPublic | undefined> => {
	await ensureInitialized(db);
	const row = await db
		.prepare("SELECT username, name, role FROM users WHERE username = ?")
		.bind(username)
		.first();

	return row ? mapPublic(row) : undefined;
};

const getUserRecordInternal = async (db: D1Database, username: string): Promise<UserRecord | undefined> => {
	await ensureInitialized(db);
	const row = await db
		.prepare(
			"SELECT username, name, role, password, created_at FROM users WHERE username = ?",
		)
		.bind(username)
		.first();

	return row ? mapRecord(row) : undefined;
};

export const createUser = async (
	db: D1Database,
	input: z.infer<typeof UserCreateSchema>,
): Promise<UserPublic> => {
	await ensureInitialized(db);
	const data = UserCreateSchema.parse(input);

	try {
		await db
			.prepare("INSERT INTO users (username, name, password, role) VALUES (?, ?, ?, ?)")
			.bind(data.username, data.name, data.password, data.role)
			.run();
	} catch (error) {
		if (error instanceof Error && error.message.includes("UNIQUE")) {
			throw new Error("Username sudah digunakan");
		}
		throw error;
	}

	const user = await getUser(db, data.username);
	if (!user) {
		throw new Error("Gagal mengambil data pengguna setelah membuat user");
	}

	return user;
};

export const updateUser = async (
	db: D1Database,
	username: string,
	input: z.infer<typeof UserUpdateSchema>,
): Promise<UserPublic> => {
	await ensureInitialized(db);
	const updates = UserUpdateSchema.parse(input);

	const setFragments: string[] = [];
	const values: unknown[] = [];

	if (typeof updates.name === "string") {
		setFragments.push("name = ?");
		values.push(updates.name);
	}

	if (typeof updates.password === "string") {
		setFragments.push("password = ?");
		values.push(updates.password);
	}

	if (typeof updates.role === "string" && UserRoleSchema.safeParse(updates.role).success) {
		setFragments.push("role = ?");
		values.push(updates.role);
	}

	if (setFragments.length === 0) {
		throw new Error("Minimal satu field harus diisi");
	}

	values.push(username);

	const statement = `UPDATE users SET ${setFragments.join(", ")} WHERE username = ?`;
	const result = await db.prepare(statement).bind(...values).run();

	if ((result.meta?.changes ?? 0) === 0) {
		throw new Error("User tidak ditemukan");
	}

	const user = await getUser(db, username);
	if (!user) {
		throw new Error("Gagal mengambil data pengguna setelah pembaruan");
	}

	return user;
};

export const deleteUser = async (db: D1Database, username: string): Promise<UserPublic> => {
	await ensureInitialized(db);
	const existing = await getUser(db, username);
	if (!existing) {
		throw new Error("User tidak ditemukan");
	}

	await db.prepare("DELETE FROM users WHERE username = ?").bind(username).run();
	return existing;
};

export const validateUserCredentials = async (
	db: D1Database,
	username: string,
	password: string,
): Promise<UserRecord | undefined> => {
	await ensureInitialized(db);
	const record = await getUserRecordInternal(db, username);
	if (!record) {
		return undefined;
	}

	if (record.password !== password) {
		return undefined;
	}

	return record;
};
