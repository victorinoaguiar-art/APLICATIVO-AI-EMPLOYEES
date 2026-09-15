/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react', '@ai-employee/shared', '@ai-employee/rolepack', '@ai-employee/runtime', '@ai-employee/marketplace-billing'],
  reactStrictMode: true,

  webpack: (config, { isServer, webpack }) => {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      })
    );
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        path: false,
        stream: false,
        sqlite: false,
        'node:sqlite': false,
        child_process: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
