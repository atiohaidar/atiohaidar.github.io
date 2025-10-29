import { z } from "zod";
import {
	ItemBorrowing,
	ItemBorrowingCreateSchema,
	ItemBorrowingUpdateStatusSchema,
	type ItemBorrowingStatus,
} from "../models/types";
import { getItem } from "./items";

export type ItemBorrowingRecord = z.infer<typeof ItemBorrowing>;

let initializedPromise: Promise<void> | undefined;

const ensureInitialized = async (db: D1Database) => {
	if (!initializedPromise) {
		initializedPromise = (async () => {
			await db.batch([
				db.prepare(`
					CREATE TABLE IF NOT EXISTS item_borrowings (
						id TEXT PRIMARY KEY,
						item_id TEXT NOT NULL,
						borrower_username TEXT NOT NULL,
						quantity INTEGER NOT NULL CHECK (quantity > 0),
						start_date TEXT NOT NULL,
						end_date TEXT NOT NULL,
						status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned', 'damaged', 'extended')),
						notes TEXT,
						created_at TEXT DEFAULT CURRENT_TIMESTAMP,
						updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
						FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
						FOREIGN KEY (borrower_username) REFERENCES users(username) ON DELETE CASCADE
					)
				`),
				db.prepare(`
					CREATE TRIGGER IF NOT EXISTS item_borrowings_updated_at
					AFTER UPDATE ON item_borrowings
					FOR EACH ROW
					BEGIN
						UPDATE item_borrowings SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
					END
				`),
				db.prepare(`CREATE INDEX IF NOT EXISTS idx_item_borrowings_item ON item_borrowings(item_id)`),
				db.prepare(
					`CREATE INDEX IF NOT EXISTS idx_item_borrowings_borrower ON item_borrowings(borrower_username)`,
				),
				db.prepare(`CREATE INDEX IF NOT EXISTS idx_item_borrowings_status ON item_borrowings(status)`),
				db.prepare(
					`CREATE INDEX IF NOT EXISTS idx_item_borrowings_dates ON item_borrowings(start_date, end_date)`,
				),
			]);
		})();
	}

	await initializedPromise;
};

const toItemBorrowing = (row: Record<string, unknown>): ItemBorrowingRecord => {
	const normalized: Record<string, unknown> = {
		id: row.id,
		item_id: row.item_id,
		borrower_username: row.borrower_username,
		quantity: row.quantity,
		start_date: row.start_date,
		end_date: row.end_date,
		status: row.status,
		notes: row.notes ?? undefined,
		created_at: row.created_at ?? undefined,
		updated_at: row.updated_at ?? undefined,
	};

	const parsed = ItemBorrowing.safeParse(normalized);
	if (!parsed.success) {
		throw new Error("Data peminjaman barang tidak valid di database");
	}

	return parsed.data;
};

/**
 * Generate a unique borrowing ID
 */
