import { z } from "zod";
import {
	Habit,
	HabitCompletion,
	HabitCreateSchema,
	HabitUpdateSchema,
	HabitCompletionCreateSchema,
	HabitWithStats,
} from "../models/types";

export type HabitRecord = z.infer<typeof Habit>;
export type HabitCompletionRecord = z.infer<typeof HabitCompletion>;
export type HabitWithStatsRecord = z.infer<typeof HabitWithStats>;

let initializedPromise: Promise<void> | undefined;

const ensureInitialized = async (db: D1Database) => {
	if (!initializedPromise) {
		initializedPromise = (async () => {
			await db.batch([
				db.prepare(`
					CREATE TABLE IF NOT EXISTS habits (
						id TEXT PRIMARY KEY,
						user_username TEXT NOT NULL,
						name TEXT NOT NULL,
						description TEXT,
						period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'custom')),
						period_days INTEGER DEFAULT 1 CHECK (period_days > 0),
						created_at TEXT DEFAULT CURRENT_TIMESTAMP,
						updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
						FOREIGN KEY (user_username) REFERENCES users(username) ON DELETE CASCADE
					)
				`),
				db.prepare(
					"CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_username)",
				),
				db.prepare(`
					CREATE TABLE IF NOT EXISTS habit_completions (
						id TEXT PRIMARY KEY,
						habit_id TEXT NOT NULL,
						user_username TEXT NOT NULL,
						completion_date TEXT NOT NULL,
						created_at TEXT DEFAULT CURRENT_TIMESTAMP,
						FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
						FOREIGN KEY (user_username) REFERENCES users(username) ON DELETE CASCADE,
						UNIQUE(habit_id, completion_date)
					)
				`),
				db.prepare(
					"CREATE INDEX IF NOT EXISTS idx_habit_completions_habit ON habit_completions(habit_id)",
				),
			]);
		})();
	}

	await initializedPromise;
};

const toHabit = (row: Record<string, unknown>) => {
	const normalized: Record<string, unknown> = {
		id: row.id,
		user_username: row.user_username,
		name: row.name,
		description: row.description ?? undefined,
		period_type: row.period_type,
		period_days: row.period_days,
		created_at: row.created_at ?? undefined,
		updated_at: row.updated_at ?? undefined,
	};

	const parsed = Habit.safeParse(normalized);
	if (!parsed.success) {
		throw new Error("Data habit tidak valid di database");
	}

	return parsed.data;
};

const toHabitCompletion = (row: Record<string, unknown>) => {
	const normalized: Record<string, unknown> = {
		id: row.id,
		habit_id: row.habit_id,
		user_username: row.user_username,
		completion_date: row.completion_date,
		created_at: row.created_at ?? undefined,
	};

	const parsed = HabitCompletion.safeParse(normalized);
	if (!parsed.success) {
		throw new Error("Data habit completion tidak valid di database");
	}

	return parsed.data;
};

