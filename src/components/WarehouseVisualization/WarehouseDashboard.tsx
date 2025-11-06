'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Tabs, Empty, Spin } from 'antd';
import {
  HomeOutlined,
  BgColorsOutlined,
  EnvironmentOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { Warehouse, Location } from './types';
import { WarehouseTreeChart } from './WarehouseTreeChart';
import { WarehouseLayout } from './WarehouseLayout';

interface WarehouseDashboardProps {
  warehouse: Warehouse;
  loading?: boolean;
}

export const WarehouseDashboard: React.FC<WarehouseDashboardProps> = ({
  warehouse,
  loading = false
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // 통계 계산
  const totalLocations = warehouse.zones.reduce((sum, z) => sum + z.totalLocations, 0);
  const totalCapacity = warehouse.zones.reduce(
    (sum, z) =>
      sum +
      z.areas.reduce(
        (aSum, a) =>
          aSum + a.locations.reduce((lSum, l) => lSum + l.capacity, 0),
        0
      ),
    0
  );
  const totalCurrent = warehouse.zones.reduce(
    (sum, z) =>
      sum +
      z.areas.reduce(
        (aSum, a) =>
          aSum + a.locations.reduce((lSum, l) => lSum + l.current, 0),
        0
      ),
    0
  );
  const utilizationRate = Math.round((totalCurrent / totalCapacity) * 100);

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          {warehouse.name}
        </h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0' }}>
          Real-time Warehouse Monitoring
        </p>
      </div>

      {/* Main Statistics */}
      <Card
        style={{ marginBottom: '20px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)' }}
        styles={{ body: { padding: '16px' } }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Total Locations"
              value={totalLocations}
              prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Zones"
              value={warehouse.zones.length}
              prefix={<BgColorsOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2', fontWeight: 'bold' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Total Capacity"
              value={totalCapacity}
              suffix="units"
              prefix={<HomeOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Utilization"
              value={utilizationRate}
              suffix="%"
              prefix={<EnvironmentOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Zone Statistics */}
      <Card title="Zone Statistics" style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          {warehouse.zones.map((zone, idx) => {
            const zoneLocations = zone.areas.reduce((sum, a) => sum + a.locations.length, 0);
            const zoneCapacity = zone.areas.reduce(
              (sum, a) => sum + a.locations.reduce((lSum, l) => lSum + l.capacity, 0),
              0
            );
            const zoneCurrent = zone.areas.reduce(
              (sum, a) => sum + a.locations.reduce((lSum, l) => lSum + l.current, 0),
              0
            );
            const zoneUtilization = Math.round((zoneCurrent / zoneCapacity) * 100);

            const colors = ['#1890ff', '#13c2c2', '#f5222d'];

            return (
              <Col xs={24} sm={12} lg={8} key={`zone-stat-${zone.id}`}>
                <Card
                  style={{
                    background: `${colors[idx]}15`,
                    border: `2px solid ${colors[idx]}`
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: colors[idx], fontWeight: 'bold' }}>
                      {zone.name}
                    </h3>
                  </div>
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Locations</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: colors[idx] }}>
                        {zoneLocations}
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Utilization</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: colors[idx] }}>
                        {zoneUtilization}%
                      </div>
                    </Col>
                    <Col span={24}>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {zoneCurrent} / {zoneCapacity}
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* Visualization Tabs */}
      <Card style={{ marginBottom: '20px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'overview',
              label: 'Overview',
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card
                      title="Structure Diagram"
                      size="small"
                      style={{ height: '700px' }}
                      styles={{ body: { height: '660px', padding: '12px' } }}
                    >
                      <WarehouseTreeChart
                        warehouse={warehouse}
                        onNodeSelect={(nodeId) => {
                          console.log('Selected node:', nodeId);
                        }}
                        onLocationSelect={setSelectedLocation}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card
                      title="Floor Plan"
                      size="small"
                      style={{ height: '500px' }}
                      styles={{ body: { height: '460px', padding: '12px' } }}
                    >
                      <WarehouseLayout
                        warehouse={warehouse}
                        selectedLocation={selectedLocation}
                        onLocationSelect={setSelectedLocation}
                      />
                    </Card>
                  </Col>
                </Row>
              )
            },
            {
              key: 'layout',
              label: 'Full Layout',
              children: (
                <Card
                  styles={{ body: { height: '600px', padding: '12px' } }}
                >
                  <WarehouseLayout
                    warehouse={warehouse}
                    selectedLocation={selectedLocation}
                    onLocationSelect={setSelectedLocation}
                  />
                </Card>
              )
            },
            {
              key: 'hierarchy',
              label: 'Hierarchy',
              children: (
                <Card
                  styles={{ body: { height: '800px', padding: '12px' } }}
                >
                  <WarehouseTreeChart
                    warehouse={warehouse}
                    onNodeSelect={(nodeId) => {
                      console.log('Selected node:', nodeId);
                    }}
                    onLocationSelect={setSelectedLocation}
                  />
                </Card>
              )
            }
          ]}
        />
      </Card>

      {/* Selected Location Details */}
      {selectedLocation && (
        <Card title="Location Details">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                Location ID
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {selectedLocation.id}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                Location Name
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {selectedLocation.name}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                Current Stock
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                {selectedLocation.current}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                Total Capacity
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#13c2c2' }}>
                {selectedLocation.capacity}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                Utilization
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#faad14' }}>
                {Math.round((selectedLocation.current / selectedLocation.capacity) * 100)}%
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                Position X
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {selectedLocation.x}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                Position Y
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {selectedLocation.y}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                Size (W×H)
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {selectedLocation.width}×{selectedLocation.height}
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};
