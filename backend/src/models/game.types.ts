import { Bool, Num, Str } from "chanfana";
import { z } from "zod";

// ==========================================
// GAME FARM PROFILE
// ==========================================
export const GameFarmProfile = z.object({
    user_username: Str({ description: "Username of the player", example: "user1" }),
    level: Num({ description: "Player level", example: 1 }).default(1),
    experience: Num({ description: "Current XP", example: 0 }).default(0),
    gold: Num({ description: "In-game gold currency", example: 100 }).default(100),
    gems: Num({ description: "Premium currency", example: 10 }).default(10),
    prestige_level: Num({ description: "Prestige resets completed", example: 0 }).default(0),
    total_harvests: Num({ description: "Total crops harvested", example: 0 }).default(0),
    total_gold_earned: Num({ description: "Total gold earned all time", example: 0 }).default(0),
    plots_unlocked: Num({ description: "Number of plots unlocked", example: 9 }).default(9),
    last_daily_reward: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
});

export type GameFarmProfileType = z.infer<typeof GameFarmProfile>;

// ==========================================
// GAME CROPS
// ==========================================
export const GameCrop = z.object({
    id: Str({ description: "Unique crop ID", example: "carrot" }),
    name: Str({ description: "Crop display name", example: "Carrot" }),
    tier: Num({ description: "Crop tier (1-5)", example: 1 }).default(1),
    grow_time_seconds: Num({ description: "Time to grow in seconds", example: 30 }),
    sell_price: Num({ description: "Gold earned when sold", example: 10 }),
    seed_price: Num({ description: "Cost to plant", example: 5 }),
    unlock_level: Num({ description: "Level required to unlock", example: 1 }).default(1),
    xp_reward: Num({ description: "XP earned on harvest", example: 5 }).default(5),
    icon: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
});

export type GameCropType = z.infer<typeof GameCrop>;

// ==========================================
// GAME SHOP ITEMS
// ==========================================
export const ShopItemTypeSchema = z.enum([
    "seed",
    "tool",
    "upgrade",
    "decoration",
    "premium",
    "booster"
]);

export type ShopItemType = z.infer<typeof ShopItemTypeSchema>;

export const GameShopItem = z.object({
    id: Str({ description: "Unique item ID", example: "sprinkler" }),
    name: Str({ description: "Item display name", example: "Sprinkler" }),
    type: ShopItemTypeSchema,
    price_gold: Num({ description: "Gold price", example: 1500 }).default(0),
    price_gems: Num({ description: "Gems price", example: 0 }).default(0),
    unlock_level: Num({ description: "Level required to unlock", example: 1 }).default(1),
    effect: z.string().nullable().optional(),
    max_quantity: Num({ description: "Max ownable, -1 = unlimited", example: 1 }).default(1),
    icon: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
});

export type GameShopItemType = z.infer<typeof GameShopItem>;

// ==========================================
// GAME INVENTORY
// ==========================================
export const GameInventoryItem = z.object({
    id: Str({ description: "Inventory entry ID" }),
    user_username: Str({ description: "Owner username" }),
    item_id: Str({ description: "Item ID from shop" }),
    quantity: Num({ description: "Quantity owned", example: 1 }).default(1),
    equipped: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)),
    purchased_at: z.string().nullable().optional(),
});

export type GameInventoryItemType = z.infer<typeof GameInventoryItem>;

// ==========================================
// GAME FARM PLOTS
// ==========================================
export const GameFarmPlot = z.object({
    id: Str({ description: "Plot ID" }),
    user_username: Str({ description: "Owner username" }),
    plot_index: Num({ description: "Plot position index (optional if using x,y)", example: 0 }).optional(),
    x: Num({ description: "X coordinate (percentage 0-100)", example: 50 }).default(0),
    y: Num({ description: "Y coordinate (percentage 0-100)", example: 50 }).default(0),
    crop_id: z.string().nullable().optional(),
    placed_item_id: z.string().nullable().optional(), // Decoration or sprinkler ID
    fertilizer_id: z.string().nullable().optional(), // Active fertilizer ID
    planted_at: z.string().nullable().optional(),
    watered: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)),
    growth_percent: Num({ description: "Growth progress 0-100", example: 0 }).default(0),
    auto_replant: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)),
});

