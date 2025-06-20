
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configuration for Turbopack (used with `next dev --turbopack`)
  experimental: {
    turbo: {
      resolveAlias: {
        // This is to handle the 'canvas' module import by Konva when using Turbopack
        // It tells Turbopack to use './empty.js' (an empty file in the project root)
        // instead of trying to resolve the 'canvas' npm package.
        canvas: './empty.js', 
      },
    },
  },
  // Configuration for Webpack (used with `next build` and `next dev` without --turbopack)
  webpack: (config, { isServer }) => {
    // This tells Webpack to treat 'canvas' as an external module.
    // For client-side bundles, this prevents Webpack from trying to bundle it.
    // For server-side, it would expect 'canvas' to be provided externally.
    // Since Konva components are dynamically imported with ssr:false,
    // Konva's server-side code paths that might use 'canvas' are not executed.
    if (!config.externals) {
      config.externals = [];
    }
    config.externals.push({ canvas: 'canvas' });
    
    return config;
  },
};

export default nextConfig;
