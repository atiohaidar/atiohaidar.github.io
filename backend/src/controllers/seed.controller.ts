import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../models/types";
import { runSeeders } from "../seeders";
import { initializeGameDb } from "../services/game";

export class SeedDatabase extends OpenAPIRoute {
    schema = {
        tags: ["Admin"],
        summary: "Run database seeders",
        description: "Runs all pending database seeders to populate initial data",
        responses: {
            "200": {
                description: "Seeders executed successfully",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            // Initialize game tables first
            await initializeGameDb(c.env.DB);

            // Then run seeders
            await runSeeders(c.env.DB);
            return c.json({
                success: true,
                message: "Database seeders executed successfully",
            });
        } catch (error) {
            return c.json({
                success: false,
                message: error instanceof Error ? error.message : "Failed to run seeders",
            }, 500);
        }
    }
}
