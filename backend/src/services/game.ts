import { z } from "zod";
import {
    GameFarmProfile,
    GameCrop,
    GameShopItem,
    GameInventoryItem,
    GameFarmPlot,
    GameAchievement,
    GameUserAchievement,
    GameDailyQuest,
    GameLeaderboardEntry,
    type GameFarmProfileType,
    type GameCropType,
    type GameShopItemType,
    type GameInventoryItemType,
    type GameFarmPlotType,
    type GameAchievementType,
    type GameUserAchievementType,
    type GameDailyQuestType,
    type GameLeaderboardEntryType,
    calculateLevelFromXp,
    GAME_CONSTANTS,
} from "../models/game.types";
import { createDbInitializer } from "../utils/dbInit";
import { getUser } from "./users";

// ==========================================
// DATABASE INITIALIZATION
// ==========================================
const ensureInitialized = createDbInitializer(async (db: D1Database) => {
    await db.batch([
        // Game farm profiles
        db.prepare(`
			CREATE TABLE IF NOT EXISTS game_farm_profiles (
				user_username TEXT PRIMARY KEY,
				level INTEGER DEFAULT 1,
				experience INTEGER DEFAULT 0,
				gold INTEGER DEFAULT 100,
				gems INTEGER DEFAULT 10,
				prestige_level INTEGER DEFAULT 0,
				total_harvests INTEGER DEFAULT 0,
				total_gold_earned INTEGER DEFAULT 0,
				plots_unlocked INTEGER DEFAULT 9,
				last_daily_reward TEXT,
				created_at TEXT DEFAULT CURRENT_TIMESTAMP,
				updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_username) REFERENCES users(username)
			)
		`),

        // Crops master data
        db.prepare(`
			CREATE TABLE IF NOT EXISTS game_crops (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				tier INTEGER DEFAULT 1,
				grow_time_seconds INTEGER NOT NULL,
				sell_price INTEGER NOT NULL,
				seed_price INTEGER NOT NULL,
				unlock_level INTEGER DEFAULT 1,
				xp_reward INTEGER DEFAULT 5,
				icon TEXT,
				description TEXT
			)
		`),

        // Shop items
        db.prepare(`
			CREATE TABLE IF NOT EXISTS game_shop_items (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				type TEXT NOT NULL CHECK (type IN ('seed', 'tool', 'upgrade', 'decoration', 'premium', 'booster')),
				price_gold INTEGER DEFAULT 0,
				price_gems INTEGER DEFAULT 0,
				unlock_level INTEGER DEFAULT 1,
				effect TEXT,
				max_quantity INTEGER DEFAULT 1,
				icon TEXT,
				description TEXT
			)
		`),

        // Player inventory
        db.prepare(`
			CREATE TABLE IF NOT EXISTS game_inventory (
				id TEXT PRIMARY KEY,
				user_username TEXT NOT NULL,
				item_id TEXT NOT NULL,
				quantity INTEGER DEFAULT 1,
				equipped INTEGER DEFAULT 0,
				purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_username) REFERENCES users(username),
				FOREIGN KEY (item_id) REFERENCES game_shop_items(id)
			)
		`),

        // Farm plots
        db.prepare(`
			CREATE TABLE IF NOT EXISTS game_farm_plots (
				id TEXT PRIMARY KEY,
				user_username TEXT NOT NULL,
				plot_index INTEGER NOT NULL,
				crop_id TEXT,
				planted_at TEXT,
				watered INTEGER DEFAULT 0,
				growth_percent INTEGER DEFAULT 0,
				auto_replant INTEGER DEFAULT 0,
				FOREIGN KEY (user_username) REFERENCES users(username),
				FOREIGN KEY (crop_id) REFERENCES game_crops(id),
				UNIQUE(user_username, plot_index)
			)
		`),

        // Achievements
        db.prepare(`
			CREATE TABLE IF NOT EXISTS game_achievements (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				description TEXT,
				requirement TEXT NOT NULL,
				reward_gold INTEGER DEFAULT 0,
				reward_gems INTEGER DEFAULT 0,
				icon TEXT
			)
		`),

        // User achievements
        db.prepare(`
			CREATE TABLE IF NOT EXISTS game_user_achievements (
				user_username TEXT NOT NULL,
				achievement_id TEXT NOT NULL,
				progress INTEGER DEFAULT 0,
				claimed INTEGER DEFAULT 0,
				claimed_at TEXT,
				PRIMARY KEY (user_username, achievement_id),
				FOREIGN KEY (user_username) REFERENCES users(username),
				FOREIGN KEY (achievement_id) REFERENCES game_achievements(id)
			)
		`),

        // Daily quests
        db.prepare(`
			CREATE TABLE IF NOT EXISTS game_daily_quests (
				id TEXT PRIMARY KEY,
				user_username TEXT NOT NULL,
				quest_type TEXT NOT NULL,
				target_value INTEGER NOT NULL,
				current_value INTEGER DEFAULT 0,
				reward_gold INTEGER DEFAULT 0,
				reward_gems INTEGER DEFAULT 0,
				completed INTEGER DEFAULT 0,
				quest_date TEXT NOT NULL,
				FOREIGN KEY (user_username) REFERENCES users(username)
			)
		`),

        // Leaderboard
        db.prepare(`
			CREATE TABLE IF NOT EXISTS game_leaderboard (
				user_username TEXT PRIMARY KEY,
				total_gold_earned INTEGER DEFAULT 0,
				level INTEGER DEFAULT 1,
				prestige_level INTEGER DEFAULT 0,
				rank INTEGER,
				updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_username) REFERENCES users(username)
			)
		`),
    ]);
});

