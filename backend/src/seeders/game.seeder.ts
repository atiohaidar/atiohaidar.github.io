/**
 * Game Data Seeder
 * Seeds initial crops, shop items, and achievements for Harvest Haven
 */

// Crop data
const CROPS = [
    // Tier 1 - Starter crops (fast, low profit)
    { id: "carrot", name: "Carrot", tier: 1, grow_time_seconds: 30, sell_price: 10, seed_price: 5, unlock_level: 1, xp_reward: 5, icon: "🥕", description: "A quick-growing orange vegetable" },
    { id: "corn", name: "Corn", tier: 1, grow_time_seconds: 60, sell_price: 25, seed_price: 10, unlock_level: 1, xp_reward: 8, icon: "🌽", description: "Golden kernels of deliciousness" },
    { id: "lettuce", name: "Lettuce", tier: 1, grow_time_seconds: 45, sell_price: 15, seed_price: 8, unlock_level: 1, xp_reward: 6, icon: "🥬", description: "Fresh and crispy greens" },

    // Tier 2 - Common crops (medium)
    { id: "tomato", name: "Tomato", tier: 2, grow_time_seconds: 120, sell_price: 50, seed_price: 25, unlock_level: 5, xp_reward: 15, icon: "🍅", description: "Juicy red tomatoes" },
    { id: "potato", name: "Potato", tier: 2, grow_time_seconds: 180, sell_price: 75, seed_price: 35, unlock_level: 7, xp_reward: 20, icon: "🥔", description: "Earthy and filling potatoes" },
    { id: "wheat", name: "Wheat", tier: 2, grow_time_seconds: 300, sell_price: 120, seed_price: 50, unlock_level: 10, xp_reward: 30, icon: "🌾", description: "Golden stalks of wheat" },

    // Tier 3 - Premium crops (slow, high profit)
    { id: "strawberry", name: "Strawberry", tier: 3, grow_time_seconds: 600, sell_price: 300, seed_price: 150, unlock_level: 15, xp_reward: 50, icon: "🍓", description: "Sweet red strawberries" },
    { id: "watermelon", name: "Watermelon", tier: 3, grow_time_seconds: 900, sell_price: 500, seed_price: 250, unlock_level: 18, xp_reward: 75, icon: "🍉", description: "Refreshing summer melons" },
    { id: "grapes", name: "Grapes", tier: 3, grow_time_seconds: 1200, sell_price: 800, seed_price: 400, unlock_level: 20, xp_reward: 100, icon: "🍇", description: "Perfect for wine making" },

    // Tier 4 - Exotic crops (very slow, very high profit)
    { id: "rose", name: "Rose", tier: 4, grow_time_seconds: 1800, sell_price: 1500, seed_price: 750, unlock_level: 25, xp_reward: 150, icon: "🌹", description: "Beautiful fragrant roses" },
    { id: "pineapple", name: "Pineapple", tier: 4, grow_time_seconds: 3600, sell_price: 3000, seed_price: 1500, unlock_level: 30, xp_reward: 250, icon: "🍍", description: "Tropical pineapples" },
    { id: "sunflower", name: "Sunflower", tier: 4, grow_time_seconds: 7200, sell_price: 6000, seed_price: 3000, unlock_level: 35, xp_reward: 400, icon: "🌻", description: "Bright and sunny flowers" },

    // Tier 5 - Legendary crops (ultra rare)
    { id: "golden_apple", name: "Golden Apple", tier: 5, grow_time_seconds: 14400, sell_price: 15000, seed_price: 7500, unlock_level: 40, xp_reward: 800, icon: "🍎", description: "A mythical golden apple" },
    { id: "crystal_berry", name: "Crystal Berry", tier: 5, grow_time_seconds: 28800, sell_price: 35000, seed_price: 17500, unlock_level: 45, xp_reward: 1500, icon: "💎", description: "Rare berries that sparkle" },
    { id: "rainbow_flower", name: "Rainbow Flower", tier: 5, grow_time_seconds: 43200, sell_price: 80000, seed_price: 40000, unlock_level: 50, xp_reward: 3000, icon: "🌈", description: "A legendary multicolored flower" },
];

