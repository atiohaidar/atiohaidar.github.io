-- Migrate tasks table to use auto-incrementing ID instead of slug
-- Create new table with desired structure
CREATE TABLE IF NOT EXISTS tasks_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  due_date TEXT,
  owner TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Copy over existing task data
INSERT INTO tasks_new (name, description, completed, due_date, owner, created_at, updated_at)
SELECT name, description, completed, due_date, owner, created_at, updated_at FROM tasks;

-- Drop existing trigger tied to slug primary key if it exists
DROP TRIGGER IF EXISTS tasks_updated_at;

-- Replace old table with the new structure
DROP TABLE tasks;
ALTER TABLE tasks_new RENAME TO tasks;

-- Recreate index for owner lookups
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner);
