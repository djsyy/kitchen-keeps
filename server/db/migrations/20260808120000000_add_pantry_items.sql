-- Up Migration
CREATE TABLE pantry_items (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users ON DELETE CASCADE,
  ingredient_id integer NOT NULL REFERENCES ingredients ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pantry_items_user_ingredient_unique UNIQUE (user_id, ingredient_id)
);

CREATE INDEX pantry_items_user_id_idx ON pantry_items (user_id);
CREATE INDEX pantry_items_ingredient_id_idx ON pantry_items (ingredient_id);

-- Down Migration
DROP TABLE IF EXISTS pantry_items;
