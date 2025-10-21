// src/components/ProgressStatus.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Flow } from '@/models/types';

interface ProgressStatusProps {
  flow: Flow;
  activeStep: number;
}

export const ProgressStatus: React.FC<ProgressStatusProps> = ({ flow, activeStep }) => {
  const t = useTranslations();

  if (activeStep < 0) return null;

  const currentStep = flow.steps[activeStep];
  const previousStep = activeStep > 0 ? flow.steps[activeStep - 1] : null;
  const nextStep = activeStep < flow.steps.length - 1 ? flow.steps[activeStep + 1] : null;
  const progress = ((activeStep + 1) / flow.steps.length) * 100;

  return (
    <div className="mt-6 space-y-4">
      {/* 현재 단계 */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              {activeStep + 1}
            </div>
            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase">{t('status.inProgress')}</p>
              <p className="text-sm font-bold text-gray-900">{currentStep.label}</p>
            </div>
          </div>
          <div className="text-sm text-blue-700 font-semibold bg-blue-200 px-3 py-1 rounded-full">
            {activeStep + 1} / {flow.steps.length}
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="space-y-2 mb-3">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-blue-200 text-blue-800 px-2.5 py-1 rounded-full font-semibold">
              {t('components.actor')}: {currentStep.actor}
            </span>
            {currentStep.term && (
              <span className="text-xs bg-purple-200 text-purple-800 px-2.5 py-1 rounded-full">
                {t('components.term')}: {currentStep.term}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed bg-white bg-opacity-70 p-2.5 rounded border border-blue-200">
            {currentStep.detail}
          </p>
        </div>

        {/* 프로그레스 바 */}
        <div className="space-y-1">
          <div className="w-full bg-blue-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-blue-600 font-medium text-right">
            {Math.round(progress)}{t('components.progress')}
          </p>
        </div>
      </div>

      {/* 이전/다음 단계 미리보기 */}
      <div className="grid grid-cols-2 gap-3">
        {previousStep ? (
          <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:shadow-md transition">
            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">{t('components.previousStep')}</p>
            <p className="text-xs font-semibold text-gray-800 truncate">{previousStep.label}</p>
            <p className="text-xs text-gray-600 truncate">{previousStep.actor}</p>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-xs text-gray-400 text-center">{t('status.start')}</p>
          </div>
        )}

        {nextStep ? (
          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200 hover:shadow-md transition">
            <p className="text-xs text-blue-600 font-semibold uppercase mb-1">{t('components.nextStep')}</p>
            <p className="text-xs font-semibold text-gray-800 truncate">{nextStep.label}</p>
            <p className="text-xs text-gray-600 truncate">{nextStep.actor}</p>
          </div>
        ) : (
          <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
            <p className="text-xs text-green-600 font-semibold text-center">{t('components.completed')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
