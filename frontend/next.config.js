const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.ssense.com' },
      { protocol: 'https', hostname: 'img.ssensemedia.com' },
      { protocol: 'https', hostname: '**.farfetch-contents.com' },
      { protocol: 'https', hostname: '**.farfetch.net' },
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