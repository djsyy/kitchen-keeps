import request from 'supertest';
import sharp from 'sharp';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  query,
  uploadRecipeImage,
  destroyRecipeImage,
  uploadLibraryCover,
  destroyLibraryCover,
} = vi.hoisted(() => ({
  query: vi.fn(),
  uploadRecipeImage: vi.fn(),
  destroyRecipeImage: vi.fn(),
  uploadLibraryCover: vi.fn(),
  destroyLibraryCover: vi.fn(),
}));

vi.mock('../config/db.js', () => ({ query }));
vi.mock('../config/cloudinary.js', () => ({
  uploadRecipeImage,
  destroyRecipeImage,
  uploadLibraryCover,
  destroyLibraryCover,
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

const createImage = () =>
  sharp({
    create: {
      width: 1,
      height: 1,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .jpeg()
    .toBuffer();

let validImage;

const ownedLibrary = {
  id: 10,
  cover_image_url: 'https://res.cloudinary.com/demo/image/upload/old.jpg',
  cover_image_public_id: 'kitchen-keeps/libraries/1/old-cover',
};

const updatedLibrary = {
  id: 10,
  user_id: 1,
  name: 'Quick lunches',
  description: null,
  icon_key: 'folder',
  color_key: 'primary',
  cover_image_url: 'https://res.cloudinary.com/demo/image/upload/new.jpg',
  created_at: '2026-08-07T00:00:00.000Z',
};

describe('library cover routes', () => {
  beforeAll(async () => {
    validImage = await createImage();
  });

  beforeEach(() => {
    query.mockReset();
    uploadRecipeImage.mockReset();
    destroyRecipeImage.mockReset();
    uploadLibraryCover.mockReset();
    destroyLibraryCover.mockReset();
    uploadLibraryCover.mockResolvedValue({
      secure_url: updatedLibrary.cover_image_url,
      public_id: 'kitchen-keeps/libraries/1/new-cover',
    });
    destroyLibraryCover.mockResolvedValue();
  });

  it('requires authentication before accepting a cover upload', async () => {
    const response = await request(createTestApp(null))
      .post('/api/libraries/10/cover')
      .attach('image', validImage, {
        filename: 'cover.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(401);
    expect(query).not.toHaveBeenCalled();
    expect(uploadLibraryCover).not.toHaveBeenCalled();
  });

  it('rejects spoofed file content before looking up a library', async () => {
    const response = await request(createTestApp())
      .post('/api/libraries/10/cover')
      .attach('image', Buffer.from('not an image'), {
        filename: 'cover.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Library covers must be JPG, PNG, or WebP files'
    );
    expect(query).not.toHaveBeenCalled();
    expect(uploadLibraryCover).not.toHaveBeenCalled();
  });

  it('rejects another user’s library without uploading anything', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const response = await request(createTestApp())
      .post('/api/libraries/99/cover')
      .attach('image', validImage, {
        filename: 'cover.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(404);
    expect(uploadLibraryCover).not.toHaveBeenCalled();
  });

  it('replaces a cover, keeps its public ID private, and cleans up the prior asset', async () => {
    query
      .mockResolvedValueOnce({ rows: [ownedLibrary] })
      .mockResolvedValueOnce({ rows: [updatedLibrary] });

    const response = await request(createTestApp())
      .post('/api/libraries/10/cover')
      .attach('image', validImage, {
        filename: 'cover.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.library.cover_image_url).toBe(
      updatedLibrary.cover_image_url
    );
    expect(response.body.data.library.cover_image_public_id).toBeUndefined();
    expect(uploadLibraryCover).toHaveBeenCalledWith(
      expect.objectContaining({ buffer: validImage }),
      { libraryId: 10, userId: 1 }
    );
    expect(destroyLibraryCover).toHaveBeenCalledWith(
      ownedLibrary.cover_image_public_id
    );
  });

  it('cleans up a newly uploaded cover when saving it fails', async () => {
    query
      .mockResolvedValueOnce({ rows: [ownedLibrary] })
      .mockRejectedValueOnce(new Error('Database unavailable'));

    const response = await request(createTestApp())
      .post('/api/libraries/10/cover')
      .attach('image', validImage, {
        filename: 'cover.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Unable to upload library cover');
    expect(destroyLibraryCover).toHaveBeenCalledWith(
      'kitchen-keeps/libraries/1/new-cover'
    );
  });

  it('removes managed covers but skips cleanup for legacy URLs', async () => {
    query
      .mockResolvedValueOnce({ rows: [ownedLibrary] })
      .mockResolvedValueOnce({
        rows: [{ ...updatedLibrary, cover_image_url: null }],
      });

    const managedResponse = await request(createTestApp()).delete(
      '/api/libraries/10/cover'
    );

    expect(managedResponse.status).toBe(200);
    expect(destroyLibraryCover).toHaveBeenCalledWith(
      ownedLibrary.cover_image_public_id
    );

    query.mockReset();
    destroyLibraryCover.mockReset();
    query
      .mockResolvedValueOnce({
        rows: [
          {
            ...ownedLibrary,
            cover_image_url: 'https://example.com/legacy-cover.jpg',
            cover_image_public_id: null,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ ...updatedLibrary, cover_image_url: null }],
      });

    const legacyResponse = await request(createTestApp()).delete(
      '/api/libraries/10/cover'
    );

    expect(legacyResponse.status).toBe(200);
    expect(destroyLibraryCover).not.toHaveBeenCalled();
  });

  it('removes a managed cover when its library is deleted', async () => {
    query.mockResolvedValueOnce({
      rows: [{ ...ownedLibrary, ...updatedLibrary }],
    });

    const response = await request(createTestApp()).delete('/api/libraries/10');

    expect(response.status).toBe(200);
    expect(response.body.data.library.cover_image_public_id).toBeUndefined();
    expect(destroyLibraryCover).toHaveBeenCalledWith(
      ownedLibrary.cover_image_public_id
    );
  });
});
