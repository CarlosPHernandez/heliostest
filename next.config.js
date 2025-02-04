/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  env: {
    ENVIRONMENT: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV || 'development',
  },
  // Enable more detailed logging in development
  logging: process.env.NODE_ENV === 'development' ? {
    fetches: {
      fullUrl: true,
    },
  } : undefined,
  // Temporarily disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Temporarily disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 