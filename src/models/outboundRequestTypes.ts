/**
 * 출고 요청 프로세스 타입 정의
 */

// ============ 상태 정의 ============
export type OutboundRequestStatus =
  | 'OUTBOUND_REQUEST' // 출고 요청
  | 'INVENTORY_ALLOCATED' // 재고 할당 완료
  | 'INVENTORY_SHORTAGE' // 재고 부족
  | 'PICKING_WAIT' // 피킹 대기
  | 'PICKING_IN_PROGRESS' // 피킹 중
  | 'PICKING_COMPLETED' // 피킹 완료
  | 'INSPECTION_WAIT' // 검수 대기
  | 'INSPECTION_PASSED' // 검수 통과
  | 'INSPECTION_HOLD' // 검수 보류
  | 'PACKING_IN_PROGRESS' // 포장 중
  | 'PACKING_COMPLETED' // 포장 완료
  | 'SHIPMENT_CONFIRMED' // 출고 확정
  | 'COMPLETED' // 완료
  | 'CANCELLED'; // 취소

// ============ 피킹 방식 ============
export type PickingMethod = 'SINGLE_PICK' | 'BATCH_PICK' | 'ZONE_PICK';

// ============ 이벤트 타입 ============
export type OutboundRequestEventType =
  | 'REQUEST_CREATED'
  | 'INVENTORY_CHECKED'
  | 'INVENTORY_ALLOCATED'
  | 'INVENTORY_SHORTAGE'
  | 'PICKING_INSTRUCTION_CREATED'
  | 'PICKING_STARTED'
  | 'BARCODE_SCANNED'
  | 'PICKING_COMPLETED'
  | 'INSPECTION_STARTED'
  | 'INSPECTION_PASSED'
  | 'INSPECTION_FAILED'
  | 'REPICKING_REQUIRED'
  | 'PACKING_STARTED'
  | 'WAYBILL_GENERATED'
  | 'PACKING_COMPLETED'
  | 'SHIPMENT_CONFIRMED'
  | 'INVENTORY_DEDUCTED'
  | 'OMS_SYNCHRONIZED'
  | 'COMPLETED'
  | 'CANCELLED';

// ============ 예외 타입 ============
export type OutboundException =
  | 'INVENTORY_INSUFFICIENT'
  | 'BARCODE_MISMATCH'
  | 'PRODUCT_MISMATCH'
  | 'PRODUCT_DAMAGED'
  | 'URGENT_SHIPMENT'
  | 'LOCATION_NOT_FOUND'
  | 'PICKING_ERROR';

// ============ 인터페이스 ============

/**
 * 출고 요청 항목
 */
