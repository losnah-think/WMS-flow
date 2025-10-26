/**
 * 출고 프로세스 관련 타입 정의
 * 재고 확인부터 배송 인계까지의 전체 절차를 정의합니다.
 */

// ============ 기본 상태 정의 ============
export type OutboundRequestStatus = 
  | 'REQUEST_CREATED'      // 출고 요청
  | 'INVENTORY_ALLOCATED'  // 재고 할당 완료
  | 'INVENTORY_SHORTAGE'   // 재고 부족
  | 'PICKING_WAITING'      // 피킹 대기
  | 'PICKING_IN_PROGRESS'  // 피킹 중
  | 'PICKING_COMPLETED'    // 피킹 완료
  | 'INSPECTION_COMPLETED' // 검수 완료
  | 'INSPECTION_HOLD'      // 검수 보류
  | 'PACKING_IN_PROGRESS'  // 포장 중
  | 'PACKING_COMPLETED'    // 포장 완료
  | 'SHIPMENT_CONFIRMED'   // 출고 확정
  | 'COMPLETED';           // 최종 완료

// ============ 피킹 방식 ============
export type PickingMethod = 
  | 'SINGLE_PICK'          // 단일 피킹 (주문 1건씩)
  | 'BATCH_PICK'           // 배치 피킹 (여러 주문 동시)
  | 'ZONE_PICK';           // 존 피킹 (구역별 분담)

// ============ 액터 타입 ============
export type OutboundActorType = 
  | 'OMS'                  // OMS 시스템
  | 'SHIPPER'              // 화주사
  | 'WMS_SYSTEM'           // WMS 시스템
  | 'FIELD_WORKER'         // 현장 작업자 (피킹)
  | 'INSPECTOR'            // 검수 담당자
  | 'PACKER'               // 포장 담당자
  | 'SHIPMENT_OFFICER';    // 출하 담당자

// ============ 출고 상품 정보 ============
export interface OutboundItem {
  itemId: string;          // 상품ID
  productName: string;     // 상품명
  quantity: number;        // 출고 수량
  unit: string;            // 단위
  locationZone: string;    // 보관 존
  location: string;        // 정확한 로케이션
  weight?: number;         // 무게
  fragile?: boolean;       // 깨지기 쉬운 상품 여부
  specialHandling?: string;// 특별 처리 지시
}

// ============ 출고 요청 기본 정보 ============
export interface OutboundRequest {
  requestId: string;                    // 출고 요청 ID
  orderId: string;                      // 주문 ID (OMS)
  status: OutboundRequestStatus;        // 현재 상태
  
  // OMS/화주사 정보
  shipperId: string;                    // 화주사 ID
  shipperName: string;                  // 화주사명
  customerId?: string;                  // 최종 고객 ID
  
  // 요청 기본 정보
  requestDate: Date;                    // 요청 일시
  dueDate?: Date;                       // 배송 마감일
  items: OutboundItem[];                // 상품 목록
  totalQuantity: number;                // 총 수량
  totalWeight?: number;                 // 총 무게
  
  // 배송 정보
  destination: string;                  // 배송지
  shippingAddress?: string;             // 상세 주소
  recipientName?: string;               // 받는 사람
  recipientPhone?: string;              // 연락처
  
  // 피킹 정보
  pickingMethod: PickingMethod;         // 피킹 방식
  pickingInstructions?: string;         // 특별 피킹 지시
  assignedPickerId?: string;            // 할당된 피킹 작업자
  
  // 운송 정보
  shippingCompany?: string;             // 배송사
  trackingNumber?: string;              // 송장 번호
  shippingCost?: number;                // 배송비
  
  // 타임스탐프
  createdAt: Date;
  updatedAt: Date;
  allocationDate?: Date;                // 재고 할당 일시
  pickingStartDate?: Date;              // 피킹 시작 일시
  pickingCompletedDate?: Date;          // 피킹 완료 일시
  inspectionDate?: Date;                // 검수 일시
  packingCompletedDate?: Date;          // 포장 완료 일시
  shippedDate?: Date;                   // 출고 일시
  
  // 우선 순위 및 예외
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'; // 우선 순위
  remarks?: string;
  attachments?: string[];
}

// ============ 재고 할당 정보 ============
export interface InventoryAllocation {
  allocationId: string;
  requestId: string;
  items: AllocationItem[];
  status: 'ALLOCATED' | 'PARTIAL' | 'INSUFFICIENT';
  allocatedAt: Date;
  notes?: string;
}

export interface AllocationItem {
  itemId: string;
  requestedQuantity: number;
  allocatedQuantity: number;
  zone: string;
  location: string;
  status: 'ALLOCATED' | 'PARTIAL' | 'NOT_AVAILABLE';
}

