// src/components/StepDetails.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Flow } from '@/models/types';

interface StepDetailsProps {
  flow: Flow;
  activeStep: number;
  onStepClick: (stepIndex: number) => void;
}

export const StepDetails: React.FC<StepDetailsProps> = ({ flow, activeStep, onStepClick }) => {
  const t = useTranslations();

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4 sticky top-0 bg-white pb-2">
        {t('stepDetails.title')}
      </h2>
      <div className="space-y-3 overflow-y-auto">
        {flow.steps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => onStepClick(idx)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer ${
              activeStep === idx 
                ? 'bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-400 ring-offset-1' 
                : activeStep > idx
                ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                : 'bg-white border-gray-100 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${
                activeStep === idx
                  ? 'bg-blue-500 text-white'
                  : activeStep > idx
                  ? 'bg-gray-400 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-gray-900 break-words">
                    {step.label}
                  </h3>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-gray-400">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
                <div className="space-y-1 mt-1">
                  <div className="text-xs text-gray-500">
                    {flow.actors.find(a => a.id === step.from)?.name} 
                    <span className="text-gray-400 mx-1">→</span>
                    {flow.actors.find(a => a.id === step.to)?.name}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
                      {step.actor}
                    </span>
                    {step.term && (
                      <span className="text-xs text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                        {step.term}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 mt-1 break-words leading-snug line-clamp-2">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
