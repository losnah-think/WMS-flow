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

  // Layer를 i18n 키로 매핑
  const getLayerLabel = (layer: string): string => {
    const layerMap: Record<string, string> = {
      '1계층': 'layers.layer1',
      '2계층': 'layers.layer2',
      '3계층': 'layers.layer3',
      '외부': 'layers.external',
    };
    return layerMap[layer] ? t(layerMap[layer]) : layer;
  };

  const layerColors: Record<string, { bg: string; text: string; border: string }> = {
    '1계층': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
    '2계층': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
    '3계층': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300' },
    '외부': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300' },
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">{t('components.legend')}</h3>
      
      {Object.entries(layerGroups).map(([layer, actors]) => {
        const colors = layerColors[layer] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300' };
        const layerLabel = getLayerLabel(layer);
        
        return (
          <div key={layer} className={`${colors.bg} border ${colors.border} rounded p-2`}>
            <h4 className={`text-xs font-semibold ${colors.text} mb-2`}>
              {layerLabel}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
              {actors.map((actor) => (
                <div
                  key={actor.id}
                  className="flex flex-col p-2 bg-white rounded border-l-2 transition-shadow hover:shadow-sm"
                  style={{ borderLeftColor: actor.color }}
                >
                  <div
                    className="text-xs font-semibold text-center"
                    style={{ color: actor.color }}
                  >
                    {t(`actors.${actor.id}`) || actor.name}
                  </div>
                  <div className="text-xs text-gray-600 text-center line-clamp-1">
                    {t(`actorDescriptions.${actor.id}`) || actor.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
