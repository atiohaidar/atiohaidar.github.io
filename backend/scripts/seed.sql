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
