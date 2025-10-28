import { z } from "zod";
import {
	Task,
	TaskCreateSchema,
	TaskUpdateSchema,
	type AppContext,
} from "../types";

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
			await db.exec(`
				CREATE TABLE IF NOT EXISTS tasks (
					slug TEXT PRIMARY KEY,
					name TEXT NOT NULL,
					description TEXT,
					completed INTEGER NOT NULL DEFAULT 0,
					due_date TEXT,
					created_at TEXT DEFAULT CURRENT_TIMESTAMP,
					updated_at TEXT DEFAULT CURRENT_TIMESTAMP
				);

				CREATE TRIGGER IF NOT EXISTS tasks_updated_at
				AFTER UPDATE ON tasks
				FOR EACH ROW
				BEGIN
					UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE slug = OLD.slug;
				END;
			`);
		})();
	}

	await initializedPromise;
};

const toTask = (row: Record<string, unknown>) => {
	const normalized: Record<string, unknown> = {
		slug: row.slug,
		name: row.name,
		description: row.description ?? undefined,
		completed: Boolean(row.completed),
		due_date: row.due_date ?? undefined,
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
	options: { page: number; isCompleted?: boolean | undefined },
) => {
	await ensureInitialized(db);

	const { page, isCompleted } = options;
	const pageSize = 20;
	const offset = Math.max(page, 0) * pageSize;

	let query = "SELECT slug, name, description, completed, due_date, created_at, updated_at FROM tasks";
	const bindings: unknown[] = [];

	if (typeof isCompleted === "boolean") {
		query += " WHERE completed = ?";
		bindings.push(isCompleted ? 1 : 0);
	}

	query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
	bindings.push(pageSize, offset);

	const { results } = await db.prepare(query).bind(...bindings).all();

	return (results ?? []).map((row) => toTask(row as Record<string, unknown>));
};

export const getTask = async (db: D1Database, slug: string) => {
	await ensureInitialized(db);
	const row = await db
		.prepare(
			"SELECT slug, name, description, completed, due_date, created_at, updated_at FROM tasks WHERE slug = ?",
		)
		.bind(slug)
		.first();

	return row ? toTask(row as Record<string, unknown>) : undefined;
};

export const createTask = async (db: D1Database, input: z.infer<typeof TaskCreateSchema>) => {
	await ensureInitialized(db);
	const data = TaskCreateSchema.parse(input);

	try {
		await db
			.prepare(
				"INSERT INTO tasks (slug, name, description, completed, due_date) VALUES (?, ?, ?, ?, ?)",
			)
			.bind(
				data.slug,
				data.name,
				data.description ?? null,
				data.completed ? 1 : 0,
				data.due_date ?? null,
			)
			.run();
	} catch (error) {
		if (error instanceof Error && error.message.includes("UNIQUE")) {
			throw new Error("Slug task sudah digunakan");
		}

		throw error;
	}

	const task = await getTask(db, data.slug);
	if (!task) {
		throw new Error("Gagal mengambil task setelah membuat data");
	}

	return task;
};

export const updateTask = async (
	db: D1Database,
	slug: string,
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

	values.push(slug);
	const statement = `UPDATE tasks SET ${setFragments.join(", ")} WHERE slug = ?`;
	const result = await db.prepare(statement).bind(...values).run();

	if ((result.meta?.changes ?? 0) === 0) {
		throw new Error("Task tidak ditemukan");
	}

	const task = await getTask(db, slug);
	if (!task) {
		throw new Error("Gagal mengambil task setelah pembaruan");
	}

	return task;
};

export const deleteTask = async (db: D1Database, slug: string) => {
	await ensureInitialized(db);
	const existing = await getTask(db, slug);
	if (!existing) {
		throw new Error("Task tidak ditemukan");
	}

	await db.prepare("DELETE FROM tasks WHERE slug = ?").bind(slug).run();
	return existing;
};
