import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../services/emailService.js', () => ({
  sendPasswordResetEmail: vi.fn(),
}));
vi.mock('../../config/cloudinary.js', () => ({
  destroyLibraryCover: vi.fn(),
  destroyRecipeImage: vi.fn(),
  uploadLibraryCover: vi.fn(),
  uploadRecipeImage: vi.fn(),
}));
import {
  addPantryItem,
  createAuthenticatedApp,
  createCookSession,
  createIngredient,
  createLibrary,
  createRecipe,
  createRecipeIngredient,
  createRecipeStep,
  createUnauthenticatedApp,
  createUser,
} from './fixtures.js';

describe('real PostgreSQL authorization boundaries', () => {
  it('requires a session for protected resources', async () => {
    const app = createUnauthenticatedApp();

    for (const path of ['/api/recipes', '/api/libraries', '/api/pantry']) {
      const response = await request(app).get(path);
      expect(response.status).toBe(401);
    }
  });

  it('does not let one user access another user’s data', async () => {
    const alice = await createUser({
      name: 'Alice',
      email: 'alice@example.test',
    });
    const bob = await createUser({ name: 'Bob', email: 'bob@example.test' });
    const bobRecipe = await createRecipe({
      userId: bob.id,
      title: 'Bob recipe',
    });
    const bobIngredient = await createIngredient({
      name: 'Bob ingredient',
      userId: bob.id,
    });
    const bobRecipeIngredient = await createRecipeIngredient({
      recipeId: bobRecipe.id,
      ingredientId: bobIngredient.id,
    });
    const bobStep = await createRecipeStep({ recipeId: bobRecipe.id });
    const bobLibrary = await createLibrary({
      userId: bob.id,
      name: 'Bob library',
    });
    const bobCookSession = await createCookSession({
      userId: bob.id,
      recipeId: bobRecipe.id,
    });
    await addPantryItem({ userId: bob.id, ingredientId: bobIngredient.id });

    const app = createAuthenticatedApp(alice.id);
    const checks = [
      request(app).get(`/api/recipes/${bobRecipe.id}`),
      request(app)
        .patch(`/api/recipes/${bobRecipe.id}`)
        .send({ title: 'Taken' }),
      request(app).get(`/api/recipes/${bobRecipe.id}/ingredients`),
      request(app)
        .patch(
          `/api/recipes/${bobRecipe.id}/ingredients/${bobRecipeIngredient.id}`
        )
        .send({ display_name: 'Taken ingredient' }),
      request(app).get(`/api/recipes/${bobRecipe.id}/steps`),
      request(app)
        .patch(`/api/recipes/${bobRecipe.id}/steps/${bobStep.id}`)
        .send({ instruction: 'Taken step' }),
      request(app).get(`/api/libraries/${bobLibrary.id}`),
      request(app)
        .post(`/api/libraries/${bobLibrary.id}/recipes`)
        .send({ recipe_id: bobRecipe.id }),
      request(app).get(`/api/ingredients/${bobIngredient.id}`),
      request(app)
        .patch(`/api/ingredients/${bobIngredient.id}`)
        .send({ name: 'Taken ingredient' }),
      request(app).delete(`/api/pantry/${bobIngredient.id}`),
      request(app).get(`/api/cook-sessions/${bobCookSession.id}`),
      request(app).patch(`/api/cook-sessions/${bobCookSession.id}/cancel`),
    ];

    const responses = await Promise.all(checks);
    for (const response of responses) {
      expect(response.status).toBe(404);
    }

    const dashboardResponse = await request(app).get('/api/dashboard');
    expect(dashboardResponse.status).toBe(200);
    expect(dashboardResponse.body.data.metrics).toMatchObject({
      recipe_count: 0,
      library_count: 0,
      pantry_count: 0,
    });
    expect(dashboardResponse.body.data.recipes).toEqual([]);
    expect(dashboardResponse.body.data.libraries).toEqual([]);
    expect(dashboardResponse.body.data.activeCookSession).toBeNull();
  });
});
