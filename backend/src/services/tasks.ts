import { z } from "zod";
import {
	Task,
	TaskCreateSchema,
	TaskUpdateSchema,
	type AppContext,
} from "../models/types";

export type TaskRecord = z.infer<typeof Task>;

const TaskRowSchema = Task.extend({
	description: Task.shape.description.optional(),
	completed: z.boolean(),
	due_date: Task.shape.due_date.optional(),
	created_at: Task.shape.created_at.optional(),
	updated_at: Task.shape.updated_at.optional(),
});

let initializedPromise: Promise<void> | undefined;

const ensureInitialized = async (db: D1Database) => {
	if (!initializedPromise) {
		initializedPromise = (async () => {
			await db.batch([
				db.prepare(`
					CREATE TABLE IF NOT EXISTS tasks (
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						name TEXT NOT NULL,
						description TEXT,
						completed INTEGER NOT NULL DEFAULT 0,
						due_date TEXT,
						owner TEXT,
						created_at TEXT DEFAULT CURRENT_TIMESTAMP,
						updated_at TEXT DEFAULT CURRENT_TIMESTAMP
					)
				`),
				db.prepare(
					"CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner)",
				),
			]);
		})();
	}

	await initializedPromise;
};

const toTask = (row: Record<string, unknown>) => {
	const normalized: Record<string, unknown> = {
		id: row.id,
		name: row.name,
		description: row.description ?? undefined,
		completed: Boolean(row.completed),
		due_date: row.due_date ?? undefined,
		owner: row.owner ?? undefined,
		created_at: row.created_at ?? undefined,
		updated_at: row.updated_at ?? undefined,
	};

	const parsed = Task.safeParse(normalized);
	if (!parsed.success) {
		throw new Error("Data task tidak valid di database");
	}

	return parsed.data;
};

export const listTasks = async (
	db: D1Database,
	options: { page: number; isCompleted?: boolean | undefined; owner?: string | undefined },
) => {
	await ensureInitialized(db);

	const { page, isCompleted, owner } = options;
	const pageSize = 20;
	const offset = Math.max(page, 0) * pageSize;

	let query =
		"SELECT id, name, description, completed, due_date, owner, created_at, updated_at FROM tasks";
	const bindings: unknown[] = [];
	const conditions: string[] = [];

	if (typeof isCompleted === "boolean") {
		conditions.push("completed = ?");
		bindings.push(isCompleted ? 1 : 0);
	}

	if (owner) {
		conditions.push("owner = ?");
		bindings.push(owner);
	}

	if (conditions.length > 0) {
		query += " WHERE " + conditions.join(" AND ");
	}

	query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
	bindings.push(pageSize, offset);

	const { results } = await db.prepare(query).bind(...bindings).all();

	return (results ?? []).map((row) => toTask(row as Record<string, unknown>));
};

export const getTask = async (db: D1Database, id: number) => {
	await ensureInitialized(db);
	const row = await db
		.prepare(
			"SELECT id, name, description, completed, due_date, owner, created_at, updated_at FROM tasks WHERE id = ?",
		)
		.bind(id)
		.first();

	return row ? toTask(row as Record<string, unknown>) : undefined;
};

export const createTask = async (
	db: D1Database,
	input: z.infer<typeof TaskCreateSchema>,
	owner?: string,
) => {
	await ensureInitialized(db);
	const data = TaskCreateSchema.parse(input);

	try {
		const result = await db
			.prepare(
				"INSERT INTO tasks (name, description, completed, due_date, owner) VALUES (?, ?, ?, ?, ?)",
			)
			.bind(
				data.name,
				data.description ?? null,
				data.completed ? 1 : 0,
				data.due_date ?? null,
				owner ?? null,
			)
			.run();

		const insertedId = result.meta?.last_row_id;
		if (typeof insertedId !== "number") {
			throw new Error("Gagal mendapatkan ID task yang baru dibuat");
		}

		const task = await getTask(db, insertedId);
		if (!task) {
			throw new Error("Gagal mengambil task setelah membuat data");
		}

		return task;
	} catch (error) {
		throw error;
	}
};

export const updateTask = async (
	db: D1Database,
	id: number,
	input: z.infer<typeof TaskUpdateSchema>,
) => {
	await ensureInitialized(db);
	const updates = TaskUpdateSchema.parse(input);

	const setFragments: string[] = [];
	const values: unknown[] = [];

	if (typeof updates.name === "string") {
		setFragments.push("name = ?");
		values.push(updates.name);
	}

	if (typeof updates.description === "string") {
		setFragments.push("description = ?");
		values.push(updates.description);
	}

	if (typeof updates.completed === "boolean") {
		setFragments.push("completed = ?");
		values.push(updates.completed ? 1 : 0);
	}

	if (typeof updates.due_date === "string") {
		setFragments.push("due_date = ?");
		values.push(updates.due_date);
	}

	if (setFragments.length === 0) {
		throw new Error("Minimal satu field harus diisi");
	}

	values.push(id);
	const statement = `UPDATE tasks SET ${setFragments.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
	const result = await db.prepare(statement).bind(...values).run();

	if ((result.meta?.changes ?? 0) === 0) {
		throw new Error("Task tidak ditemukan");
	}

	const task = await getTask(db, id);
	if (!task) {
		throw new Error("Gagal mengambil task setelah pembaruan");
	}

	return task;
};

export const deleteTask = async (db: D1Database, id: number) => {
	await ensureInitialized(db);
	const existing = await getTask(db, id);
	if (!existing) {
		throw new Error("Task tidak ditemukan");
	}

	await db.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
	return existing;
};