// ============ 피킹 지시 및 기록 ============
export interface PickingInstruction {
  instructionId: string;
  requestId: string;
  pickingMethod: PickingMethod;
  items: PickingItem[];
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  pickedBy?: string;
  notes?: string;
}

export interface PickingItem {
  itemId: string;
  productName: string;
  quantity: number;
  zone: string;
  location: string;
  pickedQuantity?: number;
  barcodeScanned?: boolean;
  scanTime?: Date;
}

// ============ 검수 기록 ============
export interface InspectionRecord {
  inspectionId: string;
  requestId: string;
  inspectedBy: string;
  inspectionDate: Date;
  items: InspectionItem[];
  overallResult: 'PASS' | 'FAIL' | 'PARTIAL';
  issues?: string[];
  photos?: string[];
  notes?: string;
}

export interface InspectionItem {
  itemId: string;
  productName: string;
  pickedQuantity: number;
  inspectedQuantity: number;
  result: 'PASS' | 'FAIL';
  damageLevel?: 'NONE' | 'MINOR' | 'MAJOR';
  notes?: string;
}

// ============ 포장 기록 ============
export interface PackingRecord {
  packingId: string;
  requestId: string;
  packedBy: string;
  packingDate: Date;
  items: PackingItem[];
  totalPackages: number;
  totalWeight: number;
  trackingNumbers: string[];
  status: 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
}

export interface PackingItem {
  itemId: string;
  productName: string;
  quantity: number;
  packageNumber: number;
  weight: number;
}

// ============ 배송 정보 ============
export interface ShipmentInfo {
  shipmentId: string;
  requestId: string;
  shippingCompany: string;
  trackingNumber: string;
  departureTime: Date;
  estimatedDeliveryDate: Date;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  loadQuantity: number;
  loadWeight: number;
  status: 'LOADED' | 'IN_TRANSIT' | 'DELIVERED';
}

// ============ 상태 전이 이벤트 ============
export interface StateTransitionEvent {
  eventId: string;
  requestId: string;
  fromStatus: OutboundRequestStatus;
  toStatus: OutboundRequestStatus;
  actor: OutboundActorType;
  reason?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ============ 예외 처리 ============
export type OutboundExceptionType = 
  | 'INVENTORY_SHORTAGE'   // 재고 부족
  | 'PICKING_ERROR'        // 피킹 오류
  | 'BARCODE_MISMATCH'     // 바코드 불일치
  | 'INSPECTION_FAILED'    // 검수 실패
  | 'DAMAGED_ITEM'         // 상품 손상
  | 'URGENT_SHIPMENT'      // 긴급 출고
  | 'PARTIAL_DELIVERY'     // 부분 배송
  | 'DELIVERY_DELAY';      // 배송 지연

export interface ExceptionHandling {
  exceptionId: string;
  requestId: string;
  type: OutboundExceptionType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  resolutionMethod?: string;
  assignedTo?: string;
}

// ============ 재고 차감 기록 ============
export interface InventoryDeductionRecord {
  deductionId: string;
  requestId: string;
  timestamp: Date;
  items: DeductionItem[];
  status: 'COMPLETED' | 'FAILED' | 'PARTIAL';
  omsSyncStatus: 'SYNCED' | 'PENDING' | 'FAILED';
  notes?: string;
}

export interface DeductionItem {
  itemId: string;
  quantity: number;
  zone: string;
  previousQuantity: number;
  newQuantity: number;
  deductionStatus: 'SUCCESS' | 'FAILED';
}

// ============ KPI 지표 ============
export interface OutboundKPI {
  kpiId: string;
  requestId: string;
  
  // 시간 지표
  requestToPickingDuration: number;     // 요청~피킹 시간(분)
  pickingDuration: number;              // 피킹 소요 시간(분)
  inspectionDuration: number;           // 검수 소요 시간(분)
  packingDuration: number;              // 포장 소요 시간(분)
  totalProcessTime: number;             // 전체 소요 시간(분)
  
  // 정확도 지표
  pickingAccuracy: number;              // 피킹 정확도 (%)
  inspectionPassRate: number;           // 검수 통과율 (%)
  
  // 효율성 지표
  itemsPerMinute: number;               // 분당 처리 수량
  
  // 품질 지표
  damagedItems: number;                 // 손상된 상품 수
  returnRate?: number;                  // 반품율 (%)
}

// ============ 프로세스 플로우 정의 ============
export interface ProcessStep {
  stepId: string;
  stepName: string;
  description: string;
  actor: OutboundActorType;
  expectedDuration: number;             // 예상 소요 시간 (분)
  requiredInputs: string[];
  outputs: string[];
  successCriteria: string[];
  failurePath?: string;
}

export interface OutboundProcessFlow {
  flowId: string;
  name: string;
  version: string;
  steps: ProcessStep[];
  totalExpectedDuration: number;
  pickingMethods: PickingMethod[];
}
