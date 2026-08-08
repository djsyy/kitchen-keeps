import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  query,
  getClient,
  hashPassword,
  comparePasswords,
  uploadRecipeImage,
  destroyRecipeImage,
  uploadLibraryCover,
  destroyLibraryCover,
  sendPasswordResetEmail,
} = vi.hoisted(() => ({
  query: vi.fn(),
  getClient: vi.fn(),
  hashPassword: vi.fn(),
  comparePasswords: vi.fn(),
  uploadRecipeImage: vi.fn(),
  destroyRecipeImage: vi.fn(),
  uploadLibraryCover: vi.fn(),
  destroyLibraryCover: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock('../config/db.js', () => ({ query, getClient }));
vi.mock('../utils/password.js', () => ({ hashPassword, comparePasswords }));
vi.mock('../config/cloudinary.js', () => ({
  uploadRecipeImage,
  destroyRecipeImage,
  uploadLibraryCover,
  destroyLibraryCover,
}));
vi.mock('../services/emailService.js', () => ({ sendPasswordResetEmail }));

const { createApp } = await import('../app.js');

const client = {
  query: vi.fn(),
  release: vi.fn(),
};

const createTestApp = (userId = 1) =>
  createApp({
    sessionMiddleware: (req, _res, next) => {
      if (userId) {
        req.session = { userId };
      }

      next();
    },
  });

const deletedUser = { id: 1, name: 'Test User', email: 'test@example.com' };

describe('auth lifecycle routes', () => {
  beforeEach(() => {
    query.mockReset();
    getClient.mockReset();
    hashPassword.mockReset();
    comparePasswords.mockReset();
    uploadRecipeImage.mockReset();
    destroyRecipeImage.mockReset();
    uploadLibraryCover.mockReset();
    destroyLibraryCover.mockReset();
    sendPasswordResetEmail.mockReset();
    client.query.mockReset();
    client.release.mockReset();
    getClient.mockResolvedValue(client);
    hashPassword.mockResolvedValue('new-password-hash');
    destroyRecipeImage.mockResolvedValue();
    destroyLibraryCover.mockResolvedValue();
  });

  it('requires both deletion confirmations before opening a transaction', async () => {
    const response = await request(createTestApp())
      .delete('/api/auth/me')
      .send({ currentPassword: 'correct-password', confirmation: 'delete' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'confirmation' }),
      ])
    );
    expect(getClient).not.toHaveBeenCalled();
  });

  it('does not delete account data when current-password verification fails', async () => {
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 1, password_hash: 'hash' }] })
      .mockResolvedValueOnce({});
    comparePasswords.mockResolvedValue(false);

    const response = await request(createTestApp())
      .delete('/api/auth/me')
      .send({ currentPassword: 'wrong-password', confirmation: 'DELETE' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Current password is incorrect');
    expect(client.query).not.toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM users'),
      expect.anything()
    );
    expect(destroyRecipeImage).not.toHaveBeenCalled();
    expect(client.release).toHaveBeenCalledOnce();
  });

  it('rolls back account deletion when managed image cleanup fails', async () => {
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 1, password_hash: 'hash' }] })
      .mockResolvedValueOnce({
        rows: [
          {
            public_id: 'kitchen-keeps/recipes/1/recipe-1',
            asset_type: 'recipe',
          },
        ],
      })
      .mockResolvedValueOnce({});
    comparePasswords.mockResolvedValue(true);
    destroyRecipeImage.mockRejectedValue(new Error('Cloudinary unavailable'));

    const response = await request(createTestApp())
      .delete('/api/auth/me')
      .send({ currentPassword: 'correct-password', confirmation: 'DELETE' });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Unable to delete user');
    expect(client.query).not.toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM users'),
      expect.anything()
    );
  });

  it('removes managed assets, all sessions, and the account after reauthentication', async () => {
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 1, password_hash: 'hash' }] })
      .mockResolvedValueOnce({
        rows: [
          { public_id: 'recipe-image', asset_type: 'recipe' },
          { public_id: 'library-cover', asset_type: 'library' },
        ],
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [deletedUser] })
      .mockResolvedValueOnce({});
    comparePasswords.mockResolvedValue(true);

    const response = await request(createTestApp())
      .delete('/api/auth/me')
      .send({ currentPassword: 'correct-password', confirmation: 'DELETE' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Account deleted successfully');
    expect(destroyRecipeImage).toHaveBeenCalledWith('recipe-image');
    expect(destroyLibraryCover).toHaveBeenCalledWith('library-cover');
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining(
        "DELETE FROM user_sessions\n      WHERE sess ->> 'userId' = $1"
      ),
      ['1']
    );
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM users'),
      [1]
    );
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('sid=;')])
    );
  });

  it('revokes every session after an authenticated password update', async () => {
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 1, password_hash: 'hash' }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});
    comparePasswords.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const response = await request(createTestApp())
      .patch('/api/auth/password')
      .send({
        currentPassword: 'correct-password',
        newPassword: 'new-password',
        confirmNewPassword: 'new-password',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'Password updated. Please sign in again.'
    );
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining(
        "DELETE FROM user_sessions\n      WHERE sess ->> 'userId' = $1"
      ),
      ['1']
    );
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('sid=;')])
    );
  });

  it('revokes every session after a password reset', async () => {
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        rows: [{ id: 8, user_id: 1, password_hash: 'hash' }],
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});
    comparePasswords.mockResolvedValue(false);

    const response = await request(createTestApp(null))
      .post('/api/auth/reset-password')
      .send({
        token: 'a'.repeat(64),
        newPassword: 'new-password',
        confirmNewPassword: 'new-password',
      });

    expect(response.status).toBe(200);
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining(
        "DELETE FROM user_sessions\n      WHERE sess ->> 'userId' = $1"
      ),
      ['1']
    );
  });
});
