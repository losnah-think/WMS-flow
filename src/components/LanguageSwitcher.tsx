'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import React from 'react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    const path = pathname.replace(`/${locale}`, '');
    router.push(`/${newLocale}${path || '/'}`);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleLanguageChange('ko')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          locale === 'ko'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        한국어
      </button>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          locale === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        English
      </button>
      <button
        onClick={() => handleLanguageChange('vi')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          locale === 'vi'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        Tiếng Việt
      </button>
    </div>
  );
}
