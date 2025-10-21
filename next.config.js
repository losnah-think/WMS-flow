/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')(() =>
  require.resolve('./src/i18n/request.ts')
);

const nextConfig = {};

module.exports = withNextIntl(nextConfig);
