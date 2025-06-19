
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
  experimental: {
    turbo: {
      resolveAlias: {
        // This is to handle the 'canvas' module import by Konva when using Turbopack
        canvas: './empty.js', 
      },
    },
  },
  // The webpack alias for 'canvas' is typically for Webpack-based builds.
  // Since Turbopack is being used (as per package.json script),
  // the experimental.turbo.resolveAlias approach is preferred.
  // Keeping the Webpack config commented out or removed if Turbopack is the primary target.
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.alias['canvas'] = false;
  //   }
  //   return config;
  // },
};

export default nextConfig;
