'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { features, categoryInfo, FeatureCategory, Priority } from '@/models/featureData';

export default function FeatureList() {
  const t = useTranslations();
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 필터링된 기능 목록
  const filteredFeatures = useMemo(() => {
    return features.filter(feature => {
      const categoryMatch = selectedCategory === 'all' || feature.category === selectedCategory;
      const priorityMatch = selectedPriority === 'all' || feature.priority === selectedPriority;
      
      // i18n에서 데이터 가져오기
      const featureName = t(`features.${feature.id}-name`);
      const featureDesc = t(`features.${feature.id}-desc`);
      
      const searchMatch = searchQuery === '' || 
        feature.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        featureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        featureDesc.toLowerCase().includes(searchQuery.toLowerCase());
      
      return categoryMatch && priorityMatch && searchMatch;
    });
  }, [selectedCategory, selectedPriority, searchQuery, t]);

  // 우선순위 아이콘
  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return '⭐⭐⭐';
      case 'medium':
        return '⭐⭐';
      case 'low':
        return '⭐';
    }
  };

  // 카테고리 색상
  const getCategoryColor = (category: FeatureCategory) => {
    const color = categoryInfo[category].color;
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
      red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    };
    return colorMap[color];
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{t('features.title')}</h1>
        <p className="text-blue-100">{t('features.subtitle')}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="bg-white/20 px-3 py-1 rounded">
            {t('features.totalCount')}: <span className="font-bold">{features.length}</span>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded">
            {t('features.filteredCount')}: <span className="font-bold">{filteredFeatures.length}</span>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 검색 */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('features.filter.search')}
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('features.filter.searchPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 분류 필터 */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('features.filter.category')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as FeatureCategory | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('features.filter.allCategories')}</option>
              {Object.entries(categoryInfo).map(([key, info]) => (
                <option key={key} value={key}>
                  {t(`features.categories.${key}`)} ({info.count})
                </option>
              ))}
            </select>
          </div>

          {/* 중요도 필터 */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('features.filter.priority')}
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as Priority | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('features.filter.allPriorities')}</option>
              <option value="high">⭐⭐⭐ {t('features.priority.high')}</option>
              <option value="medium">⭐⭐ {t('features.priority.medium')}</option>
              <option value="low">⭐ {t('features.priority.low')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 카테고리 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {Object.entries(categoryInfo).map(([key, info]) => {
          const colors = getCategoryColor(key as FeatureCategory);
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as FeatureCategory)}
              className={`${colors.bg} ${colors.border} border-2 rounded-lg p-3 transition-all hover:shadow-md ${
                selectedCategory === key ? 'ring-2 ring-offset-2 ring-blue-500' : ''
              }`}
            >
              <div className={`text-lg font-bold ${colors.text}`}>{info.count}</div>
              <div className="text-xs font-semibold text-gray-700">{t(`features.categories.${key}`)}</div>
            </button>
          );
        })}
      </div>

      {/* 기능 목록 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-200 sticky top-0">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase whitespace-nowrap w-16">
                  {t('features.table.id')}
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase whitespace-nowrap w-24">
                  {t('features.table.name')}
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase whitespace-nowrap w-32">
                  {t('features.table.description')}
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase whitespace-nowrap w-20">
                  {t('features.table.category')}
                </th>
                <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase whitespace-nowrap w-16">
                  {t('features.table.priority')}
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase whitespace-nowrap flex-1">
                  {t('features.table.input')}
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase whitespace-nowrap flex-1">
                  {t('features.table.output')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFeatures.map((feature) => {
                const colors = getCategoryColor(feature.category);
                return (
                  <tr key={feature.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-xs font-mono font-semibold text-gray-900 whitespace-nowrap">
                      {feature.id}
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold text-gray-900 whitespace-nowrap">
                      {t(`features.${feature.id}-name`)}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-700">
                      {t(`features.${feature.id}-desc`)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold ${colors.bg} ${colors.text} rounded whitespace-nowrap`}>
                        {t(`features.categories.${feature.category}`)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-xs whitespace-nowrap">
                      {getPriorityIcon(feature.priority)}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600 max-h-16 overflow-y-auto">
                      {t(`features.${feature.id}-input`)}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600 max-h-16 overflow-y-auto">
                      {t(`features.${feature.id}-output`)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredFeatures.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {t('features.noResults')}
          </div>
        )}
      </div>

      {/* 중요도 설명 */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">{t('features.priorityGuide.title')}</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="font-semibold">⭐⭐⭐</span>
            <span>{t('features.priorityGuide.high')}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold">⭐⭐</span>
            <span>{t('features.priorityGuide.medium')}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold">⭐</span>
            <span>{t('features.priorityGuide.low')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
