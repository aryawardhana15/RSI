/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize build to reduce memory usage
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Reduce memory usage during build
  experimental: {
    optimizeCss: false,
  },
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Reduce memory usage
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };
    }
    // Fix for Windows file locking issues
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: /node_modules/,
    };
    return config;
  },
}

module.exports = nextConfig

