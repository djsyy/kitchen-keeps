-- Up Migration
-- NULL means the ingredient has not been checked yet. 'unknown' is an explicit
-- “Not sure” choice made by the user.
ALTER TABLE cook_session_items
ALTER COLUMN status DROP NOT NULL,
ALTER COLUMN status DROP DEFAULT;

UPDATE cook_session_items
SET status = NULL
WHERE status = 'unknown';

-- Down Migration
UPDATE cook_session_items
SET status = 'unknown'
WHERE status IS NULL;

ALTER TABLE cook_session_items
ALTER COLUMN status SET DEFAULT 'unknown',
ALTER COLUMN status SET NOT NULL;
