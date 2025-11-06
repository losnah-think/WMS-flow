'use client';

import React from 'react';
import { WarehouseDashboard, warehouseData } from '@/components/WarehouseVisualization';

export default function GlossaryRoute() {
  return <WarehouseDashboard warehouse={warehouseData} />;
}
