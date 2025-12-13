-- Hapus tabel _migrations jika sudah ada
DROP TABLE IF EXISTS _migrations;

-- Buat tabel _migrations untuk melacak seed yang sudah dijalankan
CREATE TABLE IF NOT EXISTS _migrations (
  name TEXT PRIMARY KEY,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cek apakah seed user sudah dijalankan
SELECT name FROM _migrations WHERE name = 'user-seed';

-- Jika belum dijalankan, jalankan seed user
INSERT INTO users (username, email, password, full_name, is_admin, created_at, updated_at)
SELECT 'admin', 'admin@example.com', '$2a$10$XFDq3v7qHx3Z5K5U5q5z9e8vJ5Xv5V5X5v5X5v5X5v5X5v5X5v5X5', 'Administrator', 1, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM _migrations WHERE name = 'user-seed');

-- Tandai seed user sudah dijalankan
INSERT OR IGNORE INTO _migrations (name) VALUES ('user-seed');

-- Cek apakah seed task sudah dijalankan
SELECT name FROM _migrations WHERE name = 'task-seed';

-- Jika belum dijalankan, jalankan seed task
INSERT INTO tasks (title, description, is_completed, created_by, created_at, updated_at)
SELECT 'Menyelesaikan tugas backend', 'Menyelesaikan implementasi API untuk fitur tugas', 0, id, datetime('now'), datetime('now')
FROM users WHERE username = 'admin' AND NOT EXISTS (SELECT 1 FROM _migrations WHERE name = 'task-seed')
UNION ALL
SELECT 'Membuat dokumentasi API', 'Membuat dokumentasi lengkap untuk semua endpoint API', 0, id, datetime('now'), datetime('now')
FROM users WHERE username = 'admin' AND NOT EXISTS (SELECT 1 FROM _migrations WHERE name = 'task-seed');

-- Tandai seed task sudah dijalankan
INSERT OR IGNORE INTO _migrations (name) VALUES ('task-seed');

-- Cek apakah seed room sudah dijalankan
SELECT name FROM _migrations WHERE name = 'room-seed';

-- Jika belum dijalankan, jalankan seed room
INSERT INTO rooms (id, name, capacity, description, available, created_at, updated_at)
SELECT 'room-001', 'Meeting Room A', 10, 'Ruang meeting dengan proyektor dan whiteboard', 1, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM _migrations WHERE name = 'room-seed')
UNION ALL
SELECT 'room-002', 'Meeting Room B', 6, 'Ruang meeting kecil untuk diskusi informal', 1, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM _migrations WHERE name = 'room-seed')
UNION ALL
SELECT 'room-003', 'Conference Room', 25, 'Ruang konferensi besar dengan fasilitas lengkap', 1, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM _migrations WHERE name = 'room-seed')
UNION ALL
SELECT 'room-004', 'Training Room', 15, 'Ruang pelatihan dengan layout fleksibel', 0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM _migrations WHERE name = 'room-seed')
UNION ALL
SELECT 'room-005', 'Auditorium', 100, 'Ruang auditorium untuk presentasi besar', 1, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM _migrations WHERE name = 'room-seed');

-- Tandai seed room sudah dijalankan
INSERT OR IGNORE INTO _migrations (name) VALUES ('room-seed');

-- ==========================================
-- GAME DATA SEED
-- ==========================================

-- Create game tables if not exists
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
);

CREATE TABLE IF NOT EXISTS game_shop_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    price_gold INTEGER DEFAULT 0,
    price_gems INTEGER DEFAULT 0,
    unlock_level INTEGER DEFAULT 1,
    effect TEXT,
    max_quantity INTEGER DEFAULT 1,
    icon TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS game_achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    requirement TEXT NOT NULL,
    reward_gold INTEGER DEFAULT 0,
    reward_gems INTEGER DEFAULT 0,
    icon TEXT
);

