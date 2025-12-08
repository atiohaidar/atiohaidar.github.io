import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { validateUserCredentials } from "../services/users";
import { createToken } from "../middlewares/auth";
import { type AppContext, UserPublicSchema } from "../models/types";

export class AuthLogin extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Authenticate a user and return an access token",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							username: Str({ example: "admin" }),
							password: Str({ example: "admin123" }),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Valid credentials",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							token: Str({ description: "JWT access token" }),
							user: UserPublicSchema,
						}),
					},
				},
			},
			"401": {
				description: "Invalid credentials",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: Str({ example: "Invalid username or password" }),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { username, password } = data.body;

		const matchedUser = await validateUserCredentials(c.env.DB, username, password);

		if (!matchedUser) {
			return c.json(
				{
					success: false,
					message: "Invalid username or password",
				},
				401,
			);
		}

		const token = await createToken(matchedUser);

		return c.json({
			success: true,
			token,
			user: {
				username: matchedUser.username,
				name: matchedUser.name,
				role: matchedUser.role,
			},
		});
	}
}
