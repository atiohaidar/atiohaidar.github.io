-- Chat conversations (for direct user-to-user chats)
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user1_username TEXT NOT NULL,
  user2_username TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_username) REFERENCES users(username),
  FOREIGN KEY (user2_username) REFERENCES users(username),
  UNIQUE(user1_username, user2_username)
);

-- Chat messages (for both direct and group chats)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT,
  group_id TEXT,
  sender_username TEXT NOT NULL,
  content TEXT NOT NULL,
  reply_to_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES group_chats(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_username) REFERENCES users(username),
  FOREIGN KEY (reply_to_id) REFERENCES messages(id),
  CHECK ((conversation_id IS NOT NULL AND group_id IS NULL) OR (conversation_id IS NULL AND group_id IS NOT NULL))
);

-- Group chats
CREATE TABLE IF NOT EXISTS group_chats (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(username)
);

-- Group members
CREATE TABLE IF NOT EXISTS group_members (
  group_id TEXT NOT NULL,
  user_username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, user_username),
  FOREIGN KEY (group_id) REFERENCES group_chats(id) ON DELETE CASCADE,
  FOREIGN KEY (user_username) REFERENCES users(username)
);

-- Anonymous chat messages
CREATE TABLE IF NOT EXISTS anonymous_messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  reply_to_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reply_to_id) REFERENCES anonymous_messages(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_username);
CREATE INDEX IF NOT EXISTS idx_anonymous_messages_created_at ON anonymous_messages(created_at);

-- Triggers for updated_at
CREATE TRIGGER IF NOT EXISTS conversations_updated_at
AFTER UPDATE ON conversations
FOR EACH ROW
BEGIN
  UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS group_chats_updated_at
AFTER UPDATE ON group_chats
FOR EACH ROW
BEGIN
  UPDATE group_chats SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