// Export function to initialize game tables (for seeder)
export const initializeGameDb = async (db: D1Database): Promise<void> => {
    await ensureInitialized(db);
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================
const generateId = (prefix: string): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const getTodayDate = (): string => {
    return new Date().toISOString().split("T")[0];
};

// ==========================================
// PROFILE MANAGEMENT
// ==========================================
export const getOrCreateProfile = async (
    db: D1Database,
    username: string
): Promise<GameFarmProfileType> => {
    await ensureInitialized(db);

    // Check if user exists
    const user = await getUser(db, username);
    if (!user) {
        throw new Error("User tidak ditemukan");
    }

    // Try to get existing profile
    const existing = await db
        .prepare("SELECT * FROM game_farm_profiles WHERE user_username = ?")
        .bind(username)
        .first();

    if (existing) {
        return GameFarmProfile.parse(existing);
    }

    // Create new profile
    const now = new Date().toISOString();
    await db
        .prepare(`
			INSERT INTO game_farm_profiles 
			(user_username, level, experience, gold, gems, prestige_level, total_harvests, total_gold_earned, plots_unlocked, created_at, updated_at)
			VALUES (?, 1, 0, ?, ?, 0, 0, 0, ?, ?, ?)
		`)
        .bind(
            username,
            GAME_CONSTANTS.INITIAL_GOLD,
            GAME_CONSTANTS.INITIAL_GEMS,
            GAME_CONSTANTS.INITIAL_PLOTS,
            now,
            now
        )
        .run();

    // Initialize farm plots
    for (let i = 0; i < GAME_CONSTANTS.INITIAL_PLOTS; i++) {
        await db
            .prepare(`
				INSERT INTO game_farm_plots (id, user_username, plot_index)
				VALUES (?, ?, ?)
			`)
            .bind(generateId("plot"), username, i)
            .run();
    }

    // Initialize user achievements
    const achievements = await db.prepare("SELECT id FROM game_achievements").all();
    for (const ach of achievements.results || []) {
        await db
            .prepare(`
				INSERT INTO game_user_achievements (user_username, achievement_id, progress, claimed)
				VALUES (?, ?, 0, 0)
			`)
            .bind(username, (ach as any).id)
            .run();
    }

    // Daily quests will be generated when first accessed via getDailyQuests()

    // Return new profile
    const newProfile = await db
        .prepare("SELECT * FROM game_farm_profiles WHERE user_username = ?")
        .bind(username)
        .first();

    return GameFarmProfile.parse(newProfile);
};

export const updateProfile = async (
    db: D1Database,
    username: string,
    updates: Partial<GameFarmProfileType>
): Promise<GameFarmProfileType> => {
    await ensureInitialized(db);

    const setFragments: string[] = [];
    const values: unknown[] = [];

    if (updates.gold !== undefined) {
        setFragments.push("gold = ?");
        values.push(updates.gold);
    }
    if (updates.gems !== undefined) {
        setFragments.push("gems = ?");
        values.push(updates.gems);
    }
    if (updates.experience !== undefined) {
        setFragments.push("experience = ?");
        values.push(updates.experience);
    }
    if (updates.level !== undefined) {
        setFragments.push("level = ?");
        values.push(updates.level);
    }
    if (updates.total_harvests !== undefined) {
        setFragments.push("total_harvests = ?");
        values.push(updates.total_harvests);
    }
    if (updates.total_gold_earned !== undefined) {
        setFragments.push("total_gold_earned = ?");
        values.push(updates.total_gold_earned);
    }
    if (updates.plots_unlocked !== undefined) {
        setFragments.push("plots_unlocked = ?");
        values.push(updates.plots_unlocked);
    }
    if (updates.last_daily_reward !== undefined) {
        setFragments.push("last_daily_reward = ?");
        values.push(updates.last_daily_reward);
    }

    setFragments.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(username);

    await db
        .prepare(`UPDATE game_farm_profiles SET ${setFragments.join(", ")} WHERE user_username = ?`)
        .bind(...values)
        .run();

    return getOrCreateProfile(db, username);
};

export const addExperience = async (
    db: D1Database,
    username: string,
    xp: number
): Promise<{ leveledUp: boolean; newLevel: number; profile: GameFarmProfileType }> => {
    const profile = await getOrCreateProfile(db, username);
    const newTotalXp = profile.experience + xp;
    const levelInfo = calculateLevelFromXp(newTotalXp);
    const leveledUp = levelInfo.level > profile.level;

    await updateProfile(db, username, {
        experience: newTotalXp,
        level: levelInfo.level,
    });

    const updatedProfile = await getOrCreateProfile(db, username);

    return {
        leveledUp,
        newLevel: levelInfo.level,
        profile: updatedProfile,
    };
};

// ==========================================
// CROPS
// ==========================================
export const getAllCrops = async (db: D1Database): Promise<GameCropType[]> => {
    await ensureInitialized(db);
    const { results } = await db.prepare("SELECT * FROM game_crops ORDER BY tier, unlock_level").all();
    return (results || []).map((r) => GameCrop.parse(r));
};

export const getCrop = async (db: D1Database, cropId: string): Promise<GameCropType | null> => {
    await ensureInitialized(db);
    const crop = await db.prepare("SELECT * FROM game_crops WHERE id = ?").bind(cropId).first();
    return crop ? GameCrop.parse(crop) : null;
};

export const getUnlockedCrops = async (db: D1Database, level: number): Promise<GameCropType[]> => {
    await ensureInitialized(db);
    const { results } = await db
        .prepare("SELECT * FROM game_crops WHERE unlock_level <= ? ORDER BY tier, unlock_level")
        .bind(level)
        .all();
    return (results || []).map((r) => GameCrop.parse(r));
};

// ==========================================
// FARM OPERATIONS
// ==========================================
export const getFarmPlots = async (
    db: D1Database,
    username: string
): Promise<GameFarmPlotType[]> => {
    await ensureInitialized(db);
    await getOrCreateProfile(db, username); // Ensure profile exists

    const { results } = await db
        .prepare("SELECT * FROM game_farm_plots WHERE user_username = ? ORDER BY plot_index")
        .bind(username)
        .all();

    // Calculate current growth for each plot
    const plots = (results || []).map((r) => {
        const plot = GameFarmPlot.parse(r);
        if (plot.crop_id && plot.planted_at) {
            // Recalculate growth percent based on time
            const plantedTime = new Date(plot.planted_at).getTime();
            const now = Date.now();
            const elapsed = (now - plantedTime) / 1000; // seconds

            // Get crop grow time (we'll need to look it up)
            // For now, use the stored growth_percent
        }
        return plot;
    });

    return plots;
};

export const getFarmPlotsWithGrowth = async (
    db: D1Database,
    username: string
): Promise<(GameFarmPlotType & { crop?: GameCropType; ready: boolean; time_remaining: number })[]> => {
    const plots = await getFarmPlots(db, username);
    const crops = await getAllCrops(db);
    const cropMap = new Map(crops.map(c => [c.id, c]));

    return plots.map(plot => {
        if (!plot.crop_id || !plot.planted_at) {
            return { ...plot, ready: false, time_remaining: 0 };
        }

        const crop = cropMap.get(plot.crop_id);
        if (!crop) {
            return { ...plot, ready: false, time_remaining: 0 };
        }

        const plantedTime = new Date(plot.planted_at).getTime();
        const now = Date.now();
        const elapsed = (now - plantedTime) / 1000;
        const growTime = plot.watered
            ? crop.grow_time_seconds * (1 - GAME_CONSTANTS.WATER_SPEED_BONUS)
            : crop.grow_time_seconds;

        const growthPercent = Math.min(100, Math.floor((elapsed / growTime) * 100));
        const ready = elapsed >= growTime;
        const timeRemaining = Math.max(0, Math.ceil(growTime - elapsed));

        return {
            ...plot,
            growth_percent: growthPercent,
            crop,
            ready,
            time_remaining: timeRemaining,
        };
    });
};

export const plantCrop = async (
    db: D1Database,
    username: string,
    plotIndex: number,
    cropId: string
): Promise<GameFarmPlotType> => {
    await ensureInitialized(db);

    const profile = await getOrCreateProfile(db, username);

    // Validate plot index
    if (plotIndex < 0 || plotIndex >= profile.plots_unlocked) {
        throw new Error("Plot tidak valid");
    }

    // Get crop
    const crop = await getCrop(db, cropId);
    if (!crop) {
        throw new Error("Tanaman tidak ditemukan");
    }

    // Check level requirement
    if (crop.unlock_level > profile.level) {
        throw new Error(`Tanaman ini membutuhkan level ${crop.unlock_level}`);
    }

    // Check if can afford
    if (profile.gold < crop.seed_price) {
        throw new Error("Gold tidak cukup untuk membeli benih");
    }

    // Get plot
    const plot = await db
        .prepare("SELECT * FROM game_farm_plots WHERE user_username = ? AND plot_index = ?")
        .bind(username, plotIndex)
        .first();

    if (!plot) {
        throw new Error("Plot tidak ditemukan");
    }

    const parsedPlot = GameFarmPlot.parse(plot);

    // Check if plot is empty
    if (parsedPlot.crop_id) {
        throw new Error("Plot sudah ditanami");
    }

    // Deduct gold and plant
    const now = new Date().toISOString();
    await db.batch([
        db
            .prepare("UPDATE game_farm_profiles SET gold = gold - ? WHERE user_username = ?")
            .bind(crop.seed_price, username),
        db
            .prepare(`
				UPDATE game_farm_plots 
				SET crop_id = ?, planted_at = ?, watered = 0, growth_percent = 0
				WHERE user_username = ? AND plot_index = ?
			`)
            .bind(cropId, now, username, plotIndex),
    ]);

    // Update quest progress
    await updateQuestProgress(db, username, "plant", 1);

    // Return updated plot
    const updated = await db
        .prepare("SELECT * FROM game_farm_plots WHERE user_username = ? AND plot_index = ?")
        .bind(username, plotIndex)
        .first();

    return GameFarmPlot.parse(updated);
};

export const waterPlot = async (
    db: D1Database,
    username: string,
    plotIndex: number
): Promise<GameFarmPlotType> => {
    await ensureInitialized(db);

    const profile = await getOrCreateProfile(db, username);

    if (plotIndex < 0 || plotIndex >= profile.plots_unlocked) {
        throw new Error("Plot tidak valid");
    }

    const plot = await db
        .prepare("SELECT * FROM game_farm_plots WHERE user_username = ? AND plot_index = ?")
        .bind(username, plotIndex)
        .first();

    if (!plot) {
        throw new Error("Plot tidak ditemukan");
    }

    const parsedPlot = GameFarmPlot.parse(plot);

    if (!parsedPlot.crop_id) {
        throw new Error("Tidak ada tanaman di plot ini");
    }

    if (parsedPlot.watered) {
        throw new Error("Plot sudah disiram");
    }

    await db
        .prepare("UPDATE game_farm_plots SET watered = 1 WHERE user_username = ? AND plot_index = ?")
        .bind(username, plotIndex)
        .run();

    // Update quest progress
    await updateQuestProgress(db, username, "water", 1);

    const updated = await db
        .prepare("SELECT * FROM game_farm_plots WHERE user_username = ? AND plot_index = ?")
        .bind(username, plotIndex)
        .first();

    return GameFarmPlot.parse(updated);
};

export const harvestPlot = async (
    db: D1Database,
    username: string,
    plotIndex: number
): Promise<{ gold: number; xp: number; crop: GameCropType; leveledUp: boolean; newLevel: number }> => {
    await ensureInitialized(db);

    const profile = await getOrCreateProfile(db, username);

    if (plotIndex < 0 || plotIndex >= profile.plots_unlocked) {
        throw new Error("Plot tidak valid");
    }

    const plotsWithGrowth = await getFarmPlotsWithGrowth(db, username);
    const plot = plotsWithGrowth.find(p => p.plot_index === plotIndex);

    if (!plot) {
        throw new Error("Plot tidak ditemukan");
    }

    if (!plot.crop_id || !plot.crop) {
        throw new Error("Tidak ada tanaman di plot ini");
    }

    if (!plot.ready) {
        throw new Error(`Tanaman belum siap panen (${plot.time_remaining}s tersisa)`);
    }

    const crop = plot.crop;
    const goldEarned = Math.floor(
        crop.sell_price * (1 + (profile.prestige_level * GAME_CONSTANTS.PRESTIGE_BONUS_PERCENT / 100))
    );
    const xpEarned = crop.xp_reward;

    // Clear plot and add rewards
    await db.batch([
        db
            .prepare(`
				UPDATE game_farm_plots 
				SET crop_id = NULL, planted_at = NULL, watered = 0, growth_percent = 0
				WHERE user_username = ? AND plot_index = ?
			`)
            .bind(username, plotIndex),
        db
            .prepare(`
				UPDATE game_farm_profiles 
				SET gold = gold + ?, total_harvests = total_harvests + 1, total_gold_earned = total_gold_earned + ?
				WHERE user_username = ?
			`)
            .bind(goldEarned, goldEarned, username),
    ]);

    // Add experience
    const xpResult = await addExperience(db, username, xpEarned);

    // Update quest progress
    await updateQuestProgress(db, username, "harvest", 1);
    await updateQuestProgress(db, username, "earn", goldEarned);

    // Update achievement progress
    await updateAchievementProgress(db, username, "harvest_count", 1);
    await updateAchievementProgress(db, username, "gold_earned", goldEarned);

    // Update leaderboard
    await updateLeaderboard(db, username);

    return {
        gold: goldEarned,
        xp: xpEarned,
        crop,
        leveledUp: xpResult.leveledUp,
        newLevel: xpResult.newLevel,
    };
};

export const harvestAll = async (
    db: D1Database,
    username: string
): Promise<{ total_gold: number; total_xp: number; harvested_count: number; leveled_up: boolean; new_level: number }> => {
    const plotsWithGrowth = await getFarmPlotsWithGrowth(db, username);
    const readyPlots = plotsWithGrowth.filter(p => p.ready);

    if (readyPlots.length === 0) {
        throw new Error("Tidak ada tanaman yang siap dipanen");
    }

    let totalGold = 0;
    let totalXp = 0;
    let leveledUp = false;
    let newLevel = 0;

    for (const plot of readyPlots) {
        const result = await harvestPlot(db, username, plot.plot_index);
        totalGold += result.gold;
        totalXp += result.xp;
        if (result.leveledUp) {
            leveledUp = true;
            newLevel = result.newLevel;
        }
    }

    return {
        total_gold: totalGold,
        total_xp: totalXp,
        harvested_count: readyPlots.length,
        leveled_up: leveledUp,
        new_level: newLevel,
    };
};

// ==========================================
// SHOP
// ==========================================
export const getShopItems = async (
    db: D1Database,
    level: number = 1
): Promise<GameShopItemType[]> => {
    await ensureInitialized(db);
    const { results } = await db
        .prepare("SELECT * FROM game_shop_items WHERE unlock_level <= ? ORDER BY type, price_gold")
        .bind(level)
        .all();
    return (results || []).map((r) => GameShopItem.parse(r));
};

export const getAllShopItems = async (db: D1Database): Promise<GameShopItemType[]> => {
    await ensureInitialized(db);
    const { results } = await db.prepare("SELECT * FROM game_shop_items ORDER BY type, price_gold").all();
    return (results || []).map((r) => GameShopItem.parse(r));
};

export const purchaseItem = async (
    db: D1Database,
    username: string,
    itemId: string,
    quantity: number = 1
): Promise<{ success: boolean; newGold: number; newGems: number; inventoryItem: GameInventoryItemType }> => {
    await ensureInitialized(db);

    const profile = await getOrCreateProfile(db, username);

    // Get item
    const item = await db.prepare("SELECT * FROM game_shop_items WHERE id = ?").bind(itemId).first();
    if (!item) {
        throw new Error("Item tidak ditemukan");
    }

    const shopItem = GameShopItem.parse(item);

    // Check level requirement
    if (shopItem.unlock_level > profile.level) {
        throw new Error(`Item ini membutuhkan level ${shopItem.unlock_level}`);
    }

    // Check max quantity
    if (shopItem.max_quantity > 0) {
        const existing = await db
            .prepare("SELECT quantity FROM game_inventory WHERE user_username = ? AND item_id = ?")
            .bind(username, itemId)
            .first();

        const currentQty = existing ? (existing as any).quantity : 0;
        if (currentQty + quantity > shopItem.max_quantity) {
            throw new Error(`Maksimal ${shopItem.max_quantity} item ini`);
        }
    }

    // Calculate total cost
    const totalGoldCost = shopItem.price_gold * quantity;
    const totalGemsCost = shopItem.price_gems * quantity;

    // Check affordability
    if (shopItem.price_gold > 0 && profile.gold < totalGoldCost) {
        throw new Error("Gold tidak cukup");
    }
    if (shopItem.price_gems > 0 && profile.gems < totalGemsCost) {
        throw new Error("Gems tidak cukup");
    }

    // Deduct currency
    const newGold = profile.gold - totalGoldCost;
    const newGems = profile.gems - totalGemsCost;

    await db
        .prepare("UPDATE game_farm_profiles SET gold = ?, gems = ? WHERE user_username = ?")
        .bind(newGold, newGems, username)
        .run();

    // Add to inventory or update quantity
    const existingInventory = await db
        .prepare("SELECT * FROM game_inventory WHERE user_username = ? AND item_id = ?")
        .bind(username, itemId)
        .first();

    let inventoryItem: GameInventoryItemType;

    if (existingInventory) {
        await db
            .prepare("UPDATE game_inventory SET quantity = quantity + ? WHERE user_username = ? AND item_id = ?")
            .bind(quantity, username, itemId)
            .run();

        const updated = await db
            .prepare("SELECT * FROM game_inventory WHERE user_username = ? AND item_id = ?")
            .bind(username, itemId)
            .first();
        inventoryItem = GameInventoryItem.parse(updated);
    } else {
        const invId = generateId("inv");
        await db
            .prepare(`
				INSERT INTO game_inventory (id, user_username, item_id, quantity, equipped)
				VALUES (?, ?, ?, ?, 0)
			`)
            .bind(invId, username, itemId, quantity)
            .run();

        const newInv = await db
            .prepare("SELECT * FROM game_inventory WHERE id = ?")
            .bind(invId)
            .first();
        inventoryItem = GameInventoryItem.parse(newInv);
    }

    return {
        success: true,
        newGold,
        newGems,
        inventoryItem,
    };
};

// ==========================================
// INVENTORY
// ==========================================
export const getInventory = async (
    db: D1Database,
    username: string
): Promise<(GameInventoryItemType & { item: GameShopItemType })[]> => {
    await ensureInitialized(db);
    await getOrCreateProfile(db, username);

    const { results } = await db
        .prepare(`
			SELECT i.*, s.name, s.type, s.effect, s.icon, s.description
			FROM game_inventory i
			JOIN game_shop_items s ON i.item_id = s.id
			WHERE i.user_username = ?
		`)
        .bind(username)
        .all();

    return (results || []).map((r: any) => ({
        ...GameInventoryItem.parse(r),
        item: GameShopItem.parse({
            id: r.item_id,
            name: r.name,
            type: r.type,
            price_gold: 0,
            price_gems: 0,
            unlock_level: 1,
            effect: r.effect,
            max_quantity: 1,
            icon: r.icon,
            description: r.description,
        }),
    }));
};

// ==========================================
// ACHIEVEMENTS
// ==========================================
export const getAchievements = async (
    db: D1Database,
    username: string
): Promise<(GameAchievementType & { progress: number; claimed: boolean })[]> => {
    await ensureInitialized(db);
    await getOrCreateProfile(db, username);

    const { results } = await db
        .prepare(`
			SELECT a.*, COALESCE(ua.progress, 0) as user_progress, COALESCE(ua.claimed, 0) as user_claimed
			FROM game_achievements a
			LEFT JOIN game_user_achievements ua ON a.id = ua.achievement_id AND ua.user_username = ?
		`)
        .bind(username)
        .all();

    return (results || []).map((r: any) => ({
        ...GameAchievement.parse(r),
        progress: r.user_progress || 0,
        claimed: Boolean(r.user_claimed),
    }));
};

export const updateAchievementProgress = async (
    db: D1Database,
    username: string,
    requirementType: string,
    value: number
): Promise<void> => {
    await ensureInitialized(db);

    // Get all achievements with matching requirement type
    const { results } = await db.prepare("SELECT * FROM game_achievements").all();

    for (const ach of results || []) {
        const achievement = GameAchievement.parse(ach);
        try {
            const requirement = JSON.parse(achievement.requirement);
            if (requirement.type === requirementType) {
                // Update progress
                await db
                    .prepare(`
						INSERT INTO game_user_achievements (user_username, achievement_id, progress, claimed)
						VALUES (?, ?, ?, 0)
						ON CONFLICT(user_username, achievement_id) 
						DO UPDATE SET progress = progress + ?
					`)
                    .bind(username, achievement.id, value, value)
                    .run();
            }
        } catch {
            // Invalid requirement JSON, skip
        }
    }
};

export const claimAchievement = async (
    db: D1Database,
    username: string,
    achievementId: string
): Promise<{ gold: number; gems: number }> => {
    await ensureInitialized(db);

    // Get achievement
    const ach = await db.prepare("SELECT * FROM game_achievements WHERE id = ?").bind(achievementId).first();
    if (!ach) {
        throw new Error("Achievement tidak ditemukan");
    }

    const achievement = GameAchievement.parse(ach);

    // Get user progress
    const userAch = await db
        .prepare("SELECT * FROM game_user_achievements WHERE user_username = ? AND achievement_id = ?")
        .bind(username, achievementId)
        .first();

    if (!userAch) {
        throw new Error("Achievement belum dimulai");
    }

    const userAchievement = GameUserAchievement.parse(userAch);

    if (userAchievement.claimed) {
        throw new Error("Achievement sudah diklaim");
    }

    // Check if requirement met
    const requirement = JSON.parse(achievement.requirement);
    if (userAchievement.progress < requirement.value) {
        throw new Error(`Progress belum cukup (${userAchievement.progress}/${requirement.value})`);
    }

    // Claim rewards
    await db.batch([
        db
            .prepare(`
				UPDATE game_user_achievements 
				SET claimed = 1, claimed_at = ?
				WHERE user_username = ? AND achievement_id = ?
			`)
            .bind(new Date().toISOString(), username, achievementId),
        db
            .prepare("UPDATE game_farm_profiles SET gold = gold + ?, gems = gems + ? WHERE user_username = ?")
            .bind(achievement.reward_gold, achievement.reward_gems, username),
    ]);

    return {
        gold: achievement.reward_gold,
        gems: achievement.reward_gems,
    };
};

// ==========================================
// DAILY QUESTS
// ==========================================
export const generateDailyQuests = async (db: D1Database, username: string): Promise<void> => {
    await ensureInitialized(db);

    const today = getTodayDate();

    // Check if already have today's quests
    const existing = await db
        .prepare("SELECT COUNT(*) as count FROM game_daily_quests WHERE user_username = ? AND quest_date = ?")
        .bind(username, today)
        .first();

    if ((existing as any)?.count > 0) {
        return;
    }

    // Delete old quests
    await db
        .prepare("DELETE FROM game_daily_quests WHERE user_username = ? AND quest_date < ?")
        .bind(username, today)
        .run();

    // Generate new quests
    const questTypes = [
        { type: "harvest", target: 10, gold: 100, gems: 0 },
        { type: "plant", target: 15, gold: 150, gems: 0 },
        { type: "water", target: 20, gold: 50, gems: 1 },
        { type: "earn", target: 500, gold: 200, gems: 2 },
    ];

    // Pick 3 random quests
    const shuffled = questTypes.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, GAME_CONSTANTS.DAILY_QUEST_COUNT);

    for (const quest of selected) {
        await db
            .prepare(`
				INSERT INTO game_daily_quests 
				(id, user_username, quest_type, target_value, current_value, reward_gold, reward_gems, completed, quest_date)
				VALUES (?, ?, ?, ?, 0, ?, ?, 0, ?)
			`)
            .bind(
                generateId("quest"),
                username,
                quest.type,
                quest.target,
                quest.gold,
                quest.gems,
                today
            )
            .run();
    }
};

