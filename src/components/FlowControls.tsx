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
  onDownloadPNG?: () => void;
  onDownloadSVG?: () => void;
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

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

export const FlowControls: React.FC<FlowControlsProps> = ({
  flowType,
  isPlaying,
  onFlowTypeChange,
  onPlayPause,
  onReset,
  onDownloadPNG,
  onDownloadSVG,
}) => {
  const t = useTranslations();
  
  const flowTypes: FlowType[] = ['inbound', 'outbound', 'return', 'storage'];

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* 탭 버튼 그룹 + Reset/다운로드 버튼 */}
      <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
        {/* Flow Type 버튼 그룹 */}
        <div className="flex flex-wrap gap-1 bg-gray-200 p-1 rounded-lg flex-1">
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
        
        {/* 우측 버튼 그룹 */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* 다운로드 드롭다운 */}
          <div className="relative group">
            <button
              className="px-3 py-1.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition flex items-center gap-1 font-medium whitespace-nowrap"
              title={t('common.buttons.download')}
            >
              <DownloadIcon />
              <span className="hidden sm:inline">{t('common.buttons.download')}</span>
            </button>
            <div className="hidden group-hover:block absolute right-0 mt-1 w-32 bg-white border border-gray-300 rounded shadow-lg z-10">
              <button
                onClick={onDownloadPNG}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200"
              >
                {t('common.buttons.downloadPNG')}
              </button>
              <button
                onClick={onDownloadSVG}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {t('common.buttons.downloadSVG')}
              </button>
            </div>
          </div>
          
          {/* Reset 버튼 */}
          <button
            onClick={onReset}
            className="px-3 py-1.5 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition flex items-center gap-1 font-medium whitespace-nowrap"
            title={t('common.buttons.reset')}
          >
            <ResetIcon />
            <span className="hidden sm:inline">{t('common.buttons.reset')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
