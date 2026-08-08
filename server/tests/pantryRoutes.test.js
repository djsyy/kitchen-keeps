import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock('../config/db.js', () => ({ query }));
vi.mock('../config/cloudinary.js', () => ({
  uploadRecipeImage: vi.fn(),
  destroyRecipeImage: vi.fn(),
  uploadLibraryCover: vi.fn(),
  destroyLibraryCover: vi.fn(),
}));
vi.mock('../services/emailService.js', () => ({
  sendPasswordResetEmail: vi.fn(),
}));

const { createApp } = await import('../app.js');

const createTestApp = (userId = 1) =>
  createApp({
    sessionMiddleware: (req, _res, next) => {
      if (userId) {
        req.session = { userId };
      }

      next();
    },
  });

const pantryItem = {
  id: 8,
  ingredient_id: 4,
  name: 'Eggs',
  created_by_user_id: null,
  created_at: '2026-08-08T00:00:00.000Z',
};

describe('pantry routes', () => {
  beforeEach(() => {
    query.mockReset();
  });

  it('requires authentication before returning pantry data', async () => {
    const response = await request(createTestApp(null)).get('/api/pantry');

    expect(response.status).toBe(401);
    expect(query).not.toHaveBeenCalled();
  });

  it('returns the current user’s pantry and verified recommendations', async () => {
    const recommendation = {
      id: 12,
      title: 'Egg fried rice',
      description: null,
      image_url: null,
      prep_time_minutes: 5,
      cook_time_minutes: 10,
      servings: 2,
      created_at: '2026-08-08T00:00:00.000Z',
      updated_at: '2026-08-08T00:00:00.000Z',
      ingredient_count: 3,
    };
    query
      .mockResolvedValueOnce({ rows: [pantryItem] })
      .mockResolvedValueOnce({ rows: [recommendation] })
      .mockResolvedValueOnce({ rows: [{ unlinked_recipe_count: 1 }] });

    const response = await request(createTestApp()).get('/api/pantry');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      pantryItems: [pantryItem],
      recommendations: [recommendation],
      recommendationEligibility: { unlinkedRecipeCount: 1 },
    });
    expect(query).toHaveBeenCalledTimes(3);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('pantry_items.user_id = $1'),
      [1]
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('HAVING COUNT(recipe_ingredients.id)'),
      [1]
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('COUNT(DISTINCT recipes.id)::integer'),
      [1]
    );
  });

  it('rejects another user’s ingredient before creating a pantry item', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const response = await request(createTestApp())
      .post('/api/pantry')
      .send({ ingredient_id: 99 });

    expect(response.status).toBe(404);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('adds a visible ingredient to the current user’s pantry', async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ id: 4, name: 'Eggs', created_by_user_id: null }],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 8, ingredient_id: 4, created_at: pantryItem.created_at }],
      });

    const response = await request(createTestApp())
      .post('/api/pantry')
      .send({ ingredient_id: 4 });

    expect(response.status).toBe(201);
    expect(response.body.data.pantryItem).toEqual(pantryItem);
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining(
        'ON CONFLICT (user_id, ingredient_id) DO NOTHING'
      ),
      [1, 4]
    );
  });

  it('rejects duplicate pantry additions', async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ id: 4, name: 'Eggs', created_by_user_id: null }],
      })
      .mockResolvedValueOnce({ rows: [] });

    const response = await request(createTestApp())
      .post('/api/pantry')
      .send({ ingredient_id: 4 });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Ingredient is already in your pantry');
  });

  it('creates a private ingredient and pantry item in one database statement', async () => {
    const privatePantryItem = {
      ...pantryItem,
      ingredient_id: 25,
      name: 'Family sauce',
      created_by_user_id: 1,
    };
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [privatePantryItem] });

    const response = await request(createTestApp())
      .post('/api/pantry/private-ingredient')
      .send({ name: 'Family sauce' });

    expect(response.status).toBe(201);
    expect(response.body.data.pantryItem).toEqual(privatePantryItem);
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('WITH created_ingredient AS'),
      ['Family sauce', 1]
    );
  });

  it('only removes pantry entries owned by the current user', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const response = await request(createTestApp()).delete('/api/pantry/99');

    expect(response.status).toBe(404);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE user_id = $1 AND ingredient_id = $2'),
      [1, '99']
    );
  });
});
