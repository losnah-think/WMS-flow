// src/components/FlowDiagram.tsx
'use client';

import React from 'react';
import { Flow } from '@/models/types';

interface FlowDiagramProps {
  flow: Flow;
  activeStep: number;
  getActorPosition: (actorId: string) => number;
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({ flow, activeStep, getActorPosition }) => {
  // OMS와 WMS 그룹 분류
  const omsActors = flow.actors.filter(a => a.layer === 'OMS');
  const wmsActors = flow.actors.filter(a => a.layer === 'WMS');

  return (
    <div className="overflow-x-auto border-2 border-gray-200 rounded-lg bg-white">
      <style>{`
        @keyframes dashFlow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -24;
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.5));
          }
        }
        
        .flow-line-active {
          animation: dashFlow 0.5s linear infinite;
        }
        
        .step-circle-active {
          animation: pulseGlow 1.5s ease-in-out infinite;
        }
        
        .svg-header {
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }
      `}</style>
      <svg
        width="100%"
        height={flow.steps.length * 80 + 200}
        viewBox={`0 0 ${flow.actors.length * 150 + 100} ${flow.steps.length * 80 + 200}`}
        className="min-w-[800px]"
      >
        {/* OMS/WMS 배경 */}
        {omsActors.length > 0 && (
          <rect
            x="0"
            y="70"
            width={(omsActors.length * 150 + 50)}
            height={flow.steps.length * 80 + 130}
            fill="#f0f9ff"
            opacity="0.3"
          />
        )}
        {wmsActors.length > 0 && (
          <rect
            x={omsActors.length * 150 + 50}
            y="70"
            width={wmsActors.length * 150 + 50}
            height={flow.steps.length * 80 + 130}
            fill="#f5f3ff"
            opacity="0.3"
          />
        )}

        {/* OMS/WMS 라벨 */}
        {omsActors.length > 0 && (
          <text
            x={omsActors.length * 75 + 20}
            y="90"
            className="text-sm font-bold"
            fill="#0369a1"
            opacity="0.5"
          >
            OMS
          </text>
        )}
        {wmsActors.length > 0 && (
          <text
            x={omsActors.length * 150 + 60}
            y="90"
            className="text-sm font-bold"
            fill="#7c3aed"
            opacity="0.5"
          >
            WMS
          </text>
        )}

        {/* 액터 헤더 */}
        {flow.actors.map((actor, idx) => {
          const x = idx * 150 + 100;
          return (
            <g key={actor.id}>
              {/* 배경 세로선 */}
              <line
                x1={x}
                y1="70"
                x2={x}
                y2={flow.steps.length * 80 + 150}
                stroke={actor.color}
                strokeWidth="2"
                strokeDasharray="5 5"
                opacity="0.15"
              />
              
              {/* 액터 박스 */}
              <rect
                x={x - 60}
                y="10"
                width="120"
                height="60"
                rx="8"
                fill="white"
                stroke={actor.color}
                strokeWidth="2"
              />
              
              {/* 이름 */}
              <text
                x={x}
                y="40"
                textAnchor="middle"
                className="text-sm font-bold"
                fill={actor.color}
              >
                {actor.name}
              </text>
              
              {/* 설명 */}
              <text
                x={x}
                y="55"
                textAnchor="middle"
                className="text-xs"
                fill="#6b7280"
              >
                {actor.desc}
              </text>
              
              {/* 계층 */}
              <text
                x={x}
                y="67"
                textAnchor="middle"
                className="text-xs"
                fill="#9ca3af"
              >
                {actor.layer}
              </text>
            </g>
          );
        })}

        {/* 플로우 단계 */}
        {flow.steps.map((step, idx) => {
          const fromX = getActorPosition(step.from);
          const toX = getActorPosition(step.to);
          const y = idx * 80 + 110;
          const isActive = activeStep === idx;
          const isPassed = activeStep > idx;
          
          const labelX = (fromX + toX) / 2;
          
          return (
            <g key={idx}>
              {/* 화살표 선 - 강조 낮춤 */}
              <line
                x1={fromX}
                y1={y}
                x2={toX}
                y2={y}
                stroke={isActive ? '#60a5fa' : isPassed ? '#cbd5e1' : '#e5e7eb'}
                strokeWidth={isActive ? 3 : 1.5}
                markerEnd={`url(#arrow-${isActive ? 'active' : isPassed ? 'passed' : 'default'})`}
                strokeDasharray={isActive ? '12 12' : 'none'}
                className={isActive ? 'flow-line-active' : ''}
                style={{
                  transition: 'stroke 0.3s, stroke-width 0.3s',
                }}
              />
              
              {/* 단계 번호 */}
              <circle
                cx={fromX}
                cy={y}
                r="14"
                fill={isActive ? '#3b82f6' : isPassed ? '#d1d5db' : '#f3f4f6'}
                stroke={isActive ? '#1e40af' : '#d1d5db'}
                strokeWidth="1.5"
                className={isActive ? 'step-circle-active' : ''}
                style={{
                  transition: 'fill 0.3s, stroke 0.3s',
                }}
              />
              <text
                x={fromX}
                y={y + 4}
                textAnchor="middle"
                className="text-xs font-semibold"
                fill={isActive || isPassed ? '#fff' : '#78716c'}
              >
                {idx + 1}
              </text>
              
              {/* 라벨 (상단) */}
              <rect
                x={labelX - 65}
                y={y - 33}
                width="130"
                height="20"
                rx="3"
                fill={isActive ? '#dbeafe' : isPassed ? '#f3f4f6' : '#fafafa'}
                stroke={isActive ? '#93c5fd' : '#e5e7eb'}
                strokeWidth="0.5"
                style={{
                  transition: 'fill 0.3s, stroke 0.3s',
                }}
              />
              <text
                x={labelX}
                y={y - 19}
                textAnchor="middle"
                className="text-xs font-semibold"
                fill={isActive ? '#0c4a6e' : '#374151'}
              >
                {step.label}
              </text>
              
              {/* 설명 (하단) */}
              <text
                x={labelX}
                y={y + 18}
                textAnchor="middle"
                className="text-xs"
                fill={isActive ? '#0c4a6e' : '#6b7280'}
                fontWeight={isActive ? '600' : '400'}
              >
                {step.desc}
              </text>
            </g>
          );
        })}

        {/* 화살표 마커 정의 - 약화됨 */}
        <defs>
          <marker id="arrow-default" markerWidth="8" markerHeight="8" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#e5e7eb" />
          </marker>
          <marker id="arrow-passed" markerWidth="8" markerHeight="8" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#cbd5e1" />
          </marker>
          <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#60a5fa" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};
