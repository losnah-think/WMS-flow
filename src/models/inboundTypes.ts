/**
 * 입고 요청 관련 타입 정의
 * 입고 요청부터 출고까지의 전체 절차를 정의합니다.
 */

// ============ 기본 상태 정의 ============
export type InboundRequestStatus = 
  | 'REQUEST_WAITING'      // 요청 대기
  | 'APPROVAL_WAITING'     // 승인 대기
  | 'APPROVAL_COMPLETED'   // 승인 완료
  | 'APPROVAL_REJECTED'    // 반려
  | 'ZONE_ASSIGNED'        // 존 할당 완료
  | 'ZONE_WAITING'         // 존 대기 (공간 부족)
  | 'INBOUND_COMPLETED'    // 입고 완료
  | 'HOLD'                 // 보류 (검수 실패)
  | 'DONE';                // 최종 완료

// ============ 액터 타입 ============
export type ActorType = 
  | 'SHIPPER'              // 화주사
  | 'WMS_SYSTEM'           // WMS 시스템
  | 'WAREHOUSE_MANAGER'    // 창고장/승인권자
  | 'FIELD_WORKER'         // 현장작업자
  | 'OMS_ERP';             // OMS/ERP

// ============ 입고 요청 상품 정보 ============
export interface InboundRequestItem {
  itemId: string;           // 상품ID
  productName: string;      // 상품명
  quantity: number;         // 수량
  unit: string;            // 단위 (EA, BOX, etc)
  weight?: number;         // 무게
  volume?: number;         // 부피
  specialHandling?: string; // 특별 처리 (냉동, 상온 등)
}

// ============ 입고 요청 기본 정보 ============
export interface InboundRequest {
  requestId: string;                    // 입고 요청 ID
  status: InboundRequestStatus;         // 현재 상태
  
  // 화주사 정보
  shipperId: string;                    // 화주사 ID
  shipperName: string;                  // 화주사명
  
  // 요청 기본 정보
  requestDate: Date;                    // 요청 일시
  expectedArrivalDate: Date;            // 예상 도착 일시
  items: InboundRequestItem[];          // 상품 목록
  totalQuantity: number;                // 총 수량
  
  // 분류 정보
  inboundType?: string;                 // 입고 유형 (정상, 반품, 반입 등)
  requiresApproval: boolean;            // 승인 필요 여부
  
  // 존 할당 정보
  assignedZone?: string;                // 할당된 존
  assignedLocation?: string;            // 할당된 로케이션
  zoneAssignmentDate?: Date;            // 존 할당 일시
  
  // 검수 정보
  inspectionDate?: Date;                // 검수 일시
  inspectionResult?: 'PASS' | 'FAIL';   // 검수 결과
  inspectionNotes?: string;             // 검수 메모
  
  // 타임스탬프
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  
  // 참고 정보
  remarks?: string;
  attachments?: string[];               // 첨부파일 경로
}

// ============ 승인 요청 정보 ============
export interface ApprovalRequest {
  approvalId: string;
  requestId: string;                    // 입고 요청 ID
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requiredApprover: string;             // 필요한 승인자 (권한)
  requestedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;                  // 승인자 ID
  reason?: string;                      // 승인/반려 사유
  notes?: string;                       // 비고
}

// ============ 존 할당 정보 ============
export interface ZoneAssignment {
  assignmentId: string;
  requestId: string;
  zone: string;                         // 존 코드
  zoneName: string;                     // 존명
  capacity: number;                     // 총 수용량
  currentUsage: number;                 // 현재 사용량
  availableSpace: number;               // 가용 공간
  assignedAt: Date;
  status: 'ASSIGNED' | 'WAITING' | 'REASSIGNED';
  locations?: string[];                 // 구체적 로케이션
}

// ============ 검수 기록 ============
export interface InspectionRecord {
  inspectionId: string;
  requestId: string;
  inspectedBy: string;                  // 검수자 ID
  inspectionDate: Date;
  items: InspectionItem[];
  overallResult: 'PASS' | 'FAIL' | 'PARTIAL';
  notes?: string;
  passedQuantity: number;
  failedQuantity: number;
  images?: string[];                    // 검수 사진
}

// ============ 검수 항목 ============
export interface InspectionItem {
  itemId: string;
  productName: string;
  expectedQuantity: number;
  actualQuantity: number;
  result: 'PASS' | 'FAIL';
  damageLevel?: 'NONE' | 'MINOR' | 'MAJOR'; // 손상 정도
  notes?: string;
}

// ============ 상태 전이 이벤트 ============
export interface StateTransitionEvent {
  eventId: string;
  requestId: string;
  fromStatus: InboundRequestStatus;
  toStatus: InboundRequestStatus;
  actor: ActorType;                     // 누가 전이시켰는가
  reason?: string;                      // 상태 변경 사유
  timestamp: Date;
  metadata?: Record<string, any>;       // 추가 정보
}

// ============ 예외 처리 ============
export type ExceptionType = 
  | 'APPROVAL_DELAY'       // 승인 지연
  | 'ZONE_SHORTAGE'        // 존 공간 부족
  | 'INSPECTION_FAILED'    // 검수 실패
  | 'INFO_MISMATCH'        // 정보 불일치
  | 'DELIVERY_DELAYED'     // 배송 지연
  | 'PARTIAL_ARRIVAL';     // 부분 도착

export interface ExceptionHandling {
  exceptionId: string;
  requestId: string;
  type: ExceptionType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH'; // 심각도
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  resolutionMethod?: string;            // 해결 방법
  assignedTo?: string;                  // 담당자
}

// ============ 재고 동기화 ============
export interface InventorySyncRecord {
  syncId: string;
  requestId: string;
  timestamp: Date;
  syncType: 'PRE_ALLOCATION' | 'POST_INSPECTION' | 'FINAL_CONFIRMATION';
  items: InventorySyncItem[];
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
}

export interface InventorySyncItem {
  itemId: string;
  quantity: number;
  zone: string;
  location: string;
  syncStatus: 'SYNCED' | 'PENDING' | 'FAILED';
}

// ============ 프로세스 플로우 정의 ============
export interface ProcessStep {
  stepId: string;
  stepName: string;
  description: string;
  actor: ActorType;
  expectedDuration: number;             // 예상 소요 시간 (분)
  requiredInputs: string[];
  outputs: string[];
  successCriteria: string[];
  failurePath?: string;                 // 실패시 이동 단계
}

export interface ProcessFlow {
  flowId: string;
  name: string;
  version: string;
  steps: ProcessStep[];
  totalExpectedDuration: number;        // 전체 예상 소요 시간
}
