-- Events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL, -- ISO 8601 datetime for when the event occurs
  location TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(username) ON DELETE CASCADE
);

-- Event attendees/registrations table
CREATE TABLE IF NOT EXISTS event_attendees (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  user_username TEXT NOT NULL,
  attendance_token TEXT NOT NULL UNIQUE, -- Token for QR code
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'present', 'absent')),
  registered_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_username) REFERENCES users(username) ON DELETE CASCADE,
  UNIQUE(event_id, user_username) -- A user can only register once per event
);

-- Event admins table (who can manage the event)
CREATE TABLE IF NOT EXISTS event_admins (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  user_username TEXT NOT NULL,
  assigned_by TEXT NOT NULL,
  assigned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_username) REFERENCES users(username) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(username) ON DELETE CASCADE,
  UNIQUE(event_id, user_username) -- A user can only be admin once per event
);

-- Attendance scans table (records each scan)
CREATE TABLE IF NOT EXISTS attendance_scans (
  id TEXT PRIMARY KEY,
  attendee_id TEXT NOT NULL,
  scanned_by TEXT NOT NULL, -- Username who performed the scan
  scanned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  latitude REAL, -- GPS latitude
  longitude REAL, -- GPS longitude
  FOREIGN KEY (attendee_id) REFERENCES event_attendees(id) ON DELETE CASCADE,
  FOREIGN KEY (scanned_by) REFERENCES users(username) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_username);
CREATE INDEX IF NOT EXISTS idx_event_attendees_token ON event_attendees(attendance_token);
CREATE INDEX IF NOT EXISTS idx_event_admins_event ON event_admins(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scans_attendee ON attendance_scans(attendee_id);