export const getDailyQuests = async (
    db: D1Database,
    username: string
): Promise<GameDailyQuestType[]> => {
    await ensureInitialized(db);
    await getOrCreateProfile(db, username);

    const today = getTodayDate();
    await generateDailyQuests(db, username);

    const { results } = await db
        .prepare("SELECT * FROM game_daily_quests WHERE user_username = ? AND quest_date = ?")
        .bind(username, today)
        .all();

    return (results || []).map((r) => GameDailyQuest.parse(r));
};

export const updateQuestProgress = async (
    db: D1Database,
    username: string,
    questType: string,
    value: number
): Promise<void> => {
    await ensureInitialized(db);

    const today = getTodayDate();

    // Update matching quests
    await db
        .prepare(`
			UPDATE game_daily_quests 
			SET current_value = MIN(current_value + ?, target_value),
				completed = CASE WHEN current_value + ? >= target_value THEN 1 ELSE 0 END
			WHERE user_username = ? AND quest_type = ? AND quest_date = ? AND completed = 0
		`)
        .bind(value, value, username, questType, today)
        .run();
};

export const claimDailyQuest = async (
    db: D1Database,
    username: string,
    questId: string
): Promise<{ gold: number; gems: number }> => {
    await ensureInitialized(db);

    const quest = await db.prepare("SELECT * FROM game_daily_quests WHERE id = ?").bind(questId).first();
    if (!quest) {
        throw new Error("Quest tidak ditemukan");
    }

    const parsedQuest = GameDailyQuest.parse(quest);

    if (parsedQuest.user_username !== username) {
        throw new Error("Quest bukan milik Anda");
    }

    if (!parsedQuest.completed) {
        throw new Error("Quest belum selesai");
    }

    // Check if already claimed (completed = 1 means done, we use a different check)
    // Actually, we'll delete the quest after claiming

    // Give rewards
    await db.batch([
        db
            .prepare("UPDATE game_farm_profiles SET gold = gold + ?, gems = gems + ? WHERE user_username = ?")
            .bind(parsedQuest.reward_gold, parsedQuest.reward_gems, username),
        db.prepare("DELETE FROM game_daily_quests WHERE id = ?").bind(questId),
    ]);

    return {
        gold: parsedQuest.reward_gold,
        gems: parsedQuest.reward_gems,
    };
};

