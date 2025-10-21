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
  const progress = ((activeStep + 1) / flow.steps.length) * 100;

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm">
          <span className="font-bold text-blue-600">현재 단계:</span>{' '}
          <span className="font-semibold text-gray-800">
            {currentStep.label}
          </span>
          <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
            담당: {currentStep.actor}
          </span>
          {currentStep.term && (
            <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
              용어: {currentStep.term}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 font-medium">
          {activeStep + 1} / {flow.steps.length}
        </div>
      </div>
      <div className="text-sm text-gray-700 mb-3 p-3 bg-white rounded border border-blue-200">
        {currentStep.detail}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
