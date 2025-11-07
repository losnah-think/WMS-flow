'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import FeatureList from '@/components/FeatureList';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function FeaturesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ko';
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 고정 헤더 */}
      <header className="sticky top-0 bg-white shadow-md z-50">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <Link href={`/${locale}`}>
                <h1 className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                  FULGO WMS
                </h1>
              </Link>
              <nav className="flex gap-6 text-sm">
                <Link 
                  href={`/${locale}`}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors whitespace-nowrap"
                >
                  {t('nav.flow')}
                </Link>
                <Link 
                  href={`/${locale}/features`}
                  className="px-4 py-2 text-blue-600 bg-blue-50 rounded font-semibold whitespace-nowrap"
                >
                  {t('nav.features')}
                </Link>
                <Link 
                  href={`/${locale}/glossary`}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors whitespace-nowrap"
                >
                  {t('nav.glossary')}
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600 hidden lg:block whitespace-nowrap">{t('common.subtitle')}</p>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 - 가로 100% 사용 */}
      <div className="w-full px-6 py-6">
        <FeatureList />
      </div>
    </div>
  );
}
