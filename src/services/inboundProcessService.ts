/**
 * 입고 요청 프로세스 관리 서비스
 * 상태 전이, 검증, 예외 처리 등을 담당합니다.
 */

import {
  InboundRequest,
  InboundRequestStatus,
  ActorType,
  ApprovalRequest,
  ZoneAssignment,
  InspectionRecord,
  StateTransitionEvent,
  ExceptionHandling,
  ExceptionType,
  InventorySyncRecord,
} from '@/models/inboundTypes';

class InboundProcessService {
  /**
   * 입고 요청 생성
   * 화주사가 입고 요청을 생성합니다.
   */
  createInboundRequest(data: Partial<InboundRequest>): InboundRequest {
    const requestId = this.generateId('IBR');
    const now = new Date();

    return {
      requestId,
      status: 'REQUEST_WAITING',
      shipperId: data.shipperId || '',
      shipperName: data.shipperName || '',
      requestDate: now,
      expectedArrivalDate: data.expectedArrivalDate || this.addDays(now, 1),
      items: data.items || [],
      totalQuantity: data.items?.reduce((sum: number, item) => sum + item.quantity, 0) || 0,
      inboundType: data.inboundType || 'NORMAL',
      requiresApproval: data.requiresApproval ?? true,
      createdAt: now,
      updatedAt: now,
      remarks: data.remarks,
      attachments: data.attachments,
    };
  }

  /**
   * 입고 유형 분류 및 승인 필요 여부 판단
   * WMS 시스템이 자동으로 판정합니다.
   */
  classifyAndDetermine(request: InboundRequest): {
    inboundType: string;
    requiresApproval: boolean;
    reason: string;
  } {
    const totalAmount = request.items.reduce(
      (sum: number, item) => sum + (item.quantity * (request.totalQuantity || 1)),
      0
    );

    // 규칙 기반 분류
    let inboundType = 'NORMAL';
    let requiresApproval = false;

    if (totalAmount > 100000) {
      inboundType = 'LARGE_ORDER';
      requiresApproval = true;
    }

    if (request.items.some((item) => item.specialHandling)) {
      inboundType = 'SPECIAL_HANDLING';
      requiresApproval = true;
    }

    if (request.inboundType === 'RETURN') {
      inboundType = 'RETURN';
      requiresApproval = true;
    }

    return {
      inboundType,
      requiresApproval,
      reason: `분류: ${inboundType}, 승인 필요: ${requiresApproval ? '예' : '아니오'}`,
    };
  }

  /**
   * 상태 전이 가능 여부 검증
   */
  canTransition(
    currentStatus: InboundRequestStatus,
    nextStatus: InboundRequestStatus
  ): { allowed: boolean; reason?: string } {
    const validTransitions: Record<InboundRequestStatus, InboundRequestStatus[]> = {
      REQUEST_WAITING: ['APPROVAL_WAITING', 'ZONE_ASSIGNED'],
      APPROVAL_WAITING: ['APPROVAL_COMPLETED', 'APPROVAL_REJECTED'],
      APPROVAL_COMPLETED: ['ZONE_ASSIGNED'],
      APPROVAL_REJECTED: ['REQUEST_WAITING'],
      ZONE_ASSIGNED: ['ZONE_WAITING', 'INBOUND_COMPLETED'],
      ZONE_WAITING: ['ZONE_ASSIGNED'],
      INBOUND_COMPLETED: ['HOLD', 'DONE'],
      HOLD: ['INBOUND_COMPLETED'],
      DONE: [],
    };

    const allowed = validTransitions[currentStatus]?.includes(nextStatus) ?? false;

    return {
      allowed,
      reason: allowed ? undefined : `${currentStatus}에서 ${nextStatus}로 전이 불가능`,
    };
  }

  /**
   * 입고 요청 상태 업데이트
   */
  transitionStatus(
    request: InboundRequest,
    newStatus: InboundRequestStatus,
    actor: ActorType,
    reason?: string
  ): {
    success: boolean;
    request?: InboundRequest;
    error?: string;
    event?: StateTransitionEvent;
  } {
    const validation = this.canTransition(request.status, newStatus);

    if (!validation.allowed) {
      return {
        success: false,
        error: validation.reason,
      };
    }

    const updatedRequest = {
      ...request,
      status: newStatus,
      updatedAt: new Date(),
    };

    // 상태별 추가 업데이트
    if (newStatus === 'APPROVAL_COMPLETED') {
      updatedRequest.approvedAt = new Date();
    }

    if (newStatus === 'DONE') {
      updatedRequest.completedAt = new Date();
    }

    const event: StateTransitionEvent = {
      eventId: this.generateId('EVT'),
      requestId: request.requestId,
      fromStatus: request.status,
      toStatus: newStatus,
      actor,
      reason,
      timestamp: new Date(),
    };

    return {
      success: true,
      request: updatedRequest,
      event,
    };
  }

