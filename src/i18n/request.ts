import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  try {
    return {
      messages: locale
        ? (await import(`../messages/${locale}.json`)).default
        : {},
      locale: locale || 'ko',
    };
  } catch (error) {
    return {
      messages: {},
      locale: locale || 'ko',
    };
  }
});
