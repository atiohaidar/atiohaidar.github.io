import { z } from "zod";
import {
    Transaction,
    type TransferBalanceSchema,
    type TopUpBalanceSchema,
} from "../models/types";
import { getUser } from "./users";

let initializedPromise: Promise<void> | undefined;

const ensureInitialized = async (db: D1Database) => {
    if (!initializedPromise) {
        initializedPromise = (async () => {
            await db.prepare(`
				CREATE TABLE IF NOT EXISTS transactions (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					from_username TEXT,
					to_username TEXT NOT NULL,
					amount REAL NOT NULL,
					type TEXT NOT NULL CHECK (type IN ('transfer', 'topup')),
					description TEXT,
					created_at TEXT DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (from_username) REFERENCES users(username),
					FOREIGN KEY (to_username) REFERENCES users(username)
				)
			`).run();
        })();
    }
    await initializedPromise;
};

export const createTransaction = async (
    db: D1Database,
    data: {
        from_username?: string;
        to_username: string;
        amount: number;
        type: "transfer" | "topup";
        description?: string;
    }
) => {
    await ensureInitialized(db);
    await db
        .prepare(
            "INSERT INTO transactions (from_username, to_username, amount, type, description) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(
            data.from_username || null,
            data.to_username,
            data.amount,
            data.type,
            data.description || null
        )
        .run();
};

export const transferBalance = async (
    db: D1Database,
    fromUsername: string,
    input: z.infer<typeof TransferBalanceSchema>
) => {
    await ensureInitialized(db);
    const { to_username, amount, description } = input;

    if (fromUsername === to_username) {
        throw new Error("Tidak bisa transfer ke diri sendiri");
    }

    const sender = await getUser(db, fromUsername);
    if (!sender) throw new Error("Pengirim tidak ditemukan");

    const receiver = await getUser(db, to_username);
    if (!receiver) throw new Error("Penerima tidak ditemukan");

    if ((sender.balance || 0) < amount) {
        throw new Error("Saldo tidak mencukupi");
    }

    // Calculate new balances
    const newSenderBalance = (sender.balance || 0) - amount;
    const newReceiverBalance = (receiver.balance || 0) + amount;

    // Perform transfer securely using batch/transaction if possible, here using sequential updates
    // Note: In production, use D1 transactions: await db.batch([...])
    try {
        await db.batch([
            db.prepare("UPDATE users SET balance = ? WHERE username = ?").bind(newSenderBalance, fromUsername),
            db.prepare("UPDATE users SET balance = ? WHERE username = ?").bind(newReceiverBalance, to_username),
            db
                .prepare(
                    "INSERT INTO transactions (from_username, to_username, amount, type, description) VALUES (?, ?, ?, ?, ?)"
                )
                .bind(fromUsername, to_username, amount, "transfer", description || "Transfer saldo")
        ]);
    } catch (error) {
        throw new Error("Gagal memproses transfer: " + (error as Error).message);
    }

    return { success: true, newBalance: newSenderBalance };
};

export const topUpBalance = async (
    db: D1Database,
    input: z.infer<typeof TopUpBalanceSchema>
) => {
    await ensureInitialized(db);
    const { target_username, amount, description } = input;

    const target = await getUser(db, target_username);
    if (!target) throw new Error("User tujuan tidak ditemukan");

    const newBalance = (target.balance || 0) + amount;

    try {
        await db.batch([
            db.prepare("UPDATE users SET balance = ? WHERE username = ?").bind(newBalance, target_username),
            db
                .prepare(
                    "INSERT INTO transactions (to_username, amount, type, description) VALUES (?, ?, ?, ?)"
                )
                .bind(target_username, amount, "topup", description || "Top up request")
        ]);
    } catch (error) {
        throw new Error("Gagal memproses topup: " + (error as Error).message);
    }

    return { success: true, newBalance };
};

export const getTransactions = async (db: D1Database, username: string) => {
    await ensureInitialized(db);
    const results = await db
        .prepare(
            "SELECT * FROM transactions WHERE from_username = ? OR to_username = ? ORDER BY created_at DESC"
        )
        .bind(username, username)
        .all();
    return results.results;
};

export interface TransactionFilterOptions {
    startDate?: string;
    endDate?: string;
    type?: string;
    from_username?: string;
    to_username?: string;
    minAmount?: number;
    maxAmount?: number;
}

export const getAllTransactions = async (db: D1Database, options: TransactionFilterOptions = {}) => {
    await ensureInitialized(db);

    let query = "SELECT * FROM transactions WHERE 1=1";
    const params: any[] = [];

    if (options.startDate) {
        query += " AND created_at >= ?";
        params.push(options.startDate);
    }
    if (options.endDate) {
        query += " AND created_at <= ?";
        params.push(options.endDate + " 23:59:59"); // Include end of day
    }
    if (options.type && options.type !== 'all') {
        query += " AND type = ?";
        params.push(options.type);
    }
    if (options.from_username) {
        query += " AND from_username LIKE ?";
        params.push(`%${options.from_username}%`);
    }
    if (options.to_username) {
        query += " AND to_username LIKE ?";
        params.push(`%${options.to_username}%`);
    }
    if (options.minAmount !== undefined) {
        query += " AND amount >= ?";
        params.push(options.minAmount);
    }
    if (options.maxAmount !== undefined) {
        query += " AND amount <= ?";
        params.push(options.maxAmount);
    }

    query += " ORDER BY created_at DESC LIMIT 500"; // Increased limit for filtered searches

    const stmt = db.prepare(query).bind(...params);
    const results = await stmt.all();
    return results.results;
};
