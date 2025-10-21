'use client';

import React from 'react';
import { Flow } from '@/models/types';

interface MiniTimelineProps {
  flow: Flow;
  activeStep: number;
  onStepClick: (stepIndex: number) => void;
}

export const MiniTimeline: React.FC<MiniTimelineProps> = ({
  flow,
  activeStep,
  onStepClick,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
      <h3 className="text-xs font-bold text-gray-600 uppercase mb-3">프로세스 타임라인</h3>
      <div className="space-y-2">
        {flow.steps.map((step, idx) => {
          const isActive = activeStep === idx;
          const isPassed = activeStep > idx;

          return (
            <button
              key={idx}
              onClick={() => onStepClick(idx)}
              className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left ${
                isActive
                  ? 'bg-blue-100 border-l-4 border-blue-500'
                  : isPassed
                  ? 'bg-gray-50 border-l-4 border-gray-400'
                  : 'bg-white border-l-4 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {/* 미니 원형 인디케이터 */}
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : isPassed
                    ? 'bg-gray-400 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {idx + 1}
              </div>

              {/* 텍스트 */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {step.label}
                </p>
              </div>

              {/* 진행 상태 아이콘 */}
              {isActive && (
                <div className="flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-blue-500 animate-pulse"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <circle cx="10" cy="10" r="8" opacity="0.3" />
                    <circle cx="10" cy="10" r="5" />
                  </svg>
                </div>
              )}
              {isPassed && (
                <div className="flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
