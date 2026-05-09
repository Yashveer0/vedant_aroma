const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const configuredUploadsBaseUrl = stripTrailingSlash(
  process.env.NEXT_PUBLIC_UPLOADS_BASE_URL ||
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
);

const isAbsoluteMediaUrl = (value: string) =>
  /^(https?:)?\/\//i.test(value) ||
  value.startsWith("data:") ||
  value.startsWith("blob:");

export const resolveMediaUrl = (url?: string | null, fallback = "/placeholder.svg") => {
  const trimmedUrl = String(url || "").trim();
  if (!trimmedUrl) return fallback;

  const normalizedUrl = trimmedUrl.replace(/\\/g, "/");
  if (isAbsoluteMediaUrl(normalizedUrl)) return normalizedUrl;

  const path = normalizedUrl.startsWith("/") ? normalizedUrl : `/${normalizedUrl}`;
  if (path.startsWith("/uploads/") && configuredUploadsBaseUrl) {
    return `${configuredUploadsBaseUrl}${path}`;
  }

  return path;
};

export const resolveMediaUrls = (urls?: string[] | null) =>
  (urls || []).map((url) => resolveMediaUrl(url)).filter(Boolean);
