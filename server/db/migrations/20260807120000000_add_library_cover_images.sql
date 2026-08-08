-- Up Migration
ALTER TABLE libraries
ADD COLUMN cover_image_url text,
ADD COLUMN cover_image_public_id text;

-- Down Migration
ALTER TABLE libraries
DROP COLUMN cover_image_public_id,
DROP COLUMN cover_image_url;
