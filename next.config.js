/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Railway deployment
  output: 'standalone',

  // Image optimization settings
  images: {
    unoptimized: true,
  },

  // Environment variables available at build time
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

module.exports = nextConfig;
