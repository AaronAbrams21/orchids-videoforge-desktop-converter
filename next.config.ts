import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  distDir: 'out',
  // Disable Turbopack (Webpack is needed for @ffmpeg/ffmpeg dynamic imports)
  experimental: {
  },

  // Set static export output directory
  output: 'export',  // This replaces next export entirely!

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    unoptimized: true,  // Required for static export (no image optimization server)
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  transpilePackages: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

export default nextConfig;