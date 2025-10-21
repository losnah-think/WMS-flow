// src/app/page.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useFlowController } from '@/hooks/useFlowController';
import { FlowControls } from '@/components/FlowControls';
import { HierarchyInfo } from '@/components/HierarchyInfo';
import { ActorLegend } from '@/components/ActorLegend';
import { FlowDiagram } from '@/components/FlowDiagram';
import { ProgressStatus } from '@/components/ProgressStatus';
import { StepDetails } from '@/components/StepDetails';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Home() {
  const t = useTranslations();
  const {
    flowType,
    isPlaying,
    activeStep,
    showInfo,
    currentFlow,
    handleFlowTypeChange,
    handlePlayPause,
    handleReset,
    toggleInfo,
    getActorPosition,
  } = useFlowController();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 계층 구조 설명 카드 */}
        {showInfo && (
          <HierarchyInfo flow={currentFlow} onClose={toggleInfo} />
        )}

        <div className="bg-white rounded-xl shadow-2xl p-6">
          {/* 헤더 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {currentFlow.title}
              </h1>
              {!showInfo && (
                <button
                  onClick={toggleInfo}
                  className="text-sm text-red-600 hover:text-red-700 mt-1"
                >
                  {t('hierarchyInfo.title')}
                </button>
              )}
            </div>
            <div className="flex flex-col gap-4 items-end">
              <LanguageSwitcher />
              <FlowControls
                flowType={flowType}
                isPlaying={isPlaying}
                onFlowTypeChange={handleFlowTypeChange}
                onPlayPause={handlePlayPause}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* 범례 */}
          <ActorLegend flow={currentFlow} />

          {/* SVG 다이어그램 */}
          <FlowDiagram
            flow={currentFlow}
            activeStep={activeStep}
            getActorPosition={getActorPosition}
          />

          {/* 진행 상태 */}
          <ProgressStatus flow={currentFlow} activeStep={activeStep} />
        </div>

        {/* 단계별 상세 설명 */}
        <StepDetails flow={currentFlow} activeStep={activeStep} />
      </div>
    </div>
  );
}
