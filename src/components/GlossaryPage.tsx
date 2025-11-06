'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface GlossaryItem {
  term: string;
  description: string;
  category: string;
  examples?: string[];
}

const glossaryData: GlossaryItem[] = [
  {
    term: 'WMS (Warehouse Management System)',
    description: '창고의 입고, 보관, 출고 등 모든 프로세스를 관리하는 통합 시스템입니다.',
    category: '시스템',
    examples: ['FULGO WMS는 클라우드 기반의 포괄적인 창고 관리 시스템입니다']
  },
  {
    term: 'OMS (Order Management System)',
    description: '고객 주문의 접수, 처리, 배송까지의 전체 주문 프로세스를 관리하는 시스템입니다.',
    category: '시스템',
    examples: ['FULGO OMS는 OMS와 WMS를 연동하여 seamless한 주문 처리를 제공합니다']
  },
  {
    term: '입고 (Inbound)',
    description: '공급업체나 화주에서 상품을 받아들이는 프로세스입니다.',
    category: '프로세스',
    examples: ['일반입고, 긴급입고', '입고 요청 → 검수 → 적치']
  },
  {
    term: '출고 (Outbound)',
    description: '고객에게 상품을 배송하기 위해 창고에서 꺼내는 프로세스입니다.',
    category: '프로세스',
    examples: ['피킹 → 검수 → 포장 → 출하']
  },
  {
    term: '반품 (Return)',
    description: '고객이 받은 상품을 반환하는 프로세스입니다.',
    category: '프로세스',
    examples: ['고객 반품 → 검수 → 재입고 또는 폐기']
  },
  {
    term: '재고 관리 (Inventory Management)',
    description: '창고에 보관된 상품의 수량, 위치, 상태를 실시간으로 관리하는 프로세스입니다.',
    category: '프로세스',
    examples: ['재고 상태: 가용/예약/보류/불량', '실사(Cycle Count)']
  },
  {
    term: '존 (Zone)',
    description: '창고 내의 대분류 구역입니다. 보통 기능별로 구분됩니다.',
    category: '창고구조',
    examples: ['입고존(Inbound Zone), 보관존(Storage Zone), 출고존(Outbound Zone)']
  },
  {
    term: '구역 (Area)',
    description: '존 내의 중분류 구역입니다. 상품 특성별로 구분될 수 있습니다.',
    category: '창고구조',
    examples: ['의류구역, 전자제품구역, 신발구역']
  },
  {
    term: '랙 (Rack)',
    description: '상품을 보관하기 위한 선반 구조입니다.',
    category: '창고구조',
    examples: ['파렛트 랙, 플로우 랙, 카드뮴 랙']
  },
  {
    term: '로케이션 (Location)',
    description: '랙 내의 최소 보관 단위로, 상품을 적치하는 구체적인 위치입니다.',
    category: '창고구조',
    examples: ['로케이션 코드: A-A-01-01 (존-구역-행-열)', '규격: 500mm × 300mm × 200mm']
  },
  {
    term: '바코드 (Barcode)',
    description: '상품이나 로케이션을 식별하기 위한 부호화된 정보입니다.',
    category: '기술',
    examples: ['1D 바코드(CODE-128), 2D 바코드(QR코드)']
  },
  {
    term: 'SKU (Stock Keeping Unit)',
    description: '재고 관리를 위해 상품에 부여하는 고유한 코드입니다.',
    category: '기술',
    examples: ['SKU-001-M-RED: 상품001, 사이즈M, 색상RED']
  },
  {
    term: '피킹 (Picking)',
    description: '주문 정보에 따라 창고에서 상품을 선택하여 수집하는 작업입니다.',
    category: '작업',
    examples: ['단일 피킹, 배치 피킹, 존 피킹']
  },
  {
    term: '검수 (Inspection/Verification)',
    description: '수령한 상품의 수량과 품질을 검증하는 작업입니다.',
    category: '작업',
    examples: ['입고 검수, 출고 검수']
  },
  {
    term: '적치 (Putaway)',
    description: '검수 완료한 상품을 할당된 로케이션에 보관하는 작업입니다.',
    category: '작업',
    examples: ['자동 적치, 수동 적치']
  },
  {
    term: '포장 (Packing)',
    description: '상품을 배송하기 위해 박스에 담고 포장하는 작업입니다.',
    category: '작업',
    examples: ['개별 포장, 합포장']
  },
  {
    term: '가용 재고 (Available Stock)',
    description: '즉시 출고 가능한 상태의 재고입니다.',
    category: '재고상태',
    examples: ['입고 완료 + 검수 완료 = 가용']
  },
  {
    term: '예약 재고 (Reserved Stock)',
    description: '주문이 지정되어 출고를 기다리는 상태의 재고입니다.',
    category: '재고상태',
    examples: ['주문 확정 후 출고 전']
  },
  {
    term: '보류 재고 (Hold Stock)',
    description: '문제가 있어 출고 불가능한 상태의 재고입니다.',
    category: '재고상태',
    examples: ['검수 실패, 파손, 유효기한 만료']
  },
  {
    term: '불량 재고 (Defective Stock)',
    description: '판매 불가능한 손상되거나 오염된 재고입니다.',
    category: '재고상태',
    examples: ['파손품, 오염품, 유효기한 만료']
  },
  {
    term: 'FIFO (First In First Out)',
    description: '먼저 들어온 상품을 먼저 출고하는 재고 관리 방식입니다.',
    category: '관리방식',
    examples: ['생필품, 식품 등 유효기한이 있는 상품에 적용']
  },
  {
    term: 'FEFO (First Expired First Out)',
    description: '유효기한이 가장 앞선 상품을 먼저 출고하는 재고 관리 방식입니다.',
    category: '관리방식',
    examples: ['식품, 의약품 등']
  },
  {
    term: 'ABC 분석',
    description: '상품의 판매 기여도에 따라 A, B, C 세 그룹으로 분류하는 분석 방법입니다.',
    category: '분석',
    examples: ['A: 20% 상품이 80% 매출, B: 30% 상품이 15% 매출, C: 50% 상품이 5% 매출']
  },
  {
    term: 'KPI (Key Performance Indicator)',
    description: '주요 성과 지표로, 업무 성과를 측정하는 지표입니다.',
    category: '분석',
    examples: ['입고 처리 시간, 출고 정확도, 재고 정합성율']
  },
  {
    term: '실사 (Cycle Count)',
    description: '주기적으로 창고의 실제 재고를 세어 시스템과 비교하는 작업입니다.',
    category: '작업',
    examples: ['월 1회 전체 실사, 주 1회 부분 실사']
  },
  {
    term: '송장 (Shipping Label)',
    description: '배송할 상품에 붙이는 배송 정보 라벨입니다.',
    category: '기술',
    examples: ['배송지 주소, 수령인, 배송사 추적번호']
  },
  {
    term: '존 할당 (Zone Assignment)',
    description: '상품의 특성에 따라 적절한 존에 배치하는 작업입니다.',
    category: '작업',
    examples: ['온도 관리 필요 상품은 특수 존으로 할당']
  },
  {
    term: '슬로우무버 (Slow Mover)',
    description: '판매가 잘 되지 않아 창고에 오래 있는 상품입니다.',
    category: '분석',
    examples: ['90일 이상 출고되지 않은 상품']
  },
  {
    term: '패스트무버 (Fast Mover)',
    description: '판매가 빠르게 진행되는 상품입니다.',
    category: '분석',
    examples: ['일일 매출이 높은 상품']
  },
  {
    term: '합배송 (Consolidated Shipment)',
    description: '여러 주문을 한 번에 묶어서 배송하는 방식입니다.',
    category: '배송방식',
    examples: ['같은 지역의 여러 주문을 하나의 박스로 발송']
  }
];

