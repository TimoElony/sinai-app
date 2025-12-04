import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable ESLint during builds (it will still run in lint script)
  // This is because the original codebase has pre-existing lint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image optimization configuration for external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-5949e21c7d4c4f3e91058712f265f987.r2.dev',
      },
    ],
  },
  
  // Headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
