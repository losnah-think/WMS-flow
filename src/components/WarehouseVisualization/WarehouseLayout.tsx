'use client';

import React, { useState } from 'react';
import { Warehouse, Location } from './types';

interface WarehouseLayoutProps {
  warehouse: Warehouse;
  onLocationSelect?: (location: Location) => void;
  selectedLocation?: Location | null;
}

export const WarehouseLayout: React.FC<WarehouseLayoutProps> = ({
  warehouse,
  onLocationSelect,
  selectedLocation
}) => {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const warehouseWidth = 1400;
  const warehouseHeight = 350;

  return (
    <div style={{ overflow: 'auto', borderRadius: '8px', background: '#fafafa' }}>
      <svg
        width={warehouseWidth}
        height={warehouseHeight}
        style={{
          border: '2px solid #d9d9d9',
          background: '#fff'
        }}
      >
        {/* Background Grid */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e8e8e8" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={warehouseWidth} height={warehouseHeight} fill="url(#grid)" />

        {/* Zone Display */}
        {warehouse.zones.map((zone, zoneIndex) => {
          const zoneColors = ['#e6f7ff', '#e6fffb', '#fff1f0'];
          const zoneBorderColors = ['#1890ff', '#13c2c2', '#f5222d'];
          const zoneX = zoneIndex === 0 ? 50 : zoneIndex === 1 ? 450 : 950;
          const zoneY = 30;

          return (
            <g key={`zone-${zone.id}`}>
              {/* Zone Background */}
              <rect
                x={zoneX}
                y={zoneY}
                width={350}
                height={300}
                fill={zoneColors[zoneIndex]}
                stroke={zoneBorderColors[zoneIndex]}
                strokeWidth="2"
                rx="4"
              />

              {/* Zone Label */}
              <text
                x={zoneX + 10}
                y={zoneY + 20}
                fontSize="16"
                fontWeight="bold"
                fill={zoneBorderColors[zoneIndex]}
              >
                {zone.name}
              </text>

              {/* Area Display */}
              {zone.areas.map((area, areaIndex) => {
                const areaX = zoneX + area.x - zoneX;
                const areaY = zoneY + area.y - 30;

                return (
                  <g key={`area-${area.id}`}>
                    {/* Area Background */}
                    <rect
                      x={areaX}
                      y={areaY}
                      width={area.width}
                      height={area.height}
                      fill="none"
                      stroke={zoneBorderColors[zoneIndex]}
                      strokeWidth="1"
                      strokeDasharray="3,3"
                      opacity="0.5"
                    />

                    {/* Area Label */}
                    <text
                      x={areaX + 5}
                      y={areaY + 15}
                      fontSize="11"
                      fontWeight="bold"
                      fill={zoneBorderColors[zoneIndex]}
                      opacity="0.7"
                    >
                      {area.name}
                    </text>

                    {/* Location Boxes */}
                    {area.locations.map((location) => {
                      const isSelected = selectedLocation?.id === location.id;
                      const isHovered = hoveredLocation === location.id;
                      const fillPercentage = (location.current / location.capacity) * 100;
                      const fillColor = 
                        fillPercentage < 30 ? '#52c41a' :
                        fillPercentage < 70 ? '#faad14' :
                        '#f5222d';

                      return (
                        <g
                          key={`location-${location.id}`}
                          onClick={() => onLocationSelect?.(location)}
                          onMouseEnter={() => setHoveredLocation(location.id)}
                          onMouseLeave={() => setHoveredLocation(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* 배경 */}
                          <rect
                            x={location.x}
                            y={location.y}
                            width={location.width}
                            height={location.height}
                            fill="#fff"
                            stroke={isSelected ? '#1890ff' : isHovered ? fillColor : '#d9d9d9'}
                            strokeWidth={isSelected || isHovered ? 2 : 1}
                            opacity={isSelected || isHovered ? 1 : 0.8}
                          />

                          {/* 채워진 부분 (재고) */}
                          <rect
                            x={location.x}
                            y={location.y + (location.height * (100 - fillPercentage)) / 100}
                            width={location.width}
                            height={(location.height * fillPercentage) / 100}
                            fill={fillColor}
                            opacity="0.6"
                          />

                          {/* 로케이션 ID 표시 */}
                          {location.width > 25 && location.height > 25 && (
                            <text
                              x={location.x + location.width / 2}
                              y={location.y + location.height / 2 + 3}
                              fontSize="8"
                              textAnchor="middle"
                              fill="#333"
                              fontWeight="bold"
                              pointerEvents="none"
                            >
                              {location.id.split('-')[2]}
                            </text>
                          )}

                          {/* 호버 정보 */}
                          {isHovered && (
                            <title>
                              {location.name} - {location.current}/{location.capacity}
                            </title>
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(1200, 30)">
          <rect width="180" height="300" fill="#fff" stroke="#d9d9d9" strokeWidth="1" rx="4" />
          
          <text x="10" y="20" fontSize="12" fontWeight="bold" fill="#333">
            Legend
          </text>

          {/* Stock Level Legend */}
          <text x="10" y="45" fontSize="11" fontWeight="bold" fill="#666">
            Stock Level:
          </text>

          {[
            { label: 'Low (0-30%)', color: '#52c41a' },
            { label: 'Medium (30-70%)', color: '#faad14' },
            { label: 'High (70-100%)', color: '#f5222d' }
          ].map((item, idx) => (
            <g key={`legend-${idx}`} transform={`translate(0, ${60 + idx * 25})`}>
              <rect x="10" y="0" width="12" height="12" fill={item.color} opacity="0.6" />
              <text x="28" y="10" fontSize="10" fill="#333">
                {item.label}
              </text>
            </g>
          ))}

          {/* Zone Legend */}
          <text x="10" y="200" fontSize="11" fontWeight="bold" fill="#666">
            Zones:
          </text>

          {[
            { label: 'Zone A', color: '#1890ff' },
            { label: 'Zone B', color: '#13c2c2' },
            { label: 'Zone C', color: '#f5222d' }
          ].map((item, idx) => (
            <g key={`zone-legend-${idx}`} transform={`translate(0, ${215 + idx * 20})`}>
              <text x="10" y="10" fontSize="11" fill={item.color} fontWeight="bold">
                {item.label}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Information Panel */}
      {selectedLocation && (
        <div
          style={{
            padding: '12px',
            background: '#fafafa',
            borderTop: '1px solid #d9d9d9',
            fontSize: '12px'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Selected Location: {selectedLocation.name}
          </div>
          <div>ID: {selectedLocation.id}</div>
          <div>Capacity: {selectedLocation.current} / {selectedLocation.capacity}</div>
          <div>Utilization: {Math.round((selectedLocation.current / selectedLocation.capacity) * 100)}%</div>
          <div>위치: ({selectedLocation.x}, {selectedLocation.y})</div>
        </div>
      )}
    </div>
  );
};