-- Seed Crops (Tier 1-5)
INSERT OR IGNORE INTO game_crops (id, name, tier, grow_time_seconds, sell_price, seed_price, unlock_level, xp_reward, icon, description) VALUES
('carrot', 'Carrot', 1, 30, 10, 5, 1, 5, '🥕', 'A quick-growing orange vegetable'),
('corn', 'Corn', 1, 60, 25, 10, 1, 8, '🌽', 'Golden kernels of deliciousness'),
('lettuce', 'Lettuce', 1, 45, 15, 8, 1, 6, '🥬', 'Fresh and crispy greens'),
('tomato', 'Tomato', 2, 120, 50, 25, 5, 15, '🍅', 'Juicy red tomatoes'),
('potato', 'Potato', 2, 180, 75, 35, 7, 20, '🥔', 'Earthy and filling potatoes'),
('wheat', 'Wheat', 2, 300, 120, 50, 10, 30, '🌾', 'Golden stalks of wheat'),
('strawberry', 'Strawberry', 3, 600, 300, 150, 15, 50, '🍓', 'Sweet red strawberries'),
('watermelon', 'Watermelon', 3, 900, 500, 250, 18, 75, '🍉', 'Refreshing summer melons'),
('grapes', 'Grapes', 3, 1200, 800, 400, 20, 100, '🍇', 'Perfect for wine making'),
('rose', 'Rose', 4, 1800, 1500, 750, 25, 150, '🌹', 'Beautiful fragrant roses'),
('pineapple', 'Pineapple', 4, 3600, 3000, 1500, 30, 250, '🍍', 'Tropical pineapples'),
('sunflower', 'Sunflower', 4, 7200, 6000, 3000, 35, 400, '🌻', 'Bright and sunny flowers'),
('golden_apple', 'Golden Apple', 5, 14400, 15000, 7500, 40, 800, '🍎', 'A mythical golden apple'),
('crystal_berry', 'Crystal Berry', 5, 28800, 35000, 17500, 45, 1500, '💎', 'Rare berries that sparkle'),
('rainbow_flower', 'Rainbow Flower', 5, 43200, 80000, 40000, 50, 3000, '🌈', 'A legendary multicolored flower');

-- Seed Shop Items
INSERT OR IGNORE INTO game_shop_items (id, name, type, price_gold, price_gems, unlock_level, effect, max_quantity, icon, description) VALUES
('watering_can_plus', 'Watering Can+', 'tool', 500, 0, 3, '{"type":"water_all","area":4}', 1, '💧', 'Water 4 plots at once'),
('golden_hoe', 'Golden Hoe', 'tool', 1000, 0, 8, '{"type":"plant_speed","value":2}', 1, '⛏️', 'Plant crops 2x faster'),
('harvester', 'Harvester', 'tool', 2000, 0, 12, '{"type":"harvest_all"}', 1, '🚜', 'Harvest all ready crops at once'),
('sprinkler_basic', 'Basic Sprinkler', 'upgrade', 1500, 0, 6, '{"type":"auto_water","area":9}', 1, '🚿', 'Auto-waters 3x3 area'),
('sprinkler_advanced', 'Advanced Sprinkler', 'upgrade', 5000, 0, 15, '{"type":"auto_water","area":25}', 1, '💦', 'Auto-waters 5x5 area'),
('farmhand', 'Farmhand', 'upgrade', 3000, 0, 10, '{"type":"auto_harvest"}', 1, '👨‍🌾', 'Auto-harvests ready crops'),
('auto_plant', 'Seed Dispenser', 'upgrade', 4000, 0, 14, '{"type":"auto_replant"}', 1, '🌱', 'Auto-replants after harvest'),
('fence_wood', 'Wooden Fence', 'decoration', 200, 0, 2, NULL, 10, '🪵', 'A rustic wooden fence'),
('scarecrow', 'Scarecrow', 'decoration', 300, 0, 4, NULL, 4, '🎃', 'Keeps the crows away'),
('garden_gnome', 'Garden Gnome', 'decoration', 500, 0, 6, NULL, 5, '🧙', 'A magical garden companion'),
('well', 'Wishing Well', 'decoration', 1000, 0, 10, NULL, 1, '⛲', 'Make a wish'),
('growth_potion', 'Growth Potion', 'premium', 0, 10, 1, '{"type":"instant_grow","plots":1}', -1, '🧪', 'Instantly grows one crop'),
('gold_boost_1h', 'Gold Boost (1hr)', 'premium', 0, 20, 5, '{"type":"gold_multiplier","value":2,"duration":3600}', -1, '✨', '2x gold for 1 hour'),
('xp_boost_1h', 'XP Boost (1hr)', 'premium', 0, 15, 5, '{"type":"xp_multiplier","value":2,"duration":3600}', -1, '⚡', '2x XP for 1 hour'),
('rare_seed_pack', 'Rare Seed Pack', 'premium', 0, 50, 10, '{"type":"seed_pack","seeds":["strawberry","watermelon","grapes"],"quantity":3}', -1, '🎁', '3 random premium seeds'),
('fertilizer', 'Fertilizer', 'booster', 100, 0, 3, '{"type":"growth_speed","value":1.5,"duration":1800}', -1, '💩', '+50% growth speed for 30min'),
('plot_expansion', 'Plot Expansion', 'upgrade', 500, 0, 5, '{"type":"unlock_plot","count":1}', 40, '📐', 'Unlock 1 additional plot');

