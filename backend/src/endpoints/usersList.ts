import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { listUsers } from "../data/users";
import { ensureAdmin } from "../utils/auth";
import { type AppContext, UserPublicSchema } from "../types";

export class UsersList extends OpenAPIRoute {
	schema = {
		tags: ["Users"],
		summary: "Dapatkan daftar seluruh pengguna",
		responses: {
			"200": {
				description: "Daftar pengguna tersedia",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							users: UserPublicSchema.array(),
						}),
					},
				},
			},
			"403": {
				description: "Tidak memiliki hak akses",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: Str({ example: "Hak akses admin diperlukan" }),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const admin = ensureAdmin(c);

		if (!admin) {
			return c.json(
				{
					success: false,
					message: "Hak akses admin diperlukan",
				},
				403,
			);
		}

		const users = await listUsers(c.env.DB);

		return {
			success: true,
			users,
		};
	}
}
