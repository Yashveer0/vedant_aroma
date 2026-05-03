const AUTH_COOKIE_NAME = 'authToken';
const LEGACY_COOKIE_NAME = 'accessToken';
const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

const secureFlag = () =>
  typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? '; Secure'
    : '';

export const setClientAuthCookie = (accessToken: string) => {
  if (typeof document === 'undefined') return;

  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(
    accessToken
  )}; Path=/; SameSite=Lax; Max-Age=${ONE_WEEK_IN_SECONDS}${secureFlag()}`;
};

export const clearClientAuthCookies = () => {
  if (typeof document === 'undefined') return;

  [AUTH_COOKIE_NAME, LEGACY_COOKIE_NAME].forEach((cookieName) => {
    document.cookie = `${cookieName}=; Path=/; SameSite=Lax; Max-Age=0${secureFlag()}`;
    document.cookie = `${cookieName}=; Path=/; Max-Age=0`;
  });
};
