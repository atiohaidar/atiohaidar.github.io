import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { createTask } from "../services/tasks";
import { type AppContext, Task, TaskCreateSchema } from "../models/types";

export class TaskCreate extends OpenAPIRoute {
	schema = {
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

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		try {
			const task = await createTask(c.env.DB, data.body);
			return c.json(
				{
					success: true,
					task,
				},
				201,
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Gagal membuat task";
			return c.json(
				{
					success: false,
					message,
				},
				400,
			);
		}
	}
}
