-- users
CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO users (username, name, password, role) VALUES
  ('admin', 'Administrator', 'admin123', 'admin'),
  ('user', 'Sample Member', 'user123', 'member');

-- tasks
CREATE TABLE IF NOT EXISTS tasks (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  due_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