export const GlossaryPage: React.FC = () => {
  const t = useTranslations();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = Array.from(new Set(glossaryData.map(item => item.category)));
  
  const filteredData = glossaryData.filter(item => {
    const matchCategory = !selectedCategory || item.category === selectedCategory;
    const matchSearch = !searchTerm || 
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 bg-white shadow-md z-50">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <Link href="/">
                <h1 className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                  FULGO WMS
                </h1>
              </Link>
              <nav className="flex gap-6 text-sm">
                <Link 
                  href="/"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors whitespace-nowrap"
                >
                  플로우 분석
                </Link>
                <Link 
                  href="/glossary"
                  className="px-4 py-2 text-blue-600 bg-blue-50 rounded font-semibold whitespace-nowrap"
                >
                  용어 설명
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* 페이지 제목 */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📚 Fulgo WMS 용어 설명
            </h1>
            <p className="text-gray-600 text-lg">
              WMS 시스템에서 자주 사용되는 용어들을 체계적으로 설명합니다.
            </p>
          </div>

          {/* 검색 및 필터 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 검색 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔍 검색
                </label>
                <input
                  type="text"
                  placeholder="용어나 설명 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 카테고리 필터 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📂 카테고리
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">전체 보기</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 카테고리별 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-blue-600">{glossaryData.length}</div>
              <div className="text-sm text-gray-600 mt-1">전체 용어</div>
            </div>
            {categories.map(cat => (
              <div key={cat} className="bg-slate-50 rounded-lg p-4 border-l-4 border-slate-400">
                <div className="text-2xl font-bold text-slate-600">
                  {glossaryData.filter(item => item.category === cat).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">{cat}</div>
              </div>
            ))}
          </div>

          {/* 용어 목록 */}
          <div className="space-y-4">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-800 flex-1">
                      {item.term}
                    </h2>
                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold ml-2 whitespace-nowrap">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  {item.examples && item.examples.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        💡 예시
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {item.examples.map((example, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">
                  검색 결과가 없습니다.
                </p>
              </div>
            )}
          </div>

          {/* 결과 수 */}
          <div className="mt-8 text-center text-gray-600">
            <p>
              {selectedCategory && `"${selectedCategory}" 카테고리 중 `}
              <strong>{filteredData.length}</strong>개 용어 표시 (전체 {glossaryData.length}개)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
