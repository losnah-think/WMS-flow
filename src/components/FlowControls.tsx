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

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        value={flowType}
        onChange={(e) => onFlowTypeChange(e.target.value as FlowType)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium cursor-pointer"
      >
        <option value="inbound">{t('common.flowTypes.inbound')}</option>
        <option value="outbound">{t('common.flowTypes.outbound')}</option>
        <option value="return">{t('common.flowTypes.return')}</option>
        <option value="storage">{t('common.flowTypes.storage')}</option>
      </select>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2 text-sm font-medium whitespace-nowrap"
      >
        <ResetIcon />
        {t('common.buttons.reset')}
      </button>
    </div>
  );
};
