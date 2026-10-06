const DEV_FALLBACK_SECRET = 'dev-secret-change-in-production';

/**
 * Single source of truth for the JWT signing secret.
 *
 * Outside production a well-known fallback keeps local setup frictionless.
 * In production a missing secret must stop the app at startup: silently
 * falling back would let anyone who has read this file forge valid tokens.
 */
export function getJwtSecret(): string {
  const secret = process.env['JWT_SECRET'];
  if (secret) {
    return secret;
  }

  if (process.env['NODE_ENV'] === 'production') {
    throw new Error('JWT_SECRET must be set when NODE_ENV is "production"');
  }

  return DEV_FALLBACK_SECRET;
}
