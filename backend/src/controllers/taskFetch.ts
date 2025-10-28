import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { getTask } from "../services/tasks";
import { type AppContext, Task } from "../models/types";

export class TaskFetch extends OpenAPIRoute {
	schema = {
		tags: ["Tasks"],
		summary: "Get a single Task by slug",
		request: {
			params: z.object({
				taskSlug: Str({ description: "Task slug" }),
			}),
		},
		responses: {
			"200": {
				description: "Returns a single task if found",
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
							message: Str({ example: "Task tidak ditemukan" }),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { taskSlug } = data.params;

		const task = await getTask(c.env.DB, taskSlug);

		if (!task) {
			return c.json(
				{
					success: false,
					message: "Task tidak ditemukan",
				},
				404,
			);
		}

		return c.json({
			success: true,
			task,
		});
	}
}
