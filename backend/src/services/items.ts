import { z } from "zod";
import {
	Item,
	ItemCreateSchema,
	ItemUpdateSchema,
} from "../models/types";

export type ItemRecord = z.infer<typeof Item>;

let initializedPromise: Promise<void> | undefined;

const ensureInitialized = async (db: D1Database) => {
	if (!initializedPromise) {
		initializedPromise = (async () => {
			await db.batch([
				db.prepare(`
					CREATE TABLE IF NOT EXISTS items (
						id TEXT PRIMARY KEY,
						name TEXT NOT NULL,
						description TEXT,
						stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
						attachment_link TEXT,
						owner_username TEXT NOT NULL,
						created_at TEXT DEFAULT CURRENT_TIMESTAMP,
						updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
						FOREIGN KEY (owner_username) REFERENCES users(username) ON DELETE CASCADE
					)
				`),
				db.prepare(`
					CREATE TRIGGER IF NOT EXISTS items_updated_at
					AFTER UPDATE ON items
					FOR EACH ROW
					BEGIN
						UPDATE items SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
					END
				`),
				db.prepare(`CREATE INDEX IF NOT EXISTS idx_items_owner ON items(owner_username)`),
			]);
		})();
	}

	await initializedPromise;
};

const toItem = (row: Record<string, unknown>): ItemRecord => {
	const normalized: Record<string, unknown> = {
		id: row.id,
		name: row.name,
		description: row.description ?? undefined,
		stock: row.stock,
		attachment_link: row.attachment_link ?? undefined,
		owner_username: row.owner_username,
		created_at: row.created_at ?? undefined,
		updated_at: row.updated_at ?? undefined,
	};

	const parsed = Item.safeParse(normalized);
	if (!parsed.success) {
		throw new Error("Data barang tidak valid di database");
	}

	return parsed.data;
};

/**
 * Generate a unique item ID
 */
const generateItemId = () => {
	return `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * List all items or filter by owner
 */
export const listItems = async (
	db: D1Database,
	options: {
		ownerUsername?: string;
	} = {},
) => {
	await ensureInitialized(db);

	const { ownerUsername } = options;

	let query =
		"SELECT id, name, description, stock, attachment_link, owner_username, created_at, updated_at FROM items WHERE 1=1";
	const bindings: unknown[] = [];

	if (ownerUsername) {
		query += " AND owner_username = ?";
		bindings.push(ownerUsername);
	}

	query += " ORDER BY created_at DESC";

	const { results } = await db.prepare(query).bind(...bindings).all();

	return (results ?? []).map((row) => toItem(row as Record<string, unknown>));
};

/**
 * Get a single item by ID
 */
export const getItem = async (db: D1Database, id: string) => {
	await ensureInitialized(db);
	const row = await db
		.prepare(
			"SELECT id, name, description, stock, attachment_link, owner_username, created_at, updated_at FROM items WHERE id = ?",
		)
		.bind(id)
		.first();

	return row ? toItem(row as Record<string, unknown>) : undefined;
};

/**
 * Create a new item
 */
export const createItem = async (
	db: D1Database,
	ownerUsername: string,
	input: z.infer<typeof ItemCreateSchema>,
) => {
	await ensureInitialized(db);
	const data = ItemCreateSchema.parse(input);

	const itemId = generateItemId();

	try {
		await db
			.prepare(
				"INSERT INTO items (id, name, description, stock, attachment_link, owner_username) VALUES (?, ?, ?, ?, ?, ?)",
			)
			.bind(
				itemId,
				data.name,
				data.description ?? null,
				data.stock,
				data.attachment_link ?? null,
				ownerUsername,
			)
			.run();
	} catch (error) {
		throw new Error("Gagal membuat barang");
	}

	const item = await getItem(db, itemId);
	if (!item) {
		throw new Error("Gagal mengambil data barang setelah membuat");
	}

	return item;
};

/**
 * Update an item
 */
export const updateItem = async (
	db: D1Database,
	id: string,
	ownerUsername: string,
	input: z.infer<typeof ItemUpdateSchema>,
	role: "admin" | "member",
) => {
	await ensureInitialized(db);
	const updates = ItemUpdateSchema.parse(input);

	const existing = await getItem(db, id);
	if (!existing) {
		throw new Error("Barang tidak ditemukan");
	}

	if (role !== "admin" && existing.owner_username !== ownerUsername) {
		throw new Error("Anda tidak memiliki izin untuk memperbarui barang ini");
	}

	const fields: string[] = [];
	const bindings: unknown[] = [];

	if (updates.name !== undefined) {
		fields.push("name = ?");
		bindings.push(updates.name);
	}

	if (updates.description !== undefined) {
		fields.push("description = ?");
		bindings.push(updates.description || null);
	}

	if (updates.stock !== undefined) {
		fields.push("stock = ?");
		bindings.push(updates.stock);
	}

	if (updates.attachment_link !== undefined) {
		fields.push("attachment_link = ?");
		bindings.push(updates.attachment_link || null);
	}

	if (fields.length === 0) {
		return existing;
	}

	bindings.push(id);

	const result = await db
		.prepare(`UPDATE items SET ${fields.join(", ")} WHERE id = ?`)
		.bind(...bindings)
		.run();

	if ((result.meta?.changes ?? 0) === 0) {
		throw new Error("Barang tidak ditemukan");
	}

	const item = await getItem(db, id);
	if (!item) {
		throw new Error("Gagal mengambil data barang setelah pembaruan");
	}

	return item;
};

/**
 * Delete an item
 */
export const deleteItem = async (
	db: D1Database,
	id: string,
	username: string,
	role: "admin" | "member",
) => {
	await ensureInitialized(db);

	const item = await getItem(db, id);
	if (!item) {
		throw new Error("Barang tidak ditemukan");
	}

	if (role !== "admin" && item.owner_username !== username) {
		throw new Error("Anda tidak memiliki izin untuk menghapus barang ini");
	}

	const result = await db.prepare("DELETE FROM items WHERE id = ?").bind(id).run();

	if ((result.meta?.changes ?? 0) === 0) {
		throw new Error("Gagal menghapus barang");
	}

	return item;
};
