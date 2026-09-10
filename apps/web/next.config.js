/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react', '@ai-employee/shared', '@ai-employee/rolepack'],
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        path: false,
        stream: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
