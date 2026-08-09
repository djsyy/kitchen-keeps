-- Up Migration
ALTER TABLE recipes
ADD CONSTRAINT recipes_prep_time_minutes_range_check
CHECK (prep_time_minutes IS NULL OR prep_time_minutes BETWEEN 1 AND 1440);

ALTER TABLE recipes
ADD CONSTRAINT recipes_cook_time_minutes_range_check
CHECK (cook_time_minutes IS NULL OR cook_time_minutes BETWEEN 1 AND 1440);

ALTER TABLE recipes
ADD CONSTRAINT recipes_servings_range_check
CHECK (servings IS NULL OR servings BETWEEN 1 AND 100);

ALTER TABLE recipe_ingredients
ADD CONSTRAINT recipe_ingredients_sort_order_positive_check
CHECK (sort_order > 0);

-- Down Migration
ALTER TABLE recipe_ingredients
DROP CONSTRAINT recipe_ingredients_sort_order_positive_check;

ALTER TABLE recipes
DROP CONSTRAINT recipes_servings_range_check;

ALTER TABLE recipes
DROP CONSTRAINT recipes_cook_time_minutes_range_check;

ALTER TABLE recipes
DROP CONSTRAINT recipes_prep_time_minutes_range_check;
