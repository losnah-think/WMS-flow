// src/app/[locale]/page.tsx
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
import { StepDetailsModal } from '@/components/StepDetailsModal';
import { MiniTimeline } from '@/components/MiniTimeline';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Home() {
  let t;
  try {
    t = useTranslations();
  } catch (error) {
    t = (key: string) => key;
  }

  const {
    flowType,
    isPlaying,
    activeStep,
    showInfo,
    currentFlow,
    selectedStepIndex,
    handleFlowTypeChange,
    handlePlayPause,
    handleReset,
    toggleInfo,
    handleStepSelect,
    handleCloseModal,
    getActorPosition,
  } = useFlowController();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* 계층 구조 설명 카드 */}
        {showInfo && (
          <HierarchyInfo flow={currentFlow} onClose={toggleInfo} />
        )}

        {/* 3열 레이아웃: 타임라인(숨김/표시 토글) + 다이어그램 + 상세정보 */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {/* 좌측: 미니 타임라인 (md:col-span-1, lg 이상에서만 표시) */}
          <div className="hidden md:block md:col-span-1 lg:col-span-1">
            <MiniTimeline
              flow={currentFlow}
              activeStep={activeStep}
              onStepClick={handleStepSelect}
            />
          </div>

          {/* 중앙: 다이어그램 영역 (md:col-span-2, lg:col-span-3) */}
          <div className="col-span-1 md:col-span-3 lg:col-span-3 bg-white rounded-xl shadow-2xl p-4 md:p-6">
            {/* 헤더 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 line-clamp-2">
                  {currentFlow.title}
                </h1>
                {!showInfo && (
                  <button
                    onClick={toggleInfo}
                    className="text-xs md:text-sm text-red-600 hover:text-red-700 mt-1"
                  >
                    {t('hierarchyInfo.title')}
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2 md:gap-4 items-start md:items-end w-full md:w-auto">
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
              flowType={flowType}
            />

            {/* 진행 상태 */}
            <ProgressStatus flow={currentFlow} activeStep={activeStep} />
          </div>

          {/* 우측: 단계별 상세 설명 (col-span-1) - 모바일에서는 아래, md 이상에서는 우측 */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 h-full sticky md:top-4 overflow-y-auto max-h-[60vh] md:max-h-[calc(100vh-2rem)]">
              <StepDetails 
                flow={currentFlow} 
                activeStep={activeStep}
                onStepClick={handleStepSelect}
                flowType={flowType}
              />
            </div>
          </div>
        </div>

        {/* 모바일 전용: 타임라인 (아래) */}
        <div className="md:hidden mt-4">
          <div className="bg-white rounded-xl shadow-2xl p-4">
            <MiniTimeline
              flow={currentFlow}
              activeStep={activeStep}
              onStepClick={handleStepSelect}
            />
          </div>
        </div>
      </div>

      {/* 단계 상세 모달 */}
      {selectedStepIndex !== null && (
        <StepDetailsModal
          flow={currentFlow}
          step={currentFlow.steps[selectedStepIndex]}
          stepIndex={selectedStepIndex}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
