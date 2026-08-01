-- Up Migration
ALTER TABLE cook_sessions
ADD COLUMN expired_prompt_seen_at timestamp with time zone;

-- Down Migration
ALTER TABLE cook_sessions
DROP COLUMN expired_prompt_seen_at;
