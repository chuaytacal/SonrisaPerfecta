
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
        canvas: './empty.js',
      },
    },
  },
  // Configuration for Webpack (used with `next build` and `next dev` without --turbopack)
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: 'canvas' }]; // required to make Konva & react-konva work
    return config;
  },
};

export default nextConfig;
