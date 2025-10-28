import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { deleteTask } from "../data/tasks";
import { type AppContext, Task } from "../types";

export class TaskDelete extends OpenAPIRoute {
	schema = {
		tags: ["Tasks"],
		summary: "Delete a Task",
		request: {
			params: z.object({
				taskSlug: Str({ description: "Task slug" }),
			}),
		},
		responses: {
			"200": {
				description: "Returns if the task was deleted successfully",
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

		try {
			const task = await deleteTask(c.env.DB, taskSlug);
			return c.json({
				success: true,
				task,
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Gagal menghapus task";
			const status = message.includes("tidak ditemukan") ? 404 : 400;
			return c.json(
				{
					success: false,
					message,
				},
				status,
			);
		}
	}
}
