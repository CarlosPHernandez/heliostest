/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    domains: ['images.unsplash.com', 'lh3.googleusercontent.com'],
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
  // Disable static optimization for pages using useSearchParams
  experimental: {
    // This setting helps with the useSearchParams error during build
    // missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig 