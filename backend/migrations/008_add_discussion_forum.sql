-- Discussion threads/topics
CREATE TABLE IF NOT EXISTS discussions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  creator_username TEXT,
  creator_name TEXT,
  is_anonymous INTEGER DEFAULT 0 CHECK (is_anonymous IN (0, 1)),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_username) REFERENCES users(username) ON DELETE SET NULL
);

-- Discussion replies/comments
CREATE TABLE IF NOT EXISTS discussion_replies (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL,
  content TEXT NOT NULL,
  creator_username TEXT,
  creator_name TEXT,
  is_anonymous INTEGER DEFAULT 0 CHECK (is_anonymous IN (0, 1)),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
  FOREIGN KEY (creator_username) REFERENCES users(username) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_created_at ON discussion_replies(created_at);
