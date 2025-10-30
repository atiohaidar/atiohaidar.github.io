-- Habit Tracker tables

-- habits: stores user habits/routines
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  user_username TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'custom')),
  period_days INTEGER DEFAULT 1 CHECK (period_days > 0),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_username);
CREATE INDEX IF NOT EXISTS idx_habits_created ON habits(created_at);

-- habit_completions: tracks when habits are completed
CREATE TABLE IF NOT EXISTS habit_completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  user_username TEXT NOT NULL,
  completion_date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  FOREIGN KEY (user_username) REFERENCES users(username) ON DELETE CASCADE,
  UNIQUE(habit_id, completion_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_completions_habit ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user ON habit_completions(user_username);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completion_date);
