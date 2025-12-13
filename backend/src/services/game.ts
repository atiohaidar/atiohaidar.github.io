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
				placed_item_id TEXT,
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

    // Add placed_item_id column if it doesn't exist (migration)
    await db.prepare("ALTER TABLE game_farm_plots ADD COLUMN placed_item_id TEXT").run().catch(() => { });

    // Add fertilizer_id column if it doesn't exist (migration)
    // Add fertilizer_id column if it doesn't exist (migration)
    await db.prepare("ALTER TABLE game_farm_plots ADD COLUMN fertilizer_id TEXT").run().catch(() => { });

    // Add x, y columns if they don't exist (migration for isometric view)
    await db.prepare("ALTER TABLE game_farm_plots ADD COLUMN x INTEGER DEFAULT 0").run().catch(() => { });
    await db.prepare("ALTER TABLE game_farm_plots ADD COLUMN y INTEGER DEFAULT 0").run().catch(() => { });

    // Obstacles
    db.prepare(`
        CREATE TABLE IF NOT EXISTS game_obstacles (
            id TEXT PRIMARY KEY,
            user_username TEXT NOT NULL,
            type TEXT NOT NULL,
            x INTEGER NOT NULL,
            y INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            remove_cost INTEGER DEFAULT 0,
            FOREIGN KEY (user_username) REFERENCES users(username)
        )
    `).run().catch(() => { });
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


// Helper to get effect object
const parseEffect = (effectJson: string | null | undefined) => {
    if (!effectJson) return null;
    try {
        return JSON.parse(effectJson);
    } catch {
        return null;
    }
};

