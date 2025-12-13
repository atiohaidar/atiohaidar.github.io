import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../models/types";
import {
    GameFarmProfile,
    GameCrop,
    GameShopItem,
    GameInventoryItem,
    GameFarmPlot,
    GameAchievement,
    GameDailyQuest,
    GameLeaderboardEntry,
    PlantCropRequestSchema,
    WaterPlotRequestSchema,
    HarvestPlotRequestSchema,
    PurchaseItemRequestSchema,
    ExchangeBalanceRequestSchema,
    PlaceItemRequestSchema,
    RemoveItemRequestSchema,
    UseItemRequestSchema,
    GAME_CONSTANTS,
} from "../models/game.types";
import * as GameService from "../services/game";
import { getTokenPayloadFromRequest } from "../middlewares/auth";

// ==========================================
// HELPER: Get authenticated username
// ==========================================
const getAuthUsername = async (c: AppContext): Promise<string> => {
    const payload = await getTokenPayloadFromRequest(c);
    if (!payload?.sub) {
        throw new Error("Token tidak valid");
    }
    return payload.sub;
};

// ==========================================
// PROFILE ENDPOINTS
// ==========================================
export class GameProfileGet extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Get player game profile",
        security: [{ bearerAuth: [] }],
        responses: {
            "200": {
                description: "Player profile",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: GameFarmProfile,
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const profile = await GameService.getOrCreateProfile(c.env.DB, username);
            return c.json({ success: true, data: profile });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

export class GameProfileReset extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Prestige reset - restart with bonuses",
        security: [{ bearerAuth: [] }],
        responses: {
            "200": {
                description: "Prestige result",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                new_prestige_level: z.number(),
                                bonus_percent: z.number(),
                            }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const result = await GameService.prestigeReset(c.env.DB, username);
            return c.json({ success: true, data: result });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

// ==========================================
// FARM ENDPOINTS
// ==========================================
export class GameFarmGet extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Get all farm plots with growth status",
        security: [{ bearerAuth: [] }],
        responses: {
            "200": {
                description: "Farm plots",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(GameFarmPlot.extend({
                                crop: GameCrop.optional(),
                                ready: z.boolean(),
                                time_remaining: z.number(),
                            })),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const plots = await GameService.getFarmPlotsWithGrowth(c.env.DB, username);
            return c.json({ success: true, data: plots });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

export class GameFarmPlant extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Plant a crop in a plot",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: PlantCropRequestSchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Planted crop",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: GameFarmPlot,
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const body = await c.req.json();
            const { plot_index, crop_id } = PlantCropRequestSchema.parse(body);
            const plot = await GameService.plantCrop(c.env.DB, username, plot_index, crop_id);
            return c.json({ success: true, data: plot });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

export class GameFarmWater extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Water a plot to speed up growth",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: WaterPlotRequestSchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Watered plot",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: GameFarmPlot,
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const body = await c.req.json();
            const { plot_index } = WaterPlotRequestSchema.parse(body);
            const plot = await GameService.waterPlot(c.env.DB, username, plot_index);
            return c.json({ success: true, data: plot });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

export class GameFarmPlaceItem extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Place a decoration or sprinkler on a plot",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: PlaceItemRequestSchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Placed item",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: GameFarmPlot,
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const body = await c.req.json();
            const { plot_index, item_id } = PlaceItemRequestSchema.parse(body);
            const plot = await GameService.placeItem(c.env.DB, username, plot_index, item_id);
            return c.json({ success: true, data: plot });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

export class GameFarmRemoveItem extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Remove an item from a plot",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: RemoveItemRequestSchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Removed item",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: GameFarmPlot,
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const body = await c.req.json();
            const { plot_index } = RemoveItemRequestSchema.parse(body);
            const plot = await GameService.removeItem(c.env.DB, username, plot_index);
            return c.json({ success: true, data: plot });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

export class GameFarmUseItem extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Use an item (consumable)",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: UseItemRequestSchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Item used",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: GameFarmPlot.optional(),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const body = await c.req.json();
            const { item_id, target_plot_index } = UseItemRequestSchema.parse(body);
            const result = await GameService.useItem(c.env.DB, username, item_id, target_plot_index);
            return c.json({ success: true, message: result.message, data: result.updatedPlot });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

export class GameFarmHarvest extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Harvest a ready crop",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: HarvestPlotRequestSchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Harvest result",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                gold: z.number(),
                                xp: z.number(),
                                crop: GameCrop,
                                leveledUp: z.boolean(),
                                newLevel: z.number(),
                            }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const body = await c.req.json();
            const { plot_index } = HarvestPlotRequestSchema.parse(body);
            const result = await GameService.harvestPlot(c.env.DB, username, plot_index);
            return c.json({ success: true, data: result });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

export class GameFarmHarvestAll extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Harvest all ready crops",
        security: [{ bearerAuth: [] }],
        responses: {
            "200": {
                description: "Harvest all result",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                total_gold: z.number(),
                                total_xp: z.number(),
                                harvested_count: z.number(),
                                leveled_up: z.boolean(),
                                new_level: z.number(),
                            }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const result = await GameService.harvestAll(c.env.DB, username);
            return c.json({ success: true, data: result });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

// ==========================================
// CROPS ENDPOINTS
// ==========================================
export class GameCropsList extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Get all available crops",
        security: [{ bearerAuth: [] }],
        responses: {
            "200": {
                description: "List of crops",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(GameCrop),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const profile = await GameService.getOrCreateProfile(c.env.DB, username);
            const crops = await GameService.getUnlockedCrops(c.env.DB, profile.level);
            const allCrops = await GameService.getAllCrops(c.env.DB);
            return c.json({
                success: true,
                data: allCrops.map(c => ({
                    ...c,
                    unlocked: c.unlock_level <= profile.level,
                })),
            });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

// ==========================================
// SHOP ENDPOINTS
// ==========================================
export class GameShopList extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Get shop items",
        security: [{ bearerAuth: [] }],
        responses: {
            "200": {
                description: "Shop items",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(GameShopItem),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const profile = await GameService.getOrCreateProfile(c.env.DB, username);
            const items = await GameService.getAllShopItems(c.env.DB);
            return c.json({
                success: true,
                data: items.map(item => ({
                    ...item,
                    unlocked: item.unlock_level <= profile.level,
                })),
            });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

export class GameShopPurchase extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Purchase an item from shop",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: PurchaseItemRequestSchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Purchase result",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                newGold: z.number(),
                                newGems: z.number(),
                                inventoryItem: GameInventoryItem,
                            }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const body = await c.req.json();
            const { item_id, quantity } = PurchaseItemRequestSchema.parse(body);
            const result = await GameService.purchaseItem(c.env.DB, username, item_id, quantity);
            return c.json({ success: true, data: result });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

// ==========================================
// INVENTORY ENDPOINTS
// ==========================================
export class GameInventoryList extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Get player inventory",
        security: [{ bearerAuth: [] }],
        responses: {
            "200": {
                description: "Inventory items",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(GameInventoryItem.extend({
                                item: GameShopItem,
                            })),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const inventory = await GameService.getInventory(c.env.DB, username);
            return c.json({ success: true, data: inventory });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

// ==========================================
// ACHIEVEMENTS ENDPOINTS
// ==========================================
export class GameAchievementsList extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Get achievements list",
        security: [{ bearerAuth: [] }],
        responses: {
            "200": {
                description: "Achievements",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(GameAchievement.extend({
                                progress: z.number(),
                                claimed: z.boolean(),
                            })),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const achievements = await GameService.getAchievements(c.env.DB, username);
            return c.json({ success: true, data: achievements });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

export class GameAchievementClaim extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Claim achievement reward",
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                achievementId: z.string(),
            }),
        },
        responses: {
            "200": {
                description: "Claimed reward",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                gold: z.number(),
                                gems: z.number(),
                            }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const { achievementId } = c.req.param() as { achievementId: string };
            const result = await GameService.claimAchievement(c.env.DB, username, achievementId);
            return c.json({ success: true, data: result });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

// ==========================================
// DAILY QUESTS ENDPOINTS
// ==========================================
export class GameQuestsList extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Get daily quests",
        security: [{ bearerAuth: [] }],
        responses: {
            "200": {
                description: "Daily quests",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(GameDailyQuest),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const quests = await GameService.getDailyQuests(c.env.DB, username);
            return c.json({ success: true, data: quests });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

export class GameQuestClaim extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Claim daily quest reward",
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                questId: z.string(),
            }),
        },
        responses: {
            "200": {
                description: "Claimed reward",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                gold: z.number(),
                                gems: z.number(),
                            }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const { questId } = c.req.param() as { questId: string };
            const result = await GameService.claimDailyQuest(c.env.DB, username, questId);
            return c.json({ success: true, data: result });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

// ==========================================
// LEADERBOARD ENDPOINTS
// ==========================================
export class GameLeaderboardGet extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Get leaderboard",
        request: {
            query: z.object({
                limit: z.coerce.number().optional().default(50),
            }),
        },
        responses: {
            "200": {
                description: "Leaderboard entries",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(GameLeaderboardEntry),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const { limit } = c.req.query() as { limit?: string };
            const leaderboard = await GameService.getLeaderboard(c.env.DB, Number(limit) || 50);
            return c.json({ success: true, data: leaderboard });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

// ==========================================
// CURRENCY EXCHANGE
// ==========================================
export class GameExchangeBalanceToGems extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Exchange user balance to game gems",
        description: `Exchange rate: ${GAME_CONSTANTS.GEMS_PER_100_BALANCE} gems per 100 balance`,
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: ExchangeBalanceRequestSchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Exchange result",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                gems_received: z.number(),
                                balance_spent: z.number(),
                                new_balance: z.number(),
                                new_gems: z.number(),
                            }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const body = await c.req.json();
            const { balance_amount } = ExchangeBalanceRequestSchema.parse(body);
            const result = await GameService.exchangeBalanceToGems(c.env.DB, username, balance_amount);
            return c.json({ success: true, data: result });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

export class GameExchangeBalanceToGold extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Exchange user balance to game gold",
        description: `Exchange rate: ${GAME_CONSTANTS.GOLD_PER_BALANCE} gold per 1 balance`,
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: ExchangeBalanceRequestSchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Exchange result",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                gold_received: z.number(),
                                balance_spent: z.number(),
                                new_balance: z.number(),
                                new_gold: z.number(),
                            }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const username = await getAuthUsername(c);
            const body = await c.req.json();
            const { balance_amount } = ExchangeBalanceRequestSchema.parse(body);
            const result = await GameService.exchangeBalanceToGold(c.env.DB, username, balance_amount);
            return c.json({ success: true, data: result });
        } catch (error) {
            return c.json({ success: false, error: (error as Error).message }, 400);
        }
    }
}

// ==========================================
// GAME CONSTANTS (Public)
// ==========================================
export class GameConstantsGet extends OpenAPIRoute {
    schema = {
        tags: ["Game"],
        summary: "Get game constants",
        responses: {
            "200": {
                description: "Game constants",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                initial_gold: z.number(),
                                initial_gems: z.number(),
                                initial_plots: z.number(),
                                max_plots: z.number(),
                                gems_per_100_balance: z.number(),
                                gold_per_balance: z.number(),
                                water_speed_bonus: z.number(),
                                prestige_bonus_percent: z.number(),
                            }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        return c.json({
            success: true,
            data: {
                initial_gold: GAME_CONSTANTS.INITIAL_GOLD,
                initial_gems: GAME_CONSTANTS.INITIAL_GEMS,
                initial_plots: GAME_CONSTANTS.INITIAL_PLOTS,
                max_plots: GAME_CONSTANTS.MAX_PLOTS,
                gems_per_100_balance: GAME_CONSTANTS.GEMS_PER_100_BALANCE,
                gold_per_balance: GAME_CONSTANTS.GOLD_PER_BALANCE,
                water_speed_bonus: GAME_CONSTANTS.WATER_SPEED_BONUS,
                prestige_bonus_percent: GAME_CONSTANTS.PRESTIGE_BONUS_PERCENT,
            },
        });
    }
}

export class GamePrestigeReset {
    static async handle(c: AppContext) {
        const username = await getAuthUsername(c);
        const res = await GameService.prestigeReset(c.env.DB, username);
        return c.json({ success: true, data: res });
    }

    static schema = {
        tags: ["Game"],
        summary: "Prestige reset farm for bonus",
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                description: "Prestige successful",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                new_prestige_level: z.number(),
                                bonus_percent: z.number(),
                            }),
                        }),
                    },
                },
            },
        },
    };
}