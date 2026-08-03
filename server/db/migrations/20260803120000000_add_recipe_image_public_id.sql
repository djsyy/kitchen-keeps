-- Up Migration
ALTER TABLE recipes
ADD COLUMN image_public_id text;

-- Down Migration
ALTER TABLE recipes
DROP COLUMN image_public_id;
