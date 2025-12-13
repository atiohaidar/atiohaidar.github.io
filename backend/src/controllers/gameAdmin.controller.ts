import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../models/types";
import {
    GameFarmProfile,
    GameShopItem,
    ShopItemTypeSchema,
} from "../models/game.types";
import * as GameService from "../services/game";
import { ensureAdmin } from "../middlewares/auth";

// ==========================================
// ADMIN PLAYERS ENDPOINTS
// ==========================================
export class GameAdminPlayersList extends OpenAPIRoute {
    schema = {
        tags: ["Game Admin"],
        summary: "Get all players (Admin only)",
        security: [{ bearerAuth: [] }],
        request: {
            query: z.object({
                limit: z.coerce.number().optional().default(50),
                offset: z.coerce.number().optional().default(0),
            }),
        },
        responses: {
            "200": {
                description: "List of players",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                profiles: z.array(GameFarmProfile),
                                total: z.number(),
                            }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            await ensureAdmin(c);
            const { limit, offset } = c.req.query() as { limit?: string; offset?: string };
            const result = await GameService.getAllProfiles(c.env.DB, Number(limit) || 50, Number(offset) || 0);
            return c.json({ success: true, data: result });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

// ==========================================
// ADMIN ITEMS ENDPOINTS
// ==========================================
const CreateItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: ShopItemTypeSchema,
    price_gold: z.number().default(0),
    price_gems: z.number().default(0),
    unlock_level: z.number().default(1),
    effect: z.string().nullable().optional(),
    max_quantity: z.number().default(1),
    icon: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
});

export class GameAdminItemsCreate extends OpenAPIRoute {
    schema = {
        tags: ["Game Admin"],
        summary: "Create shop item (Admin only)",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: CreateItemSchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Created item",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: GameShopItem,
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            await ensureAdmin(c);
            const body = await c.req.json();
            const item = CreateItemSchema.parse(body);
            const result = await GameService.createShopItem(c.env.DB, item);
            return c.json({ success: true, data: result });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

export class GameAdminItemsUpdate extends OpenAPIRoute {
    schema = {
        tags: ["Game Admin"],
        summary: "Update shop item (Admin only)",
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string(),
            }),
            body: {
                content: {
                    "application/json": {
                        schema: CreateItemSchema.partial(),
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Updated item",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: GameShopItem,
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            await ensureAdmin(c);
            const { id } = c.req.param() as { id: string };
            const body = await c.req.json();
            const updates = CreateItemSchema.partial().parse(body);
            const result = await GameService.updateShopItem(c.env.DB, id, updates);
            return c.json({ success: true, data: result });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

export class GameAdminItemsDelete extends OpenAPIRoute {
    schema = {
        tags: ["Game Admin"],
        summary: "Delete shop item (Admin only)",
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string(),
            }),
        },
        responses: {
            "200": {
                description: "Delete result",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            await ensureAdmin(c);
            const { id } = c.req.param() as { id: string };
            await GameService.deleteShopItem(c.env.DB, id);
            return c.json({ success: true });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}
