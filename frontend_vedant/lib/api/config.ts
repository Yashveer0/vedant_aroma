const API_PREFIX = '/api/v1';

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const normalizeRelativeApiBaseUrl = (baseUrl?: string) => {
  const trimmedBaseUrl = baseUrl?.trim();

  if (!trimmedBaseUrl || !trimmedBaseUrl.startsWith('/')) {
    return undefined;
  }

  return stripTrailingSlash(trimmedBaseUrl);
};

const configuredApiBaseUrl = normalizeRelativeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL
);

export const API_ORIGIN = '';
export const API_BASE_URL = configuredApiBaseUrl || API_PREFIX;
export const BLOGS_API_BASE_URL = `${API_BASE_URL}/blogs`;
export const USERS_API_BASE_URL = `${API_BASE_URL}/users`;
