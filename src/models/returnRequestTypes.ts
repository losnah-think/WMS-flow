/**
 * 반품 요청 프로세스 타입 정의
 */

// ============ 상태 정의 ============
export type ReturnRequestStatus =
  | 'RETURN_RECEIVED' // 반품 접수
  | 'RETURN_APPROVED' // 반품 승인
  | 'RETURN_REJECTED' // 반품 거부
  | 'INBOUND_WAIT' // 입고 대기
  | 'INBOUND_COMPLETED' // 입고 완료
  | 'INSPECTION_IN_PROGRESS' // 검수 중
  | 'REWORK_DECISION' // 처리 방법 결정
  | 'RESTOCKING_DECISION' // 재입고 결정
  | 'DEFECTIVE_CONVERSION' // 불량 재고 전환
  | 'DISPOSAL_TARGET' // 폐기 대상
  | 'DISPOSAL_APPROVAL_WAIT' // 폐기 승인 대기
  | 'RESTOCKING_COMPLETED' // 재입고 완료
  | 'DISPOSAL_COMPLETED' // 폐기 완료
  | 'COMPLETED'; // 완료

// ============ 검수 등급 ============
export type InspectionGrade = 'GRADE_A' | 'GRADE_B' | 'GRADE_C';

// ============ 반품 사유 ============
export type ReturnReason =
  | 'CUSTOMER_CHANGE_OF_MIND'
  | 'PRODUCT_DEFECT'
  | 'PRODUCT_DAMAGED'
  | 'SHIPPING_DAMAGE'
  | 'DELIVERY_DELAY'
  | 'WRONG_ITEM'
  | 'EXPIRATION_DATE'
  | 'OTHER';

// ============ 이벤트 타입 ============
export type ReturnRequestEventType =
  | 'REQUEST_RECEIVED'
  | 'RETURN_APPROVED'
  | 'RETURN_REJECTED'
  | 'PICKUP_INSTRUCTION_CREATED'
  | 'INBOUND_EXPECTED'
  | 'INBOUND_COMPLETED'
  | 'INSPECTION_STARTED'
  | 'INSPECTION_COMPLETED'
  | 'GRADE_DETERMINED'
  | 'REWORK_DECISION_MADE'
  | 'RESTOCKING_STARTED'
  | 'RESTOCKING_COMPLETED'
  | 'DISPOSAL_APPROVED'
  | 'DISPOSAL_COMPLETED'
  | 'REFUND_PROCESSED'
  | 'COMPLETED'
  | 'CANCELLED';

// ============ 예외 타입 ============
export type ReturnException =
  | 'RETURN_OUTSIDE_WINDOW'
  | 'INELIGIBLE_PRODUCT'
  | 'DEFECT_NOT_FOUND'
  | 'SEVERE_DAMAGE'
  | 'EXPIRED_PRODUCT'
  | 'MISSING_DOCUMENTATION';

// ============ 인터페이스 ============

/**
 * 반품 요청 항목
 */
export interface ReturnRequestItem {
  itemId: string;
  sku: string;
  productName: string;
  quantity: number;
  originalPrice: number;
  refundAmount: number;
  reason: ReturnReason;
  inspectionGrade?: InspectionGrade;
  gradeReason?: string;
}

/**
 * 반품 승인 정보
 */
export interface ReturnApproval {
  approvalId: string;
  approvedAt: Date;
  approvedBy: string;
  pickupAddress: string;
  pickupWindowStart: Date;
  pickupWindowEnd: Date;
  pickupInstructions: string;
}

/**
 * 반품 거부 정보
 */
export interface ReturnRejection {
  rejectionId: string;
  rejectedAt: Date;
  rejectedBy: string;
  rejectionReason: string;
  notifiedAt?: Date;
}

/**
 * 반품 입고 정보
 */
export interface ReturnInboundInfo {
  inboundId: string;
  trackingNumber: string;
  receivedAt: Date;
  receivedBy: string;
  returnZone: string;
  physicalCondition: string;
  damageReport?: string;
}

/**
 * 검수 기록
 */