  /**
   * 승인 요청 생성
   */
  createApprovalRequest(requestId: string): ApprovalRequest {
    return {
      approvalId: this.generateId('APR'),
      requestId,
      status: 'PENDING',
      requiredApprover: 'WAREHOUSE_MANAGER',
      requestedAt: new Date(),
    };
  }

  /**
   * 승인 처리
   */
  approveRequest(
    approval: ApprovalRequest,
    approverId: string,
    approved: boolean,
    reason?: string
  ): ApprovalRequest {
    return {
      ...approval,
      status: approved ? 'APPROVED' : 'REJECTED',
      approvedAt: new Date(),
      approvedBy: approverId,
      reason,
    };
  }

  /**
   * 존 할당
   */
  assignZone(
    requestId: string,
    zone: string,
    zoneName: string,
    availableSpace: number,
    requiredSpace: number
  ): {
    success: boolean;
    assignment?: ZoneAssignment;
    error?: string;
  } {
    if (availableSpace < requiredSpace) {
      return {
        success: false,
        error: `존 공간 부족: 필요 ${requiredSpace}, 가용 ${availableSpace}`,
      };
    }

    const assignment: ZoneAssignment = {
      assignmentId: this.generateId('ZON'),
      requestId,
      zone,
      zoneName,
      capacity: availableSpace + requiredSpace,
      currentUsage: availableSpace,
      availableSpace: availableSpace - requiredSpace,
      assignedAt: new Date(),
      status: 'ASSIGNED',
      locations: this.generateLocations(zone, Math.ceil(requiredSpace / 100)),
    };

    return {
      success: true,
      assignment,
    };
  }

  /**
   * 검수 기록 생성
   */
  createInspectionRecord(
    requestId: string,
    request: InboundRequest,
    inspectedBy: string
  ): InspectionRecord {
    const items = request.items.map((item) => ({
      itemId: item.itemId,
      productName: item.productName,
      expectedQuantity: item.quantity,
      actualQuantity: 0, // 검수 중에 입력됨
      result: 'PASS' as const,
      damageLevel: 'NONE' as const,
    }));

    return {
      inspectionId: this.generateId('INS'),
      requestId,
      inspectedBy,
      inspectionDate: new Date(),
      items,
      overallResult: 'PASS',
      passedQuantity: 0,
      failedQuantity: 0,
    };
  }

  /**
   * 예외 처리 등록
   */
  createException(
    requestId: string,
    type: ExceptionType,
    description: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH'
  ): ExceptionHandling {
    return {
      exceptionId: this.generateId('EXC'),
      requestId,
      type,
      severity,
      description,
      detectedAt: new Date(),
    };
  }

  /**
   * 재고 동기화 기록
   */
  recordInventorySync(
    requestId: string,
    items: Array<{
      itemId: string;
      quantity: number;
      zone: string;
      location: string;
    }>
  ): InventorySyncRecord {
    return {
      syncId: this.generateId('SYN'),
      requestId,
      timestamp: new Date(),
      syncType: 'PRE_ALLOCATION',
      items: items.map(item => ({
        ...item,
        syncStatus: 'PENDING' as const,
      })),
      status: 'PENDING',
    };
  }

  /**
   * SLA 체크 (승인 지연)
   */
  checkApprovalSLA(
    approvalRequest: ApprovalRequest,
    slaDurationMinutes: number = 60
  ): { exceeded: boolean; delayMinutes?: number } {
    const elapsedMinutes =
      (new Date().getTime() - approvalRequest.requestedAt.getTime()) / (1000 * 60);

    return {
      exceeded: elapsedMinutes > slaDurationMinutes,
      delayMinutes: elapsedMinutes,
    };
  }

  // ============ 유틸리티 함수 ============

  private generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${randomStr}`.toUpperCase();
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private generateLocations(zone: string, count: number): string[] {
    return Array.from({ length: count }, (_, i) => `${zone}-${String(i + 1).padStart(3, '0')}`);
  }
}

export const inboundProcessService = new InboundProcessService();
