-- Whiteboards table
CREATE TABLE IF NOT EXISTS whiteboards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

-- Whiteboard strokes table (for persistence)
CREATE TABLE IF NOT EXISTS whiteboard_strokes (
    id TEXT PRIMARY KEY,
    whiteboard_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    stroke_data TEXT NOT NULL, -- JSON data for the stroke
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (whiteboard_id) REFERENCES whiteboards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_whiteboard_strokes_whiteboard_id ON whiteboard_strokes(whiteboard_id);
CREATE INDEX IF NOT EXISTS idx_whiteboards_created_by ON whiteboards(created_by);
