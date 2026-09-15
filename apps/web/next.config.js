/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react', '@ai-employee/shared', '@ai-employee/rolepack', '@ai-employee/runtime', '@ai-employee/marketplace-billing'],
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        path: false,
        stream: false,
        'node:crypto': false,
        'node:fs': false,
        'node:path': false,
        'node:stream': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
