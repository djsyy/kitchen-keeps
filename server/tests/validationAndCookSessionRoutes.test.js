import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  query,
  getClient,
  uploadRecipeImage,
  destroyRecipeImage,
  uploadLibraryCover,
  destroyLibraryCover,
  sendPasswordResetEmail,
  comparePasswords,
} = vi.hoisted(() => ({
  query: vi.fn(),
  getClient: vi.fn(),
  uploadRecipeImage: vi.fn(),
  destroyRecipeImage: vi.fn(),
  uploadLibraryCover: vi.fn(),
  destroyLibraryCover: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  comparePasswords: vi.fn(),
}));

vi.mock('../config/db.js', () => ({ query, getClient }));
vi.mock('../config/cloudinary.js', () => ({
  uploadRecipeImage,
  destroyRecipeImage,
  uploadLibraryCover,
  destroyLibraryCover,
}));
vi.mock('../services/emailService.js', () => ({ sendPasswordResetEmail }));
vi.mock('../utils/password.js', () => ({ comparePasswords }));

const { createApp } = await import('../app.js');

const client = {
  query: vi.fn(),
  release: vi.fn(),
};

const createTestApp = () =>
  createApp({
    sessionMiddleware: (req, _res, next) => {
      req.session = { userId: 1 };
      next();
    },
  });

describe('validation and cook-session completion routes', () => {
  beforeEach(() => {
    query.mockReset();
    getClient.mockReset();
    client.query.mockReset();
    client.release.mockReset();
    comparePasswords.mockReset();
    getClient.mockResolvedValue(client);
  });

  it('rejects new passwords shorter than eight characters before registration', async () => {
    const response = await request(createTestApp())
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
        confirmPassword: 'short',
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'password',
          message: 'Password must be at least 8 characters',
        }),
      ])
    );
    expect(query).not.toHaveBeenCalled();
  });

  it('preserves password whitespace during login validation', async () => {
    query.mockResolvedValue({ rows: [{ id: 1, password_hash: 'hash' }] });
    comparePasswords.mockResolvedValue(false);

    const response = await request(createTestApp())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: ' password ' });

    expect(response.status).toBe(401);
    expect(comparePasswords).toHaveBeenCalledWith(' password ', 'hash');
  });

  it('rejects oversized recipe values and database-overflowing IDs', async () => {
    const app = createTestApp();
    const recipeResponse = await request(app).post('/api/recipes').send({
      title: 'Dinner',
      prep_time_minutes: 1441,
      servings: 101,
    });
    const idResponse = await request(app).get('/api/recipes/2147483648');

    expect(recipeResponse.status).toBe(400);
    expect(recipeResponse.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'prep_time_minutes' }),
        expect.objectContaining({ field: 'servings' }),
      ])
    );
    expect(idResponse.status).toBe(400);
  });

  it('rejects ingredient values beyond their database column limits', async () => {
    const response = await request(createTestApp())
      .post('/api/recipes/1/ingredients')
      .send({
        display_name: 'Salt',
        quantity_value: '1'.repeat(51),
        preparation_note: 'a'.repeat(101),
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'quantity_value' }),
        expect.objectContaining({ field: 'preparation_note' }),
      ])
    );
    expect(getClient).not.toHaveBeenCalled();
  });

  it('rejects caller-supplied ingredient ordering', async () => {
    const response = await request(createTestApp())
      .post('/api/recipes/1/ingredients')
      .send({ display_name: 'Salt', sort_order: 1 });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'sort_order' })])
    );
  });

  it('appends a new ingredient while the owned recipe is locked', async () => {
    const recipeIngredient = {
      id: 7,
      recipe_id: 1,
      display_name: 'Salt',
      sort_order: 2,
    };
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rows: [{ next_sort_order: 2 }] })
      .mockResolvedValueOnce({ rows: [recipeIngredient] })
      .mockResolvedValueOnce({});

    const response = await request(createTestApp())
      .post('/api/recipes/1/ingredients')
      .send({ display_name: 'Salt' });

    expect(response.status).toBe(201);
    expect(response.body.data.recipeIngredient).toEqual(recipeIngredient);
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('FOR UPDATE'),
      ['1', 1]
    );
    expect(client.query).toHaveBeenCalledWith('COMMIT');
  });

  it('blocks completion when a prep-list ingredient is unchecked', async () => {
    query.mockResolvedValue({});
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 12 }] })
      .mockResolvedValueOnce({ rows: [{ unchecked_count: 1 }] })
      .mockResolvedValueOnce({});

    const response = await request(createTestApp()).patch(
      '/api/cook-sessions/12/complete'
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Mark every ingredient before finishing this prep list'
    );
    expect(client.query).not.toHaveBeenCalledWith(
      expect.stringContaining("SET status = 'completed'"),
      expect.anything()
    );
    expect(client.release).toHaveBeenCalledOnce();
  });

  it('completes a fully marked prep list in one transaction', async () => {
    const completedCookSession = { id: 12, status: 'completed' };
    query.mockResolvedValue({});
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 12 }] })
      .mockResolvedValueOnce({ rows: [{ unchecked_count: 0 }] })
      .mockResolvedValueOnce({ rows: [completedCookSession] })
      .mockResolvedValueOnce({});

    const response = await request(createTestApp()).patch(
      '/api/cook-sessions/12/complete'
    );

    expect(response.status).toBe(200);
    expect(response.body.data.cookSession).toEqual(completedCookSession);
    expect(client.query).toHaveBeenCalledWith('COMMIT');
    expect(client.release).toHaveBeenCalledOnce();
  });
});
