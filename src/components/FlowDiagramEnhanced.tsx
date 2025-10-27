'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Flow } from '@/models/types';

interface FlowDiagramEnhancedProps {
  flow: Flow;
  activeStep: number;
  getActorPosition: (actorId: string) => number;
  flowType: string;
  visualMode?: 'linear' | 'circular' | 'nested' | 'tree';
}

export const FlowDiagramEnhanced: React.FC<FlowDiagramEnhancedProps> = ({
  flow,
  activeStep,
  getActorPosition,
  flowType,
  visualMode = 'linear',
}) => {
  const t = useTranslations();
  const [mode, setMode] = useState<'linear' | 'circular' | 'nested' | 'tree'>(visualMode);

  const getActorName = (actorId: string) => {
    return t(`actors.${actorId}`) || flow.actors.find(a => a.id === actorId)?.name || '';
  };

  const getActorDescription = (actorId: string) => {
    return t(`actorDescriptions.${actorId}`) || flow.actors.find(a => a.id === actorId)?.desc || '';
  };

  const getStepLabel = (stepIndex: number) => {
    try {
      return t(`flows.${flowType}.steps.${stepIndex}.label`);
    } catch {
      return flow.steps[stepIndex]?.label || '';
    }
  };

  const getStepDesc = (stepIndex: number) => {
    try {
      return t(`flows.${flowType}.steps.${stepIndex}.desc`);
    } catch {
      return flow.steps[stepIndex]?.desc || '';
    }
  };

  // 재귀 구조 감지
  const isRecursive = (step: any) => step.from === step.to;
  const recursiveSteps = flow.steps.filter(isRecursive);
  const normalSteps = flow.steps.filter(s => !isRecursive(s));

  // 원형 다이어그램
  const renderCircularMode = () => {
    const centerX = 300;
    const centerY = 300;
    const radius = 180;
    const angleSlice = (2 * Math.PI) / flow.actors.length;

    return (
      <svg width="100%" height="700" viewBox="0 0 600 600" className="w-full h-auto">
        {/* 중앙 원형 연결선 */}
        <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="5 5" />

        {/* 액터들 (원형 배치) */}
        {flow.actors.map((actor, idx) => {
          const angle = angleSlice * idx - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          return (
            <g key={actor.id}>
              {/* 액터 박스 */}
              <circle cx={x} cy={y} r="35" fill="white" stroke={actor.color} strokeWidth="2" />

              {/* 아이콘 또는 텍스트 */}
              <text x={x} y={y + 5} textAnchor="middle" className="text-xs font-bold" fill={actor.color}>
                {getActorName(actor.id).substring(0, 3)}
              </text>

              {/* 라벨 */}
              <text x={x} y={y + 60} textAnchor="middle" className="text-xs font-semibold" fill="#374151">
                {getActorName(actor.id)}
              </text>
            </g>
          );
        })}

        {/* 단계 연결선 (중앙에서) */}
        {normalSteps.map((step, idx) => {
          const fromIdx = flow.actors.findIndex(a => a.id === step.from);
          const toIdx = flow.actors.findIndex(a => a.id === step.to);

          const fromAngle = angleSlice * fromIdx - Math.PI / 2;
          const toAngle = angleSlice * toIdx - Math.PI / 2;

          const fromX = centerX + (radius - 35) * Math.cos(fromAngle);
          const fromY = centerY + (radius - 35) * Math.sin(fromAngle);
          const toX = centerX + (radius - 35) * Math.cos(toAngle);
          const toY = centerY + (radius - 35) * Math.sin(toAngle);

          const isActive = activeStep === idx;

          return (
            <g key={`line-${idx}`}>
              {/* 곡선 연결 */}
              <path
                d={`M ${fromX} ${fromY} Q ${centerX} ${centerY} ${toX} ${toY}`}
                fill="none"
                stroke={isActive ? '#60a5fa' : '#e5e7eb'}
                strokeWidth={isActive ? 2.5 : 1.5}
                markerEnd={`url(#arrow-${isActive ? 'active' : 'default'})`}
              />

              {/* 단계 번호 (곡선 중간) */}
              <circle
                cx={(fromX + toX) / 2}
                cy={(fromY + toY) / 2}
                r="16"
                fill={isActive ? '#3b82f6' : '#f3f4f6'}
                stroke={isActive ? '#1e40af' : '#d1d5db'}
                strokeWidth="1.5"
              />
              <text
                x={(fromX + toX) / 2}
                y={(fromY + toY) / 2 + 4}
                textAnchor="middle"
                className="text-xs font-semibold"
                fill={isActive ? '#fff' : '#78716c'}
              >
                {idx + 1}
              </text>
            </g>
          );
        })}

        {/* 재귀 단계 표시 (액터 내부 루프) */}
        {recursiveSteps.map((step, idx) => {
          const actorIdx = flow.actors.findIndex(a => a.id === step.from);
          const angle = angleSlice * actorIdx - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          return (
            <g key={`recursive-${idx}`}>
              {/* 루프 곡선 */}
              <path
                d={`M ${x + 40} ${y} Q ${x + 60} ${y + 60} ${x + 40} ${y + 120} Q ${x + 0} ${y + 60} ${x - 40} ${y}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="8 4"
                markerEnd="url(#arrow-recursive)"
              />

              {/* 재귀 레이블 */}
              <rect x={x + 50} y={y + 35} width="60" height="20" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
              <text x={x + 80} y={y + 48} textAnchor="middle" className="text-xs font-bold" fill="#b45309">
                🔄 Self
              </text>
            </g>
          );
        })}

        {/* 화살표 마커 */}
        <defs>
          <marker id="arrow-default" markerWidth="8" markerHeight="8" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#e5e7eb" />
          </marker>
          <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#60a5fa" />
          </marker>
          <marker id="arrow-recursive" markerWidth="8" markerHeight="8" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
          </marker>
        </defs>
      </svg>
    );
  };

  // 중첩 모드 (재귀 구조를 명확히)
  const renderNestedMode = () => {
    return (
      <div className="w-full overflow-x-auto">
        <svg width="100%" height={flow.steps.length * 90 + 300} viewBox={`0 0 1000 ${flow.steps.length * 90 + 300}`} className="w-full h-auto">
          {/* 배경 그룹 */}
          {flow.actors.map((actor, idx) => {
            const x = idx * 200 + 50;
            return (
              <g key={`group-${actor.id}`}>
                {/* 배경 */}
                <rect x={x} y="50" width="180" height={flow.steps.length * 90 + 200} fill={actor.color} opacity="0.05" rx="8" stroke={actor.color} strokeWidth="2" />

                {/* 액터 헤더 */}
                <rect x={x + 10} y="60" width="160" height="60" rx="6" fill="white" stroke={actor.color} strokeWidth="2" />
                <text x={x + 90} y="80" textAnchor="middle" className="text-sm font-bold" fill={actor.color}>
                  {getActorName(actor.id)}
                </text>
                <text x={x + 90} y="105" textAnchor="middle" className="text-xs" fill="#6b7280">
                  {getActorDescription(actor.id)}
                </text>
              </g>
            );
          })}

          {/* 단계 처리 */}
          {flow.steps.map((step, idx) => {
            const fromIdx = flow.actors.findIndex(a => a.id === step.from);
            const toIdx = flow.actors.findIndex(a => a.id === step.to);
            const fromX = fromIdx * 200 + 140;
            const toX = toIdx * 200 + 140;
            const y = idx * 90 + 150;
            const isActive = activeStep === idx;
            const isRecurs = step.from === step.to;

            if (isRecurs) {
              // 재귀: 자체 루프 그리기
              return (
                <g key={`step-${idx}`}>
                  <path
                    d={`M ${fromX} ${y} Q ${fromX + 80} ${y} ${fromX + 80} ${y + 40} Q ${fromX + 80} ${y + 60} ${fromX} ${y + 60}`}
                    fill="none"
                    stroke={isActive ? '#f59e0b' : '#fbbf24'}
                    strokeWidth={isActive ? 2.5 : 2}
                    markerEnd="url(#arrow-self)"
                  />
                  {/* 재귀 표시 */}
                  <circle cx={fromX + 40} cy={y - 20} r="18" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                  <text x={fromX + 40} y={y - 15} textAnchor="middle" className="text-lg font-bold" fill="#b45309">
                    ↻
                  </text>
                  <text x={fromX + 40} y={y + 35} textAnchor="middle" className="text-xs font-semibold" fill="#b45309">
                    {getStepLabel(idx)}
                  </text>
                </g>
              );
            }

            // 일반: 액터 간 연결
            return (
              <g key={`step-${idx}`}>
                <line
                  x1={fromX}
                  y1={y}
                  x2={toX}
                  y2={y}
                  stroke={isActive ? '#60a5fa' : '#e5e7eb'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  markerEnd={`url(#arrow-${isActive ? 'active' : 'default'})`}
                  strokeDasharray="8 4"
                />

                {/* 단계 번호 */}
                <circle
                  cx={(fromX + toX) / 2}
                  cy={y}
                  r="14"
                  fill={isActive ? '#3b82f6' : '#f3f4f6'}
                  stroke={isActive ? '#1e40af' : '#d1d5db'}
                  strokeWidth="1.5"
                />
                <text x={(fromX + toX) / 2} y={y + 4} textAnchor="middle" className="text-xs font-semibold" fill={isActive ? '#fff' : '#78716c'}>
                  {idx + 1}
                </text>

                {/* 라벨 */}
                <text x={(fromX + toX) / 2} y={y - 15} textAnchor="middle" className="text-xs font-semibold" fill={isActive ? '#0c4a6e' : '#374151'}>
                  {getStepLabel(idx)}
                </text>
              </g>
            );
          })}

          <defs>
            <marker id="arrow-default" markerWidth="8" markerHeight="8" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#e5e7eb" />
            </marker>
            <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#60a5fa" />
            </marker>
            <marker id="arrow-self" markerWidth="8" markerHeight="8" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
            </marker>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 모드 선택기 */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setMode('linear')}
          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
            mode === 'linear' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📊 선형
        </button>
        <button
          onClick={() => setMode('circular')}
          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
            mode === 'circular' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🔄 원형
        </button>
        <button
          onClick={() => setMode('nested')}
          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
            mode === 'nested' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📦 중첩
        </button>

        {/* 재귀 정보 */}
        {recursiveSteps.length > 0 && (
          <div className="ml-auto flex items-center gap-2 text-xs bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            <span className="text-lg">🔄</span>
            <span className="text-amber-900 font-semibold">{recursiveSteps.length}개 재귀 단계</span>
          </div>
        )}
      </div>

      {/* 다이어그램 렌더링 */}
      <div className="border-2 border-gray-200 rounded-lg bg-white overflow-x-auto">
        {mode === 'circular' && renderCircularMode()}
        {mode === 'nested' && renderNestedMode()}
      </div>
    </div>
  );
};
