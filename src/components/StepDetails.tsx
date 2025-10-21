// src/components/StepDetails.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Flow } from '@/models/types';

interface StepDetailsProps {
  flow: Flow;
  activeStep: number;
}

export const StepDetails: React.FC<StepDetailsProps> = ({ flow, activeStep }) => {
  const t = useTranslations();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">단계별 상세 설명</h2>
      <div className="space-y-3">
        {flow.steps.map((step, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-lg border-2 transition-all ${
              activeStep === idx 
                ? 'bg-blue-50 border-blue-400 shadow-md' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                activeStep === idx
                  ? 'bg-blue-500 text-white'
                  : activeStep > idx
                  ? 'bg-gray-400 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-gray-900">{step.label}</h3>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {flow.actors.find(a => a.id === step.from)?.name} 
                    {' → '}
                    {flow.actors.find(a => a.id === step.to)?.name}
                  </span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded font-semibold">
                    {step.actor}
                  </span>
                  {step.term && (
                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                      {step.term}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{step.desc}</p>
                <p className="text-sm text-gray-700">{step.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
