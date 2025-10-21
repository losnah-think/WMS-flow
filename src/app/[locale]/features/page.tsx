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
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}`}>
                <h1 className="text-xl md:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                  FULGO WMS
                </h1>
              </Link>
              <nav className="flex gap-3 text-sm">
                <Link 
                  href={`/${locale}`}
                  className="px-3 py-1 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  {t('nav.flow')}
                </Link>
                <Link 
                  href={`/${locale}/features`}
                  className="px-3 py-1 text-blue-600 bg-blue-50 rounded font-semibold"
                >
                  {t('nav.features')}
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">{t('common.subtitle')}</p>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-6">
        <FeatureList />
      </div>
    </div>
  );
}
