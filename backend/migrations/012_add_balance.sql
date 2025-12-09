-- Add balance to users
ALTER TABLE users ADD COLUMN balance REAL DEFAULT 0;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_username TEXT,
  to_username TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('transfer', 'topup')),
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_username) REFERENCES users(username),
  FOREIGN KEY (to_username) REFERENCES users(username)
);
