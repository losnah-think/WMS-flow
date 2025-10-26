'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useFlowController } from '@/hooks/useFlowController';
import { useDownloadDiagram } from '@/hooks/useDownloadDiagram';
import { FlowControls } from '@/components/FlowControls';
import { HierarchyInfo } from '@/components/HierarchyInfo';
import { ActorLegend } from '@/components/ActorLegend';
import { FlowDiagram } from '@/components/FlowDiagram';
import { StepDetails } from '@/components/StepDetails';
import { StepDetailsModal } from '@/components/StepDetailsModal';
import { MiniTimeline } from '@/components/MiniTimeline';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ProcessDashboard } from '@/components/ProcessDashboard';

export default function Home() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ko';
  const [showDashboard, setShowDashboard] = useState(false);
  
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

  const {
    downloadDiagramAsPNG,
    downloadDiagramAsSVG,
  } = useDownloadDiagram();

  const handleDownloadPNG = () => {
    downloadDiagramAsPNG(`wms-flow-${flowType}`);
  };

  const handleDownloadSVG = () => {
    downloadDiagramAsSVG(`wms-flow-${flowType}`);
  };

  if (showDashboard) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="sticky top-0 bg-white shadow-md z-50">
          <div className="w-full px-6 py-3">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setShowDashboard(false)}
                  className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
                >
                  ← FULGO WMS
                </button>
              </div>
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </header>
        <div className="w-full">
          <ProcessDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 bg-white shadow-md z-50">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <Link href={`/${locale}`}>
                <h1 className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                  FULGO WMS
                </h1>
              </Link>
              <nav className="flex gap-6 text-sm">
                <Link 
                  href={`/${locale}`}
                  className="px-4 py-2 text-blue-600 bg-blue-50 rounded font-semibold whitespace-nowrap"
                >
                  {t('nav.flow')}
                </Link>
                <button
                  onClick={() => setShowDashboard(true)}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors whitespace-nowrap font-semibold"
                >
                  📊 프로세스 대시보드 (NEW)
                </button>
                <Link 
                  href={`/${locale}/features`}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors whitespace-nowrap"
                >
                  {t('nav.features')}
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600 hidden lg:block whitespace-nowrap">{t('common.subtitle')}</p>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <div className="w-full p-2 md:p-4">
        <div className="w-full px-2 md:px-4 space-y-3 md:space-y-4">
          {showInfo && (
            <HierarchyInfo flow={currentFlow} flowType={flowType} onClose={toggleInfo} />
          )}

          <div>
            <FlowControls
              flowType={flowType}
              isPlaying={isPlaying}
              onFlowTypeChange={handleFlowTypeChange}
              onPlayPause={handlePlayPause}
              onReset={handleReset}
              onDownloadPNG={handleDownloadPNG}
              onDownloadSVG={handleDownloadSVG}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            <div className="col-span-1 md:col-span-3 bg-white rounded-lg shadow-lg p-3 md:p-4">
              <div className="mb-3 md:mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 line-clamp-2">
                  {t(`flows.${flowType}.title`)}
                </h1>
                {!showInfo && (
                  <button
                    onClick={toggleInfo}
                    className="text-xs md:text-sm text-red-600 hover:text-red-700 mt-1 font-medium"
                  >
                    {t('hierarchyInfo.title')}
                  </button>
                )}
              </div>

              <FlowDiagram
                flow={currentFlow}
                activeStep={activeStep}
                getActorPosition={getActorPosition}
                flowType={flowType}
              />
            </div>

            <div className="col-span-1 md:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-4 md:p-5 h-full sticky md:top-20 overflow-y-auto max-h-[calc(100vh-180px)]">
                <StepDetails 
                  flow={currentFlow} 
                  activeStep={activeStep}
                  onStepClick={handleStepSelect}
                  flowType={flowType}
                />
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <MiniTimeline
                flow={currentFlow}
                activeStep={activeStep}
                onStepClick={handleStepSelect}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-3">
            <ActorLegend flow={currentFlow} />
          </div>
        </div>
      </div>

      {selectedStepIndex !== null && (
        <StepDetailsModal
          flow={currentFlow}
          step={currentFlow.steps[selectedStepIndex]}
          stepIndex={selectedStepIndex}
          flowType={flowType}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
