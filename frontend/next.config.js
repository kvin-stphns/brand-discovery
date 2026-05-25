const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Work around a third-party ox/wagmi type incompatibility during Next production builds.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.ssense.com' },
      { protocol: 'https', hostname: 'img.ssensemedia.com' },
      { protocol: 'https', hostname: '**.farfetch-contents.com' },
      { protocol: 'https', hostname: '**.farfetch.net' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      encoding: false,
      'pino-pretty': false,
    }
    return config
  },
}

module.exports = nextConfig