// ==========================================
// LEADERBOARD
// ==========================================
export const updateLeaderboard = async (db: D1Database, username: string): Promise<void> => {
    await ensureInitialized(db);

    const profile = await getOrCreateProfile(db, username);

    await db
        .prepare(`
			INSERT INTO game_leaderboard (user_username, total_gold_earned, level, prestige_level, updated_at)
			VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(user_username) 
			DO UPDATE SET total_gold_earned = ?, level = ?, prestige_level = ?, updated_at = ?
		`)
        .bind(
            username,
            profile.total_gold_earned,
            profile.level,
            profile.prestige_level,
            new Date().toISOString(),
            profile.total_gold_earned,
            profile.level,
            profile.prestige_level,
            new Date().toISOString()
        )
        .run();
};

export const getLeaderboard = async (
    db: D1Database,
    limit: number = 50
): Promise<GameLeaderboardEntryType[]> => {
    await ensureInitialized(db);

    const { results } = await db
        .prepare(`
			SELECT *, ROW_NUMBER() OVER (ORDER BY total_gold_earned DESC) as rank
			FROM game_leaderboard
			ORDER BY total_gold_earned DESC
			LIMIT ?
		`)
        .bind(limit)
        .all();

    return (results || []).map((r) => GameLeaderboardEntry.parse(r));
};

