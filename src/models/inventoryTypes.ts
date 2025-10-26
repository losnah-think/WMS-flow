/**
 * 재고 관리 프로세스 관련 타입 정의
 * 재고 상태, 로케이션, 동기화를 관리합니다.
 */

// ============ 재고 상태 정의 ============
export type InventoryStatus =
  | 'AVAILABLE'           // 가용 재고 (출고 가능)
  | 'RESERVED'            // 예약 재고 (출고 예정)
  | 'HOLD'                // 보류 재고 (문제 발생)
  | 'DAMAGED'             // 불량 재고 (폐기 대기)
  | 'DISPOSED';           // 폐기 완료

// ============ 온도 요구사항 ============
export type TemperatureZone =
  | 'AMBIENT'             // 상온
  | 'CHILLED'             // 냉장 (0~4℃)
  | 'FROZEN'              // 냉동 (-18℃ 이하)
  | 'HAZARDOUS';          // 위험물

// ============ 재고 수량 구조 ============
export interface InventoryQuantity {
  physicalQuantity: number;     // 물리 재고 (실제 보유)
  availableQuantity: number;    // 가용 재고 (출고 가능)
  reservedQuantity: number;     // 예약 재고 (출고 예정)
  safetyStockQuantity: number;  // 안전 재고 (최소 유지)
  holdQuantity: number;         // 보류 재고 (문제 중)
  damagedQuantity: number;      // 불량 재고 (폐기 예정)
}

// ============ 재고 항목 정보 ============
export interface InventoryItem {
  itemId: string;                       // 상품 ID
  sku: string;                          // SKU
  productName: string;                  // 상품명
  category: string;                     // 카테고리
  
  // 상품 속성
  quantity: InventoryQuantity;          // 수량 정보
  temperatureZone: TemperatureZone;    // 온도 요구사항
  weight?: number;                      // 무게
  volume?: number;                      // 부피
  fragile?: boolean;                    // 깨지기 쉬운 상품
  expirationDate?: Date;                // 유효기한
  
  // 로케이션 정보
  currentLocation?: string;             // 현재 로케이션
  zone?: string;                        // 현재 존
  
  // 통계
  lastInboundDate?: Date;               // 마지막 입고 일시
  lastOutboundDate?: Date;              // 마지막 출고 일시
  averageStayDays?: number;             // 평균 보관 일수
  turnoverRate?: number;                // 회전율 (회/년)
  
  // 상태
  status: InventoryStatus;              // 현재 상태
  createdAt: Date;
  updatedAt: Date;
}

// ============ 로케이션 정보 ============
export interface Location {
  locationId: string;                   // 로케이션 ID
  zone: string;                         // 존 (Zone A, Zone B 등)
  row: number;                          // 행
  column: number;                       // 열
  level: number;                        // 층
  rack?: string;                        // 랙 번호
  
  // 용량 정보
  maxCapacity: number;                  // 최대 수용량
  currentOccupancy: number;             // 현재 점유
  availableCapacity: number;            // 가용 공간
  
  // 로케이션 설정
  temperatureZone: TemperatureZone;    // 온도 구역
  allowedItemTypes?: string[];          // 허용 상품 유형
  isPriority?: boolean;                 // 우선 피킹 위치
  
  // 상태
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  lastAssignedDate?: Date;
  occupancyRate: number;                // 점유율 (%)
}

// ============ 존(Zone) 정보 ============
export interface Zone {
  zoneId: string;
  zoneName: string;
  zoneCode: string;                     // A, B, C 등
  
  // 존 특성
  temperatureZone: TemperatureZone;
  totalLocations: number;               // 총 로케이션 수
  activeLocations: number;              // 활성 로케이션 수
  
  // 용량 정보
  totalCapacity: number;                // 총 용량
  currentOccupancy: number;             // 현재 점유
  occupancyRate: number;                // 점유율 (%)
  
  // 현황
  itemCount: number;                    // 상품 종류 수
  totalQuantity: number;                // 총 수량
  availableQuantity: number;            // 가용 수량
  
  // 상태
  status: 'OPERATIONAL' | 'FULL' | 'MAINTENANCE';
}

// ============ 재고 이동 기록 ============
export interface InventoryMovement {
  movementId: string;
  itemId: string;
  quantity: number;
  
  // 이동 경로
  fromLocation?: string;
  toLocation?: string;
  fromZone?: string;
  toZone?: string;
  
  // 이동 사유
  movementType: 'INBOUND' | 'OUTBOUND' | 'REALLOCATION' | 'ADJUSTMENT' | 'DISPOSAL';
  relatedId?: string;                   // 관련 입고/출고 ID
  
  // 상태 변화
  previousStatus?: InventoryStatus;
  newStatus?: InventoryStatus;
  
  // 작업자 정보
  movedBy?: string;
  movedAt: Date;
  notes?: string;
}

// ============ 재고 조정 기록 ============
export interface InventoryAdjustment {
  adjustmentId: string;
  itemId: string;
  
  // 조정 수량
  quantity: number;                     // 조정 수량 (증가/감소)
  reason: 'PHYSICAL_COUNT' | 'DAMAGE' | 'EXPIRATION' | 'ERROR_CORRECTION' | 'OTHER';
  
  // 조정 전후
  beforeQuantity: number;
  afterQuantity: number;
  
  // 조정 정보
  adjustedBy: string;                   // 조정자
  adjustedAt: Date;
  verifiedBy?: string;                  // 검증자
  verifiedAt?: Date;
  
