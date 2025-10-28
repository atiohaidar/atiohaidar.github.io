-- Add owner field to tasks table for proper authorization
ALTER TABLE tasks ADD COLUMN owner TEXT;

-- Add owner field to articles table for proper authorization
ALTER TABLE articles ADD COLUMN owner TEXT;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner);
CREATE INDEX IF NOT EXISTS idx_articles_owner ON articles(owner);