// ==========================================
// CURRENCY EXCHANGE
// ==========================================
import { createTransaction } from "./transactions";

export const exchangeBalanceToGems = async (
    db: D1Database,
    username: string,
    balanceAmount: number
): Promise<{ gems_received: number; balance_spent: number; new_balance: number; new_gems: number }> => {
    await ensureInitialized(db);

    // Get user balance from users table
    const user = await getUser(db, username);
    if (!user) {
        throw new Error("User tidak ditemukan");
    }

    if (user.balance < balanceAmount) {
        throw new Error("Saldo tidak mencukupi");
    }

    // Calculate gems
    const gemsReceived = Math.floor(balanceAmount / 100 * GAME_CONSTANTS.GEMS_PER_100_BALANCE);

    if (gemsReceived < 1) {
        throw new Error("Minimal tukar 100 balance untuk 10 gems");
    }

    // Get game profile
    const profile = await getOrCreateProfile(db, username);

    // Deduct balance and add gems
    const newBalance = user.balance - balanceAmount;
    const newGems = profile.gems + gemsReceived;

    await db.batch([
        db.prepare("UPDATE users SET balance = ? WHERE username = ?").bind(newBalance, username),
        db.prepare("UPDATE users SET balance = balance + ? WHERE username = 'admin'").bind(balanceAmount),
        db.prepare("UPDATE game_farm_profiles SET gems = ? WHERE user_username = ?").bind(newGems, username),
    ]);

    // Record transaction
    await createTransaction(db, {
        from_username: username,
        to_username: "admin",
        amount: balanceAmount,
        type: "transfer",
        description: `Top up game: ${gemsReceived} gems`,
    });

    return {
        gems_received: gemsReceived,
        balance_spent: balanceAmount,
        new_balance: newBalance,
        new_gems: newGems,
    };
};

