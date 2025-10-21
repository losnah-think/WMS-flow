// src/components/HierarchyInfo.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Flow } from '@/models/types';

interface HierarchyInfoProps {
  flow: Flow;
  onClose: () => void;
}

export const HierarchyInfo: React.FC<HierarchyInfoProps> = ({ flow, onClose }) => {
  const t = useTranslations();

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-lg p-6 mb-6 border-l-4 border-red-500">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                FULGO WMS - 3계층 구조
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {flow.hierarchy}
              </p>
            </div>
          </div>
          <p className="text-gray-700 mb-3">
            {flow.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-white rounded-lg p-3 border-2 border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-red-700">1계층: FULGO 플랫폼</span>
              </div>
              <p className="text-xs text-gray-600">전체 시스템 관리 · 정책 수립 · 데이터 통합 · 재고 추적</p>
            </div>
            <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-orange-700">2계층: 물류사</span>
              </div>
              <p className="text-xs text-gray-600">창고 운영 · 실제 입출고 작업 · 작업자 관리 · 화주 서비스</p>
            </div>
            <div className="bg-white rounded-lg p-3 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-blue-700">3계층: 화주사</span>
              </div>
              <p className="text-xs text-gray-600">상품 주인 · 입출고 요청 · 재고 조회 · 판매 관리</p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold ml-4"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
