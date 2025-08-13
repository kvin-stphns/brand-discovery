const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn-images.farfetch-contents.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'img.ssensemedia.com' },
      { protocol: 'https', hostname: 'assets.ssense.com' },
    ],
  },
}

module.exports = nextConfig