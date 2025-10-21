// src/components/FlowControls.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FlowType } from '@/models/types';

interface FlowControlsProps {
  flowType: FlowType;
  isPlaying: boolean;
  onFlowTypeChange: (flowType: FlowType) => void;
  onPlayPause: () => void;
  onReset: () => void;
}

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const PauseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const ResetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="1 4 1 10 7 10"></polyline>
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
  </svg>
);

export const FlowControls: React.FC<FlowControlsProps> = ({
  flowType,
  isPlaying,
  onFlowTypeChange,
  onPlayPause,
  onReset,
}) => {
  const t = useTranslations();
  
  const flowTypes: FlowType[] = ['inbound', 'outbound', 'return', 'storage'];

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* 탭 버튼 그룹 + Reset 버튼 */}
      <div className="flex flex-wrap gap-1 bg-gray-200 p-1 rounded-lg items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {flowTypes.map((type) => (
            <button
              key={type}
              onClick={() => onFlowTypeChange(type)}
              className={`px-3 py-1.5 rounded text-xs md:text-sm font-medium transition whitespace-nowrap ${
                flowType === type
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t(`common.flowTypes.${type}`)}
            </button>
          ))}
        </div>
        
        {/* Reset 버튼 - 우측 */}
        <button
          onClick={onReset}
          className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition flex items-center gap-1 font-medium"
          title={t('common.buttons.reset')}
        >
          <ResetIcon />
          <span className="hidden md:inline">{t('common.buttons.reset')}</span>
        </button>
      </div>
    </div>
  );
};
