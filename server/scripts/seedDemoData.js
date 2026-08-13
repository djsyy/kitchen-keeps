import pkg from 'pg';
import { hashPassword } from '../utils/password.js';
import { demoDatabaseName, demoDatabaseUrl } from './demoEnvironment.js';

const { Pool } = pkg;
const demoEmail = 'demo@kitchenkeeps.local';
const isDryRun = process.argv.includes('--dry-run');

const demoPassword = process.env.DEMO_USER_PASSWORD;

if (!demoPassword || demoPassword.length < 8) {
  throw new Error('DEMO_USER_PASSWORD must contain at least 8 characters.');
}

const libraries = [
  {
    name: 'Weeknight Favorites',
    description: 'Reliable dinners for busy evenings.',
    iconKey: 'utensils',
    colorKey: 'primary',
  },
  {
    name: 'Fresh & Bright',
    description: 'Light, colorful meals with bold flavor.',
    iconKey: 'salad',
    colorKey: 'secondary',
  },
  {
    name: 'Comfort Cooking',
    description: 'Slow-down meals for a cozy night in.',
    iconKey: 'soup',
    colorKey: 'accent',
  },
];

const recipes = [
  {
    title: 'Lemon Garlic Parmesan Pasta',
    description: 'A bright, silky pasta for an easy weeknight dinner.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    library: 'Weeknight Favorites',
    ingredients: [
      ['Pasta', '8', 'oz'],
      ['Olive oil', '2', 'tbsp'],
      ['Garlic', '3', 'cloves'],
      ['Lemon', '1', null],
      ['Parmesan cheese', '1/2', 'cup'],
      ['Black pepper', null, null],
    ],
    steps: [
      'Cook the pasta in salted water until al dente, reserving a cup of pasta water.',
      'Warm the olive oil and garlic in a large skillet until fragrant.',
      'Toss in the pasta, lemon zest and juice, parmesan, and enough pasta water to make a glossy sauce.',
      'Finish with black pepper and extra parmesan.',
    ],
  },
  {
    title: 'Honey Soy Salmon Rice Bowls',
    description:
      'Sweet-savory salmon bowls with crisp vegetables and warm rice.',
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 2,
    library: 'Weeknight Favorites',
    ingredients: [
      ['Salmon', '2', 'fillets'],
      ['Rice', '1', 'cup'],
      ['Soy sauce', '3', 'tbsp'],
      ['Honey', '1', 'tbsp'],
      ['Ginger', '1', 'tsp'],
      ['Green onion', '2', null],
      ['Lime', '1', null],
      ['Cucumber', '1/2', null],
    ],
    steps: [
      'Cook the rice according to the package directions.',
      'Whisk soy sauce, honey, and grated ginger together.',
      'Brush the salmon with the sauce and roast until flaky.',
      'Build bowls with rice, salmon, cucumber, green onion, and lime.',
    ],
  },
  {
    title: 'One-Pan Tomato Chickpea Skillet',
    description: 'A fast pantry-friendly skillet with rich tomato flavor.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 4,
    library: 'Weeknight Favorites',
    ingredients: [
      ['Olive oil', '1', 'tbsp'],
      ['Yellow onion', '1', null],
      ['Garlic', '2', 'cloves'],
      ['Canned crushed tomatoes', '1', 'can'],
      ['Chickpeas', '1', 'can'],
      ['Spinach', '4', 'cups'],
      ['Red pepper flakes', '1/4', 'tsp'],
    ],
    steps: [
      'Soften the onion in olive oil, then add the garlic and red pepper flakes.',
      'Stir in tomatoes and chickpeas, then simmer until thickened.',
      'Fold in spinach until just wilted.',
      'Serve warm with crusty bread or rice.',
    ],
  },
  {
    title: 'Coconut Ginger Chicken Curry',
    description: 'Creamy coconut curry with tender chicken and spinach.',
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    servings: 4,
    library: 'Comfort Cooking',
    ingredients: [
      ['Chicken thighs', '1 1/2', 'lb'],
      ['Coconut milk', '1', 'can'],
      ['Yellow onion', '1', null],
      ['Garlic', '3', 'cloves'],
      ['Ginger', '1', 'tbsp'],
      ['Curry powder', '2', 'tsp'],
      ['Spinach', '3', 'cups'],
      ['Rice', '2', 'cups'],
    ],
    steps: [
      'Brown the chicken thighs and set them aside.',
      'Cook onion, garlic, ginger, and curry powder until fragrant.',
      'Add coconut milk and chicken, then simmer until the chicken is cooked through.',
      'Stir in spinach and serve over rice.',
    ],
  },
  {
    title: 'Crispy Chickpea & Feta Salad',
    description: 'A crunchy, fresh salad with warm spiced chickpeas.',
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    servings: 2,
    library: 'Fresh & Bright',
    ingredients: [
      ['Chickpeas', '1', 'can'],
      ['Olive oil', '1', 'tbsp'],
      ['Cucumber', '1', null],
      ['Feta cheese', '1/2', 'cup'],
      ['Lemon', '1', null],
      ['Cilantro', '1/4', 'cup'],
      ['Cumin', '1/2', 'tsp'],
    ],
    steps: [
      'Crisp the chickpeas in a skillet with olive oil and cumin.',
      'Chop the cucumber and cilantro while the chickpeas cook.',
      'Toss everything with feta, lemon juice, and a pinch of salt.',
      'Top with the warm chickpeas just before serving.',
    ],
  },
  {
    title: 'Creamy Mushroom Rice',
    description:
      'A comforting stovetop rice with savory mushrooms and parmesan.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 35,
    servings: 4,
    library: 'Comfort Cooking',
    ingredients: [
      ['Rice', '1 1/2', 'cups'],
      ['Mushroom', '8', 'oz'],
      ['Butter', '2', 'tbsp'],
      ['Yellow onion', '1/2', null],
      ['Garlic', '2', 'cloves'],
      ['Vegetable broth', '4', 'cups'],
      ['Parmesan cheese', '1/2', 'cup'],
    ],
    steps: [
      'Sauté the mushrooms in butter until deeply browned.',
      'Add onion and garlic, then stir in the rice.',
      'Add warm broth gradually, stirring often until the rice is tender.',
      'Fold in parmesan and serve with the mushrooms on top.',
    ],
  },
];

