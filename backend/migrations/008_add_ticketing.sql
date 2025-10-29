-- Create ticket_categories table
CREATE TABLE IF NOT EXISTS ticket_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'solved')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  submitter_name TEXT,
  submitter_email TEXT,
  reference_link TEXT,
  assigned_to TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES ticket_categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (assigned_to) REFERENCES users(username) ON DELETE SET NULL
);

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  commenter_type TEXT NOT NULL CHECK (commenter_type IN ('guest', 'user')),
  commenter_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Create ticket_assignments table for tracking assignment history
CREATE TABLE IF NOT EXISTS ticket_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  assigned_from TEXT,
  assigned_to TEXT NOT NULL,
  assigned_by TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_from) REFERENCES users(username) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(username) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(username) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tickets_token ON tickets(token);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_assignments_ticket_id ON ticket_assignments(ticket_id);

-- Insert default categories
INSERT OR IGNORE INTO ticket_categories (name, description) VALUES
  ('Technical', 'Technical issues and bugs'),
  ('Support', 'General support requests'),
  ('Feature Request', 'Requests for new features'),
  ('Complaint', 'Complaints and concerns'),
  ('Other', 'Other inquiries');