export const getFarmPlotsWithGrowth = async (
    db: D1Database,
    username: string
): Promise<(GameFarmPlotType & { crop?: GameCropType; ready: boolean; time_remaining: number })[]> => {
    const plots = await getFarmPlots(db, username);
    const crops = await getAllCrops(db);
    const cropMap = new Map(crops.map(c => [c.id, c]));

    // Fetch all shop items to check for passive effects (sprinklers) and fertilizers
    // Optimization: Cache this or fetch only needed? For now fetch all is fine for small item count.
    const shopItems = await getShopItems(db);
    const itemMap = new Map(shopItems.map(i => [i.id, i]));

    // Identify Sprinklers
    const gridWidth = 7; // Assuming 7x7 grid for 49 plots
    const sprinklerPlots = new Set<number>(); // Plots that are watered by sprinklers

    plots.forEach(plot => {
        if (plot.placed_item_id) {
            const item = itemMap.get(plot.placed_item_id);
            if (item && item.type === 'upgrade' && item.effect) {
                const effect = parseEffect(item.effect);
                if (effect && effect.type === 'auto_water') {
                    // Calculate area
                    // area: 9 means 3x3, area: 25 means 5x5
                    // Range is (sqrt(area) - 1) / 2
                    // 3x3 -> range 1 (center +- 1)
                    const range = (Math.sqrt(effect.area || 9) - 1) / 2;

                    const centerIdx = plot.plot_index;
                    const cx = centerIdx % gridWidth;
                    const cy = Math.floor(centerIdx / gridWidth);

                    for (let dy = -range; dy <= range; dy++) {
                        for (let dx = -range; dx <= range; dx++) {
                            const nx = cx + dx;
                            const ny = cy + dy;
                            if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridWidth) { // Boundary check (assuming 7x7 max)
                                const targetIdx = ny * gridWidth + nx;
                                sprinklerPlots.add(targetIdx);
                            }
                        }
                    }
                }
            }
        }
    });

    return plots.map(plot => {
        // Apply sprinkler water
        const isWatered = plot.watered || sprinklerPlots.has(plot.plot_index);

        if (!plot.crop_id || !plot.planted_at) {
            return { ...plot, watered: isWatered, ready: false, time_remaining: 0 };
        }

        const crop = cropMap.get(plot.crop_id);
        if (!crop) {
            return { ...plot, watered: isWatered, ready: false, time_remaining: 0 };
        }

        const plantedTime = new Date(plot.planted_at).getTime();
        const now = Date.now();
        const elapsed = (now - plantedTime) / 1000;

        let growTime = crop.grow_time_seconds;

        // Apply Water Bonus
        if (isWatered) {
            growTime *= (1 - GAME_CONSTANTS.WATER_SPEED_BONUS);
        }

        // Apply Fertilizer Bonus
        if (plot.fertilizer_id) {
            const fertilizer = itemMap.get(plot.fertilizer_id);
            if (fertilizer && fertilizer.effect) {
                const effect = parseEffect(fertilizer.effect);
                if (effect && effect.type === 'growth_speed' && effect.value) {
                    // value: 1.5 means 1.5x speed => time / 1.5
                    // value: 0.5 means +50% speed => time / 1.5 ?
                    // description says "+50% growth speed". New speed = 1.5 * old speed. 
                    // Time = Distance / Speed. So New Time = Old Time / 1.5.
                    growTime /= effect.value;
                }
            }
        }

        const growthPercent = Math.min(100, Math.floor((elapsed / growTime) * 100));
        const ready = elapsed >= growTime;
        const timeRemaining = Math.max(0, Math.ceil(growTime - elapsed));

        return {
            ...plot,
            watered: isWatered, // Return calculated water status so frontend sees it
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
    plotIndex: number | undefined,
    cropId: string,
    x?: number,
    y?: number
): Promise<GameFarmPlotType> => {
    await ensureInitialized(db);

    const profile = await getOrCreateProfile(db, username);

    // Determine target index
    let targetIndex: number | undefined = plotIndex;

    // IF using coordinate system (x, y provided) and no explicit index
    if (targetIndex === undefined && x !== undefined && y !== undefined) {
        // 1. Try to recycle an empty plot
        const emptyPlot = await db
            .prepare("SELECT * FROM game_farm_plots WHERE user_username = ? AND crop_id IS NULL AND placed_item_id IS NULL ORDER BY plot_index LIMIT 1")
            .bind(username)
            .first();

        if (emptyPlot) {
            targetIndex = (emptyPlot as any).plot_index;
        } else {
            // 2. Check if we can create a NEW plot
            const { count: rawCount } = await db.prepare("SELECT COUNT(*) as count FROM game_farm_plots WHERE user_username = ?").bind(username).first() as { count: number };
            const count = Number(rawCount);
            const unlocked = Number(profile.plots_unlocked);

            if (count < unlocked) {
                // Create new plot
                const { maxIndex } = await db.prepare("SELECT MAX(plot_index) as maxIndex FROM game_farm_plots WHERE user_username = ?").bind(username).first() as { maxIndex: number };
                const newIndex = (maxIndex ?? -1) + 1;

                await db.prepare("INSERT INTO game_farm_plots (id, user_username, plot_index, x, y) VALUES (?, ?, ?, ?, ?)")
                    .bind(generateId('plot'), username, newIndex, x, y)
                    .run();

                targetIndex = newIndex;
            } else {
                console.error(`[DEBUG] Plant Logic check: count=${count}, unlocked=${unlocked}`);
                throw new Error(`Tidak ada lahan kosong! Upgrade farm untuk menambah slot. (${count}/${unlocked})`);
            }
        }
    }

    if (targetIndex === undefined) {
        throw new Error("Target plot tidak valid");
    }

    // Validate plot index
    if (targetIndex < 0 || targetIndex >= profile.plots_unlocked) {
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
        .bind(username, targetIndex)
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
				SET crop_id = ?, planted_at = ?, watered = 0, growth_percent = 0, x = ?, y = ?
				WHERE user_username = ? AND plot_index = ?
			`)
            .bind(cropId, now, x ?? parsedPlot.x, y ?? parsedPlot.y, username, targetIndex),
    ]);

    // Update quest progress
    await updateQuestProgress(db, username, "plant", 1);

    // Return updated plot
    const updated = await db
        .prepare("SELECT * FROM game_farm_plots WHERE user_username = ? AND plot_index = ?")
        .bind(username, targetIndex)
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
        throw new Error(`Tanaman belum siap panen(${plot.time_remaining}s tersisa)`);
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
				INSERT INTO game_inventory(id, user_username, item_id, quantity, equipped)
				VALUES(?, ?, ?, ?, 0)
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
// ITEM PLACEMENT
// ==========================================
export const placeItem = async (
    db: D1Database,
    username: string,
    plotIndex: number | undefined,
    inventoryItemId: string,
    x?: number,
    y?: number
): Promise<GameFarmPlotType> => {
    await ensureInitialized(db);
    const profile = await getOrCreateProfile(db, username);

    // Determine target index
    let targetIndex: number | undefined = plotIndex;

    // IF using coordinate system (x, y provided) and no explicit index
    if (targetIndex === undefined && x !== undefined && y !== undefined) {
        // 1. Try to recycle an empty plot
        const emptyPlot = await db
            .prepare("SELECT * FROM game_farm_plots WHERE user_username = ? AND crop_id IS NULL AND placed_item_id IS NULL ORDER BY plot_index LIMIT 1")
            .bind(username)
            .first();

        if (emptyPlot) {
            targetIndex = (emptyPlot as any).plot_index;
        } else {
            // 2. Check if we can create a NEW plot
            const { count: rawCount } = await db.prepare("SELECT COUNT(*) as count FROM game_farm_plots WHERE user_username = ?").bind(username).first() as { count: number };
            const count = Number(rawCount);
            const unlocked = Number(profile.plots_unlocked);

            if (count < unlocked) {
                // Create new plot
                const { maxIndex } = await db.prepare("SELECT MAX(plot_index) as maxIndex FROM game_farm_plots WHERE user_username = ?").bind(username).first() as { maxIndex: number };
                const newIndex = (maxIndex ?? -1) + 1;

                await db.prepare("INSERT INTO game_farm_plots (id, user_username, plot_index, x, y) VALUES (?, ?, ?, ?, ?)")
                    .bind(generateId('plot'), username, newIndex, x, y)
                    .run();

                targetIndex = newIndex;
            } else {
                console.error(`[DEBUG] Place Logic check: count=${count}, unlocked=${unlocked}`);
                throw new Error(`Tidak ada lahan kosong! Upgrade farm untuk menambah slot. (${count}/${unlocked})`);
            }
        }
    }

    if (targetIndex === undefined) {
        throw new Error("Target plot tidak valid");
    }

    // Validate plot index
    if (targetIndex < 0 || targetIndex >= profile.plots_unlocked) {
        throw new Error("Plot tidak valid");
    }

    // Get inventory item to check ownership and item type
    // We expect inventoryItemId to be the shop item ID (e.g., 'fence_wood')
    // We check if user has this item
    const inventory = await db
        .prepare("SELECT * FROM game_inventory WHERE user_username = ? AND item_id = ? AND quantity > 0")
        .bind(username, inventoryItemId)
        .first();

    if (!inventory) {
        throw new Error("Kamu tidak memiliki item ini");
    }

    // Get item details to verify it's placeable
    const item = await db.prepare("SELECT * FROM game_shop_items WHERE id = ?").bind(inventoryItemId).first();
    if (!item) {
        throw new Error("Item tidak valid");
    }

    // Check if item is placeable type
    const shopItem = GameShopItem.parse(item);
    // Only decorations, sprinklers (upgrades), or tools that act as persistent objects? 
    // Usually 'decoration' or 'upgrade' (like sprinklers) are placeable.
    if (!['decoration', 'upgrade'].includes(shopItem.type)) {
        throw new Error("Item ini tidak bisa diletakkan di ladang");
    }

    // Get plot
    const plot = await db
        .prepare("SELECT * FROM game_farm_plots WHERE user_username = ? AND plot_index = ?")
        .bind(username, targetIndex)
        .first();

    // If plot doesn't exist, create it (should exist from profile creation, but safety check)
    // Actually getOrCreateProfile ensures initialization.

    const parsedPlot = GameFarmPlot.parse(plot);

    // Check if plot is empty of other placed items
    if (parsedPlot.placed_item_id) {
        throw new Error("Sudah ada item di plot ini");
    }

    // Check if trying to place on top of a crop? 
    // Decorations like fences probably shouldn't overlap with crops.
    // Sprinklers might? Let's assume exclusive for simplicty for now, OR allow mix.
    // "Sprinklers water 3x3 area", usually they take up a tile.
    // So we enforce: Tile must be empty (no crop, no placed item).

    if (parsedPlot.crop_id) {
        throw new Error("Plot sedang ditanami");
    }

    // Place item logic:
    // 1. Decrement inventory
    // 2. Update plot with placed_item_id

    await db.batch([
        db.prepare("UPDATE game_inventory SET quantity = quantity - 1 WHERE user_username = ? AND item_id = ?")
            .bind(username, inventoryItemId),
        db.prepare("UPDATE game_farm_plots SET placed_item_id = ?, x = ?, y = ? WHERE user_username = ? AND plot_index = ?")
            .bind(inventoryItemId, x ?? parsedPlot.x, y ?? parsedPlot.y, username, targetIndex)
    ]);

    // Return updated plot
    const updated = await db
        .prepare("SELECT * FROM game_farm_plots WHERE user_username = ? AND plot_index = ?")
        .bind(username, targetIndex)
        .first();

    return GameFarmPlot.parse(updated);
};

export const removeItem = async (
    db: D1Database,
    username: string,
    plotIndex: number
): Promise<GameFarmPlotType> => {
    await ensureInitialized(db);

    // Get plot
    const plot = await db
        .prepare("SELECT * FROM game_farm_plots WHERE user_username = ? AND plot_index = ?")
        .bind(username, plotIndex)
        .first();

    if (!plot) throw new Error("Plot tidak ditemukan");

    const parsedPlot = GameFarmPlot.parse(plot);

    if (!parsedPlot.placed_item_id) {
        throw new Error("Tidak ada item di plot ini");
    }

    const itemId = parsedPlot.placed_item_id;

    // Remove item logic:
    // 1. Increment inventory (or create entry if missing?)
    //    Ideally user keys should already exist if they bought it, but if they had 1 and placed 1, quantity is 0.
    //    We check if row exists first.

    const currInv = await db.prepare("SELECT * FROM game_inventory WHERE user_username = ? AND item_id = ?")
        .bind(username, itemId).first();

    const queries: D1PreparedStatement[] = [];

    if (currInv) {
        queries.push(
            db.prepare("UPDATE game_inventory SET quantity = quantity + 1 WHERE user_username = ? AND item_id = ?")
                .bind(username, itemId)
        );
    } else {
        // Should not happen if they placed it, but just in case
        queries.push(
            db.prepare("INSERT INTO game_inventory (id, user_username, item_id, quantity) VALUES (?, ?, ?, 1)")
                .bind(generateId('inv'), username, itemId)
        );
    }

    queries.push(
        db.prepare("UPDATE game_farm_plots SET placed_item_id = NULL WHERE user_username = ? AND plot_index = ?")
            .bind(username, plotIndex)
    );

    await db.batch(queries);

    // Return updated plot
    const updated = await db
        .prepare("SELECT * FROM game_farm_plots WHERE user_username = ? AND plot_index = ?")
        .bind(username, plotIndex)
        .first();

    return GameFarmPlot.parse(updated);
};

export const useItem = async (
    db: D1Database,
    username: string,
    itemId: string,
    targetPlotIndex?: number
): Promise<{ message: string; updatedPlot?: GameFarmPlotType }> => {
    await ensureInitialized(db);

    const profile = await getOrCreateProfile(db, username);

    // Get inventory item
    const inventory = await db
        .prepare("SELECT * FROM game_inventory WHERE user_username = ? AND item_id = ? AND quantity > 0")
        .bind(username, itemId)
        .first();

    if (!inventory) {
        throw new Error("Kamu tidak memiliki item ini");
    }

    // Get item details
    const item = await db.prepare("SELECT * FROM game_shop_items WHERE id = ?").bind(itemId).first();
    if (!item) {
        throw new Error("Item tidak valid");
    }
    const shopItem = GameShopItem.parse(item);

    // Validate item type
    if (shopItem.type === "seed" || shopItem.type === "tool" || shopItem.type === "decoration" || shopItem.type === "upgrade") {
        throw new Error("Item ini tidak bisa digunakan dengan cara ini");
    }

    const effect = shopItem.effect ? JSON.parse(shopItem.effect) : null;
    if (!effect) {
        throw new Error("Item tidak memiliki efek guna");
    }

    let updatedPlot: GameFarmPlotType | undefined;
    let message = "Item berhasil digunakan";

    if (effect.type === "growth_speed") {
        // Fertilizer
        if (targetPlotIndex === undefined) {
            throw new Error("Pilih plot untuk menggunakan pupuk");
        }

        const plot = await db
            .prepare("SELECT * FROM game_farm_plots WHERE user_username = ? AND plot_index = ?")
            .bind(username, targetPlotIndex)
            .first();

        if (!plot) throw new Error("Plot tidak ditemukan");
        const parsedPlot = GameFarmPlot.parse(plot);

        if (!parsedPlot.crop_id) {
            throw new Error("Plot harus ditanami terlebih dahulu");
        }
        if (parsedPlot.fertilizer_id) {
            throw new Error("Plot sudah diberi pupuk");
        }

        // Apply fertilizer
        await db
            .prepare("UPDATE game_farm_plots SET fertilizer_id = ? WHERE user_username = ? AND plot_index = ?")
            .bind(itemId, username, targetPlotIndex)
            .run();

        // Get updated plot
        const updated = await db
            .prepare("SELECT * FROM game_farm_plots WHERE user_username = ? AND plot_index = ?")
            .bind(username, targetPlotIndex)
            .first();
        updatedPlot = GameFarmPlot.parse(updated);
        message = `Berhasil memberi pupuk ${shopItem.name} `;
    } else {
        throw new Error("Efek item belum didukung");
    }

    // Consume item
    await db
        .prepare("UPDATE game_inventory SET quantity = quantity - 1 WHERE user_username = ? AND item_id = ?")
        .bind(username, itemId)
        .run();

    return { message, updatedPlot };
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
						INSERT INTO game_user_achievements(user_username, achievement_id, progress, claimed)
    VALUES(?, ?, ?, 0)
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
        throw new Error(`Progress belum cukup(${userAchievement.progress} / ${requirement.value})`);
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
    VALUES(?, ?, ?, ?, 0, ?, ?, 0, ?)
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
			INSERT INTO game_leaderboard(user_username, total_gold_earned, level, prestige_level, updated_at)
    VALUES(?, ?, ?, ?, ?)
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
			SELECT *, ROW_NUMBER() OVER(ORDER BY total_gold_earned DESC) as rank
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

// ==========================================
// ADMIN OPERATIONS
// ==========================================
export const getAllProfiles = async (
    db: D1Database,
    limit: number = 50,
    offset: number = 0
): Promise<{ profiles: GameFarmProfileType[]; total: number }> => {
    await ensureInitialized(db);

    // Get total count
    const totalResult = await db.prepare("SELECT COUNT(*) as count FROM game_farm_profiles").first();
    const total = totalResult ? (totalResult.count as number) : 0;

    // Get profiles
    const { results } = await db
        .prepare("SELECT * FROM game_farm_profiles ORDER BY total_gold_earned DESC LIMIT ? OFFSET ?")
        .bind(limit, offset)
        .all();

    return {
        profiles: (results || []).map((r) => GameFarmProfile.parse(r)),
        total,
    };
};

export const createShopItem = async (
    db: D1Database,
    item: GameShopItemType
): Promise<GameShopItemType> => {
    await ensureInitialized(db);

    await db
        .prepare(`
            INSERT INTO game_shop_items
        (id, name, type, price_gold, price_gems, unlock_level, effect, max_quantity, icon, description)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
            item.id,
            item.name,
            item.type,
            item.price_gold,
            item.price_gems,
            item.unlock_level,
            item.effect,
            item.max_quantity,
            item.icon,
            item.description
        )
        .run();

    return item;
};

export const updateShopItem = async (
    db: D1Database,
    id: string,
    item: Partial<GameShopItemType>
): Promise<GameShopItemType> => {
    await ensureInitialized(db);

    const setFragments: string[] = [];
    const values: unknown[] = [];

    // Helper to add field update if present
    const addUpdate = (field: keyof GameShopItemType) => {
        if (item[field] !== undefined) {
            setFragments.push(`${field} = ?`);
            values.push(item[field]);
        }
    };

    addUpdate("name");
    addUpdate("type");
    addUpdate("price_gold");
    addUpdate("price_gems");
    addUpdate("unlock_level");
    addUpdate("effect");
    addUpdate("max_quantity");
    addUpdate("icon");
    addUpdate("description");

    if (setFragments.length === 0) {
        throw new Error("No updates provided");
    }

    values.push(id);

    await db
        .prepare(`UPDATE game_shop_items SET ${setFragments.join(", ")} WHERE id = ? `)
        .bind(...values)
        .run();

    const updated = await db.prepare("SELECT * FROM game_shop_items WHERE id = ?").bind(id).first();
    if (!updated) throw new Error("Item not found after update");

    return GameShopItem.parse(updated);
};

export const deleteShopItem = async (
    db: D1Database,
    id: string
): Promise<void> => {
    await db.prepare("DELETE FROM game_shop_items WHERE id = ?").bind(id).run();
};

// ==========================================
// OBSTACLES
// ==========================================
export const generateObstacles = async (
    db: D1Database,
    username: string
): Promise<void> => {
    // Chance to spawn obstacles on empty space
    const maxObstacles = 5;
    const { count } = await db.prepare("SELECT COUNT(*) as count FROM game_obstacles WHERE user_username = ?").bind(username).first() as any;

    if (count >= maxObstacles) return;

    // 20% chance to spawn
    if (Math.random() > 0.2) return;

    const types = [
        { type: "rock", cost: 50 },
        { type: "weed", cost: 10 },
        { type: "stump", cost: 30 }
    ];
    const picked = types[Math.floor(Math.random() * types.length)];

    // Find random x,y
    // In a real gridless system, we'd need collision check. 
    // For now, let's pick a random location (0-100)
    const x = Math.floor(Math.random() * 90) + 5; // 5-95
    const y = Math.floor(Math.random() * 90) + 5;

    await db.prepare(`
        INSERT INTO game_obstacles (id, user_username, type, x, y, remove_cost)
        VALUES (?, ?, ?, ?, ?, ?)
    `).bind(generateId('obs'), username, picked.type, x, y, picked.cost).run();
};

export const removeObstacle = async (
    db: D1Database,
    username: string,
    obstacleId: string
): Promise<{ success: boolean; newGold: number }> => {
    const obstacle = await db.prepare("SELECT * FROM game_obstacles WHERE id = ?").bind(obstacleId).first();
    if (!obstacle) throw new Error("Obstacle tidak ditemukan");

    if ((obstacle as any).user_username !== username) throw new Error("Bukan milikmu");

    const cost = (obstacle as any).remove_cost || 0;
    const profile = await getOrCreateProfile(db, username);

    if (profile.gold < cost) {
        throw new Error(`Butuh ${cost} gold untuk menghapus ini`);
    }

    await db.batch([
        db.prepare("DELETE FROM game_obstacles WHERE id = ?").bind(obstacleId),
        db.prepare("UPDATE game_farm_profiles SET gold = gold - ? WHERE user_username = ?").bind(cost, username)
    ]);

    return {
        success: true,
        newGold: profile.gold - cost
    };
};

export const getObstacles = async (
    db: D1Database,
    username: string
): Promise<any[]> => {
    const { results } = await db.prepare("SELECT * FROM game_obstacles WHERE user_username = ?").bind(username).all();
    return results || [];
};

// ==========================================
// FARM EXPANSION
// ==========================================
export const expandLand = async (db: D1Database, username: string) => {
    const profile = await getOrCreateProfile(db, username);

    // Calculate cost based on current plot count
    // Base 9 plots free.
    // 10th plot = 500
    // 11th plot = 500 * 1.5
    const expansions = Math.max(0, profile.plots_unlocked - GAME_CONSTANTS.INITIAL_PLOTS);
    const cost = Math.floor(GAME_CONSTANTS.PLOT_EXPANSION_BASE_COST * Math.pow(GAME_CONSTANTS.PLOT_EXPANSION_MULTIPLIER, expansions));

    if (profile.gold < cost) {
        throw new Error(`Not enough gold! Need ${cost} gold.`);
    }

    if (profile.plots_unlocked >= GAME_CONSTANTS.MAX_PLOTS) {
        throw new Error("Maximum farm size reached!");
    }

    // Transaction
    const result = await db.batch([
        db.prepare("UPDATE game_farm_profiles SET gold = gold - ?, plots_unlocked = plots_unlocked + 1 WHERE user_username = ?")
            .bind(cost, username),
        db.prepare("SELECT * FROM game_farm_profiles WHERE user_username = ?")
            .bind(username)
    ]);

    const updatedProfile = result[1].results[0] as GameFarmProfileType;

    return {
        success: true,
        new_plots_unlocked: updatedProfile.plots_unlocked,
        gold_spent: cost,
        remaining_gold: updatedProfile.gold
    };
};
