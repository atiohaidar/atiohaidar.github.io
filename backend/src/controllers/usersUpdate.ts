import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { updateUser } from "../services/users";
import { ensureAdmin } from "../middlewares/auth";
import { type AppContext, UserPublicSchema, UserUpdateSchema } from "../models/types";

export class UsersUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Users"],
		summary: "Perbarui data pengguna",
		request: {
			params: z.object({
				username: Str({ description: "Username yang akan diperbarui" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: UserUpdateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Pengguna berhasil diperbarui",
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
							message: Str({ example: "Minimal satu field harus diisi" }),
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
			"404": {
				description: "Pengguna tidak ditemukan",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: Str({ example: "User tidak ditemukan" }),
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
			const user = await updateUser(c.env.DB, data.params.username, data.body);
			return c.json({
				success: true,
				user,
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Gagal memperbarui pengguna";
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
