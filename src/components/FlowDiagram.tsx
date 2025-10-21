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
  return (
    <div className="overflow-x-auto border-2 border-gray-200 rounded-lg bg-white">
      <svg
        width="100%"
        height={flow.steps.length * 80 + 200}
        viewBox={`0 0 ${flow.actors.length * 150 + 100} ${flow.steps.length * 80 + 200}`}
        className="min-w-[800px]"
      >
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
                opacity="0.2"
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
                strokeWidth="3"
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
              {/* 화살표 선 */}
              <line
                x1={fromX}
                y1={y}
                x2={toX}
                y2={y}
                stroke={isActive ? '#3b82f6' : isPassed ? '#94a3b8' : '#cbd5e1'}
                strokeWidth={isActive ? 4 : 2}
                markerEnd={`url(#arrow-${isActive ? 'active' : isPassed ? 'passed' : 'default'})`}
                style={{
                  strokeDasharray: isActive ? '8 4' : 'none',
                  transition: 'all 0.3s'
                }}
              >
                {isActive && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-12"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                )}
              </line>
              
              {/* 단계 번호 */}
              <circle
                cx={fromX}
                cy={y}
                r="15"
                fill={isActive ? '#3b82f6' : isPassed ? '#94a3b8' : '#e2e8f0'}
                stroke={isActive ? '#1e40af' : '#94a3b8'}
                strokeWidth="2"
              />
              <text
                x={fromX}
                y={y + 5}
                textAnchor="middle"
                className="text-xs font-bold"
                fill={isActive || isPassed ? '#fff' : '#64748b'}
              >
                {idx + 1}
              </text>
              
              {/* 라벨 (상단) */}
              <rect
                x={labelX - 70}
                y={y - 35}
                width="140"
                height="22"
                rx="4"
                fill={isActive ? '#3b82f6' : isPassed ? '#e2e8f0' : '#fff'}
                stroke={isActive ? '#1e40af' : '#cbd5e1'}
                strokeWidth="1"
              />
              <text
                x={labelX}
                y={y - 20}
                textAnchor="middle"
                className="text-xs font-bold"
                fill={isActive ? '#fff' : '#1e293b'}
              >
                {step.label}
              </text>
              
              {/* 설명 (하단) */}
              <text
                x={labelX}
                y={y + 20}
                textAnchor="middle"
                className="text-xs"
                fill={isActive ? '#3b82f6' : '#64748b'}
                fontWeight={isActive ? 'bold' : 'normal'}
              >
                {step.desc}
              </text>
            </g>
          );
        })}

        {/* 화살표 마커 정의 */}
        <defs>
          <marker id="arrow-default" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#cbd5e1" />
          </marker>
          <marker id="arrow-passed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
          </marker>
          <marker id="arrow-active" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};
