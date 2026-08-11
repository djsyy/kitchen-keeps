import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

const {
  query,
  getClient,
  uploadRecipeImage,
  destroyRecipeImage,
  uploadLibraryCover,
  destroyLibraryCover,
  sendPasswordResetEmail,
} = vi.hoisted(() => ({
  query: vi.fn(),
  getClient: vi.fn(),
  uploadRecipeImage: vi.fn(),
  destroyRecipeImage: vi.fn(),
  uploadLibraryCover: vi.fn(),
  destroyLibraryCover: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock('../config/db.js', () => ({ query, getClient }));
vi.mock('../config/cloudinary.js', () => ({
  uploadRecipeImage,
  destroyRecipeImage,
  uploadLibraryCover,
  destroyLibraryCover,
}));
vi.mock('../services/emailService.js', () => ({ sendPasswordResetEmail }));

const { createApp } = await import('../app.js');
const { createRateLimiter } = await import('../middleware/rateLimiters.js');
const { requestLogger } = await import('../utils/logger.js');

const originalNodeEnv = process.env.NODE_ENV;
const originalCorsOrigin = process.env.CORS_ORIGIN;

const createTestApp = () =>
  createApp({
    sessionMiddleware: (_req, _res, next) => next(),
  });

afterEach(() => {
  if (originalNodeEnv === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = originalNodeEnv;
  }

  if (originalCorsOrigin === undefined) {
    delete process.env.CORS_ORIGIN;
  } else {
    process.env.CORS_ORIGIN = originalCorsOrigin;
  }

  vi.restoreAllMocks();
});

describe('security middleware', () => {
  it('returns a minimal public health response', async () => {
    const response = await request(createTestApp()).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('adds security and request-id headers to JSON API 404 responses', async () => {
    const response = await request(createTestApp()).get('/api/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      message: 'API route not found',
      errors: [],
    });
    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('allows development requests without an Origin header for local API tools', async () => {
    process.env.NODE_ENV = 'development';
    process.env.CORS_ORIGIN = 'http://localhost:5173';

    const response = await request(createTestApp())
      .post('/api/auth/login')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Please check your information and try again.'
    );
  });

  it('rejects missing and untrusted production write origins with a safe 403', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGIN = 'https://app.kitchen-keeps.example';

    const missingOriginResponse = await request(createTestApp())
      .post('/api/auth/login')
      .send({});
    const rejectedOriginResponse = await request(createTestApp())
      .post('/api/auth/login')
      .set('Origin', 'https://attacker.example')
      .send({});

    expect(missingOriginResponse.status).toBe(403);
    expect(rejectedOriginResponse.status).toBe(403);
    expect(missingOriginResponse.body.message).toBe(
      'Request origin is not allowed'
    );
    expect(rejectedOriginResponse.body.message).toBe(
      'Request origin is not allowed'
    );
  });

  it('rejects oversized JSON before it reaches route validation', async () => {
    const response = await request(createTestApp())
      .post('/api/auth/login')
      .send({ password: 'a'.repeat(101 * 1024) });

    expect(response.status).toBe(413);
    expect(response.body.message).toBe('Request body is too large');
  });

  it('returns a retry header and safe JSON after a rate limit is exceeded', async () => {
    const app = express();
    app.use(requestLogger);
    app.use(
      createRateLimiter({
        windowMs: 60_000,
        limit: 1,
        scope: 'test',
      })
    );
    app.get('/limited', (_req, res) => res.json({ ok: true }));

    const firstResponse = await request(app).get('/limited');
    const limitedResponse = await request(app).get('/limited');

    expect(firstResponse.status).toBe(200);
    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.headers['retry-after']).toMatch(/^\d+$/);
    expect(limitedResponse.body).toMatchObject({
      message: 'Too many requests. Please try again later.',
      errors: [],
    });
  });

  it('logs request paths without sensitive query parameters', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    await request(createTestApp()).get('/api/unknown-route?token=secret-value');

    const logOutput = infoSpy.mock.calls
      .map(([entry]) => String(entry))
      .join('\n');
    expect(logOutput).toContain('/api/unknown-route');
    expect(logOutput).not.toContain('secret-value');
  });
});
