import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { updateUser, getUser } from "../services/users";
import { type AppContext } from "../models/types";

export class AuthForgotPassword extends OpenAPIRoute {
    schema = {
        tags: ["Auth"],
        summary: "Reset password for a user (simple reset - no email verification)",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            username: Str({ example: "user" }),
                            newPassword: Str({ example: "newpassword123" }),
                        }),
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Password reset successful",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            message: Str({ example: "Password has been reset successfully" }),
                        }),
                    },
                },
            },
            "404": {
                description: "User not found",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            message: Str({ example: "User not found" }),
                        }),
                    },
                },
            },
            "400": {
                description: "Password reset failed",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            message: Str({ example: "Failed to reset password" }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        const data = await this.getValidatedData<typeof this.schema>();
        const { username, newPassword } = data.body;

        try {
            // Check if user exists
            const existingUser = await getUser(c.env.DB, username);
            if (!existingUser) {
                return c.json(
                    {
                        success: false,
                        message: "User not found",
                    },
                    404
                );
            }

            // Update password
            await updateUser(c.env.DB, username, {
                password: newPassword,
            });

            return c.json({
                success: true,
                message: "Password has been reset successfully",
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to reset password";
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
