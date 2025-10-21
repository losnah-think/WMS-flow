import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ko', 'en', 'vi'],
  defaultLocale: 'ko',
  localePrefix: 'as-needed',
});

export const config = {
  matcher: [
    // Match all request paths except static files and APIs
    '/((?!_next|_vercel|api|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
