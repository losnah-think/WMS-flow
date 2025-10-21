// src/components/ActorLegend.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Flow } from '@/models/types';

interface ActorLegendProps {
  flow: Flow;
}

export const ActorLegend: React.FC<ActorLegendProps> = ({ flow }) => {
  const t = useTranslations();

  // 계층별 그룹화
  const layerGroups = flow.actors.reduce((acc, actor) => {
    const layer = actor.layer;
    if (!acc[layer]) acc[layer] = [];
    acc[layer].push(actor);
    return acc;
  }, {} as Record<string, typeof flow.actors>);

  const layerColors: Record<string, { bg: string; text: string; border: string }> = {
    'OMS': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
    'WMS': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
    '1계층': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
    '2계층': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
    '3계층': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300' },
    'Layer 1': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
    'Layer 2': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
    'Layer 3': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300' },
    'Lớp 1': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
    'Lớp 2': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
    'Lớp 3': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300' },
    '외부': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300' },
    'External': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300' },
    'Bên ngoài': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300' },
  };

  return (
    <div className="mb-6 space-y-4">
      <h3 className="text-sm font-bold text-gray-800">{t('components.legend')}</h3>
      
      {Object.entries(layerGroups).map(([layer, actors]) => {
        const colors = layerColors[layer] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300' };
        
        return (
          <div key={layer}>
            <div className={`${colors.bg} border-2 ${colors.border} rounded-lg p-4`}>
              <h4 className={`text-xs font-bold ${colors.text} uppercase mb-3`}>
                {layer}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {actors.map((actor) => (
                  <div
                    key={actor.id}
                    className="flex flex-col p-3 bg-white rounded-lg shadow-sm border-l-4 transition-all hover:shadow-md"
                    style={{ borderLeftColor: actor.color }}
                  >
                    <div
                      className="text-xs font-bold text-center mb-1"
                      style={{ color: actor.color }}
                    >
                      {t(`actors.${actor.id}`) || actor.name}
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                      {t(`actorDescriptions.${actor.id}`) || actor.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
