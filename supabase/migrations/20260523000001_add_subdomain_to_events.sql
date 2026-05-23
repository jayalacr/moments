-- Add subdomain column to events table
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS subdomain TEXT UNIQUE;

-- Index for fast lookups in middleware
CREATE INDEX IF NOT EXISTS idx_events_subdomain ON events (subdomain)
  WHERE subdomain IS NOT NULL;

-- Backfill existing events: use slug as subdomain
UPDATE events
SET subdomain = slug
WHERE subdomain IS NULL;