  // 문서화
  notes?: string;
  attachments?: string[];
}

// ============ 재고 모니터링 ============
export interface InventoryAlert {
  alertId: string;
  itemId: string;
  type: 'STOCK_LOW' | 'STOCK_OUT' | 'EXPIRATION_SOON' | 'LONG_AGING' | 'LOCATION_FULL' | 'QUALITY_ISSUE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // 알림 내용
  message: string;
  threshold?: number;                   // 임계값
  currentValue?: number;                // 현재값
  
  // 상태
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: Date;
  resolvedAt?: Date;
  
  // 액션
  recommendedAction?: string;
  assignedTo?: string;
}

// ============ 재고 동기화 기록 ============
export interface InventorySyncLog {
  syncId: string;
  timestamp: Date;
  
  // 동기화 대상
  syncType: 'TO_OMS' | 'FROM_OMS' | 'TO_ERP' | 'FROM_ERP' | 'FULL_SYNC';
  
  // 동기화 데이터
  itemsCount: number;
  successCount: number;
  failureCount: number;
  
  // 상태
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  errorMessage?: string;
  
  // 상세
  details?: SyncDetail[];
}

export interface SyncDetail {
  itemId: string;
  syncStatus: 'SUCCESS' | 'FAILED';
  reason?: string;
  previousValue?: number;
  newValue?: number;
}

// ============ 재고 KPI ============
export interface InventoryKPI {
  kpiId: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  date: Date;
  
  // 정확도 지표
  inventoryAccuracy: number;            // 재고 정확도 (%)
  countVariance: number;                // 실사 편차 (%)
  
  // 효율성 지표
  turnoverRate: number;                 // 회전율 (회/년)
  averageStayDays: number;              // 평균 체류 일수
  stockoutRate: number;                 // 품절율 (%)
  
  // 공간 활용
  spaceUtilization: number;             // 공간 활용도 (%)
  zoneUtilization: number;              // 존별 평균 활용도 (%)
  
  // 비용 지표
  holdingCostPerItem: number;           // 항목당 보관비
  totalHoldingCost: number;             // 총 보관비
  
  // 품질 지표
  damageRate: number;                   // 손상율 (%)
  expirationRate: number;               // 유효기한 초과율 (%)
}

// ============ 안전 재고 정책 ============
export interface SafetyStockPolicy {
  policyId: string;
  itemId: string;
  
  // 안전 재고 계산
  safetyStockQuantity: number;          // 안전 재고 수량
  reorderPoint: number;                 // 재주문점
  reorderQuantity: number;              // 재주문량
  
  // 기간
  leadTimeDays: number;                 // 리드 타임
  demandVariabilityFactor: number;      // 수요 변동성 계수
  serviceLevel: number;                 // 서비스 레벨 (%)
  
  // 적용
  createdAt: Date;
  updatedAt: Date;
  appliedBy: string;
}

// ============ 재고 분석 ============
export interface InventoryAnalysis {
  analysisId: string;
  date: Date;
  
  // ABC 분석
  categoryA: ABCItem[];                 // 고가치 상품
  categoryB: ABCItem[];                 // 중가치 상품
  categoryC: ABCItem[];                 // 저가치 상품
  
  // 느린 이동 상품
  slowMovingItems: SlowMovingItem[];
  
  // 과잉 재고
  overstockedItems: OverstockedItem[];
  
  // 손상/만료
  damagedAndExpiredItems: DamagedItem[];
}

export interface ABCItem {
  itemId: string;
  sku: string;
  annualValue: number;
  percentageOfTotal: number;
  quantity: number;
}

export interface SlowMovingItem {
  itemId: string;
  sku: string;
  lastSaleDate: Date;
  daysSinceLastSale: number;
  quantity: number;
  estimatedMonthsToSell: number;
}

export interface OverstockedItem {
  itemId: string;
  sku: string;
  currentQuantity: number;
  safetyStockQuantity: number;
  excess: number;
  suggestedAction: string;
}

export interface DamagedItem {
  itemId: string;
  sku: string;
  damagedQuantity: number;
  expiryDate?: Date;
  daysTillExpiry?: number;
  disposition: 'RETURN_TO_SHIPPER' | 'DISPOSAL' | 'DISCOUNT_SALE' | 'DONATION';
}

// ============ 재고 실사 기록 ============
export interface PhysicalCount {
  countId: string;
  countDate: Date;
  countType: 'FULL_COUNT' | 'CYCLE_COUNT' | 'SPOT_CHECK';
  
  // 참여자
  conductedBy: string[];                // 실사 담당자
  supervisedBy: string;                 // 감독자
  
  // 범위
  zonesIncluded: string[];              // 포함된 존
  itemsCounted: number;                 // 실사 상품 수
  
  // 결과
  items: CountItem[];
  discrepancyCount: number;             // 편차 건수
  accuracy: number;                     // 정확도 (%)
  
  // 상태
  status: 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
  completedAt?: Date;
  verifiedAt?: Date;
  notes?: string;
}

export interface CountItem {
  itemId: string;
  sku: string;
  systemQuantity: number;               // 시스템 수량
  countedQuantity: number;              // 실사 수량
  discrepancy: number;                  // 편차
  discrepancyPercentage: number;        // 편차율
  variance: 'CORRECT' | 'OVER' | 'SHORT';
}
