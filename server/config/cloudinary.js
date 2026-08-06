import crypto from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';

const hasCloudinaryConfiguration = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

export const logCloudinaryConfigurationStatus = () => {
  if (!hasCloudinaryConfiguration()) {
    console.warn(
      'Cloudinary recipe image uploads are unavailable: required configuration is missing'
    );
  }
};

const configureCloudinary = () => {
  if (!hasCloudinaryConfiguration()) {
    throw new Error('Cloudinary is not configured');
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

export const uploadRecipeImage = (file, { recipeId, userId }) => {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `kitchen-keeps/recipes/${userId}`,
        public_id: `recipe-${recipeId}-${crypto.randomUUID()}`,
        resource_type: 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};

export const destroyRecipeImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  configureCloudinary();

  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  });
};
