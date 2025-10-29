-- Inventory items table
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  attachment_link TEXT,
  owner_username TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_username) REFERENCES users(username) ON DELETE CASCADE
);



-- Helpful index for owner lookups
CREATE INDEX IF NOT EXISTS idx_items_owner ON items(owner_username);

-- Borrowing requests for items
CREATE TABLE IF NOT EXISTS item_borrowings (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  borrower_username TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned', 'damaged', 'extended')),
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (borrower_username) REFERENCES users(username) ON DELETE CASCADE
);


-- Indexes to support common queries
CREATE INDEX IF NOT EXISTS idx_item_borrowings_item ON item_borrowings(item_id);
CREATE INDEX IF NOT EXISTS idx_item_borrowings_borrower ON item_borrowings(borrower_username);
CREATE INDEX IF NOT EXISTS idx_item_borrowings_status ON item_borrowings(status);
CREATE INDEX IF NOT EXISTS idx_item_borrowings_dates ON item_borrowings(start_date, end_date);
