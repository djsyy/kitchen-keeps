-- Up Migration
CREATE EXTENSION IF NOT EXISTS citext;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
  id serial PRIMARY KEY,
  name varchar(100) NOT NULL,
  email varchar(255) NOT NULL CONSTRAINT users_email_unique UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE libraries (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE (user_id, name)
);

CREATE TABLE recipes (
  id serial PRIMARY KEY,
  title varchar(255) NOT NULL,
  description text,
  image_url text,
  created_by_user_id integer REFERENCES users ON DELETE SET NULL,
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings integer,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT recipes_user_title_unique UNIQUE (created_by_user_id, title)
);

CREATE TRIGGER set_recipes_updated_at
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

CREATE TABLE ingredients (
  id serial PRIMARY KEY,
  name citext NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  status varchar(20) DEFAULT 'active' NOT NULL
    CONSTRAINT ingredients_status_check CHECK (status IN ('active', 'hidden')),
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_by_user_id integer REFERENCES users ON DELETE CASCADE
);

COMMENT ON COLUMN ingredients.created_by_user_id IS
  'NULL means global ingredient; user id means private user ingredient.';

CREATE INDEX ingredients_status_name_idx
  ON ingredients (status, name);

CREATE UNIQUE INDEX ingredients_global_name_unique
  ON ingredients (name)
  WHERE created_by_user_id IS NULL;

CREATE UNIQUE INDEX ingredients_user_name_unique
  ON ingredients (created_by_user_id, name)
  WHERE created_by_user_id IS NOT NULL;

CREATE INDEX ingredients_user_status_name_idx
  ON ingredients (created_by_user_id, status, name);

CREATE TRIGGER set_ingredients_updated_at
BEFORE UPDATE ON ingredients
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

CREATE TABLE recipe_ingredients (
  recipe_id integer NOT NULL REFERENCES recipes ON DELETE CASCADE,
  ingredient_id integer REFERENCES ingredients ON DELETE SET NULL,
  quantity_value varchar(50),
  quantity_unit varchar(50),
  preparation_note varchar(100),
  sort_order integer DEFAULT 1 NOT NULL,
  display_name varchar(255) NOT NULL,
  id serial PRIMARY KEY,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX recipe_ingredients_recipe_sort_order_idx
  ON recipe_ingredients (recipe_id, sort_order);

CREATE TRIGGER set_recipe_ingredients_updated_at
BEFORE UPDATE ON recipe_ingredients
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

CREATE TABLE library_recipes (
  library_id integer NOT NULL REFERENCES libraries ON DELETE CASCADE,
  recipe_id integer NOT NULL REFERENCES recipes ON DELETE CASCADE,
  added_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  notes text,
  PRIMARY KEY (library_id, recipe_id)
);

CREATE TABLE recipe_steps (
  id serial PRIMARY KEY,
  recipe_id integer NOT NULL REFERENCES recipes ON DELETE CASCADE,
  sort_order integer DEFAULT 1 NOT NULL
    CONSTRAINT recipe_steps_sort_order_positive CHECK (sort_order > 0),
  instruction text NOT NULL
    CONSTRAINT recipe_steps_instruction_not_blank CHECK (length(btrim(instruction)) > 0),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX recipe_steps_recipe_sort_order_idx
  ON recipe_steps (recipe_id, sort_order);

CREATE TRIGGER set_recipe_steps_updated_at
BEFORE UPDATE ON recipe_steps
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

CREATE TABLE cook_sessions (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users ON DELETE CASCADE,
  recipe_id integer NOT NULL REFERENCES recipes ON DELETE CASCADE,
  status varchar(20) DEFAULT 'active' NOT NULL
    CONSTRAINT cook_sessions_status_check CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  completed_at timestamp with time zone
);

CREATE UNIQUE INDEX cook_sessions_one_active_per_recipe_idx
  ON cook_sessions (user_id, recipe_id)
  WHERE status = 'active';

CREATE INDEX cook_sessions_user_status_idx
  ON cook_sessions (user_id, status);

CREATE TRIGGER set_cook_sessions_updated_at
BEFORE UPDATE ON cook_sessions
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

CREATE TABLE cook_session_items (
  id serial PRIMARY KEY,
  cook_session_id integer NOT NULL REFERENCES cook_sessions ON DELETE CASCADE,
  recipe_ingredient_id integer REFERENCES recipe_ingredients ON DELETE SET NULL,
  display_name varchar(255) NOT NULL,
  quantity_value varchar(50),
  quantity_unit varchar(50),
  sort_order integer DEFAULT 1 NOT NULL
    CONSTRAINT cook_session_items_sort_order_positive CHECK (sort_order > 0),
  status varchar(20)
    CONSTRAINT cook_session_items_status_check CHECK (status IN ('unknown', 'have', 'need')),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX cook_session_items_session_sort_order_idx
  ON cook_session_items (cook_session_id, sort_order);

CREATE INDEX cook_session_items_session_status_idx
  ON cook_session_items (cook_session_id, status);

CREATE TRIGGER set_cook_session_items_updated_at
BEFORE UPDATE ON cook_session_items
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

CREATE TABLE user_sessions (
  sid varchar NOT NULL PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);

CREATE INDEX user_sessions_expire_idx
  ON user_sessions (expire);

CREATE TABLE password_reset_tokens (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX password_reset_tokens_token_hash_idx
  ON password_reset_tokens (token_hash);

CREATE INDEX password_reset_tokens_user_id_idx
  ON password_reset_tokens (user_id);

CREATE INDEX password_reset_tokens_expires_at_idx
  ON password_reset_tokens (expires_at);

-- Down Migration
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS cook_session_items;
DROP TABLE IF EXISTS cook_sessions;
DROP TABLE IF EXISTS recipe_steps;
DROP TABLE IF EXISTS library_recipes;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS libraries;
DROP TABLE IF EXISTS users;
DROP FUNCTION IF EXISTS set_updated_at();
DROP EXTENSION IF EXISTS citext;
