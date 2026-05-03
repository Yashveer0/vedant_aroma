const FALLBACK_API_ORIGIN = 'http://72.60.101.227:8000';

const LEGACY_API_ORIGINS = new Set([
  'https://api.vedantgurukul.com',
  'http://api.vedantgurukul.com',
]);

const normalizeApiOrigin = (origin?: string) => {
  const trimmedOrigin = origin?.trim().replace(/\/+$/, '');

  if (!trimmedOrigin || LEGACY_API_ORIGINS.has(trimmedOrigin)) {
    return FALLBACK_API_ORIGIN;
  }

  return trimmedOrigin;
};

export const API_ORIGIN = normalizeApiOrigin(process.env.NEXT_PUBLIC_API_URL);
export const API_BASE_URL = `${API_ORIGIN}/api/v1`;
export const BLOGS_API_BASE_URL = `${API_BASE_URL}/blogs`;
export const USERS_API_BASE_URL = `${API_BASE_URL}/users`;
