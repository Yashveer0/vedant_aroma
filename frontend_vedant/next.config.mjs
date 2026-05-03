const DEFAULT_API_PROXY_ORIGIN =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'http://72.60.101.227:8000';

const getOriginFromApiBaseUrl = (baseUrl) => {
  try {
    return baseUrl?.startsWith('http') ? new URL(baseUrl).origin : undefined;
  } catch {
    return undefined;
  }
};

const apiProxyOrigin = (
  process.env.API_PROXY_ORIGIN ||
  process.env.NEXT_PUBLIC_API_URL ||
  getOriginFromApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL) ||
  DEFAULT_API_PROXY_ORIGIN
).replace(/\/+$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiProxyOrigin}/api/v1/:path*`,
      },
    ];
  },
}

export default nextConfig