const generateBorrowingId = () => {
	return `borrow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Check if an item is available for the given date range and quantity
 */
export const checkItemAvailability = async (
	db: D1Database,
	itemId: string,
	startDate: string,
	endDate: string,
	quantity: number,
	excludeBorrowingId?: string,
): Promise<boolean> => {
	await ensureInitialized(db);

	// Get item and check total stock
	const item = await getItem(db, itemId);
	if (!item) {
		return false;
	}

	if (item.stock < quantity) {
		return false;
	}

	// Check for overlapping borrowings that are approved or pending
	let query = `
		SELECT COALESCE(SUM(quantity), 0) as borrowed_quantity 
		FROM item_borrowings 
		WHERE item_id = ? 
		AND status IN ('pending', 'approved', 'extended')
		AND (
			(start_date <= ? AND end_date >= ?) OR
			(start_date <= ? AND end_date >= ?) OR
			(start_date >= ? AND end_date <= ?)
		)
	`;
	const bindings: unknown[] = [itemId, endDate, startDate, endDate, startDate, startDate, endDate];

	if (excludeBorrowingId) {
		query += " AND id != ?";
		bindings.push(excludeBorrowingId);
	}

	const result = await db.prepare(query).bind(...bindings).first();

	const borrowedQuantity = (result?.borrowed_quantity as number) || 0;
	const availableStock = item.stock - borrowedQuantity;

	return availableStock >= quantity;
};

/**
 * List borrowings with optional filters
 */
export const listItemBorrowings = async (
	db: D1Database,
	options: {
		borrowerUsername?: string;
		itemId?: string;
		status?: ItemBorrowingStatus;
		ownerUsername?: string;
	} = {},
) => {
	await ensureInitialized(db);

	const { borrowerUsername, itemId, status, ownerUsername } = options;

	let query = `
		SELECT ib.id, ib.item_id, ib.borrower_username, ib.quantity, 
		       ib.start_date, ib.end_date, ib.status, ib.notes, 
		       ib.created_at, ib.updated_at
		FROM item_borrowings ib
	`;
	const bindings: unknown[] = [];

	if (ownerUsername) {
		query += " INNER JOIN items i ON ib.item_id = i.id WHERE i.owner_username = ?";
		bindings.push(ownerUsername);
	} else {
		query += " WHERE 1=1";
	}

	if (borrowerUsername) {
		query += " AND ib.borrower_username = ?";
		bindings.push(borrowerUsername);
	}

	if (itemId) {
		query += " AND ib.item_id = ?";
		bindings.push(itemId);
	}

	if (status) {
		query += " AND ib.status = ?";
		bindings.push(status);
	}

	query += " ORDER BY ib.created_at DESC";

	const { results } = await db.prepare(query).bind(...bindings).all();

	return (results ?? []).map((row) => toItemBorrowing(row as Record<string, unknown>));
};

/**
 * Get a single borrowing by ID
 */
export const getItemBorrowing = async (db: D1Database, id: string) => {
	await ensureInitialized(db);
	const row = await db
		.prepare(
			"SELECT id, item_id, borrower_username, quantity, start_date, end_date, status, notes, created_at, updated_at FROM item_borrowings WHERE id = ?",
		)
		.bind(id)
		.first();

	return row ? toItemBorrowing(row as Record<string, unknown>) : undefined;
};

/**
 * Create a new borrowing request
 */
export const createItemBorrowing = async (
	db: D1Database,
	borrowerUsername: string,
	input: z.infer<typeof ItemBorrowingCreateSchema>,
) => {
	await ensureInitialized(db);
	const data = ItemBorrowingCreateSchema.parse(input);

	// Validate date range
	const startDate = new Date(data.start_date);
	const endDate = new Date(data.end_date);

	if (startDate >= endDate) {
		throw new Error("Tanggal mulai harus sebelum tanggal selesai");
	}

	if (startDate < new Date(new Date().toISOString().split("T")[0])) {
		throw new Error("Tanggal mulai tidak boleh di masa lalu");
	}

	// Check item exists
	const item = await getItem(db, data.item_id);
	if (!item) {
		throw new Error("Barang tidak ditemukan");
	}

	// Check if borrower is the owner
	if (item.owner_username === borrowerUsername) {
		throw new Error("Anda tidak dapat meminjam barang Anda sendiri");
	}

	// Check availability
	const isAvailable = await checkItemAvailability(
		db,
		data.item_id,
		data.start_date,
		data.end_date,
		data.quantity,
	);

	if (!isAvailable) {
		throw new Error("Barang tidak tersedia untuk tanggal dan jumlah yang dipilih");
	}

	const borrowingId = generateBorrowingId();

	try {
		await db
			.prepare(
				"INSERT INTO item_borrowings (id, item_id, borrower_username, quantity, start_date, end_date, status, notes) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)",
			)
			.bind(
				borrowingId,
				data.item_id,
				borrowerUsername,
				data.quantity,
				data.start_date,
				data.end_date,
				data.notes ?? null,
			)
			.run();
	} catch (error) {
		throw new Error("Gagal membuat peminjaman barang");
	}

	const borrowing = await getItemBorrowing(db, borrowingId);
	if (!borrowing) {
		throw new Error("Gagal mengambil data peminjaman setelah membuat");
	}

	return borrowing;
};

/**
 * Update borrowing status (by item owner)
 */
export const updateItemBorrowingStatus = async (
	db: D1Database,
	id: string,
	ownerUsername: string,
	input: z.infer<typeof ItemBorrowingUpdateStatusSchema>,
	role: "admin" | "member",
) => {
	await ensureInitialized(db);
	const updates = ItemBorrowingUpdateStatusSchema.parse(input);

	const borrowing = await getItemBorrowing(db, id);
	if (!borrowing) {
		throw new Error("Peminjaman tidak ditemukan");
	}

	// Check if user is the item owner or admin
	const item = await getItem(db, borrowing.item_id);
	if (!item) {
		throw new Error("Barang tidak ditemukan");
	}

	if (role !== "admin" && item.owner_username !== ownerUsername) {
		throw new Error("Hanya pemilik barang yang dapat memperbarui status peminjaman");
	}

	// Validate status transitions
	if (borrowing.status === "rejected" && updates.status !== "rejected") {
		throw new Error("Peminjaman yang ditolak tidak dapat diubah statusnya");
	}

	const fields: string[] = ["status = ?"];
	const bindings: unknown[] = [updates.status];

	if (updates.notes !== undefined) {
		fields.push("notes = ?");
		bindings.push(updates.notes || null);
	}

	bindings.push(id);

	const result = await db
		.prepare(`UPDATE item_borrowings SET ${fields.join(", ")} WHERE id = ?`)
		.bind(...bindings)
		.run();

	if ((result.meta?.changes ?? 0) === 0) {
		throw new Error("Peminjaman tidak ditemukan");
	}

	const updated = await getItemBorrowing(db, id);
	if (!updated) {
		throw new Error("Gagal mengambil data peminjaman setelah pembaruan");
	}

	return updated;
};

/**
 * Cancel a borrowing (by borrower)
 */
export const cancelItemBorrowing = async (
	db: D1Database,
	id: string,
	borrowerUsername: string,
) => {
	await ensureInitialized(db);

	const borrowing = await getItemBorrowing(db, id);
	if (!borrowing) {
		throw new Error("Peminjaman tidak ditemukan");
	}

	if (borrowing.borrower_username !== borrowerUsername) {
		throw new Error("Anda tidak memiliki izin untuk membatalkan peminjaman ini");
	}

	if (borrowing.status === "rejected" || borrowing.status === "returned") {
		throw new Error("Peminjaman ini tidak dapat dibatalkan");
	}

	const result = await db
		.prepare("UPDATE item_borrowings SET status = 'rejected' WHERE id = ?")
		.bind(id)
		.run();

	if ((result.meta?.changes ?? 0) === 0) {
		throw new Error("Gagal membatalkan peminjaman");
	}

	const updated = await getItemBorrowing(db, id);
	if (!updated) {
		throw new Error("Gagal mengambil data peminjaman setelah pembatalan");
	}

	return updated;
};
