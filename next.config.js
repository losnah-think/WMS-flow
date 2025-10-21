/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')(
  () => require.resolve('./src/i18n/request.ts')
);

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          destination: '/ko',
        },
      ],
    };
  },
  experimental: {
    appDir: true,
  },
};

module.exports = withNextIntl(nextConfig);