export const exchangeBalanceToGold = async (
    db: D1Database,
    username: string,
    balanceAmount: number
): Promise<{ gold_received: number; balance_spent: number; new_balance: number; new_gold: number }> => {
    await ensureInitialized(db);

    // Get user balance from users table
    const user = await getUser(db, username);
    if (!user) {
        throw new Error("User tidak ditemukan");
    }

    if (user.balance < balanceAmount) {
        throw new Error("Saldo tidak mencukupi");
    }

    // Calculate gold (1 balance = 10 gold)
    const goldReceived = balanceAmount * GAME_CONSTANTS.GOLD_PER_BALANCE;

    if (goldReceived < 1) {
        throw new Error("Minimal tukar 1 balance untuk gold");
    }

    // Get game profile
    const profile = await getOrCreateProfile(db, username);

    // Deduct balance and add gold
    const newBalance = user.balance - balanceAmount;
    const newGold = profile.gold + goldReceived;

    await db.batch([
        db.prepare("UPDATE users SET balance = ? WHERE username = ?").bind(newBalance, username),
        db.prepare("UPDATE users SET balance = balance + ? WHERE username = 'admin'").bind(balanceAmount),
        db.prepare("UPDATE game_farm_profiles SET gold = ? WHERE user_username = ?").bind(newGold, username),
    ]);

    // Record transaction
    await createTransaction(db, {
        from_username: username,
        to_username: "admin",
        amount: balanceAmount,
        type: "transfer",
        description: `Top up game: ${goldReceived} gold`,
    });

    return {
        gold_received: goldReceived,
        balance_spent: balanceAmount,
        new_balance: newBalance,
        new_gold: newGold,
    };
};