export interface InspectionDetail {
  inspectionId: string;
  itemId: string;
  inspectionDate: Date;
  inspectedBy: string;
  appearanceCheck: {
    packaging: 'UNOPENED' | 'OPENED' | 'DAMAGED';
    productCondition: 'PERFECT' | 'MINOR_DAMAGE' | 'SEVERE_DAMAGE';
    remarks?: string;
  };
  functionalityCheck?: {
    tested: boolean;
    result: 'WORKING' | 'NOT_WORKING' | 'PARTIALLY_WORKING';
    remarks?: string;
  };
  expirationDateCheck?: {
    checked: boolean;
    expiredDate?: Date;
    result: 'VALID' | 'EXPIRED' | 'EXPIRING_SOON';
  };
  grade: InspectionGrade;
  gradeReason: string;
  estimatedRepairCost?: number;
}

/**
 * 처리 결정
 */
export interface ReworkDecision {
  decisionId: string;
  itemId: string;
  decidedAt: Date;
  decidedBy: string;
  decision: 'RESTOCKING' | 'REPAIR' | 'DISPOSAL';
  reason: string;
  repairEstimate?: {
    cost: number;
    duration: number; // 일수
  };
  disposalApprovalRequired: boolean;
}

/**
 * 재입고 실행
 */
export interface RestockingExecution {
  restockingId: string;
  itemId: string;
  restockingDate: Date;
  restockedBy: string;
  locationId: string;
  zone: string;
  quantity: number;
  notes?: string;
}

/**
 * 폐기 승인
 */
export interface DisposalApproval {
  approvalId: string;
  itemId: string;
  approvedAt: Date;
  approvedBy: string; // 창고장/관리자
  approvalReason: string;
  disposalDeadline: Date;
}

/**
 * 폐기 실행
 */
export interface DisposalExecution {
  disposalId: string;
  itemId: string;
  disposalDate: Date;
  disposalMethod: 'INCINERATION' | 'RECYCLING' | 'DONATION' | 'LANDFILL';
  disposedBy: string;
  quantity: number;
  certificateNumber?: string;
  photosUrl?: string[];
  notes?: string;
}

/**
 * 환불 정보
 */
export interface RefundInfo {
  refundId: string;
  totalRefundAmount: number;
  refundReason: string;
  refundMethod: 'ORIGINAL_PAYMENT' | 'CREDIT' | 'VOUCHER';
  processedAt?: Date;
  processedBy?: string;
  refundStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  omsRefundId?: string;
}

/**
 * 상태 전이 이벤트
 */
export interface ReturnRequestStateTransitionEvent {
  eventId: string;
  requestId: string;
  fromStatus: ReturnRequestStatus;
  toStatus: ReturnRequestStatus;
  eventType: ReturnRequestEventType;
  actor?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  exceptionType?: ReturnException;
  exceptionMessage?: string;
}

/**
 * KPI 정보
 */
export interface ReturnRequestKPI {
  kpiId: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  date: Date;
  totalReturnRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageProcessingTime: number; // 시간
  gradeARate: number; // %
  gradeBRate: number; // %
  gradeCRate: number; // %
  restockingRate: number; // %
  disposalRate: number; // %
  refundAmount: number;
  averageRefundAmount: number;
  customerSatisfactionScore: number;
}

/**
 * 메인 반품 요청 객체
 */
export interface ReturnRequest {
  requestId: string;
  orderId: string;
  omsOrderId: string;
  status: ReturnRequestStatus;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  items: ReturnRequestItem[];
  reasons: Map<string, ReturnReason>;
  totalRefundAmount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // 처리 정보
  approval?: ReturnApproval;
  rejection?: ReturnRejection;
  inboundInfo?: ReturnInboundInfo;
  inspectionDetails: InspectionDetail[];
  reworkDecisions: ReworkDecision[];
  restockingExecutions: RestockingExecution[];
  disposalApprovals: DisposalApproval[];
  disposalExecutions: DisposalExecution[];
  refundInfo?: RefundInfo;
  
  // 고객 정보
  customerInfo: {
    customerId: string;
    customerName: string;
    returnAddress: string;
    phoneNumber: string;
    email?: string;
  };
  
  // 이벤트 및 예외
  events: ReturnRequestStateTransitionEvent[];
  exceptions: ReturnException[];
  lastUpdatedBy?: string;
  kpis?: ReturnRequestKPI;
}

