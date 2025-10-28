import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { createUser } from "../data/users";
import { ensureAdmin } from "../utils/auth";
import { type AppContext, UserCreateSchema, UserPublicSchema } from "../types";

export class UsersCreate extends OpenAPIRoute {
	schema = {
		tags: ["Users"],
		summary: "Buat pengguna baru",
		request: {
			body: {
				content: {
					"application/json": {
						schema: UserCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Pengguna berhasil dibuat",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							user: UserPublicSchema,
						}),
					},
				},
			},
			"400": {
				description: "Validasi gagal",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: z.string(),
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
							message: z.string(),
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

		const data = await this.getValidatedData<typeof this.schema>();

		try {
			const user = await createUser(c.env.DB, data.body);
			return c.json(
				{
					success: true,
					user,
				},
				201,
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Gagal membuat pengguna";
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