export type GameFarmPlotType = z.infer<typeof GameFarmPlot>;

// ==========================================
// GAME ACHIEVEMENTS
// ==========================================
export const GameAchievement = z.object({
    id: Str({ description: "Achievement ID", example: "first_harvest" }),
    name: Str({ description: "Achievement name", example: "First Harvest" }),
    description: z.string().nullable().optional(),
    requirement: Str({ description: "JSON requirement data" }),
    reward_gold: Num({ description: "Gold reward", example: 50 }).default(0),
    reward_gems: Num({ description: "Gems reward", example: 0 }).default(0),
    icon: z.string().nullable().optional(),
});

export type GameAchievementType = z.infer<typeof GameAchievement>;

export const GameUserAchievement = z.object({
    user_username: Str({ description: "Username" }),
    achievement_id: Str({ description: "Achievement ID" }),
    progress: Num({ description: "Current progress", example: 0 }).default(0),
    claimed: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)),
    claimed_at: z.string().nullable().optional(),
});

export type GameUserAchievementType = z.infer<typeof GameUserAchievement>;

// ==========================================
// GAME DAILY QUESTS
// ==========================================
export const GameDailyQuest = z.object({
    id: Str({ description: "Quest ID" }),
    user_username: Str({ description: "Username" }),
    quest_type: Str({ description: "Quest type: harvest, plant, earn, water" }),
    target_value: Num({ description: "Target to complete", example: 10 }),
    current_value: Num({ description: "Current progress", example: 0 }).default(0),
    reward_gold: Num({ description: "Gold reward", example: 100 }).default(0),
    reward_gems: Num({ description: "Gems reward", example: 0 }).default(0),
    completed: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)),
    quest_date: Str({ description: "Date of quest (YYYY-MM-DD)" }),
});

export type GameDailyQuestType = z.infer<typeof GameDailyQuest>;

export const GameObstacle = z.object({
    id: Str({ description: "Obstacle ID" }),
    user_username: Str({ description: "Owner username" }),
    type: Str({ description: "Type: rock, weed, etc.", example: "rock" }),
    x: Num({ description: "X coordinate", example: 20 }),
    y: Num({ description: "Y coordinate", example: 30 }),
    created_at: z.string().nullable().optional(),
    remove_cost: Num({ description: "Gold cost to remove", example: 50 }),
});

export type GameObstacleType = z.infer<typeof GameObstacle>;

// ==========================================
// GAME LEADERBOARD
// ==========================================
export const GameLeaderboardEntry = z.object({
    user_username: Str({ description: "Username" }),
    total_gold_earned: Num({ description: "Total gold earned", example: 0 }).default(0),
    level: Num({ description: "Player level", example: 1 }).default(1),
    prestige_level: Num({ description: "Prestige level", example: 0 }).default(0),
    rank: z.number().nullable().optional(),
    updated_at: z.string().nullable().optional(),
});

export type GameLeaderboardEntryType = z.infer<typeof GameLeaderboardEntry>;

// ==========================================
// REQUEST SCHEMAS
// ==========================================
export const PlantCropRequestSchema = z.object({
    plot_index: Num({ description: "Legacy Grid Index", required: false }).optional(),
    x: Num({ description: "X Coordinate", required: false }).optional(),
    y: Num({ description: "Y Coordinate", required: false }).optional(),
    crop_id: Str({ description: "Crop ID to plant", example: "carrot" }),
});

export const PlaceItemRequestSchema = z.object({
    plot_index: Num({ description: "Legacy Grid Index", required: false }).optional(),
    x: Num({ description: "X Coordinate", required: false }).optional(),
    y: Num({ description: "Y Coordinate", required: false }).optional(),
    item_id: Str({ description: "Inventory Item ID to place", example: "sprinkler" }),
});

