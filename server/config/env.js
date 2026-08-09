import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({
  path: fileURLToPath(
    new URL(
      process.env.NODE_ENV === 'test' ? '../../.env.test' : '../../.env',
      import.meta.url
    )
  ),
});

if (process.env.NODE_ENV === 'production') {
  const requiredVariables = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'CLIENT_URL',
    'CORS_ORIGIN',
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'TRUST_PROXY',
  ];
  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missingVariables.join(', ')}`
    );
  }

  if (process.env.SESSION_SECRET.length < 32) {
    throw new Error(
      'SESSION_SECRET must be at least 32 characters in production'
    );
  }

  if (!/^[1-9]\d*$/.test(process.env.TRUST_PROXY)) {
    throw new Error(
      'TRUST_PROXY must be a positive proxy-hop count in production'
    );
  }
}