const generateId = (prefix: string) => {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Calculate stats for a habit
const calculateHabitStats = async (
	db: D1Database,
	habitId: string,
	periodType: string,
	periodDays: number,
	createdAt: string,
) => {
	const now = new Date();
	const createdDate = new Date(createdAt);
	
	// Calculate total periods since creation
	const daysSinceCreation = Math.floor(
		(now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
	);
	
	let totalPeriods = 0;
	if (periodType === "daily") {
		totalPeriods = daysSinceCreation + 1;
	} else if (periodType === "weekly") {
		totalPeriods = Math.floor(daysSinceCreation / 7) + 1;
	} else if (periodType === "monthly") {
		const monthsDiff =
			(now.getFullYear() - createdDate.getFullYear()) * 12 +
			(now.getMonth() - createdDate.getMonth()) + 1;
		totalPeriods = monthsDiff;
	} else if (periodType === "custom") {
		totalPeriods = Math.floor(daysSinceCreation / periodDays) + 1;
	}

	// Get total completions
	const completionsResult = await db
		.prepare(
			"SELECT COUNT(*) as count FROM habit_completions WHERE habit_id = ?",
		)
		.bind(habitId)
		.first();
	const totalCompletions = (completionsResult?.count as number) || 0;

	// Calculate completion percentage
	const completionPercentage =
		totalPeriods > 0 ? Math.round((totalCompletions / totalPeriods) * 100) : 0;

	// Calculate current streak
	const completions = await db
		.prepare(
			"SELECT completion_date FROM habit_completions WHERE habit_id = ? ORDER BY completion_date DESC",
		)
		.bind(habitId)
		.all();

	let currentStreak = 0;
	if (completions.results && completions.results.length > 0) {
		const dates = completions.results.map(
			(r) => new Date((r as any).completion_date),
		);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Check if completed today or yesterday
		const lastCompletion = dates[0];
		lastCompletion.setHours(0, 0, 0, 0);
		const daysDiff = Math.floor(
			(today.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24),
		);

		if (daysDiff <= 1) {
			currentStreak = 1;
			// Count consecutive days
			for (let i = 1; i < dates.length; i++) {
				const prevDate = dates[i - 1];
				const currDate = dates[i];
				prevDate.setHours(0, 0, 0, 0);
				currDate.setHours(0, 0, 0, 0);
				
				const diff = Math.floor(
					(prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24),
				);
				
				if (diff === 1 || (periodType !== "daily" && diff <= periodDays)) {
					currentStreak++;
				} else {
					break;
				}
			}
		}
	}

	// Check if completed today
	const todayStr = now.toISOString().split("T")[0];
	const todayCompletion = await db
		.prepare(
			"SELECT id FROM habit_completions WHERE habit_id = ? AND completion_date = ?",
		)
		.bind(habitId, todayStr)
		.first();
	const isCompletedToday = !!todayCompletion;

	return {
		total_completions: totalCompletions,
		total_periods: totalPeriods,
		completion_percentage: completionPercentage,
		current_streak: currentStreak,
		is_completed_today: isCompletedToday,
	};
};

export const listHabits = async (
	db: D1Database,
	username: string,
	page: number = 0,
) => {
	await ensureInitialized(db);

	const pageSize = 20;
	const offset = Math.max(page, 0) * pageSize;

	const { results } = await db
		.prepare(
			"SELECT id, user_username, name, description, period_type, period_days, created_at, updated_at FROM habits WHERE user_username = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
		)
		.bind(username, pageSize, offset)
		.all();

	return (results ?? []).map((row) => toHabit(row as Record<string, unknown>));
};

export const listHabitsWithStats = async (
	db: D1Database,
	username: string,
	page: number = 0,
) => {
	await ensureInitialized(db);

	const habits = await listHabits(db, username, page);
	const habitsWithStats = await Promise.all(
		habits.map(async (habit) => {
			const stats = await calculateHabitStats(
				db,
				habit.id,
				habit.period_type,
				habit.period_days,
				habit.created_at || new Date().toISOString(),
			);
			return { ...habit, ...stats };
		}),
	);

	return habitsWithStats;
};

export const getHabit = async (db: D1Database, id: string) => {
	await ensureInitialized(db);
	const row = await db
		.prepare(
			"SELECT id, user_username, name, description, period_type, period_days, created_at, updated_at FROM habits WHERE id = ?",
		)
		.bind(id)
		.first();

	return row ? toHabit(row as Record<string, unknown>) : undefined;
};

export const getHabitWithStats = async (db: D1Database, id: string) => {
	await ensureInitialized(db);
	const habit = await getHabit(db, id);
	if (!habit) {
		return undefined;
	}

	const stats = await calculateHabitStats(
		db,
		habit.id,
		habit.period_type,
		habit.period_days,
		habit.created_at || new Date().toISOString(),
	);

	return { ...habit, ...stats };
};

export const createHabit = async (
	db: D1Database,
	input: z.infer<typeof HabitCreateSchema>,
	username: string,
) => {
	await ensureInitialized(db);
	const data = HabitCreateSchema.parse(input);

	const id = generateId("habit");

	try {
		await db
			.prepare(
				"INSERT INTO habits (id, user_username, name, description, period_type, period_days) VALUES (?, ?, ?, ?, ?, ?)",
			)
			.bind(
				id,
				username,
				data.name,
				data.description ?? null,
				data.period_type,
				data.period_days,
			)
			.run();

		const habit = await getHabit(db, id);
		if (!habit) {
			throw new Error("Gagal mengambil habit setelah membuat data");
		}

		return habit;
	} catch (error) {
		throw error;
	}
};

export const updateHabit = async (
	db: D1Database,
	id: string,
	input: z.infer<typeof HabitUpdateSchema>,
) => {
	await ensureInitialized(db);
	const updates = HabitUpdateSchema.parse(input);

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

	if (typeof updates.period_type === "string") {
		setFragments.push("period_type = ?");
		values.push(updates.period_type);
	}

	if (typeof updates.period_days === "number") {
		setFragments.push("period_days = ?");
		values.push(updates.period_days);
	}

	if (setFragments.length === 0) {
		throw new Error("Minimal satu field harus diisi");
	}

	values.push(id);
	const statement = `UPDATE habits SET ${setFragments.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
	const result = await db.prepare(statement).bind(...values).run();

	if ((result.meta?.changes ?? 0) === 0) {
		throw new Error("Habit tidak ditemukan");
	}

	const habit = await getHabit(db, id);
	if (!habit) {
		throw new Error("Gagal mengambil habit setelah pembaruan");
	}

	return habit;
};

export const deleteHabit = async (db: D1Database, id: string) => {
	await ensureInitialized(db);
	const existing = await getHabit(db, id);
	if (!existing) {
		throw new Error("Habit tidak ditemukan");
	}

	await db.prepare("DELETE FROM habits WHERE id = ?").bind(id).run();
	return existing;
};

// Habit completion functions
export const getHabitCompletions = async (
	db: D1Database,
	habitId: string,
	startDate?: string,
	endDate?: string,
) => {
	await ensureInitialized(db);

	let query =
		"SELECT id, habit_id, user_username, completion_date, created_at FROM habit_completions WHERE habit_id = ?";
	const bindings: unknown[] = [habitId];

	if (startDate) {
		query += " AND completion_date >= ?";
		bindings.push(startDate);
	}

	if (endDate) {
		query += " AND completion_date <= ?";
		bindings.push(endDate);
	}

	query += " ORDER BY completion_date DESC";

	const { results } = await db.prepare(query).bind(...bindings).all();

	return (results ?? []).map((row) =>
		toHabitCompletion(row as Record<string, unknown>),
	);
};

export const createHabitCompletion = async (
	db: D1Database,
	input: z.infer<typeof HabitCompletionCreateSchema>,
	username: string,
) => {
	await ensureInitialized(db);
	const data = HabitCompletionCreateSchema.parse(input);

	// Check if habit exists and belongs to user
	const habit = await getHabit(db, data.habit_id);
	if (!habit) {
		throw new Error("Habit tidak ditemukan");
	}

	if (habit.user_username !== username) {
		throw new Error("Habit tidak milik user ini");
	}

	const id = generateId("comp");

	try {
		await db
			.prepare(
				"INSERT INTO habit_completions (id, habit_id, user_username, completion_date) VALUES (?, ?, ?, ?)",
			)
			.bind(id, data.habit_id, username, data.completion_date)
			.run();

		const completion = await db
			.prepare(
				"SELECT id, habit_id, user_username, completion_date, created_at FROM habit_completions WHERE id = ?",
			)
			.bind(id)
			.first();

		if (!completion) {
			throw new Error("Gagal mengambil completion setelah membuat data");
		}

		return toHabitCompletion(completion as Record<string, unknown>);
	} catch (error: any) {
		if (error?.message?.includes("UNIQUE constraint failed")) {
			throw new Error("Habit sudah ditandai selesai untuk tanggal ini");
		}
		throw error;
	}
};

export const deleteHabitCompletion = async (
	db: D1Database,
	habitId: string,
	completionDate: string,
	username: string,
) => {
	await ensureInitialized(db);

	// Verify habit belongs to user
	const habit = await getHabit(db, habitId);
	if (!habit) {
		throw new Error("Habit tidak ditemukan");
	}

	if (habit.user_username !== username) {
		throw new Error("Habit tidak milik user ini");
	}

	const result = await db
		.prepare(
			"DELETE FROM habit_completions WHERE habit_id = ? AND completion_date = ?",
		)
		.bind(habitId, completionDate)
		.run();

	if ((result.meta?.changes ?? 0) === 0) {
		throw new Error("Completion tidak ditemukan");
	}

	return { success: true };
};
