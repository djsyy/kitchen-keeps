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

const privateIngredient = {
  id: 24,
  name: 'Family sauce',
  status: 'active',
  created_by_user_id: 1,
};

describe('ingredient management routes', () => {
  beforeEach(() => {
    query.mockReset();
  });

  it('requires authentication before listing managed ingredients', async () => {
    const response = await request(createTestApp(null)).get(
      '/api/ingredients/manage'
    );

    expect(response.status).toBe(401);
    expect(query).not.toHaveBeenCalled();
  });

  it('lists only the current user’s private ingredients by status', async () => {
    query.mockResolvedValueOnce({ rows: [privateIngredient] });

    const response = await request(createTestApp()).get(
      '/api/ingredients/manage?status=hidden'
    );

    expect(response.status).toBe(200);
    expect(response.body.data.ingredients).toEqual([privateIngredient]);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('created_by_user_id = $1 AND status = $2'),
      [1, 'hidden']
    );
  });

  it('rejects an invalid management status', async () => {
    const response = await request(createTestApp()).get(
      '/api/ingredients/manage?status=all'
    );

    expect(response.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  it('renames a private ingredient and updates matching recipe labels', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 24, name: 'Family sauce' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ ...privateIngredient, name: 'Family chili sauce' }],
      });

    const response = await request(createTestApp())
      .patch('/api/ingredients/24')
      .send({ name: 'Family chili sauce' });

    expect(response.status).toBe(200);
    expect(response.body.data.ingredient.name).toBe('Family chili sauce');
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('updated_recipe_ingredients AS'),
      ['Family chili sauce', '24', 1]
    );
    expect(query.mock.calls.at(-1)[0]).toContain(
      'recipe_ingredients.display_name = current_ingredient.name'
    );
    expect(query.mock.calls.at(-1)[0]).toContain('RETURNING ingredients.id');
  });

  it('archives a private ingredient and removes its pantry item', async () => {
    query.mockResolvedValueOnce({
      rows: [{ ...privateIngredient, status: 'hidden' }],
    });

    const response = await request(createTestApp()).delete(
      '/api/ingredients/24'
    );

    expect(response.status).toBe(200);
    expect(response.body.data.ingredient.status).toBe('hidden');
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('removed_pantry_item AS'),
      ['24', 1]
    );
    expect(query.mock.calls[0][0]).toContain('DELETE FROM pantry_items');
  });

  it('does not archive another user’s private ingredient', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const response = await request(createTestApp()).delete(
      '/api/ingredients/99'
    );

    expect(response.status).toBe(404);
    expect(query).toHaveBeenCalledWith(expect.any(String), ['99', 1]);
  });

  it('restores a hidden private ingredient without re-adding it to Pantry', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 24, name: 'Family sauce' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [privateIngredient] });

    const response = await request(createTestApp()).patch(
      '/api/ingredients/24/reactivate'
    );

    expect(response.status).toBe(200);
    expect(response.body.data.ingredient.status).toBe('active');
    expect(query.mock.calls.some(([sql]) => sql.includes('pantry_items'))).toBe(
      false
    );
  });
});