export const RemoveItemRequestSchema = z.object({
    plot_index: Num({ description: "Plot index or Plot ID to remove item from", example: 0 }),
    // In coordinate system, we might remove by clicking the plot/item directly, which implies knowing the PlotID not index.
    // For back-compat we keep plot_index but we should probably support plot_id too.
    plot_id: Str({ description: "Plot ID target", required: false }).optional(),
});

export const WaterPlotRequestSchema = z.object({
    plot_index: Num({ description: "Plot index", required: false }).optional(),
    plot_id: Str({ description: "Plot ID", required: false }).optional(),
});

export const HarvestPlotRequestSchema = z.object({
    plot_index: Num({ description: "Plot index", required: false }).optional(),
    plot_id: Str({ description: "Plot ID", required: false }).optional(),
});

export const PurchaseItemRequestSchema = z.object({
    item_id: Str({ description: "Item ID to purchase", example: "sprinkler" }),
    quantity: Num({ description: "Quantity to purchase", example: 1 }).default(1),
});

export const UseItemRequestSchema = z.object({
    item_id: Str({ description: "Item ID to use", example: "growth_potion" }),
    target_plot_index: Num({ required: false, description: "Target plot index if applicable" }).optional(),
    target_plot_id: Str({ required: false, description: "Target plot ID" }).optional(),
});

export const ExchangeBalanceRequestSchema = z.object({
    balance_amount: Num({ description: "Amount of balance to exchange", example: 100 }),
});

// ==========================================
// RESPONSE SCHEMAS
// ==========================================
export const HarvestResultSchema = z.object({
    gold_earned: Num({ description: "Gold earned from harvest" }),
    xp_earned: Num({ description: "XP earned from harvest" }),
    crop: GameCrop,
    leveled_up: Bool({ description: "Did player level up" }).default(false),
    new_level: Num({ required: false, description: "New level if leveled up" }),
});

export const PurchaseResultSchema = z.object({
    success: Bool({ description: "Was purchase successful" }),
    new_gold: Num({ description: "Remaining gold" }),
    new_gems: Num({ description: "Remaining gems" }),
    inventory_item: GameInventoryItem.optional(),
});

export const ExchangeResultSchema = z.object({
    success: Bool({ description: "Was exchange successful" }),
    gems_received: Num({ description: "Gems received" }),
    balance_spent: Num({ description: "Balance spent" }),
    new_balance: Num({ description: "New user balance" }),
    new_gems: Num({ description: "New gem count" }),
});

// ==========================================
// XP/LEVEL CALCULATION
// ==========================================
export const calculateXpForLevel = (level: number): number => {
    // XP needed = 100 * level * 1.5^(level-1)
    return Math.floor(100 * level * Math.pow(1.5, level - 1));
};

export const calculateLevelFromXp = (totalXp: number): { level: number; currentXp: number; xpForNext: number } => {
    let level = 1;
    let xpRemaining = totalXp;

    while (true) {
        const xpNeeded = calculateXpForLevel(level);
        if (xpRemaining < xpNeeded) {
            return {
                level,
                currentXp: xpRemaining,
                xpForNext: xpNeeded,
            };
        }
        xpRemaining -= xpNeeded;
        level++;
    }
};

// ==========================================
// GAME CONSTANTS
// ==========================================
export const GAME_CONSTANTS = {
    INITIAL_GOLD: 100,
    INITIAL_GEMS: 10,
    INITIAL_PLOTS: 9,
    MAX_PLOTS: 49, // 7x7 grid
    PLOT_EXPANSION_BASE_COST: 500,
    PLOT_EXPANSION_MULTIPLIER: 1.5,
    WATER_SPEED_BONUS: 0.1, // 10% faster growth when watered
    GEMS_PER_100_BALANCE: 10, // Exchange rate: 100 balance = 10 gems
    GOLD_PER_BALANCE: 10, // Exchange rate: 1 balance = 10 gold
    DAILY_QUEST_COUNT: 3,
    PRESTIGE_BONUS_PERCENT: 10, // 10% gold bonus per prestige level
};
