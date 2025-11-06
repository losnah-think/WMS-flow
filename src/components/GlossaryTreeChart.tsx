'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

interface TreeNode {
  name: string;
  description?: string;
  children?: TreeNode[];
  value?: number;
}

const glossaryTreeData: TreeNode = {
  name: 'FULGO WMS\n물류 관리 시스템',
  description: 'WMS 용어 체계도',
  children: [
    {
      name: '시스템\n(System)',
      children: [
        {
          name: 'WMS\n창고관리',
          description: '입출고, 재고, 배송 등 창고 운영 전체를 자동화하고 관리하는 소프트웨어'
        },
        {
          name: 'OMS\n주문관리',
          description: '화주사의 입출고 요청, 주문 정보를 수집하고 WMS에 전달'
        }
      ]
    },
    {
      name: '프로세스\n(Process)',
      children: [
        {
          name: '입고\n(Inbound)',
          description: '상품 수령 → 검수 → 적치'
        },
        {
          name: '출고\n(Outbound)',
          description: '피킹 → 검수 → 포장 → 배송'
        },
        {
          name: '반품\n(Return)',
          description: '반품 신청 → 검수 → 재입고 또는 폐기'
        },
        {
          name: '재고관리\n(Inventory)',
          description: '수량, 상태를 추적 및 관리'
        }
      ]
    },
    {
      name: '창고구조\n(Structure)',
      children: [
        {
          name: '존\n(Zone)',
          description: '용도별 대분류 구역 (의류존, 악세서리존 등)'
        },
        {
          name: '구역\n(Area)',
          description: '존 내부 세분화 단위'
        },
        {
          name: '랙\n(Rack)',
          description: '상품 보관 선반'
        },
        {
          name: '로케이션\n(Location)',
          description: '창고 내 정확한 위치 코드 (A-01-01)'
        }
      ]
    },
    {
      name: '작업 & 기술\n(Operations)',
      children: [
        {
          name: '피킹\n(Picking)',
          description: '주문에 맞춰 상품을 꺼내기'
        },
        {
          name: '검수\n(Inspection)',
          description: '수량, 상태, 정확성 확인'
        },
        {
          name: '적치\n(Placement)',
          description: '로케이션에 상품 배치'
        },
        {
          name: '포장\n(Packing)',
          description: '배송 준비 및 송장 부착'
        },
        {
          name: '바코드\n(Barcode)',
          description: '상품 식별 코드'
        },
        {
          name: 'SKU\n(Stock Code)',
          description: '상품 관리 고유 번호'
        }
      ]
    },
    {
      name: '재고상태\n(Status)',
      children: [
        {
          name: '가용\n(Available)',
          description: '즉시 판매 가능한 정상 상품'
        },
        {
          name: '예약\n(Reserved)',
          description: '주문이 들어와 출고 준비 중'
        },
        {
          name: '보류\n(Hold)',
          description: '문제 발생해 임시 보관 중'
        },
        {
          name: '불량\n(Defective)',
          description: '판매 불가능한 상품'
        }
      ]
    },
    {
      name: '관리방식\n(Management)',
      children: [
        {
          name: 'FIFO\n(First In First Out)',
          description: '먼저 들어온 상품을 먼저 출고'
        },
        {
          name: 'FEFO\n(First Expire First Out)',
          description: '유효기한이 빠른 상품부터 출고'
        },
        {
          name: 'ABC분석\n(ABC Analysis)',
          description: '판매량 기준 분류 (A/B/C)'
        },
        {
          name: 'KPI\n(Performance)',
          description: '핵심 성과 지표'
        }
      ]
    }
  ]
};

export const GlossaryTreeChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          if (params.data?.description) {
            return `<div class="p-2">
              <div class="font-semibold text-blue-600">${params.name}</div>
              <div class="text-sm text-gray-700 mt-1">${params.data.description}</div>
            </div>`;
          }
          return params.name;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: { color: '#333' }
      },
      series: [
        {
          type: 'tree',
          data: [glossaryTreeData],
          top: '10%',
          left: '5%',
          bottom: '10%',
          right: '5%',
          symbolSize: [90, 50],
          roam: true,
          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750,
          label: {
            position: 'top',
            verticalAlign: 'middle',
            align: 'center',
            fontSize: 12,
            fontWeight: 'bold',
            color: '#1f2937',
            backgroundColor: '#f0f9ff',
            borderRadius: 6,
            padding: [6, 12],
            borderColor: '#3b82f6',
            borderWidth: 1.5
          },
          itemStyle: {
            borderRadius: 8,
            borderWidth: 2,
            color: '#dbeafe',
            borderColor: '#3b82f6'
          },
          lineStyle: {
            width: 2,
            color: '#60a5fa',
            curveness: 0.5
          },
          leaves: {
            label: {
              position: 'right',
              align: 'left',
              fontSize: 11,
              color: '#374151',
              backgroundColor: '#fef3c7',
              borderColor: '#f59e0b',
              borderWidth: 1,
              borderRadius: 4,
              padding: [4, 8]
            },
            itemStyle: {
              color: '#fef3c7',
              borderColor: '#f59e0b',
              borderWidth: 1.5
            }
          }
        }
      ]
    } as any;

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg overflow-hidden">
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-md max-w-sm">
        <h3 className="font-bold text-blue-700 mb-2">📊 WMS 용어 체계도</h3>
        <p className="text-sm text-gray-600">
          마우스로 드래그하여 이동, 스크롤로 확대/축소 가능합니다. 노드에 마우스를 올려 상세 설명을 확인하세요.
        </p>
      </div>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
