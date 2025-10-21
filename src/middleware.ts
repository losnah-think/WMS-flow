import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ko', 'en', 'vi'],
  defaultLocale: 'ko',
});

export const config = {
  matcher: ['/', '/(ko|en|vi)/:path*'],
};
