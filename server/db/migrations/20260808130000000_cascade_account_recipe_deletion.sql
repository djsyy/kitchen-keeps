-- Up Migration
ALTER TABLE recipes
DROP CONSTRAINT recipes_created_by_user_id_fkey;

ALTER TABLE recipes
ADD CONSTRAINT recipes_created_by_user_id_fkey
FOREIGN KEY (created_by_user_id) REFERENCES users ON DELETE CASCADE;

-- Down Migration
ALTER TABLE recipes
DROP CONSTRAINT recipes_created_by_user_id_fkey;

ALTER TABLE recipes
ADD CONSTRAINT recipes_created_by_user_id_fkey
FOREIGN KEY (created_by_user_id) REFERENCES users ON DELETE SET NULL;
