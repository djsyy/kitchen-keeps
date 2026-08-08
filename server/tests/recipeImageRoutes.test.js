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

const createImage = (format, width = 1, height = 1) =>
  sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .toFormat(format)
    .toBuffer();

let validImages;

const ownedRecipe = {
  id: 10,
  image_url: 'https://res.cloudinary.com/demo/image/upload/old.jpg',
  image_public_id: 'kitchen-keeps/recipes/1/old-image',
};

const updatedRecipe = {
  id: 10,
  title: 'Lemon pasta',
  description: null,
  image_url: 'https://res.cloudinary.com/demo/image/upload/new.jpg',
  created_by_user_id: 1,
  prep_time_minutes: null,
  cook_time_minutes: null,
  servings: null,
  created_at: '2026-08-04T00:00:00.000Z',
  updated_at: '2026-08-04T00:00:00.000Z',
};

describe('recipe image routes', () => {
  beforeAll(async () => {
    validImages = {
      jpeg: await createImage('jpeg'),
      png: await createImage('png'),
      webp: await createImage('webp'),
    };
  });

  beforeEach(() => {
    query.mockReset();
    uploadRecipeImage.mockReset();
    destroyRecipeImage.mockReset();
    uploadRecipeImage.mockResolvedValue({
      secure_url: updatedRecipe.image_url,
      public_id: 'kitchen-keeps/recipes/1/new-image',
    });
    destroyRecipeImage.mockResolvedValue();
  });

  it('requires authentication before accepting an upload', async () => {
    const response = await request(createTestApp(null))
      .post('/api/recipes/10/image')
      .attach('image', validImages.jpeg, {
        filename: 'recipe.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(401);
    expect(query).not.toHaveBeenCalled();
    expect(uploadRecipeImage).not.toHaveBeenCalled();
  });

  it('requires an image file and accepts only one image at a time', async () => {
    const missingImageResponse = await request(createTestApp()).post(
      '/api/recipes/10/image'
    );

    expect(missingImageResponse.status).toBe(400);
    expect(missingImageResponse.body.message).toBe('Recipe image is required');
    expect(query).not.toHaveBeenCalled();

    const multipleImagesResponse = await request(createTestApp())
      .post('/api/recipes/10/image')
      .attach('image', validImages.jpeg, {
        filename: 'first.jpg',
        contentType: 'image/jpeg',
      })
      .attach('image', validImages.jpeg, {
        filename: 'second.jpg',
        contentType: 'image/jpeg',
      });

    expect(multipleImagesResponse.status).toBe(400);
    expect(multipleImagesResponse.body.message).toBe(
      'Upload one recipe image at a time'
    );
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects spoofed and unsupported image content before looking up a recipe', async () => {
    const response = await request(createTestApp())
      .post('/api/recipes/10/image')
      .attach('image', Buffer.from('not an image'), {
        filename: 'recipe.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Recipe images must be JPG, PNG, or WebP files'
    );
    expect(query).not.toHaveBeenCalled();
    expect(uploadRecipeImage).not.toHaveBeenCalled();

    const svgResponse = await request(createTestApp())
      .post('/api/recipes/10/image')
      .attach(
        'image',
        Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" />'
        ),
        {
          filename: 'recipe.png',
          contentType: 'image/png',
        }
      );

    expect(svgResponse.status).toBe(400);
    expect(svgResponse.body.message).toBe(
      'Recipe images must be JPG, PNG, or WebP files'
    );
    expect(query).not.toHaveBeenCalled();
    expect(uploadRecipeImage).not.toHaveBeenCalled();
  });

  it('rejects truncated image data before looking up a recipe', async () => {
    const response = await request(createTestApp())
      .post('/api/recipes/10/image')
      .attach('image', Buffer.from([0xff, 0xd8, 0xff, 0xe0]), {
        filename: 'truncated.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Recipe images must be JPG, PNG, or WebP files'
    );
    expect(query).not.toHaveBeenCalled();
    expect(uploadRecipeImage).not.toHaveBeenCalled();
  });

  it.each(['jpeg', 'png', 'webp'])(
    'accepts valid %s image content when the multipart MIME type is inaccurate',
    async (format) => {
      query
        .mockResolvedValueOnce({ rows: [ownedRecipe] })
        .mockResolvedValueOnce({ rows: [updatedRecipe] });

      const response = await request(createTestApp())
        .post('/api/recipes/10/image')
        .attach('image', validImages[format], {
          filename: `recipe.${format}`,
          contentType: 'application/octet-stream',
        });

      expect(response.status).toBe(200);
      expect(uploadRecipeImage).toHaveBeenCalledWith(
        expect.objectContaining({ buffer: validImages[format] }),
        { recipeId: 10, userId: 1 }
      );
    }
  );

  it('rejects images that exceed the dimension limit before looking up a recipe', async () => {
    const oversizedImage = await createImage('png', 8001, 1);

    const response = await request(createTestApp())
      .post('/api/recipes/10/image')
      .attach('image', oversizedImage, {
        filename: 'wide.png',
        contentType: 'image/png',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Recipe images must be 8,000 pixels or less on each side and no more than 20 megapixels'
    );
    expect(query).not.toHaveBeenCalled();
    expect(uploadRecipeImage).not.toHaveBeenCalled();
  });

  it('rejects images larger than 5 MB', async () => {
    const response = await request(createTestApp())
      .post('/api/recipes/10/image')
      .attach('image', Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: 'large.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Recipe images must be 5 MB or smaller');
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects another user’s recipe without uploading anything', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const response = await request(createTestApp())
      .post('/api/recipes/99/image')
      .attach('image', validImages.jpeg, {
        filename: 'recipe.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(404);
    expect(uploadRecipeImage).not.toHaveBeenCalled();
  });

  it('replaces an image, persists managed data, and removes the prior asset', async () => {
    query
      .mockResolvedValueOnce({ rows: [ownedRecipe] })
      .mockResolvedValueOnce({ rows: [updatedRecipe] });

    const response = await request(createTestApp())
      .post('/api/recipes/10/image')
      .attach('image', validImages.jpeg, {
        filename: 'recipe.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.recipe.image_url).toBe(updatedRecipe.image_url);
    expect(response.body.data.recipe.image_public_id).toBeUndefined();
    expect(uploadRecipeImage).toHaveBeenCalledWith(
      expect.objectContaining({ mimetype: 'image/jpeg' }),
      { recipeId: 10, userId: 1 }
    );
    expect(query.mock.calls[1][1]).toEqual([
      updatedRecipe.image_url,
      'kitchen-keeps/recipes/1/new-image',
      '10',
      1,
    ]);
    expect(destroyRecipeImage).toHaveBeenCalledWith(
      ownedRecipe.image_public_id
    );
  });

  it('cleans up a newly uploaded asset when saving it fails', async () => {
    query
      .mockResolvedValueOnce({ rows: [ownedRecipe] })
      .mockRejectedValueOnce(new Error('Database unavailable'));

    const response = await request(createTestApp())
      .post('/api/recipes/10/image')
      .attach('image', validImages.jpeg, {
        filename: 'recipe.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Unable to upload recipe image');
    expect(destroyRecipeImage).toHaveBeenCalledWith(
      'kitchen-keeps/recipes/1/new-image'
    );
  });

  it('keeps existing image data unchanged when Cloudinary upload fails', async () => {
    query.mockResolvedValueOnce({ rows: [ownedRecipe] });
    uploadRecipeImage.mockRejectedValueOnce(
      new Error('Cloudinary unavailable')
    );

    const response = await request(createTestApp())
      .post('/api/recipes/10/image')
      .attach('image', validImages.jpeg, {
        filename: 'recipe.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(500);
    expect(query).toHaveBeenCalledTimes(1);
    expect(destroyRecipeImage).not.toHaveBeenCalled();
  });

  it('removes managed images but skips Cloudinary cleanup for legacy URLs', async () => {
    query.mockResolvedValueOnce({ rows: [ownedRecipe] }).mockResolvedValueOnce({
      rows: [{ ...updatedRecipe, image_url: null }],
    });

    const managedResponse = await request(createTestApp()).delete(
      '/api/recipes/10/image'
    );

    expect(managedResponse.status).toBe(200);
    expect(destroyRecipeImage).toHaveBeenCalledWith(
      ownedRecipe.image_public_id
    );

    query.mockReset();
    destroyRecipeImage.mockReset();
    query
      .mockResolvedValueOnce({
        rows: [
          {
            ...ownedRecipe,
            image_public_id: null,
            image_url: 'https://example.com/legacy-image.jpg',
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ ...updatedRecipe, image_url: null }],
      });

    const legacyResponse = await request(createTestApp()).delete(
      '/api/recipes/10/image'
    );

    expect(legacyResponse.status).toBe(200);
    expect(destroyRecipeImage).not.toHaveBeenCalled();
  });

  it('removes a managed image when its recipe is deleted', async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          ...ownedRecipe,
          title: 'Lemon pasta',
          description: null,
          created_by_user_id: 1,
          prep_time_minutes: null,
          cook_time_minutes: null,
          servings: null,
          created_at: '2026-08-04T00:00:00.000Z',
          updated_at: '2026-08-04T00:00:00.000Z',
        },
      ],
    });

    const response = await request(createTestApp()).delete('/api/recipes/10');

    expect(response.status).toBe(200);
    expect(destroyRecipeImage).toHaveBeenCalledWith(
      ownedRecipe.image_public_id
    );
  });

  it('keeps a successful image removal successful when cleanup fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    query.mockResolvedValueOnce({ rows: [ownedRecipe] }).mockResolvedValueOnce({
      rows: [{ ...updatedRecipe, image_url: null }],
    });
    destroyRecipeImage.mockRejectedValueOnce(new Error('Cleanup failed'));

    const response = await request(createTestApp()).delete(
      '/api/recipes/10/image'
    );

    expect(response.status).toBe(200);
    expect(errorSpy).toHaveBeenCalledWith(
      'Unable to remove recipe image from Cloudinary',
      { message: 'Cleanup failed' }
    );
    errorSpy.mockRestore();
  });
});
