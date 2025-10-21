import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['ko', 'en', 'vi'];

export default getRequestConfig(async ({ locale }) => {
  if (!locale || !locales.includes(locale)) notFound();

  return {
    messages: (await import(`./src/messages/${locale}.json`)).default,
    locale: locale as string,
  };
});
