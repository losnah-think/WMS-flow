'use client';

import { WarehouseDashboard, warehouseData } from '@/components/WarehouseVisualization';

export default function WarehouseVisualizationPage() {
  return (
    <main>
      <WarehouseDashboard warehouse={warehouseData} />
    </main>
  );
}
