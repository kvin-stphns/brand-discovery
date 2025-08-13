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
}

module.exports = nextConfig