const pantryIngredientNames = [
  'Olive oil',
  'Garlic',
  'Lemon',
  'Parmesan cheese',
  'Pasta',
  'Rice',
  'Soy sauce',
  'Honey',
  'Ginger',
  'Eggs',
  'Coconut milk',
  'Chickpeas',
  'Spinach',
  'Cucumber',
  'Feta cheese',
  'Yellow onion',
  'Black pepper',
];

const privateIngredients = ["Grandma's chili crisp", 'Smoky garlic salt'];

const allGlobalIngredientNames = [
  ...new Set([
    ...recipes.flatMap((recipe) => recipe.ingredients.map(([name]) => name)),
    ...pantryIngredientNames,
  ]),
];

const getValueRows = (rowCount, valuesPerRow) =>
  Array.from(
    { length: rowCount },
    (_, rowIndex) =>
      `(${Array.from(
        { length: valuesPerRow },
        (_, valueIndex) => `$${rowIndex * valuesPerRow + valueIndex + 1}`
      ).join(', ')})`
  ).join(', ');

const getGlobalIngredients = async (client) => {
  const result = await client.query(
    `
      SELECT id, name
      FROM ingredients
      WHERE created_by_user_id IS NULL
        AND status = 'active'
        AND name = ANY($1::citext[])
    `,
    [allGlobalIngredientNames]
  );
  const ingredientsByName = new Map(
    result.rows.map((ingredient) => [ingredient.name, ingredient.id])
  );
  const missingNames = allGlobalIngredientNames.filter(
    (name) => !ingredientsByName.has(name)
  );

  if (missingNames.length > 0) {
    throw new Error(
      `Missing global ingredients: ${missingNames.join(', ')}. Run db:seed:ingredients first.`
    );
  }

  return ingredientsByName;
};