-- Seed Achievements
INSERT OR IGNORE INTO game_achievements (id, name, description, requirement, reward_gold, reward_gems, icon) VALUES
('first_harvest', 'First Harvest', 'Harvest your first crop', '{"type":"harvest_count","value":1}', 50, 0, '🌱'),
('green_thumb', 'Green Thumb', 'Harvest 100 crops', '{"type":"harvest_count","value":100}', 500, 5, '👍'),
('master_farmer', 'Master Farmer', 'Harvest 1000 crops', '{"type":"harvest_count","value":1000}', 5000, 50, '🏆'),
('legendary_harvester', 'Legendary Harvester', 'Harvest 10000 crops', '{"type":"harvest_count","value":10000}', 50000, 200, '👑'),
('first_gold', 'First Gold', 'Earn 100 gold', '{"type":"gold_earned","value":100}', 50, 0, '🪙'),
('wealthy', 'Wealthy Farmer', 'Earn 10,000 gold', '{"type":"gold_earned","value":10000}', 1000, 10, '💰'),
('millionaire', 'Millionaire', 'Earn 1,000,000 gold', '{"type":"gold_earned","value":1000000}', 10000, 100, '🤑'),
('level_10', 'Rising Star', 'Reach level 10', '{"type":"level","value":10}', 500, 10, '⭐'),
('level_25', 'Experienced Farmer', 'Reach level 25', '{"type":"level","value":25}', 2500, 25, '🌟'),
('level_50', 'Farming Legend', 'Reach level 50', '{"type":"level","value":50}', 10000, 100, '💫'),
('speed_farmer', 'Speed Farmer', 'Harvest 10 crops in 1 minute', '{"type":"speed_harvest","value":10}', 200, 5, '⚡'),
('collector', 'Crop Collector', 'Grow every type of crop', '{"type":"unique_crops","value":15}', 5000, 50, '🏅'),
('prestige_1', 'Rebirth', 'Prestige for the first time', '{"type":"prestige","value":1}', 1000, 50, '🔄'),
('prestige_5', 'Transcendence', 'Reach prestige level 5', '{"type":"prestige","value":5}', 10000, 200, '✨'),
('full_farm', 'Full Farm', 'Unlock all plots', '{"type":"plots_unlocked","value":49}', 25000, 100, '🗺️');

-- Tandai seed game sudah dijalankan
INSERT OR IGNORE INTO _migrations (name) VALUES ('game-seed');