export interface OutboundRequestItem {
  itemId: string;
  sku: string;
  productName: string;
  requestedQuantity: number;
  allocatedQuantity: number;
  pickedQuantity: number;
  inspectedQuantity: number;
  packedQuantity: number;
  shippedQuantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * 재고 할당 정보
 */
export interface InventoryAllocation {
  allocationId: string;
  itemId: string;
  allocatedQuantity: number;
  locationId: string;
  zone: string;
  reservedAt: Date;
  status: 'ALLOCATED' | 'PICKED' | 'CANCELLED';
}

/**
 * 피킹 지시
 */
export interface PickingInstruction {
  instructionId: string;
  requestId: string;
  itemId: string;
  quantity: number;
  fromLocation: string;
  toStagingArea: string;
  pickingMethod: PickingMethod;
  assignedTo?: string;
  priorityLevel: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: Date;
  completedAt?: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

/**
 * 바코드 스캔 기록
 */
export interface BarcodeScanned {
  scanId: string;
  instructionId: string;
  scannedBarcode: string;
  expectedBarcode: string;
  isMatched: boolean;
  quantity: number;
  scannedAt: Date;
  scannedBy: string;
  location?: string;
}

/**
 * 검수 기록
 */
export interface InspectionRecord {
  inspectionId: string;
  requestId: string;
  itemId: string;
  requestedQuantity: number;
  inspectedQuantity: number;
  inspectionDate: Date;
  inspectedBy: string;
  status: 'PASSED' | 'FAILED' | 'PARTIAL';
  notes?: string;
  failureReasons?: string[];
}

/**
 * 포장 정보
 */
export interface PackingInfo {
  packingId: string;
  requestId: string;
  items: OutboundRequestItem[];
  totalWeight: number;
  packageDimensions: {
    length: number;
    width: number;
    height: number;
  };
  waybillNumber?: string;
  generatedAt?: Date;
  packedBy?: string;
  packedAt?: Date;
}

/**
 * 송장 정보
 */
export interface Waybill {
  waybillId: string;
  waybillNumber: string;
  requestId: string;
  carrier: string;
  carrier_service: string;
  from_address: string;
  to_address: string;
  weight: number;
  generateDate: Date;
  estimatedDeliveryDate?: Date;
}

/**
 * 출고 확정 정보
 */
export interface ShipmentConfirmation {
  confirmationId: string;
  requestId: string;
  loadedAt: Date;
  loadedBy: string;
  waybill: Waybill;
  shippedAt: Date;
  shippedBy: string;
  cargoQuantity: number;
  omsNotified: boolean;
}

/**
 * 상태 전이 이벤트
 */
export interface OutboundRequestStateTransitionEvent {
  eventId: string;
  requestId: string;
  fromStatus: OutboundRequestStatus;
  toStatus: OutboundRequestStatus;
  eventType: OutboundRequestEventType;
  actor?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  exceptionType?: OutboundException;
  exceptionMessage?: string;
}

/**
 * KPI 정보
 */
export interface OutboundRequestKPI {
  kpiId: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  date: Date;
  totalRequests: number;
  completedRequests: number;
  averagePickingTime: number; // 분
  averageInspectionTime: number; // 분
  averagePackingTime: number; // 분
  totalPickingTime: number; // 분
  pickingAccuracy: number; // %
  inspectionFailureRate: number; // %
  partialShipmentRate: number; // %
  averageOrderValue: number;
  onTimeShipmentRate: number; // %
  carriageExceptionRate: number; // %
}

/**
 * 메인 출고 요청 객체
 */
export interface OutboundRequest {
  requestId: string;
  orderId: string;
  omsOrderId: string;
  status: OutboundRequestStatus;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  items: OutboundRequestItem[];
  allocations: InventoryAllocation[];
  pickingInstructions: PickingInstruction[];
  pickingMethod: PickingMethod;
  barcodeScans: BarcodeScanned[];
  inspectionRecords: InspectionRecord[];
  packingInfo?: PackingInfo;
  waybill?: Waybill;
  shipmentConfirmation?: ShipmentConfirmation;
  totalAmount: number;
  requiredDeliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  events: OutboundRequestStateTransitionEvent[];
  exceptions: OutboundException[];
  lastUpdatedBy?: string;
  customerInfo: {
    customerId: string;
    customerName: string;
    shippingAddress: string;
    phoneNumber: string;
  };
  kpis?: OutboundRequestKPI;
}

/**
 * 상태 전이 허용 매핑
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<OutboundRequestStatus, OutboundRequestStatus[]> =
  {
    OUTBOUND_REQUEST: ['INVENTORY_ALLOCATED', 'INVENTORY_SHORTAGE', 'CANCELLED'],
    INVENTORY_ALLOCATED: ['PICKING_WAIT', 'CANCELLED'],
    INVENTORY_SHORTAGE: [],
    PICKING_WAIT: ['PICKING_IN_PROGRESS'],
    PICKING_IN_PROGRESS: ['PICKING_COMPLETED', 'PICKING_WAIT'],
    PICKING_COMPLETED: ['INSPECTION_WAIT'],
    INSPECTION_WAIT: ['INSPECTION_PASSED', 'INSPECTION_HOLD'],
    INSPECTION_PASSED: ['PACKING_IN_PROGRESS'],
    INSPECTION_HOLD: ['PICKING_IN_PROGRESS', 'CANCELLED'],
    PACKING_IN_PROGRESS: ['PACKING_COMPLETED'],
    PACKING_COMPLETED: ['SHIPMENT_CONFIRMED'],
    SHIPMENT_CONFIRMED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
  };

/**
 * 상태별 담당자 권한
 */
export const STATUS_ACTOR_PERMISSIONS: Record<OutboundRequestStatus, string[]> = {
  OUTBOUND_REQUEST: ['WMS_SYSTEM', 'ADMIN'],
  INVENTORY_ALLOCATED: ['WMS_SYSTEM', 'ADMIN'],
  INVENTORY_SHORTAGE: ['ADMIN', 'OMS_OPERATOR'],
  PICKING_WAIT: ['PICKING_STAFF', 'ADMIN'],
  PICKING_IN_PROGRESS: ['PICKING_STAFF', 'ADMIN'],
  PICKING_COMPLETED: ['PICKING_STAFF', 'ADMIN'],
  INSPECTION_WAIT: ['INSPECTION_STAFF', 'ADMIN'],
  INSPECTION_PASSED: ['INSPECTION_STAFF', 'ADMIN'],
  INSPECTION_HOLD: ['INSPECTION_STAFF', 'ADMIN'],
  PACKING_IN_PROGRESS: ['PACKING_STAFF', 'ADMIN'],
  PACKING_COMPLETED: ['PACKING_STAFF', 'ADMIN'],
  SHIPMENT_CONFIRMED: ['SHIPPING_STAFF', 'ADMIN'],
  COMPLETED: ['ADMIN', 'OMS_OPERATOR'],
  CANCELLED: ['ADMIN', 'OMS_OPERATOR'],
};