const insertRecipeIngredients = async (
  client,
  recipeId,
  ingredients,
  ingredientsByName
) => {
  const values = ingredients.flatMap(
    ([name, quantityValue, quantityUnit], index) => [
      recipeId,
      ingredientsByName.get(name),
      quantityValue,
      quantityUnit,
      index + 1,
      name,
    ]
  );
  const rows = ingredients.map(
    (_, index) =>
      `($${index * 6 + 1}, $${index * 6 + 2}, $${index * 6 + 3}, $${index * 6 + 4}, $${index * 6 + 5}, $${index * 6 + 6})`
  );
  const result = await client.query(
    `
      INSERT INTO recipe_ingredients (
        recipe_id, ingredient_id, quantity_value, quantity_unit, sort_order, display_name
      )
      VALUES ${rows.join(', ')}
      RETURNING id, display_name
    `,
    values
  );

  return new Map(
    result.rows.map((ingredient) => [ingredient.display_name, ingredient.id])
  );
};

const insertRecipeSteps = async (client, recipeId, steps) => {
  const values = steps.flatMap((instruction, index) => [
    recipeId,
    index + 1,
    instruction,
  ]);
  const rows = steps.map(
    (_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
  );

  await client.query(
    `
      INSERT INTO recipe_steps (recipe_id, sort_order, instruction)
      VALUES ${rows.join(', ')}
    `,
    values
  );
};

if (isDryRun) {
  console.log(
    `Validated demo fixture for ${demoDatabaseName}: ${libraries.length} libraries and ${recipes.length} recipes.`
  );
  process.exit(0);
}

const pool = new Pool({ connectionString: demoDatabaseUrl });
const client = await pool.connect();

try {
  const ingredientsByName = await getGlobalIngredients(client);
  const passwordHash = await hashPassword(demoPassword);

  const managedImageResult = await client.query(
    `
      SELECT image_public_id AS public_id
      FROM recipes
      WHERE created_by_user_id = (SELECT id FROM users WHERE email = $1)
        AND image_public_id IS NOT NULL
      UNION ALL
      SELECT cover_image_public_id AS public_id
      FROM libraries
      WHERE user_id = (SELECT id FROM users WHERE email = $1)
        AND cover_image_public_id IS NOT NULL
    `,
    [demoEmail]
  );

  if (managedImageResult.rowCount > 0) {
    throw new Error(
      'Remove the demo account’s managed recipe and library images through the UI before resetting its data.'
    );
  }

  await client.query('BEGIN');
  await client.query(
    `
      DELETE FROM recipes
      WHERE created_by_user_id = (SELECT id FROM users WHERE email = $1)
    `,
    [demoEmail]
  );
  await client.query('DELETE FROM users WHERE email = $1', [demoEmail]);

  const userResult = await client.query(
    `
      INSERT INTO users (name, email, password_hash)
      VALUES ('Demo Kitchen', $1, $2)
      RETURNING id
    `,
    [demoEmail, passwordHash]
  );
  const userId = userResult.rows[0].id;

  const libraryValues = libraries.flatMap((library) => [
    userId,
    library.name,
    library.description,
    library.iconKey,
    library.colorKey,
  ]);
  const libraryRows = libraries.map(
    (_, index) =>
      `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`
  );
  const libraryResult = await client.query(
    `
      INSERT INTO libraries (user_id, name, description, icon_key, color_key)
      VALUES ${libraryRows.join(', ')}
      RETURNING id, name
    `,
    libraryValues
  );
  const libraryIdsByName = new Map(
    libraryResult.rows.map((library) => [library.name, library.id])
  );

  const recipeIdsByName = new Map();
  const recipeIngredientIdsByRecipe = new Map();

  for (const recipe of recipes) {
    const recipeResult = await client.query(
      `
        INSERT INTO recipes (
          title, description, created_by_user_id, prep_time_minutes, cook_time_minutes, servings
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [
        recipe.title,
        recipe.description,
        userId,
        recipe.prepTimeMinutes,
        recipe.cookTimeMinutes,
        recipe.servings,
      ]
    );
    const recipeId = recipeResult.rows[0].id;
    const ingredientIdsByName = await insertRecipeIngredients(
      client,
      recipeId,
      recipe.ingredients,
      ingredientsByName
    );
    await insertRecipeSteps(client, recipeId, recipe.steps);
    await client.query(
      'INSERT INTO library_recipes (library_id, recipe_id) VALUES ($1, $2)',
      [libraryIdsByName.get(recipe.library), recipeId]
    );
    recipeIdsByName.set(recipe.title, recipeId);
    recipeIngredientIdsByRecipe.set(recipe.title, ingredientIdsByName);
  }

  const pantryValues = pantryIngredientNames.map((name) => [
    userId,
    ingredientsByName.get(name),
  ]);
  await client.query(
    `
      INSERT INTO pantry_items (user_id, ingredient_id)
      VALUES ${pantryValues
        .map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
        .join(', ')}
    `,
    pantryValues.flat()
  );

  const privateIngredientResult = await client.query(
    `
      INSERT INTO ingredients (name, created_by_user_id)
      VALUES ${getValueRows(privateIngredients.length, 2)}
      RETURNING id, name
    `,
    privateIngredients.flatMap((name) => [name, userId])
  );
  const chiliCrisp = privateIngredientResult.rows.find(
    (ingredient) => ingredient.name === "Grandma's chili crisp"
  );
  await client.query(
    'INSERT INTO pantry_items (user_id, ingredient_id) VALUES ($1, $2)',
    [userId, chiliCrisp.id]
  );

  const salmonRecipeId = recipeIdsByName.get('Honey Soy Salmon Rice Bowls');
  const sessionResult = await client.query(
    'INSERT INTO cook_sessions (user_id, recipe_id) VALUES ($1, $2) RETURNING id',
    [userId, salmonRecipeId]
  );
  const sessionId = sessionResult.rows[0].id;
  const salmonIngredientIds = recipeIngredientIdsByRecipe.get(
    'Honey Soy Salmon Rice Bowls'
  );
  const statusesByIngredientName = new Map([
    ['Rice', 'have'],
    ['Soy sauce', 'have'],
    ['Honey', 'have'],
    ['Ginger', 'have'],
    ['Lime', 'unknown'],
    ['Salmon', 'need'],
    ['Green onion', 'need'],
    ['Cucumber', 'need'],
  ]);
  const salmonRecipe = recipes.find(
    (recipe) => recipe.title === 'Honey Soy Salmon Rice Bowls'
  );

  for (const [name, quantityValue, quantityUnit] of salmonRecipe.ingredients) {
    await client.query(
      `
        INSERT INTO cook_session_items (
          cook_session_id, recipe_ingredient_id, display_name, quantity_value,
          quantity_unit, sort_order, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        sessionId,
        salmonIngredientIds.get(name),
        name,
        quantityValue,
        quantityUnit,
        salmonRecipe.ingredients.findIndex(
          ([ingredientName]) => ingredientName === name
        ) + 1,
        statusesByIngredientName.get(name),
      ]
    );
  }

  await client.query('COMMIT');
  console.log(
    `Reset ${demoEmail} with ${libraries.length} libraries, ${recipes.length} recipes, and ${pantryIngredientNames.length + 1} pantry items.`
  );
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
