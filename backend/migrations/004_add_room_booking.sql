-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  description TEXT,
  available INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_username TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  purpose TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_username) REFERENCES users(username) ON DELETE CASCADE
);



-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_username);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_time ON bookings(start_time, end_time);

-- Insert sample rooms
INSERT OR IGNORE INTO rooms (id, name, capacity, description, available) VALUES
  ('room-001', 'Meeting Room A', 10, 'Ruang meeting dengan proyektor dan whiteboard', 1),
  ('room-002', 'Meeting Room B', 6, 'Ruang meeting kecil untuk diskusi tim', 1),
  ('room-003', 'Conference Hall', 50, 'Ruang konferensi besar dengan sound system', 1),
  ('room-004', 'Training Room', 20, 'Ruang training dengan komputer dan LCD', 1);