// ==========================================
// PRESTIGE
// ==========================================
export const prestigeReset = async (
    db: D1Database,
    username: string
): Promise<{ new_prestige_level: number; bonus_percent: number }> => {
    await ensureInitialized(db);

    const profile = await getOrCreateProfile(db, username);

    // Require minimum level to prestige
    if (profile.level < 20) {
        throw new Error("Minimal level 20 untuk prestige");
    }

    const newPrestigeLevel = profile.prestige_level + 1;
    const bonusPercent = newPrestigeLevel * GAME_CONSTANTS.PRESTIGE_BONUS_PERCENT;

    // Reset profile but keep gems and prestige level
    await db.batch([
        db
            .prepare(`
				UPDATE game_farm_profiles 
				SET level = 1, experience = 0, gold = ?, total_harvests = 0, 
					prestige_level = ?, plots_unlocked = ?, updated_at = ?
				WHERE user_username = ?
			`)
            .bind(
                GAME_CONSTANTS.INITIAL_GOLD,
                newPrestigeLevel,
                GAME_CONSTANTS.INITIAL_PLOTS,
                new Date().toISOString(),
                username
            ),
        // Clear farm plots
        db
            .prepare("UPDATE game_farm_plots SET crop_id = NULL, planted_at = NULL, watered = 0, growth_percent = 0 WHERE user_username = ?")
            .bind(username),
        // Keep only initial plots
        db
            .prepare("DELETE FROM game_farm_plots WHERE user_username = ? AND plot_index >= ?")
            .bind(username, GAME_CONSTANTS.INITIAL_PLOTS),
    ]);

    return {
        new_prestige_level: newPrestigeLevel,
        bonus_percent: bonusPercent,
    };
};