/**
 * 상태 전이 허용 매핑
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<ReturnRequestStatus, ReturnRequestStatus[]> =
  {
    RETURN_RECEIVED: ['RETURN_APPROVED', 'RETURN_REJECTED'],
    RETURN_APPROVED: ['INBOUND_WAIT'],
    RETURN_REJECTED: [],
    INBOUND_WAIT: ['INBOUND_COMPLETED'],
    INBOUND_COMPLETED: ['INSPECTION_IN_PROGRESS'],
    INSPECTION_IN_PROGRESS: ['REWORK_DECISION'],
    REWORK_DECISION: ['RESTOCKING_DECISION', 'DEFECTIVE_CONVERSION', 'DISPOSAL_TARGET'],
    RESTOCKING_DECISION: ['RESTOCKING_COMPLETED'],
    DEFECTIVE_CONVERSION: ['DISPOSAL_TARGET', 'RESTOCKING_COMPLETED'],
    DISPOSAL_TARGET: ['DISPOSAL_APPROVAL_WAIT'],
    DISPOSAL_APPROVAL_WAIT: ['DISPOSAL_COMPLETED'],
    RESTOCKING_COMPLETED: ['COMPLETED'],
    DISPOSAL_COMPLETED: ['COMPLETED'],
    COMPLETED: [],
  };

/**
 * 상태별 담당자 권한
 */
export const STATUS_ACTOR_PERMISSIONS: Record<ReturnRequestStatus, string[]> = {
  RETURN_RECEIVED: ['CUSTOMER_SERVICE', 'ADMIN'],
  RETURN_APPROVED: ['CUSTOMER_SERVICE', 'ADMIN'],
  RETURN_REJECTED: ['CUSTOMER_SERVICE', 'ADMIN'],
  INBOUND_WAIT: ['WMS_SYSTEM', 'ADMIN'],
  INBOUND_COMPLETED: ['INBOUND_STAFF', 'ADMIN'],
  INSPECTION_IN_PROGRESS: ['INSPECTION_STAFF', 'ADMIN'],
  REWORK_DECISION: ['RETURN_MANAGER', 'ADMIN'],
  RESTOCKING_DECISION: ['RESTOCKING_STAFF', 'ADMIN'],
  DEFECTIVE_CONVERSION: ['RETURN_MANAGER', 'ADMIN'],
  DISPOSAL_TARGET: ['DISPOSAL_STAFF', 'ADMIN'],
  DISPOSAL_APPROVAL_WAIT: ['WAREHOUSE_MANAGER', 'ADMIN'],
  RESTOCKING_COMPLETED: ['WMS_SYSTEM', 'ADMIN'],
  DISPOSAL_COMPLETED: ['DISPOSAL_STAFF', 'ADMIN'],
  COMPLETED: ['ADMIN', 'OMS_OPERATOR'],
};

/**
 * 검수 등급별 재입고 정책
 */
export const INSPECTION_GRADE_POLICY: Record<
  InspectionGrade,
  {
    restockingAllowed: boolean;
    refundPercentage: number;
    requiresApproval: boolean;
  }
> = {
  GRADE_A: {
    restockingAllowed: true,
    refundPercentage: 100,
    requiresApproval: false,
  },
  GRADE_B: {
    restockingAllowed: true,
    refundPercentage: 80,
    requiresApproval: true,
  },
  GRADE_C: {
    restockingAllowed: false,
    refundPercentage: 50,
    requiresApproval: true,
  },
};

/**
 * 반품 사유별 처리 정책
 */
export const RETURN_REASON_POLICY: Record<
  ReturnReason,
  {
    returnWindowDays: number;
    refundPercentage: number;
    restockingAllowed: boolean;
  }
> = {
  CUSTOMER_CHANGE_OF_MIND: {
    returnWindowDays: 30,
    refundPercentage: 100,
    restockingAllowed: true,
  },
  PRODUCT_DEFECT: {
    returnWindowDays: 365,
    refundPercentage: 100,
    restockingAllowed: false,
  },
  PRODUCT_DAMAGED: {
    returnWindowDays: 365,
    refundPercentage: 100,
    restockingAllowed: false,
  },
  SHIPPING_DAMAGE: {
    returnWindowDays: 14,
    refundPercentage: 100,
    restockingAllowed: false,
  },
  DELIVERY_DELAY: {
    returnWindowDays: 7,
    refundPercentage: 100,
    restockingAllowed: true,
  },
  WRONG_ITEM: {
    returnWindowDays: 30,
    refundPercentage: 100,
    restockingAllowed: true,
  },
  EXPIRATION_DATE: {
    returnWindowDays: 365,
    refundPercentage: 100,
    restockingAllowed: false,
  },
  OTHER: {
    returnWindowDays: 30,
    refundPercentage: 80,
    restockingAllowed: false,
  },
};
