import { Bool, Str } from "chanfana";
import { z } from "zod";
import {
	createHabit,
	deleteHabit,
	getHabit,
	getHabitWithStats,
	listHabitsWithStats,
	updateHabit,
	createHabitCompletion,
	deleteHabitCompletion,
	getHabitCompletions,
} from "../services/habits";
import {
	type AppContext,
	Habit,
	HabitCreateSchema,
	HabitUpdateSchema,
	HabitCompletionCreateSchema,
	HabitCompletion,
	HabitWithStats,
} from "../models/types";
import { getTokenPayloadFromRequest } from "../middlewares/auth";

export class HabitList {
	static schema = {
		tags: ["Habits"],
		summary: "List user's habits with stats",
		request: {
			query: z.object({
				page: z.coerce.number().int().nonnegative().optional(),
			}),
		},
		responses: {
			"200": {
				description: "Returns a list of habits with statistics",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							habits: HabitWithStats.array(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const query = c.req.query();
		const page = query.page ? Number(query.page) : 0;

		const habits = await listHabitsWithStats(c.env.DB, payload.sub, page);
		return c.json({ success: true, habits });
	}
}

export class HabitGet {
	static schema = {
		tags: ["Habits"],
		summary: "Get a single habit with stats",
		request: {
			params: z.object({
				habitId: Str({ example: "habit-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Returns the requested habit with statistics",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							habit: HabitWithStats,
						}),
					},
				},
			},
			"404": {
				description: "Habit not found",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: z.string(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const { habitId } = c.req.param();
		const habit = await getHabitWithStats(c.env.DB, habitId);
		
		if (!habit) {
			return c.json({ success: false, message: "Habit tidak ditemukan" }, 404);
		}

		if (habit.user_username !== payload.sub) {
			return c.json({ success: false, message: "Akses ditolak" }, 403);
		}

		return c.json({ success: true, habit });
	}
}

export class HabitCreate {
	static schema = {
		tags: ["Habits"],
		summary: "Create a new habit",
		request: {
			body: {
				content: {
					"application/json": {
						schema: HabitCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Returns the created habit",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							habit: Habit,
						}),
					},
				},
			},
			"400": {
				description: "Validation error",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: z.string(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		try {
			const body = await c.req.json();
			const habit = await createHabit(c.env.DB, body, payload.sub);
			return c.json({ success: true, habit }, 201);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to create habit";
			return c.json({ success: false, message }, 400);
		}
	}
}

export class HabitUpdate {
	static schema = {
		tags: ["Habits"],
		summary: "Update a habit",
		request: {
			params: z.object({
				habitId: Str({ example: "habit-001" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: HabitUpdateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns the updated habit",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							habit: Habit,
						}),
					},
				},
			},
			"400": {
				description: "Validation error",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: z.string(),
						}),
					},
				},
			},
			"404": {
				description: "Habit not found",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: z.string(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const { habitId } = c.req.param();
		const existingHabit = await getHabit(c.env.DB, habitId);
		
		if (!existingHabit) {
			return c.json({ success: false, message: "Habit tidak ditemukan" }, 404);
		}

		if (existingHabit.user_username !== payload.sub) {
			return c.json({ success: false, message: "Akses ditolak" }, 403);
		}

		try {
			const body = await c.req.json();
			const habit = await updateHabit(c.env.DB, habitId, body);
			return c.json({ success: true, habit });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update habit";
			const status = message.includes("tidak ditemukan") ? 404 : 400;
			return c.json({ success: false, message }, status);
		}
	}
}

export class HabitDelete {
	static schema = {
		tags: ["Habits"],
		summary: "Delete a habit",
		request: {
			params: z.object({
				habitId: Str({ example: "habit-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Returns the deleted habit",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							habit: Habit,
						}),
					},
				},
			},
			"404": {
				description: "Habit not found",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: z.string(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const { habitId } = c.req.param();
		const existingHabit = await getHabit(c.env.DB, habitId);
		
		if (!existingHabit) {
			return c.json({ success: false, message: "Habit tidak ditemukan" }, 404);
		}

		if (existingHabit.user_username !== payload.sub) {
			return c.json({ success: false, message: "Akses ditolak" }, 403);
		}

		try {
			const habit = await deleteHabit(c.env.DB, habitId);
			return c.json({ success: true, habit });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete habit";
			const status = message.includes("tidak ditemukan") ? 404 : 400;
			return c.json({ success: false, message }, status);
		}
	}
}

export class HabitCompletionList {
	static schema = {
		tags: ["Habits"],
		summary: "Get habit completion history",
		request: {
			params: z.object({
				habitId: Str({ example: "habit-001" }),
			}),
			query: z.object({
				startDate: Str({ required: false, description: "ISO 8601 date" }),
				endDate: Str({ required: false, description: "ISO 8601 date" }),
			}),
		},
		responses: {
			"200": {
				description: "Returns habit completions",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							completions: HabitCompletion.array(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const { habitId } = c.req.param();
		const habit = await getHabit(c.env.DB, habitId);
		
		if (!habit) {
			return c.json({ success: false, message: "Habit tidak ditemukan" }, 404);
		}

		if (habit.user_username !== payload.sub) {
			return c.json({ success: false, message: "Akses ditolak" }, 403);
		}

		const query = c.req.query();
		const completions = await getHabitCompletions(
			c.env.DB,
			habitId,
			query.startDate,
			query.endDate,
		);

		return c.json({ success: true, completions });
	}
}

export class HabitCompletionCreate {
	static schema = {
		tags: ["Habits"],
		summary: "Mark habit as completed",
		request: {
			body: {
				content: {
					"application/json": {
						schema: HabitCompletionCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Returns the created completion",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							completion: HabitCompletion,
						}),
					},
				},
			},
			"400": {
				description: "Validation error",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: z.string(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		try {
			const body = await c.req.json();
			const completion = await createHabitCompletion(c.env.DB, body, payload.sub);
			return c.json({ success: true, completion }, 201);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to create completion";
			return c.json({ success: false, message }, 400);
		}
	}
}

export class HabitCompletionDelete {
	static schema = {
		tags: ["Habits"],
		summary: "Unmark habit completion",
		request: {
			params: z.object({
				habitId: Str({ example: "habit-001" }),
			}),
			query: z.object({
				date: Str({ description: "ISO 8601 date", example: "2024-01-15" }),
			}),
		},
		responses: {
			"200": {
				description: "Completion deleted successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
						}),
					},
				},
			},
			"404": {
				description: "Completion not found",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: z.string(),
						}),
					},
				},
			},
		},
	};

	static async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const { habitId } = c.req.param();
		const query = c.req.query();
		const date = query.date;

		if (!date) {
			return c.json({ success: false, message: "Date parameter required" }, 400);
		}

		try {
			await deleteHabitCompletion(c.env.DB, habitId, date, payload.sub);
			return c.json({ success: true });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete completion";
			const status = message.includes("tidak ditemukan") ? 404 : 400;
			return c.json({ success: false, message }, status);
		}
	}
}
