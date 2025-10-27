'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface ProcessIcon {
  id: string;
  name: string;
  description: string;
  icon: string; // SVG or emoji
  category: 'input' | 'processing' | 'storage' | 'output' | 'check' | 'system';
}

const processIcons: ProcessIcon[] = [
  // Input & Reception
  {
    id: 'package-inbound',
    name: '입고 박스',
    description: '배송 도착 상품',
    icon: '📦',
    category: 'input',
  },
  {
    id: 'order-receipt',
    name: '주문 수신',
    description: '외부 채널 주문',
    icon: '🛒',
    category: 'input',
  },
  // Processing & Movement
  {
    id: 'forklift',
    name: '지게차',
    description: '상품 이동',
    icon: '🏗️',
    category: 'processing',
  },
  {
    id: 'worker-pickup',
    name: '작업자 픽업',
    description: '피킹 작업',
    icon: '👷',
    category: 'processing',
  },
  {
    id: 'handcart',
    name: '핸드카트',
    description: '운반 도구',
    icon: '🛒',
    category: 'processing',
  },
  // Storage & Location
  {
    id: 'warehouse',
    name: '창고',
    description: '보관 시설',
    icon: '🏭',
    category: 'storage',
  },
  {
    id: 'shelf',
    name: '선반',
    description: '재고 보관 위치',
    icon: '🗂️',
    category: 'storage',
  },
  {
    id: 'pallet',
    name: '팔레트',
    description: '대량 보관',
    icon: '📦',
    category: 'storage',
  },
  // Quality Check
  {
    id: 'pos-device',
    name: 'POS 기기',
    description: '품질 검수 도구',
    icon: '🖥️',
    category: 'check',
  },
  {
    id: 'checklist',
    name: '체크리스트',
    description: '검증 목록',
    icon: '✅',
    category: 'check',
  },
  {
    id: 'scale',
    name: '저울',
    description: '무게 확인',
    icon: '⚖️',
    category: 'check',
  },
  // Output & Shipping
  {
    id: 'truck',
    name: '배송 트럭',
    description: '출고 운송',
    icon: '🚚',
    category: 'output',
  },
  {
    id: 'shipping-container',
    name: '컨테이너',
    description: '대량 배송',
    icon: '📦',
    category: 'output',
  },
  // System & Management
  {
    id: 'system-dashboard',
    name: '대시보드',
    description: '시스템 모니터링',
    icon: '📊',
    category: 'system',
  },
  {
    id: 'database',
    name: '데이터베이스',
    description: '정보 관리',
    icon: '💾',
    category: 'system',
  },
];

interface ProcessIconLegendProps {
  hideCategory?: string[];
  compact?: boolean;
}

export const ProcessIconLegend: React.FC<ProcessIconLegendProps> = ({
  hideCategory = [],
  compact = false,
}) => {
  const t = useTranslations();

  const categoryMap = {
    input: { label: '입고/수신', color: 'bg-green-50 border-green-300', textColor: 'text-green-700' },
    processing: { label: '작업/이동', color: 'bg-blue-50 border-blue-300', textColor: 'text-blue-700' },
    storage: { label: '보관/위치', color: 'bg-yellow-50 border-yellow-300', textColor: 'text-yellow-700' },
    check: { label: '검증/확인', color: 'bg-purple-50 border-purple-300', textColor: 'text-purple-700' },
    output: { label: '출고/배송', color: 'bg-red-50 border-red-300', textColor: 'text-red-700' },
    system: { label: '시스템/관리', color: 'bg-gray-50 border-gray-300', textColor: 'text-gray-700' },
  };

  const groupedIcons = processIcons.reduce((acc, icon) => {
    if (!acc[icon.category]) acc[icon.category] = [];
    acc[icon.category].push(icon);
    return acc;
  }, {} as Record<string, ProcessIcon[]>);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
        프로세스 구성 요소
      </h3>

      {Object.entries(categoryMap).map(([category, { label, color, textColor }]) => {
        if (hideCategory.includes(category)) return null;

        const icons = groupedIcons[category as keyof typeof categoryMap] || [];
        if (icons.length === 0) return null;

        return (
          <div key={category} className={`border ${color} rounded-lg p-3`}>
            <h4 className={`text-xs font-semibold ${textColor} mb-3 uppercase tracking-wide`}>
              {label}
            </h4>
            <div className={`grid gap-2 ${compact ? 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
              {icons.map((icon) => (
                <div
                  key={icon.id}
                  className="flex flex-col items-center p-2 bg-white rounded-md border border-gray-200 hover:shadow-md transition-all group"
                >
                  <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                    {icon.icon}
                  </div>
                  <div className="text-xs font-semibold text-gray-700 text-center line-clamp-1">
                    {icon.name}
                  </div>
                  <div className="text-xs text-gray-500 text-center line-clamp-1">
                    {icon.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
        <p className="font-semibold mb-1">💡 아이콘 설명</p>
        <p>각 아이콘은 물류 프로세스의 주요 요소를 나타냅니다. 호버하면 더 자세한 정보를 확인할 수 있습니다.</p>
      </div>
    </div>
  );
};
