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

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
      <h3 className="text-sm font-bold text-gray-700 mb-3">시스템 구성 요소</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {flow.actors.map((actor) => (
          <div key={actor.id} className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border-2 border-gray-200">
            <div className="text-xs font-bold text-center mb-1" style={{color: actor.color}}>
              {actor.name}
            </div>
            <div className="text-xs text-gray-500 text-center mt-1">
              {actor.desc}
            </div>
            <div className="text-xs text-gray-400 text-center mt-1 font-semibold">
              {actor.layer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
