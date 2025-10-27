'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Flow } from '@/models/types';

interface RecursiveVisualizerProps {
  flow: Flow;
  activeStep: number;
  flowType: string;
}

export const RecursiveVisualizer: React.FC<RecursiveVisualizerProps> = ({
  flow,
  activeStep,
  flowType,
}) => {
  const t = useTranslations();
  const [visualMode, setVisualMode] = useState<'detailed' | 'compact'>('detailed');

  const getActorName = (actorId: string) => {
    return t(`actors.${actorId}`) || flow.actors.find(a => a.id === actorId)?.name || '';
  };

  const getStepLabel = (stepIndex: number) => {
    try {
      return t(`flows.${flowType}.steps.${stepIndex}.label`);
    } catch {
      return flow.steps[stepIndex]?.label || '';
    }
  };

  // 재귀 구조 분류
  const recursiveSteps: { [actorId: string]: number[] } = {};
  const normalSteps: typeof flow.steps = [];

  flow.steps.forEach((step, idx) => {
    if (step.from === step.to) {
      if (!recursiveSteps[step.from]) {
        recursiveSteps[step.from] = [];
      }
      recursiveSteps[step.from].push(idx);
    } else {
      normalSteps.push({ ...step, originalIndex: idx } as any);
    }
  });

  const renderDetailedView = () => {
    return (
      <div className="space-y-4">
        {/* 재귀 구조 표시 */}
        {flow.actors.map((actor) => {
          const selfSteps = recursiveSteps[actor.id] || [];
          if (selfSteps.length === 0) return null;

          return (
            <div key={`recursive-${actor.id}`} className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg"
                  style={{ backgroundColor: actor.color }}
                >
                  ↻
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{getActorName(actor.id)}</h3>
                  <p className="text-sm text-gray-600">시스템 내부 처리 (자체 반복)</p>
                </div>
              </div>

              {/* 재귀 단계 목록 */}
              <div className="space-y-2 ml-4">
                {selfSteps.map((stepIdx) => (
                  <div
                    key={`step-${stepIdx}`}
                    className={`p-3 rounded-lg border-l-4 transition-all ${
                      activeStep === stepIdx
                        ? 'bg-white border-blue-500 shadow-lg'
                        : 'bg-white border-amber-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-semibold flex-shrink-0 ${
                          activeStep === stepIdx ? 'bg-blue-600' : 'bg-amber-500'
                        }`}
                      >
                        {stepIdx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{getStepLabel(stepIdx)}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {flow.steps[stepIdx]?.desc}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 italic">
                          💡 {getActorName(actor.id)} 시스템 내에서 처리되는 내부 단계입니다.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* 일반 단계 (액터 간 연결) */}
        {Object.keys(recursiveSteps).length > 0 && normalSteps.length > 0 && (
          <div className="border-t-2 border-gray-300 pt-4 mt-6">
            <h3 className="font-bold text-gray-800 mb-3">외부 단계 (액터 간 이동)</h3>
            <div className="space-y-2">
              {flow.steps.map((step, idx) => {
                if (step.from === step.to) return null;

                const fromActor = flow.actors.find(a => a.id === step.from);
                const toActor = flow.actors.find(a => a.id === step.to);

                return (
                  <div
                    key={`normal-${idx}`}
                    className={`p-3 rounded-lg border-l-4 transition-all ${
                      activeStep === idx
                        ? 'bg-blue-50 border-blue-500 shadow-lg'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`flex items-center justify-center w-7 h-7 rounded-full text-white text-sm font-semibold ${
                          activeStep === idx ? 'bg-blue-600' : 'bg-gray-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <p className="font-semibold text-gray-800">{getStepLabel(idx)}</p>
                      <span className="text-xs text-gray-500 ml-auto">
                        {fromActor?.name} → {toActor?.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCompactView = () => {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 재귀 단계 */}
          {Object.entries(recursiveSteps).map(([actorId, stepIndices]) => {
            const actor = flow.actors.find(a => a.id === actorId);
            if (!actor || stepIndices.length === 0) return null;

            return (
              <div
                key={`recursive-compact-${actorId}`}
                className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xl"
                    style={{ backgroundColor: actor.color }}
                  >
                    ↻
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{actor.name}</p>
                    <p className="text-xs text-gray-600">{stepIndices.length}개 내부 단계</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {stepIndices.map((stepIdx) => (
                    <div
                      key={`step-compact-${stepIdx}`}
                      className={`text-xs p-2 rounded border-l-2 ${
                        activeStep === stepIdx
                          ? 'bg-white border-blue-500 font-semibold text-blue-600'
                          : 'bg-white border-amber-300 text-gray-700'
                      }`}
                    >
                      <span className="font-bold">{stepIdx + 1}.</span> {getStepLabel(stepIdx)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{flow.steps.length}</div>
            <div className="text-xs text-gray-600">전체 단계</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              {Object.values(recursiveSteps).flat().length}
            </div>
            <div className="text-xs text-gray-600">재귀 단계</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {flow.steps.length - Object.values(recursiveSteps).flat().length}
            </div>
            <div className="text-xs text-gray-600">연결 단계</div>
          </div>
        </div>
      </div>
    );
  };

  const recursiveCount = Object.values(recursiveSteps).flat().length;
  const hasRecursive = recursiveCount > 0;

  return (
    <div className="space-y-4">
      {/* 헤더 및 모드 선택 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {hasRecursive && (
            <div className="flex items-center gap-2 bg-amber-100 text-amber-900 px-3 py-2 rounded-lg text-sm font-semibold">
              <span className="text-lg">🔄</span>
              <span>{recursiveCount}개의 재귀 단계 감지됨</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setVisualMode('detailed')}
            className={`px-3 py-2 rounded text-sm font-semibold transition-all ${
              visualMode === 'detailed'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📋 상세
          </button>
          <button
            onClick={() => setVisualMode('compact')}
            className={`px-3 py-2 rounded text-sm font-semibold transition-all ${
              visualMode === 'compact'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📊 요약
          </button>
        </div>
      </div>

      {/* 콘텐츠 렌더링 */}
      {hasRecursive ? (
        <div className="bg-white rounded-lg shadow-lg p-4">
          {visualMode === 'detailed' ? renderDetailedView() : renderCompactView()}
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800 font-semibold">✓ 이 프로세스에는 재귀 단계가 없습니다.</p>
          <p className="text-sm text-blue-600 mt-1">모든 단계가 액터 간의 외부 연결입니다.</p>
        </div>
      )}
    </div>
  );
};
