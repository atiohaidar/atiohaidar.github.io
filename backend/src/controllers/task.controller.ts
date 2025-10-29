import { Bool, Num } from "chanfana";
import { z } from "zod";
import { createTask, deleteTask, getTask, listTasks, updateTask } from "../services/tasks";
import { type AppContext, Task, TaskCreateSchema, TaskUpdateSchema } from "../models/types";
import { getTokenPayloadFromRequest } from "../middlewares/auth";

type ListQuery = {
	page?: number;
	isCompleted?: boolean;
};

type UpdateBody = z.infer<typeof TaskUpdateSchema>;

export class TaskController {
	static listSchema = {
		tags: ["Tasks"],
		summary: "List Tasks",
		request: {
			query: z.object({
				page: z.coerce.number().int().nonnegative().optional(),
				isCompleted: Bool({ required: false, description: "Filter by completed flag" }),
			}),
		},
		responses: {
			"200": {
				description: "Returns a list of tasks",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							tasks: Task.array(),
						}),
					},
				},
			},
		},
	};

	static getSchema = {
		tags: ["Tasks"],
		summary: "Get a single Task",
		request: {
			params: z.object({
				taskId: z.coerce.number().int().positive(),
			}),
		},
		responses: {
			"200": {
				description: "Returns the requested task",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							task: Task,
						}),
					},
				},
			},
			"404": {
				description: "Task not found",
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

	static createSchema = {
		tags: ["Tasks"],
		summary: "Create a new Task",
		request: {
			body: {
				content: {
					"application/json": {
						schema: TaskCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Returns the created task",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							task: Task,
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

	static updateSchema = {
		tags: ["Tasks"],
		summary: "Update a Task",
		request: {
			params: z.object({
				taskId: z.coerce.number().int().positive(),
			}),
			body: {
				content: {
					"application/json": {
						schema: TaskUpdateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns the updated task",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							task: Task,
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
				description: "Task not found",
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

	static deleteSchema = {
		tags: ["Tasks"],
		summary: "Delete a Task",
		request: {
			params: z.object({
				taskId: z.coerce.number().int().positive(),
			}),
		},
		responses: {
			"200": {
				description: "Returns the deleted task",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							task: Task,
						}),
					},
				},
			},
			"404": {
				description: "Task not found",
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

	private static async validateData<T>(c: AppContext, schema: any): Promise<T> {
		if (schema.request?.query) {
			const query = c.req.query();
			const normalized: Record<string, unknown> = {};

			if (query.page !== undefined) {
				const parsed = Number(query.page);
				if (Number.isNaN(parsed)) {
					throw new Error("Query validation failed: page must be a valid number");
				}
				normalized.page = parsed;
			}

			const completedValue = query.isCompleted ?? query.is_completed;
			if (completedValue !== undefined) {
				if (completedValue === "true" || completedValue === "false") {
					normalized.isCompleted = completedValue === "true";
				} else if (typeof completedValue === "boolean") {
					normalized.isCompleted = completedValue;
				} else {
					throw new Error("Query validation failed: isCompleted must be boolean");
				}
			}

			const result = schema.request.query.safeParse(normalized);
			if (!result.success) {
				throw new Error(`Query validation failed: ${result.error.message}`);
			}

			return { query: result.data } as T;
		}

		if (schema.request?.params) {
			const parsed = schema.request.params.safeParse(c.req.param());
			if (!parsed.success) {
				throw new Error(`Params validation failed: ${parsed.error.message}`);
			}

			return { params: parsed.data } as T;
		}

		if (schema.request?.body?.content?.["application/json"]?.schema) {
			try {
				const body = await c.req.json();
				const bodySchema = schema.request.body.content["application/json"].schema;
				const parsed = bodySchema.safeParse(body);
				if (!parsed.success) {
					throw new Error(`Body validation failed: ${parsed.error.message}`);
				}
				return { body: parsed.data } as T;
			} catch (error) {
				if (error instanceof Error && error.message.includes("validation failed")) {
					throw error;
				}
				throw new Error("Invalid JSON body");
			}
		}

		return {} as T;
	}

	static async list(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await TaskController.validateData<{ query: ListQuery }>(
			c,
			TaskController.listSchema,
		);

		const page = data.query.page ?? 0;
		const isCompleted = data.query.isCompleted;
		const owner = payload.role === "admin" ? undefined : payload.sub;

		const tasks = await listTasks(c.env.DB, { page, isCompleted, owner });
		return c.json({ success: true, tasks });
	}

	static async get(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await TaskController.validateData<{ params: { taskId: number } }>(
			c,
			TaskController.getSchema,
		);

		const { taskId } = data.params;
		const task = await getTask(c.env.DB, taskId);
		if (!task) {
			return c.json({ success: false, message: "Task not found" }, 404);
		}

		if (payload.role !== "admin" && task.owner !== payload.sub) {
			return c.json({ success: false, message: "Akses ditolak" }, 403);
		}

		return c.json({ success: true, task });
	}

	static async create(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await TaskController.validateData<{ body: z.infer<typeof TaskCreateSchema> }>(
			c,
			TaskController.createSchema,
		);

		try {
			const task = await createTask(c.env.DB, data.body, payload.sub);
			return c.json({ success: true, task }, 201);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to create task";
			return c.json({ success: false, message }, 400);
		}
	}

	static async update(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await TaskController.validateData<{
			params: { taskId: number };
			body: UpdateBody;
		}>(c, TaskController.updateSchema);

		const { taskId } = data.params;
		const existingTask = await getTask(c.env.DB, taskId);
		if (!existingTask) {
			return c.json({ success: false, message: "Task not found" }, 404);
		}

		if (payload.role !== "admin" && existingTask.owner !== payload.sub) {
			return c.json({ success: false, message: "Akses ditolak" }, 403);
		}

		try {
			const task = await updateTask(c.env.DB, taskId, data.body);
			return c.json({ success: true, task });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update task";
			const status = message.includes("not found") ? 404 : 400;
			return c.json({ success: false, message }, status);
		}
	}

	static async delete(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await TaskController.validateData<{ params: { taskId: number } }>(
			c,
			TaskController.deleteSchema,
		);

		const { taskId } = data.params;
		const existingTask = await getTask(c.env.DB, taskId);
		if (!existingTask) {
			return c.json({ success: false, message: "Task not found" }, 404);
		}

		if (payload.role !== "admin" && existingTask.owner !== payload.sub) {
			return c.json({ success: false, message: "Akses ditolak" }, 403);
		}

		try {
			const task = await deleteTask(c.env.DB, taskId);
			return c.json({ success: true, task });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete task";
			const status = message.includes("not found") ? 404 : 400;
			return c.json({ success: false, message }, status);
		}
	}
}
