import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ko', 'en', 'vi'],
  defaultLocale: 'ko',
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!_next|api|favicon).*)'],
};
