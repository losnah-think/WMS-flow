'use client';

import React, { useState } from 'react';
import { GlossaryTreeChart } from './GlossaryTreeChart';

interface GlossaryItem {
  term: string;
  description: string;
  category: string;
  examples?: string[];
}

const glossaryData: GlossaryItem[] = [
  {
    term: 'WMS',
    description: '창고 관리 시스템. 입출고, 재고, 배송 등 창고 운영 전체를 자동화하고 관리하는 소프트웨어',
    category: '시스템',
    examples: ['FULGO WMS는 물류사의 창고 운영을 효율적으로 관리']
  },
  {
    term: 'OMS',
    description: '주문 관리 시스템. 화주사의 입출고 요청, 주문 정보를 수집하고 WMS에 전달',
    category: '시스템',
    examples: ['FULGO OMS는 화주사의 주문을 받아 WMS로 전달']
  },
  {
    term: '입고',
    description: '상품이 창고에 들어오는 과정. 상품 수령 → 검수 → 적치',
    category: '프로세스',
    examples: ['화주가 상품 100개를 발주하면 창고에 입고']
  },
  {
    term: '출고',
    description: '상품이 창고에서 나가는 과정. 피킹 → 검수 → 포장 → 배송',
    category: '프로세스',
    examples: ['고객 주문에 맞춰 상품을 출고']
  },
  {
    term: '반품',
    description: '고객이 구매한 상품을 반품하는 과정. 반품 신청 → 검수 → 재입고 또는 폐기',
    category: '프로세스',
    examples: ['상품이 손상되어 반품 요청']
  },
  {
    term: '재고관리',
    description: '창고에 있는 상품의 수량, 상태를 추적 및 관리하는 일',
    category: '프로세스',
    examples: ['재고가 부족하면 발주, 초과되면 할인']
  },
  {
    term: '존',
    description: '창고를 용도별로 나눈 대분류 구역. 예: 의류존, 악세서리존, 신발존',
    category: '창고구조',
    examples: ['A존은 의류, B존은 악세서리 보관']
  },
  {
    term: '구역',
    description: '존 내부를 더 세분화한 단위. 한 존을 여러 구역으로 나눔',
    category: '창고구조',
    examples: ['A존-1구역, A존-2구역']
  },
  {
    term: '랙',
    description: '상품을 보관하는 선반. 높이별로 여러 단으로 구성',
    category: '창고구조',
    examples: ['랙 A-1의 3번째 단에 상품 보관']
  },
  {
    term: '로케이션',
    description: '창고 내 상품의 정확한 위치 코드. 예: A-01-01 (존-행-열)',
    category: '창고구조',
    examples: ['상품은 로케이션 B-03-05에 위치']
  },
  {
    term: '바코드',
    description: '상품을 식별하기 위한 코드. 스캔으로 빠르게 인식',
    category: '기술',
    examples: ['상품 바코드를 스캔하면 자동 인식']
  },
  {
    term: 'SKU',
    description: '상품 관리 코드. 각 상품마다 고유한 번호',
    category: '기술',
    examples: ['SKU-12345는 파란색 티셔츠']
  },
  {
    term: '피킹',
    description: '주문에 맞춰 창고에서 상품을 꺼내는 작업',
    category: '작업',
    examples: ['고객이 파란색 셔츠 5개 주문하면 피킹']
  },
  {
    term: '검수',
    description: '상품의 수량, 상태, 정확성을 확인하는 작업',
    category: '작업',
    examples: ['피킹한 상품이 맞는지 확인']
  },
  {
    term: '적치',
    description: '상품을 정해진 로케이션에 배치하는 작업',
    category: '작업',
    examples: ['입고한 상품을 A-01-01에 적치']
  },
  {
    term: '포장',
    description: '배송할 상품을 박스에 담고 송장을 붙이는 작업',
    category: '작업',
    examples: ['상품을 박스에 포장하고 송장 부착']
  },
  {
    term: '가용',
    description: '즉시 판매 및 출고 가능한 정상 상품',
    category: '재고상태',
    examples: ['완벽한 상태의 상품은 가용 상태']
  },
  {
    term: '예약',
    description: '주문이 들어와 출고 준비 중인 상품. 판매 불가능',
    category: '재고상태',
    examples: ['5개가 예약되면 다른 고객은 못 삼']
  },
  {
    term: '보류',
    description: '문제가 발생해 임시 보관 중인 상품. 확인 대기 중',
    category: '재고상태',
    examples: ['손상 의심 상품은 보류 상태']
  },
  {
    term: '불량',
    description: '파손, 오염 등으로 판매 불가능한 상품',
    category: '재고상태',
    examples: ['깨진 상품은 불량으로 분류']
  },
  {
    term: 'FIFO',
    description: 'First In First Out. 먼저 들어온 상품을 먼저 출고',
    category: '관리방식',
    examples: ['음료는 FIFO로 관리 (유효기한 고려)']
  },
  {
    term: 'FEFO',
    description: 'First Expire First Out. 유효기한이 빠른 상품을 먼저 출고',
    category: '관리방식',
    examples: ['식품은 FEFO로 관리']
  },
  {
    term: 'ABC분석',
    description: '상품을 판매량 기준으로 A(상위20%), B(중간30%), C(하위50%)로 분류',
    category: '분석',
    examples: ['A상품은 최우선 관리, C상품은 최저 우선순위']
  },
  {
    term: 'KPI',
    description: '핵심 성과 지표. 사업 목표 달성도를 측정하는 지표',
    category: '분석',
    examples: ['배송 시간, 정확도, 효율성이 KPI']
  },
  {
    term: '합배송',
    description: '여러 주문을 하나로 묶어 한 번에 배송',
    category: '배송방식',
    examples: ['같은 지역 3개 주문을 합쳐서 배송']
  }
];

