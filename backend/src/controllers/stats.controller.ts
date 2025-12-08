import { OpenAPIRoute, Bool, Num } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../models/types";
import { getAdminStats, getMemberStats } from "../services/stats";
import { getTokenPayloadFromRequest } from "../middlewares/auth";

// Get Dashboard Statistics
export class StatsGet extends OpenAPIRoute {
	schema = {
		tags: ["Stats"],
		summary: "Get dashboard statistics",
		responses: {
			"200": {
				description: "Dashboard statistics",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.object({
								totalUsers: Num({ required: false }),
								totalTasks: Num(),
								completedTasks: Num(),
								totalArticles: Num(),
								publishedArticles: Num(),
								totalRooms: Num({ required: false }),
								totalBookings: Num(),
								pendingBookings: Num(),
								approvedBookings: Num(),
							}),
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		let stats;
		if (payload.role === "admin") {
			stats = await getAdminStats(c.env.DB);
		} else {
			stats = await getMemberStats(c.env.DB, payload.sub);
		}

		return c.json({
			success: true,
			data: stats,
		});
	}
}
