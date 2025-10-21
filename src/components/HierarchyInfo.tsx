// src/components/HierarchyInfo.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Flow } from '@/models/types';

interface HierarchyInfoProps {
  flow: Flow;
  flowType: string;
  onClose: () => void;
}

export const HierarchyInfo: React.FC<HierarchyInfoProps> = ({ flow, flowType, onClose }) => {
  const t = useTranslations();

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-lg p-6 mb-6 border-l-4 border-red-500">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {t('hierarchyInfo.structureTitle')}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {t(`flows.${flowType}.hierarchy`)}
              </p>
            </div>
          </div>
          <p className="text-gray-700 mb-3">
            {t(`flows.${flowType}.description`)}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-white rounded-lg p-3 border-2 border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-red-700">{t('hierarchyInfo.layer1Title')}</span>
              </div>
              <p className="text-xs text-gray-600">{t('hierarchyInfo.layer1Desc')}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-orange-700">{t('hierarchyInfo.layer2Title')}</span>
              </div>
              <p className="text-xs text-gray-600">{t('hierarchyInfo.layer2Desc')}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-blue-700">{t('hierarchyInfo.layer3Title')}</span>
              </div>
              <p className="text-xs text-gray-600">{t('hierarchyInfo.layer3Desc')}</p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold ml-4"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