export const GlossaryPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = Array.from(new Set(glossaryData.map(item => item.category)));

  const filteredData = glossaryData.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryStats = categories.map(cat => ({
    category: cat,
    count: glossaryData.filter(item => item.category === cat).length
  }));

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">📚 WMS 용어 설명</h1>
              <p className="text-gray-600 mt-2">물류 관리 시스템의 핵심 용어들을 체계적으로 이해하세요</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === 'tree'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🌳 트리 구조
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📋 목록
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {categoryStats.map(stat => (
              <div
                key={stat.category}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200 text-center hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory(selectedCategory === stat.category ? '' : stat.category)}
              >
                <div className="text-2xl font-bold text-blue-600">{stat.count}</div>
                <div className="text-xs text-gray-700 mt-1">{stat.category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {viewMode === 'tree' ? (
          // Tree View
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <GlossaryTreeChart />
          </div>
        ) : (
          // List View
          <div>
            {/* Search & Filter */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="🔍 용어 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              >
                <option value="">전체 카테고리</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  초기화
                </button>
              )}
            </div>

            {/* Results Info */}
            <div className="mb-6 text-sm text-gray-600">
              {filteredData.length > 0 ? (
                <p>검색 결과: <span className="font-bold text-blue-600">{filteredData.length}</span>개의 용어</p>
              ) : (
                <p className="text-red-600">검색 결과가 없습니다.</p>
              )}
            </div>

            {/* Glossary Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-blue-600"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-blue-600">{item.term}</h3>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  {item.examples && item.examples.length > 0 && (
                    <div className="bg-amber-50 p-3 rounded-lg border-l-2 border-amber-400">
                      <p className="text-xs font-semibold text-amber-700 mb-2">💡 예시:</p>
                      <ul className="space-y-1">
                        {item.examples.map((example, exIdx) => (
                          <li key={exIdx} className="text-sm text-gray-700">
                            • {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
