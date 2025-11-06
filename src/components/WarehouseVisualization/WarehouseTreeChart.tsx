'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Warehouse, TreeNode, Location } from './types';
import { Card, Row, Col } from 'antd';

interface WarehouseTreeChartProps {
  warehouse: Warehouse;
  onNodeSelect?: (nodeId: string) => void;
  onLocationSelect?: (location: Location) => void;
}

const convertToTreeNode = (warehouse: Warehouse): TreeNode => {
  return {
    name: warehouse.name,
    emoji: '',
    value: warehouse.zones.reduce((sum, z) => sum + z.totalLocations, 0),
    info: `${warehouse.zones.length} Zones`,
    children: warehouse.zones.map((zone, zoneIdx) => ({
      name: zone.name,
      emoji: '',
      value: zone.totalLocations,
      info: `${zone.totalLocations} Locations`,
      children: zone.areas.map((area, areaIdx) => ({
        name: area.name,
        emoji: '',
        value: area.locations.length,
        info: `${area.locations.length} Locations`,
        locations: area.locations,
        children: area.locations.map((loc, locIdx) => ({
          name: loc.name,
          emoji: '',
          value: loc.capacity,
          info: `${loc.current}/${loc.capacity}`,
          locationData: loc
        }))
      }))
    }))
  };
};

export const WarehouseTreeChart: React.FC<WarehouseTreeChartProps> = ({
  warehouse,
  onNodeSelect,
  onLocationSelect
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [expandedDepth, setExpandedDepth] = useState<number>(4);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const treeData = convertToTreeNode(warehouse);

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const data = params.data;
          const depth = params.depth || 0;
          let levelName = '';
          
          if (depth === 0) levelName = 'Warehouse';
          else if (depth === 1) levelName = 'Zone';
          else if (depth === 2) levelName = 'Area';
          else if (depth === 3) levelName = 'Location';
          
          let tooltip = `
            <div style="padding: 10px; font-size: 12px; white-space: normal; max-width: 300px;">
              <div style="font-weight: bold; margin-bottom: 6px; color: #333;">
                ${data.name}
              </div>
              <div style="color: #666; margin-bottom: 4px;">Type: ${levelName}</div>
              ${data.info ? `<div style="color: #666; margin-bottom: 4px;">${data.info}</div>` : ''}
              ${data.value ? `<div style="color: #666;">Capacity: ${data.value}</div>` : ''}
              ${params.depth === 3 ? '<div style="color: #1890ff; margin-top: 6px; font-size: 11px; font-weight: bold;">Click to view details</div>' : ''}
          `;
          
          tooltip += `</div>`;
          return tooltip;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#bfbfbf',
        borderWidth: 1,
        textStyle: { color: '#333', fontSize: 12 },
        confine: true
      },
      series: [
        {
          type: 'tree',
          data: [treeData],
          top: '5%',
          left: '8%',
          right: '8%',
          bottom: '5%',
          symbol: 'circle',
          symbolSize: (val: any, params: any) => {
            const depth = params.depth || 0;
            if (depth === 0) return 40;
            if (depth === 1) return 32;
            if (depth === 2) return 28;
            return 24;
          },
          orient: 'TB',
          roam: false,
          expandAndCollapse: true,
          initialTreeDepth: 4,
          lineStyle: {
            width: 2,
            color: '#bfbfbf',
            curveness: 0.3
          },
          label: {
            position: 'bottom',
            distance: 6,
            fontSize: (val: any, params: any) => {
              const depth = params.depth || 0;
              if (depth === 0) return 11;
              if (depth === 1) return 10;
              if (depth === 2) return 9;
              return 10;
            },
            fontWeight: 600,
            color: (val: any, params: any) => {
              const depth = params.depth || 0;
              if (depth === 3) return '#d9534f';
              return '#262626';
            },
            backgroundColor: (val: any, params: any) => {
              const depth = params.depth || 0;
              if (depth === 3) return '#fff1f0';
              return '#fafafa';
            },
            borderColor: (val: any, params: any) => {
              const depth = params.depth || 0;
              if (depth === 3) return '#d9534f';
              return '#d9d9d9';
            },
            borderWidth: 1,
            borderRadius: 3,
            padding: [4, 8],
            formatter: (params: any) => {
              return params.data.name;
            }
          },
          itemStyle: {
            color: (params: any) => {
              const level = params.depth || 0;
              const colors = ['#1890ff', '#13c2c2', '#52c41a', '#faad14'];
              return colors[level % colors.length];
            },
            borderColor: '#fff',
            borderWidth: 2,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 4
          },
          leaves: {
            label: {
              position: 'right',
              distance: 6,
              fontSize: 8,
              color: '#595959'
            },
            itemStyle: {
              color: '#faad14',
              borderWidth: 1
            }
          }
        }
      ]
    };

    chart.setOption(option as any);

    // 노드 클릭 이벤트
    const handleClick = (params: any) => {
      if (params.depth === 3 && params.data.locationData) {
        setSelectedLocation(params.data.locationData);
        onLocationSelect?.(params.data.locationData);
      }
    };

    chart.on('click', handleClick);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.off('click', handleClick);
      chart.dispose();
    };
  }, [warehouse, onNodeSelect, onLocationSelect]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      <div
        ref={chartRef}
        style={{
          flex: 1,
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#fafafa',
          minHeight: '400px'
        }}
      />
      
      {/* 로케이션 상세 정보 */}
      {selectedLocation && (
        <Card 
          title="Location Details" 
          size="small"
          style={{ 
            background: '#f5f5f5',
            border: '2px solid #d9534f'
          }}
          styles={{
            body: {
              padding: '16px'
            }
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
                Location Code
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#d9534f' }}>
                {selectedLocation.name}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
                Location ID
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                {selectedLocation.id}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
                Current Stock
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                {selectedLocation.current.toFixed(0)} units
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
                Total Capacity
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#13c2c2' }}>
                {selectedLocation.capacity} units
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
                Utilization
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#faad14' }}>
                {Math.round((selectedLocation.current / selectedLocation.capacity) * 100)}%
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
                Position X
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                {selectedLocation.x}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
                Position Y
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                {selectedLocation.y}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
                Size (W×H)
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                {selectedLocation.width}×{selectedLocation.height}
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};
