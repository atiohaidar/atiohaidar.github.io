import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { listTasks } from "../services/tasks";
import { type AppContext, Task } from "../models/types";

export class TaskList extends OpenAPIRoute {
	schema = {
		tags: ["Tasks"],
		summary: "List Tasks",
		request: {
			query: z.object({
				page: Num({
					description: "Page number",
					default: 0,
				}),
				isCompleted: Bool({
					description: "Filter by completed flag",
					required: false,
				}),
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

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { page, isCompleted } = data.query;

		const tasks = await listTasks(c.env.DB, {
			page,
			isCompleted,
		});

		return c.json({
			success: true,
			tasks,
		});
	}
}
