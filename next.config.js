const nextTranslate = require('next-translate-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  webpack: (config, { isServer, webpack }) => {
    return config;
  }
}

module.exports = nextTranslate(nextConfig);
