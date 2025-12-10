import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { createUser } from "../services/users";
import { type AppContext, UserPublicSchema } from "../models/types";

export class AuthRegister extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Register a new user account",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							username: Str({ example: "newuser" }),
							name: Str({ example: "New User" }),
							password: Str({ example: "password123" }),
						}),
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Registration successful",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: Str({ example: "Registration successful" }),
							user: UserPublicSchema,
						}),
					},
				},
			},
			"400": {
				description: "Registration failed",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: Str({ example: "Username already exists" }),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { username, name, password } = data.body;

		try {
			// Create user with default role 'member'
			const user = await createUser(c.env.DB, {
				username,
				name,
				password,
				role: "member",
			});

			return c.json(
				{
					success: true,
					message: "Registration successful",
					user: {
						username: user.username,
						name: user.name,
						role: user.role,
					},
				},
				201
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Registration failed";
			return c.json(
				{
					success: false,
					message,
				},
				400
			);
		}
	}
}