// Shop items
const SHOP_ITEMS = [
    // Tools
    { id: "watering_can_plus", name: "Watering Can+", type: "tool", price_gold: 500, price_gems: 0, unlock_level: 3, effect: JSON.stringify({ type: "water_all", area: 4 }), max_quantity: 1, icon: "💧", description: "Water 4 plots at once" },
    { id: "golden_hoe", name: "Golden Hoe", type: "tool", price_gold: 1000, price_gems: 0, unlock_level: 8, effect: JSON.stringify({ type: "plant_speed", value: 2 }), max_quantity: 1, icon: "⛏️", description: "Plant crops 2x faster" },
    { id: "harvester", name: "Harvester", type: "tool", price_gold: 2000, price_gems: 0, unlock_level: 12, effect: JSON.stringify({ type: "harvest_all" }), max_quantity: 1, icon: "🚜", description: "Harvest all ready crops at once" },

    // Upgrades
    { id: "sprinkler_basic", name: "Basic Sprinkler", type: "upgrade", price_gold: 1500, price_gems: 0, unlock_level: 6, effect: JSON.stringify({ type: "auto_water", area: 9 }), max_quantity: 1, icon: "🚿", description: "Auto-waters 3x3 area" },
    { id: "sprinkler_advanced", name: "Advanced Sprinkler", type: "upgrade", price_gold: 5000, price_gems: 0, unlock_level: 15, effect: JSON.stringify({ type: "auto_water", area: 25 }), max_quantity: 1, icon: "💦", description: "Auto-waters 5x5 area" },
    { id: "farmhand", name: "Farmhand", type: "upgrade", price_gold: 3000, price_gems: 0, unlock_level: 10, effect: JSON.stringify({ type: "auto_harvest" }), max_quantity: 1, icon: "👨‍🌾", description: "Auto-harvests ready crops" },
    { id: "auto_plant", name: "Seed Dispenser", type: "upgrade", price_gold: 4000, price_gems: 0, unlock_level: 14, effect: JSON.stringify({ type: "auto_replant" }), max_quantity: 1, icon: "🌱", description: "Auto-replants after harvest" },

    // Decorations
    { id: "fence_wood", name: "Wooden Fence", type: "decoration", price_gold: 200, price_gems: 0, unlock_level: 2, effect: null, max_quantity: 10, icon: "🪵", description: "A rustic wooden fence" },
    { id: "scarecrow", name: "Scarecrow", type: "decoration", price_gold: 300, price_gems: 0, unlock_level: 4, effect: null, max_quantity: 4, icon: "🎃", description: "Keeps the crows away" },
    { id: "garden_gnome", name: "Garden Gnome", type: "decoration", price_gold: 500, price_gems: 0, unlock_level: 6, effect: null, max_quantity: 5, icon: "🧙", description: "A magical garden companion" },
    { id: "well", name: "Wishing Well", type: "decoration", price_gold: 1000, price_gems: 0, unlock_level: 10, effect: null, max_quantity: 1, icon: "⛲", description: "Make a wish" },

    // Premium items (gems)
    { id: "growth_potion", name: "Growth Potion", type: "premium", price_gold: 0, price_gems: 10, unlock_level: 1, effect: JSON.stringify({ type: "instant_grow", plots: 1 }), max_quantity: -1, icon: "🧪", description: "Instantly grows one crop" },
    { id: "gold_boost_1h", name: "Gold Boost (1hr)", type: "premium", price_gold: 0, price_gems: 20, unlock_level: 5, effect: JSON.stringify({ type: "gold_multiplier", value: 2, duration: 3600 }), max_quantity: -1, icon: "✨", description: "2x gold for 1 hour" },
    { id: "xp_boost_1h", name: "XP Boost (1hr)", type: "premium", price_gold: 0, price_gems: 15, unlock_level: 5, effect: JSON.stringify({ type: "xp_multiplier", value: 2, duration: 3600 }), max_quantity: -1, icon: "⚡", description: "2x XP for 1 hour" },
    { id: "rare_seed_pack", name: "Rare Seed Pack", type: "premium", price_gold: 0, price_gems: 50, unlock_level: 10, effect: JSON.stringify({ type: "seed_pack", seeds: ["strawberry", "watermelon", "grapes"], quantity: 3 }), max_quantity: -1, icon: "🎁", description: "3 random premium seeds" },

    // Boosters
    { id: "fertilizer", name: "Fertilizer", type: "booster", price_gold: 100, price_gems: 0, unlock_level: 3, effect: JSON.stringify({ type: "growth_speed", value: 1.5, duration: 1800 }), max_quantity: -1, icon: "💩", description: "+50% growth speed for 30min" },
    { id: "lucky_clover", name: "Lucky Clover", type: "booster", price_gold: 200, price_gems: 0, unlock_level: 7, effect: JSON.stringify({ type: "double_harvest_chance", value: 0.25 }), max_quantity: -1, icon: "🍀", description: "25% chance for double harvest" },

    // Plot expansion
    { id: "plot_expansion", name: "Plot Expansion", type: "upgrade", price_gold: 500, price_gems: 0, unlock_level: 5, effect: JSON.stringify({ type: "unlock_plot", count: 1 }), max_quantity: 40, icon: "📐", description: "Unlock 1 additional plot" },
];

