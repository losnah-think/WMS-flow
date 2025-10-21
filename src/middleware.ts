import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ko', 'en', 'vi'],
  defaultLocale: 'ko',
  localePrefix: 'as-needed',
});

export const config = {
  matcher: [
    // Match all paths except static files, APIs, and Vercel internals
    '/((?!_next/static|_next/image|api|favicon.ico|robots.txt|sitemap.xml|__nextjs).*)',
  ],
};
