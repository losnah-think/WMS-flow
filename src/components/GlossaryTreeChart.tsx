'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

interface TreeNode {
  name: string;
  description?: string;
  children?: TreeNode[];
  value?: number;
}

const warehouseStructureData: TreeNode = {
  name: '창고\n(Warehouse)',
  description: '물류 창고',
  children: [
    {
      name: '존 A\n(Zone A)',
      description: '의류 보관 구역',
      children: [
        {
          name: '구역 A-1\n(Area A-1)',
          description: '상의 보관 구역',
          children: [
            {
              name: '랙 A-1-1\n(Rack A-1-1)',
              description: '4단 선반',
              children: [
                {
                  name: '부분랙 1\n(Shelf 1)',
                  description: '높이: 0~1.5m',
                  children: [
                    {
                      name: '로케이션 A-1-1-1-1',
                      description: '상품 위치 코드'
                    },
                    {
                      name: '로케이션 A-1-1-1-2',
                      description: '상품 위치 코드'
                    },
                    {
                      name: '로케이션 A-1-1-1-3',
                      description: '상품 위치 코드'
                    }
                  ]
                },
                {
                  name: '부분랙 2\n(Shelf 2)',
                  description: '높이: 1.5~3m',
                  children: [
                    {
                      name: '로케이션 A-1-1-2-1',
                      description: '상품 위치 코드'
                    },
                    {
                      name: '로케이션 A-1-1-2-2',
                      description: '상품 위치 코드'
                    },
                    {
                      name: '로케이션 A-1-1-2-3',
                      description: '상품 위치 코드'
                    }
                  ]
                },
                {
                  name: '부분랙 3\n(Shelf 3)',
                  description: '높이: 3~4.5m',
                  children: [
                    {
                      name: '로케이션 A-1-1-3-1',
                      description: '상품 위치 코드'
                    },
                    {
                      name: '로케이션 A-1-1-3-2',
                      description: '상품 위치 코드'
                    }
                  ]
                },
                {
                  name: '부분랙 4\n(Shelf 4)',
                  description: '높이: 4.5~6m',
                  children: [
                    {
                      name: '로케이션 A-1-1-4-1',
                      description: '상품 위치 코드'
                    },
                    {
                      name: '로케이션 A-1-1-4-2',
                      description: '상품 위치 코드'
                    }
                  ]
                }
              ]
            },
            {
              name: '랙 A-1-2\n(Rack A-1-2)',
              description: '4단 선반',
              children: [
                {
                  name: '부분랙 1\n(Shelf 1)',
                  description: '높이: 0~1.5m',
                  children: [
                    {
                      name: '로케이션 A-1-2-1-1',
                      description: '상품 위치 코드'
                    },
                    {
                      name: '로케이션 A-1-2-1-2',
                      description: '상품 위치 코드'
                    }
                  ]
                },
                {
                  name: '부분랙 2\n(Shelf 2)',
                  description: '높이: 1.5~3m',
                  children: [
                    {
                      name: '로케이션 A-1-2-2-1',
                      description: '상품 위치 코드'
                    },
                    {
                      name: '로케이션 A-1-2-2-2',
                      description: '상품 위치 코드'
                    }
                  ]
                },
                {
                  name: '부분랙 3\n(Shelf 3)',
                  description: '높이: 3~4.5m',
                  children: [
                    {
                      name: '로케이션 A-1-2-3-1',
                      description: '상품 위치 코드'
                    }
                  ]
                },
                {
                  name: '부분랙 4\n(Shelf 4)',
                  description: '높이: 4.5~6m',
                  children: [
                    {
                      name: '로케이션 A-1-2-4-1',
                      description: '상품 위치 코드'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: '구역 A-2\n(Area A-2)',
          description: '하의 보관 구역',
          children: [
            {
              name: '랙 A-2-1\n(Rack A-2-1)',
              description: '4단 선반',
              children: [
                {
                  name: '부분랙 1\n(Shelf 1)',
                  children: [
                    {
                      name: '로케이션 A-2-1-1-1',
                      description: '상품 위치 코드'
                    },
                    {
                      name: '로케이션 A-2-1-1-2',
                      description: '상품 위치 코드'
                    }
                  ]
                },
                {
                  name: '부분랙 2\n(Shelf 2)',
                  children: [
                    {
                      name: '로케이션 A-2-1-2-1',
                      description: '상품 위치 코드'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: '존 B\n(Zone B)',
      description: '전자제품 보관 구역',
      children: [
        {
          name: '구역 B-1\n(Area B-1)',
          description: '휴대폰 보관 구역',
          children: [
            {
              name: '랙 B-1-1\n(Rack B-1-1)',
              description: '보안 보관함',
              children: [
                {
                  name: '부분랙 1\n(Shelf 1)',
                  children: [
                    {
                      name: '로케이션 B-1-1-1-1',
                      description: '상품 위치 코드'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: '구역 B-2\n(Area B-2)',
          description: '노트북 보관 구역',
          children: [
            {
              name: '랙 B-2-1\n(Rack B-2-1)',
              description: '안티정전 선반',
              children: [
                {
                  name: '부분랙 1\n(Shelf 1)',
                  children: [
                    {
                      name: '로케이션 B-2-1-1-1',
                      description: '상품 위치 코드'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: '존 C\n(Zone C)',
      description: '신발 보관 구역',
      children: [
        {
          name: '구역 C-1\n(Area C-1)',
          description: '스니커즈 보관',
          children: [
            {
              name: '랙 C-1-1\n(Rack C-1-1)',
              children: [
                {
                  name: '부분랙 1\n(Shelf 1)',
                  children: [
                    {
                      name: '로케이션 C-1-1-1-1',
                      description: '상품 위치 코드'
                    }
                  ]
                }
              ]
            }
          ]
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
          data: [warehouseStructureData],
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
        <h3 className="font-bold text-blue-700 mb-2">🏭 창고 구조 계층도</h3>
        <p className="text-sm text-gray-600">
          <strong>창고 → 존 → 구역 → 랙 → 부분랙 → 로케이션</strong><br />
          마우스로 드래그하여 이동, 스크롤로 확대/축소 가능합니다.
        </p>
      </div>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