// Achievements
const ACHIEVEMENTS = [
    // Harvest milestones
    { id: "first_harvest", name: "First Harvest", description: "Harvest your first crop", requirement: JSON.stringify({ type: "harvest_count", value: 1 }), reward_gold: 50, reward_gems: 0, icon: "🌱" },
    { id: "green_thumb", name: "Green Thumb", description: "Harvest 100 crops", requirement: JSON.stringify({ type: "harvest_count", value: 100 }), reward_gold: 500, reward_gems: 5, icon: "👍" },
    { id: "master_farmer", name: "Master Farmer", description: "Harvest 1000 crops", requirement: JSON.stringify({ type: "harvest_count", value: 1000 }), reward_gold: 5000, reward_gems: 50, icon: "🏆" },
    { id: "legendary_harvester", name: "Legendary Harvester", description: "Harvest 10000 crops", requirement: JSON.stringify({ type: "harvest_count", value: 10000 }), reward_gold: 50000, reward_gems: 200, icon: "👑" },

    // Gold earning milestones
    { id: "first_gold", name: "First Gold", description: "Earn 100 gold", requirement: JSON.stringify({ type: "gold_earned", value: 100 }), reward_gold: 50, reward_gems: 0, icon: "🪙" },
    { id: "wealthy", name: "Wealthy Farmer", description: "Earn 10,000 gold", requirement: JSON.stringify({ type: "gold_earned", value: 10000 }), reward_gold: 1000, reward_gems: 10, icon: "💰" },
    { id: "millionaire", name: "Millionaire", description: "Earn 1,000,000 gold", requirement: JSON.stringify({ type: "gold_earned", value: 1000000 }), reward_gold: 10000, reward_gems: 100, icon: "🤑" },

    // Level milestones
    { id: "level_10", name: "Rising Star", description: "Reach level 10", requirement: JSON.stringify({ type: "level", value: 10 }), reward_gold: 500, reward_gems: 10, icon: "⭐" },
    { id: "level_25", name: "Experienced Farmer", description: "Reach level 25", requirement: JSON.stringify({ type: "level", value: 25 }), reward_gold: 2500, reward_gems: 25, icon: "🌟" },
    { id: "level_50", name: "Farming Legend", description: "Reach level 50", requirement: JSON.stringify({ type: "level", value: 50 }), reward_gold: 10000, reward_gems: 100, icon: "💫" },

    // Special achievements
    { id: "speed_farmer", name: "Speed Farmer", description: "Harvest 10 crops in 1 minute", requirement: JSON.stringify({ type: "speed_harvest", value: 10 }), reward_gold: 200, reward_gems: 5, icon: "⚡" },
    { id: "collector", name: "Crop Collector", description: "Grow every type of crop", requirement: JSON.stringify({ type: "unique_crops", value: 15 }), reward_gold: 5000, reward_gems: 50, icon: "🏅" },
    { id: "prestige_1", name: "Rebirth", description: "Prestige for the first time", requirement: JSON.stringify({ type: "prestige", value: 1 }), reward_gold: 1000, reward_gems: 50, icon: "🔄" },
    { id: "prestige_5", name: "Transcendence", description: "Reach prestige level 5", requirement: JSON.stringify({ type: "prestige", value: 5 }), reward_gold: 10000, reward_gems: 200, icon: "✨" },
    { id: "full_farm", name: "Full Farm", description: "Unlock all plots", requirement: JSON.stringify({ type: "plots_unlocked", value: 49 }), reward_gold: 25000, reward_gems: 100, icon: "🗺️" },
];

export const seedGameData = async (db: D1Database): Promise<{ crops: number; items: number; achievements: number }> => {
    let cropsSeeded = 0;
    let itemsSeeded = 0;
    let achievementsSeeded = 0;

    // Seed crops
    for (const crop of CROPS) {
        try {
            await db
                .prepare(`
					INSERT OR IGNORE INTO game_crops 
					(id, name, tier, grow_time_seconds, sell_price, seed_price, unlock_level, xp_reward, icon, description)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				`)
                .bind(
                    crop.id,
                    crop.name,
                    crop.tier,
                    crop.grow_time_seconds,
                    crop.sell_price,
                    crop.seed_price,
                    crop.unlock_level,
                    crop.xp_reward,
                    crop.icon,
                    crop.description
                )
                .run();
            cropsSeeded++;
        } catch (e) {
            console.error(`Failed to seed crop ${crop.id}:`, e);
        }
    }

    // Seed shop items
    for (const item of SHOP_ITEMS) {
        try {
            await db
                .prepare(`
					INSERT OR IGNORE INTO game_shop_items 
					(id, name, type, price_gold, price_gems, unlock_level, effect, max_quantity, icon, description)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            itemsSeeded++;
        } catch (e) {
            console.error(`Failed to seed item ${item.id}:`, e);
        }
    }

    // Seed achievements
    for (const ach of ACHIEVEMENTS) {
        try {
            await db
                .prepare(`
					INSERT OR IGNORE INTO game_achievements 
					(id, name, description, requirement, reward_gold, reward_gems, icon)
					VALUES (?, ?, ?, ?, ?, ?, ?)
				`)
                .bind(
                    ach.id,
                    ach.name,
                    ach.description,
                    ach.requirement,
                    ach.reward_gold,
                    ach.reward_gems,
                    ach.icon
                )
                .run();
            achievementsSeeded++;
        } catch (e) {
            console.error(`Failed to seed achievement ${ach.id}:`, e);
        }
    }

    return {
        crops: cropsSeeded,
        items: itemsSeeded,
        achievements: achievementsSeeded,
    };
};

// Export data for reference
export { CROPS, SHOP_ITEMS, ACHIEVEMENTS };
