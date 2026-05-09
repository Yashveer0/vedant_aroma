import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

const uploadRemotePattern = (() => {
  try {
    const url = new URL(apiProxyOrigin);
    return {
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      port: url.port,
      pathname: '/uploads/**',
    };
  } catch {
    return undefined;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: __dirname,
  images: {
    unoptimized: true,
    remotePatterns: uploadRemotePattern ? [uploadRemotePattern] : [],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiProxyOrigin}/api/v1/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiProxyOrigin}/uploads/:path*`,
      },
    ];
  },
}

export default nextConfig
