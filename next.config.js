/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')(
  () => require.resolve('./src/i18n/request.ts')
);

const nextConfig = {
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
};

module.exports = withNextIntl(nextConfig);
