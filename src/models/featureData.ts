// WMS 기능 정의서 데이터 모델

export interface Feature {
  id: string;
  category: FeatureCategory;
  priority: Priority;
}

export type FeatureCategory = 
  | 'inventory'      // 재고관리
  | 'picking'        // 피킹/패킹
  | 'return'         // 반품/불량
  | 'shipping'       // 출고/배송
  | 'system'         // 시스템/인증
  | 'report'         // 통계/리포트
  | 'config';        // 설정/관리

export type Priority = 'high' | 'medium' | 'low';

export const features: Feature[] = [
  // 재고 관리 (15개)
  { id: 'STK-001', category: 'inventory', priority: 'high' },
  { id: 'STK-002', category: 'inventory', priority: 'high' },
  { id: 'STK-003', category: 'inventory', priority: 'high' },
  { id: 'STK-004', category: 'inventory', priority: 'high' },
  { id: 'STK-005', category: 'inventory', priority: 'high' },
  { id: 'STK-006', category: 'inventory', priority: 'high' },
  { id: 'STK-007', category: 'inventory', priority: 'medium' },
  { id: 'STK-008', category: 'inventory', priority: 'medium' },
  { id: 'STK-009', category: 'inventory', priority: 'high' },
  { id: 'STK-010', category: 'inventory', priority: 'high' },
  { id: 'STK-011', category: 'inventory', priority: 'high' },
  { id: 'STK-012', category: 'inventory', priority: 'high' },
  { id: 'STK-013', category: 'inventory', priority: 'medium' },
  { id: 'STK-014', category: 'inventory', priority: 'medium' },
  { id: 'STK-015', category: 'inventory', priority: 'medium' },

  // 피킹/패킹 (10개)
  { id: 'PIC-001', category: 'picking', priority: 'high' },
  { id: 'PIC-002', category: 'picking', priority: 'high' },
  { id: 'PIC-003', category: 'picking', priority: 'high' },
  { id: 'PIC-004', category: 'picking', priority: 'high' },
  { id: 'PIC-005', category: 'picking', priority: 'high' },
  { id: 'PIC-006', category: 'picking', priority: 'high' },
  { id: 'PIC-007', category: 'picking', priority: 'medium' },
  { id: 'PIC-008', category: 'picking', priority: 'medium' },
  { id: 'PIC-009', category: 'picking', priority: 'low' },
  { id: 'PIC-010', category: 'picking', priority: 'medium' },

  // 반품/불량 (7개)
  { id: 'RET-001', category: 'return', priority: 'high' },
  { id: 'RET-002', category: 'return', priority: 'high' },
  { id: 'RET-003', category: 'return', priority: 'high' },
  { id: 'RET-004', category: 'return', priority: 'high' },
  { id: 'RET-005', category: 'return', priority: 'medium' },
  { id: 'RET-006', category: 'return', priority: 'medium' },
  { id: 'RET-007', category: 'return', priority: 'medium' },

  // 출고/배송 (5개)
  { id: 'OUT-001', category: 'shipping', priority: 'high' },
  { id: 'OUT-002', category: 'shipping', priority: 'high' },
  { id: 'OUT-003', category: 'shipping', priority: 'high' },
  { id: 'OUT-004', category: 'shipping', priority: 'medium' },
  { id: 'OUT-005', category: 'shipping', priority: 'low' },

  // 시스템/인증 (4개)
  { id: 'USER-001', category: 'system', priority: 'high' },
  { id: 'USER-002', category: 'system', priority: 'high' },
  { id: 'USER-003', category: 'system', priority: 'high' },
  { id: 'USER-004', category: 'system', priority: 'medium' },

  // 통계/리포트 (6개)
  { id: 'RPT-001', category: 'report', priority: 'high' },
  { id: 'RPT-002', category: 'report', priority: 'high' },
  { id: 'RPT-003', category: 'report', priority: 'medium' },
  { id: 'RPT-004', category: 'report', priority: 'medium' },
  { id: 'RPT-005', category: 'report', priority: 'medium' },
  { id: 'RPT-006', category: 'report', priority: 'low' },

  // 설정/관리 (4개)
  { id: 'CFG-001', category: 'config', priority: 'high' },
  { id: 'CFG-002', category: 'config', priority: 'high' },
  { id: 'CFG-003', category: 'config', priority: 'medium' },
  { id: 'CFG-004', category: 'config', priority: 'medium' },
];

export const categoryInfo = {
  inventory: { count: 15, color: 'blue' },
  picking: { count: 10, color: 'green' },
  return: { count: 7, color: 'orange' },
  shipping: { count: 5, color: 'purple' },
  system: { count: 4, color: 'gray' },
  report: { count: 6, color: 'red' },
  config: { count: 4, color: 'indigo' },
};
