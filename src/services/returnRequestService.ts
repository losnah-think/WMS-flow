/**
 * 반품 요청 서비스
 * 반품 접수, 승인, 입고, 검수, 폐기, 환불을 관리합니다.
 */

import {
  ReturnRequest,
  ReturnRequestStatus,
  ReturnRequestItem,
  ReturnReason,
  InspectionGrade,
  ReturnApproval,
  ReturnRejection,
  ReturnInboundInfo,
  InspectionDetail,
  ReworkDecision,
  RestockingExecution,
  DisposalApproval,
  DisposalExecution,
  RefundInfo,
  ReturnRequestStateTransitionEvent,
  ReturnRequestKPI,
  ALLOWED_STATUS_TRANSITIONS,
  STATUS_ACTOR_PERMISSIONS,
  INSPECTION_GRADE_POLICY,
  RETURN_REASON_POLICY,
} from '@/models/returnRequestTypes';

class ReturnRequestService {
  /**
   * 반품 요청 생성
   */
  createReturnRequest(
    orderId: string,
    omsOrderId: string,
    items: ReturnRequestItem[],
    customerInfo: {
      customerId: string;
      customerName: string;
      returnAddress: string;
      phoneNumber: string;
      email?: string;
    },
    reasons: Map<string, ReturnReason>,
    priority: 'LOW' | 'NORMAL' | 'HIGH' = 'NORMAL'
  ): ReturnRequest {
    const totalRefundAmount = items.reduce((sum, item) => sum + item.refundAmount, 0);

    return {
      requestId: this.generateId('RRQ'),
      orderId,
      omsOrderId,
      status: 'RETURN_RECEIVED',
      priority,
      items,
      reasons,
      totalRefundAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'CUSTOMER',
      inspectionDetails: [],
      reworkDecisions: [],
      restockingExecutions: [],
      disposalApprovals: [],
      disposalExecutions: [],
      events: [this.createStateTransitionEvent(
        this.generateId('EVT'),
        this.generateId('RRQ'),
        'RETURN_RECEIVED' as ReturnRequestStatus,
        'RETURN_RECEIVED' as ReturnRequestStatus,
        'REQUEST_RECEIVED',
        'CUSTOMER'
      )],
      exceptions: [],
      customerInfo,
    };
  }

  /**
   * 반품 승인
   */
  approveReturn(
    request: ReturnRequest,
    approvedBy: string,
    pickupWindowDays: number = 7
  ): {
    success: boolean;
    request?: ReturnRequest;
    error?: string;
  } {
    const updatedRequest = { ...request };

    // 반품 정책 검증
    for (const item of request.items) {
      const policy = RETURN_REASON_POLICY[item.reason];
      if (!policy) {
        return {
          success: false,
          error: `알 수 없는 반품 사유: ${item.reason}`,
        };
      }
    }

    const pickupWindowStart = new Date();
    const pickupWindowEnd = new Date();
    pickupWindowEnd.setDate(pickupWindowEnd.getDate() + pickupWindowDays);

    const approval: ReturnApproval = {
      approvalId: this.generateId('APR'),
      approvedAt: new Date(),
      approvedBy,
      pickupAddress: request.customerInfo.returnAddress,
      pickupWindowStart,
      pickupWindowEnd,
      pickupInstructions: `반품 상품을 ${pickupWindowStart.toLocaleDateString()} ~ ${pickupWindowEnd.toLocaleDateString()} 사이에 발송해주세요.`,
    };

    updatedRequest.approval = approval;
    updatedRequest.status = 'RETURN_APPROVED';
    this.addStateTransitionEvent(
      updatedRequest,
      'RETURN_RECEIVED',
      'RETURN_APPROVED',
      approvedBy
    );

    return {
      success: true,
      request: updatedRequest,
    };
  }

  /**
   * 반품 거부
   */
  rejectReturn(
    request: ReturnRequest,
    rejectedBy: string,
    rejectionReason: string
  ): ReturnRequest {
    const updatedRequest = { ...request };

    const rejection: ReturnRejection = {
      rejectionId: this.generateId('REJ'),
      rejectedAt: new Date(),
      rejectedBy,
      rejectionReason,
    };

    updatedRequest.rejection = rejection;
    updatedRequest.status = 'RETURN_REJECTED';
    this.addStateTransitionEvent(
      updatedRequest,
      'RETURN_RECEIVED',
      'RETURN_REJECTED',
      rejectedBy
    );

    return updatedRequest;
  }

  /**
   * 반품 입고 등록
   */
  registerInboundExpectation(
    request: ReturnRequest,
    trackingNumber: string
  ): ReturnRequest {
    const updatedRequest = { ...request };
    updatedRequest.status = 'INBOUND_WAIT';

    this.addStateTransitionEvent(
      updatedRequest,
      'RETURN_APPROVED',
      'INBOUND_WAIT',
      'WMS_SYSTEM'
    );

    return updatedRequest;
  }

  /**
   * 반품 상품 수령
   */
  completeInbound(
    request: ReturnRequest,
    trackingNumber: string,
    receivedBy: string,
    physicalCondition: string,
    damageReport?: string
  ): ReturnRequest {
    const updatedRequest = { ...request };

    const inboundInfo: ReturnInboundInfo = {
      inboundId: this.generateId('RIN'),
      trackingNumber,
      receivedAt: new Date(),
      receivedBy,
      returnZone: `RETURN-${Date.now()}`,
      physicalCondition,
      damageReport,
    };

    updatedRequest.inboundInfo = inboundInfo;
    updatedRequest.status = 'INBOUND_COMPLETED';
    this.addStateTransitionEvent(
      updatedRequest,
      'INBOUND_WAIT',
      'INBOUND_COMPLETED',
      receivedBy
    );

    return updatedRequest;
  }

  /**
   * 반품 검수 수행
   */
  performInspection(
    request: ReturnRequest,
    itemId: string,
    inspectionData: Omit<InspectionDetail, 'inspectionId' | 'itemId' | 'inspectionDate'>,
    inspectedBy: string
  ): {
    success: boolean;
    request?: ReturnRequest;
    error?: string;
  } {
    const updatedRequest = { ...request };
    const item = updatedRequest.items.find((i) => i.itemId === itemId);

    if (!item) {
      return {
        success: false,
        error: `항목을 찾을 수 없음: ${itemId}`,
      };
    }

    const inspection: InspectionDetail = {
      inspectionId: this.generateId('INS'),
      itemId,
      inspectionDate: new Date(),
      ...inspectionData,
      inspectedBy,
    };

    updatedRequest.inspectionDetails.push(inspection);
    item.inspectionGrade = inspection.grade;
    item.gradeReason = inspection.gradeReason;

    // 모든 항목 검수 완료 시 상태 변경
    const allInspected = updatedRequest.items.every((i) => i.inspectionGrade);
    if (allInspected && updatedRequest.status === 'INSPECTION_IN_PROGRESS') {
      updatedRequest.status = 'REWORK_DECISION';
      this.addStateTransitionEvent(
        updatedRequest,
        'INSPECTION_IN_PROGRESS',
        'REWORK_DECISION',
        inspectedBy
      );
    }

    return {
      success: true,
      request: updatedRequest,
    };
  }

  /**
   * 검수 시작
   */
  startInspection(request: ReturnRequest): ReturnRequest {
    const updatedRequest = { ...request };
    updatedRequest.status = 'INSPECTION_IN_PROGRESS';

    this.addStateTransitionEvent(
      updatedRequest,
      'INBOUND_COMPLETED',
      'INSPECTION_IN_PROGRESS',
      'WMS_SYSTEM'
    );

    return updatedRequest;
  }

  /**
   * 처리 결정
   */
  makeReworkDecision(
    request: ReturnRequest,
    itemId: string,
    decision: 'RESTOCKING' | 'REPAIR' | 'DISPOSAL',
    reason: string,
    decidedBy: string,
    repairEstimate?: { cost: number; duration: number }
  ): {
    success: boolean;
    request?: ReturnRequest;
    error?: string;
  } {
    const updatedRequest = { ...request };
    const item = updatedRequest.items.find((i) => i.itemId === itemId);
    const inspection = updatedRequest.inspectionDetails.find((i) => i.itemId === itemId);

    if (!item) {
      return {
        success: false,
        error: `항목을 찾을 수 없음: ${itemId}`,
      };
    }

    if (!inspection) {
      return {
        success: false,
        error: `검수 기록을 찾을 수 없음: ${itemId}`,
      };
    }

    // 등급에 따른 정책 확인
    const policy = INSPECTION_GRADE_POLICY[inspection.grade];
    if (decision === 'RESTOCKING' && !policy.restockingAllowed) {
      return {
        success: false,
        error: `${inspection.grade} 등급은 재입고 불가능`,
      };
    }

    const reworkDecision: ReworkDecision = {
      decisionId: this.generateId('RWD'),
      itemId,
      decidedAt: new Date(),
      decidedBy,
      decision,
      reason,
      repairEstimate,
      disposalApprovalRequired: decision === 'DISPOSAL' || inspection.grade === 'GRADE_C',
    };

    updatedRequest.reworkDecisions.push(reworkDecision);

    // 상태 전환
    if (decision === 'RESTOCKING') {
      updatedRequest.status = 'RESTOCKING_DECISION';
      this.addStateTransitionEvent(
        updatedRequest,
        'REWORK_DECISION',
        'RESTOCKING_DECISION',
        decidedBy
      );
    } else if (decision === 'REPAIR') {
      updatedRequest.status = 'DEFECTIVE_CONVERSION';
      this.addStateTransitionEvent(
        updatedRequest,
        'REWORK_DECISION',
        'DEFECTIVE_CONVERSION',
        decidedBy
      );
    } else if (decision === 'DISPOSAL') {
      updatedRequest.status = 'DISPOSAL_TARGET';
      this.addStateTransitionEvent(
        updatedRequest,
        'REWORK_DECISION',
        'DISPOSAL_TARGET',
        decidedBy
      );
    }

    return {
      success: true,
      request: updatedRequest,
    };
  }

  /**
   * 재입고 실행
   */
  executeRestocking(
    request: ReturnRequest,
    itemId: string,
    locationId: string,
    zone: string,
    restockedBy: string,
    notes?: string
  ): ReturnRequest {
    const updatedRequest = { ...request };
    const item = updatedRequest.items.find((i) => i.itemId === itemId);

    if (!item) {
      return updatedRequest;
    }

    const restocking: RestockingExecution = {
      restockingId: this.generateId('RST'),
      itemId,
      restockingDate: new Date(),
      restockedBy,
      locationId,
      zone,
      quantity: item.quantity,
      notes,
    };

    updatedRequest.restockingExecutions.push(restocking);

    // 모든 재입고 항목이 실행되면 상태 변경
    const allRestocked = updatedRequest.items.every((i) =>
      updatedRequest.restockingExecutions.some((r) => r.itemId === i.itemId)
    );

    if (allRestocked) {
      updatedRequest.status = 'RESTOCKING_COMPLETED';
      this.addStateTransitionEvent(
        updatedRequest,
        'RESTOCKING_DECISION',
        'RESTOCKING_COMPLETED',
        restockedBy
      );
    }

    return updatedRequest;
  }

  /**
   * 폐기 승인
   */
  approvDisposal(
    request: ReturnRequest,
    itemId: string,
    approvedBy: string,
    approvalReason: string,
    disposalDeadlineDays: number = 7
  ): ReturnRequest {
    const updatedRequest = { ...request };

    const disposalDeadline = new Date();
    disposalDeadline.setDate(disposalDeadline.getDate() + disposalDeadlineDays);

    const approval: DisposalApproval = {
      approvalId: this.generateId('DAP'),
      itemId,
      approvedAt: new Date(),
      approvedBy,
      approvalReason,
      disposalDeadline,
    };

    updatedRequest.disposalApprovals.push(approval);
    updatedRequest.status = 'DISPOSAL_COMPLETED';

    return updatedRequest;
  }

  /**
   * 폐기 실행
   */
  executeDisposal(
    request: ReturnRequest,
    itemId: string,
    disposalMethod: 'INCINERATION' | 'RECYCLING' | 'DONATION' | 'LANDFILL',
    disposedBy: string,
    certificateNumber?: string,
    photosUrl?: string[],
    notes?: string
  ): ReturnRequest {
    const updatedRequest = { ...request };
    const item = updatedRequest.items.find((i) => i.itemId === itemId);

    if (!item) {
      return updatedRequest;
    }

    const disposal: DisposalExecution = {
      disposalId: this.generateId('DIS'),
      itemId,
      disposalDate: new Date(),
      disposalMethod,
      disposedBy,
      quantity: item.quantity,
      certificateNumber,
      photosUrl,
      notes,
    };

    updatedRequest.disposalExecutions.push(disposal);
    updatedRequest.status = 'DISPOSAL_COMPLETED';
    this.addStateTransitionEvent(
      updatedRequest,
      'DISPOSAL_APPROVAL_WAIT',
      'DISPOSAL_COMPLETED',
      disposedBy
    );

    return updatedRequest;
  }

  /**
   * 환불 처리
   */
  processRefund(
    request: ReturnRequest,
    refundMethod: 'ORIGINAL_PAYMENT' | 'CREDIT' | 'VOUCHER',
    processedBy: string
  ): {
    success: boolean;
    refund?: RefundInfo;
    error?: string;
  } {
    // 재입고 및 폐기 완료 확인
    const hasRestocking = request.restockingExecutions.length > 0;
    const hasDisposal = request.disposalExecutions.length > 0;

    if (!hasRestocking && !hasDisposal) {
      return {
        success: false,
        error: '재입고 또는 폐기가 완료되어야 환불 처리 가능',
      };
    }

    const refund: RefundInfo = {
      refundId: this.generateId('RFD'),
      totalRefundAmount: request.totalRefundAmount,
      refundReason: `반품 요청 ${request.requestId}에 대한 환불`,
      refundMethod,
      processedAt: new Date(),
      processedBy,
      refundStatus: 'COMPLETED',
      omsRefundId: `OMS-${this.generateId('RFD')}`,
    };

    return {
      success: true,
      refund,
    };
  }

  /**
   * 반품 완료
   */
  completeReturn(request: ReturnRequest): ReturnRequest {
    const updatedRequest = { ...request };
    updatedRequest.status = 'COMPLETED';
    updatedRequest.updatedAt = new Date();

    this.addStateTransitionEvent(
      updatedRequest,
      updatedRequest.status,
      'COMPLETED',
      'WMS_SYSTEM'
    );

    return updatedRequest;
  }

  /**
   * 상태 전이 검증
   */
  validateStatusTransition(
    currentStatus: ReturnRequestStatus,
    targetStatus: ReturnRequestStatus,
    actor: string
  ): {
    valid: boolean;
    error?: string;
  } {
    const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus];
    if (!allowedTransitions.includes(targetStatus)) {
      return {
        valid: false,
        error: `허용되지 않은 상태 전이: ${currentStatus} -> ${targetStatus}`,
      };
    }

    const allowedActors = STATUS_ACTOR_PERMISSIONS[targetStatus];
    if (!allowedActors.includes(actor) && actor !== 'ADMIN') {
      return {
        valid: false,
        error: `권한 없음: ${actor}는 ${targetStatus} 상태에 접근할 수 없습니다`,
      };
    }

    return { valid: true };
  }

  /**
   * KPI 계산
   */
  calculateReturnKPI(requests: ReturnRequest[], period: 'DAILY' | 'WEEKLY' | 'MONTHLY'): ReturnRequestKPI {
    const completedRequests = requests.filter((r) => r.status === 'COMPLETED');
    const approvedRequests = requests.filter((r) => r.status !== 'RETURN_REJECTED');
    const rejectedRequests = requests.filter((r) => r.status === 'RETURN_REJECTED');

    let gradeACount = 0;
    let gradeBCount = 0;
    let gradeCCount = 0;
    let totalInspections = 0;

    let restockingCount = 0;
    let disposalCount = 0;
    let totalProcessingTime = 0;

    for (const request of requests) {
      // 검수 등급 집계
      for (const inspection of request.inspectionDetails) {
        totalInspections++;
        if (inspection.grade === 'GRADE_A') gradeACount++;
        else if (inspection.grade === 'GRADE_B') gradeBCount++;
        else if (inspection.grade === 'GRADE_C') gradeCCount++;
      }

      // 처리 방법 집계
      for (const decision of request.reworkDecisions) {
        if (decision.decision === 'RESTOCKING') restockingCount++;
        else if (decision.decision === 'DISPOSAL') disposalCount++;
      }

      // 처리 시간
      if (request.status === 'COMPLETED') {
        const processingTime =
          (request.updatedAt.getTime() - request.createdAt.getTime()) / (1000 * 60 * 60);
        totalProcessingTime += processingTime;
      }
    }

    const gradeARate = totalInspections > 0 ? (gradeACount / totalInspections) * 100 : 0;
    const gradeBRate = totalInspections > 0 ? (gradeBCount / totalInspections) * 100 : 0;
    const gradeCRate = totalInspections > 0 ? (gradeCCount / totalInspections) * 100 : 0;
    const restockingRate =
      gradeACount + gradeBCount > 0
        ? (restockingCount / (gradeACount + gradeBCount)) * 100
        : 0;
    const disposalRate = totalInspections > 0 ? (disposalCount / totalInspections) * 100 : 0;

    const totalRefundAmount = requests.reduce((sum, r) => sum + r.totalRefundAmount, 0);
    const avgRefundAmount = approvedRequests.length > 0 ? totalRefundAmount / approvedRequests.length : 0;

    return {
      kpiId: this.generateId('KPI'),
      period,
      date: new Date(),
      totalReturnRequests: requests.length,
      approvedRequests: approvedRequests.length,
      rejectedRequests: rejectedRequests.length,
      averageProcessingTime:
        completedRequests.length > 0
          ? Math.round(totalProcessingTime / completedRequests.length)
          : 0,
      gradeARate: Math.round(gradeARate * 100) / 100,
      gradeBRate: Math.round(gradeBRate * 100) / 100,
      gradeCRate: Math.round(gradeCRate * 100) / 100,
      restockingRate: Math.round(restockingRate * 100) / 100,
      disposalRate: Math.round(disposalRate * 100) / 100,
      refundAmount: Math.round(totalRefundAmount),
      averageRefundAmount: Math.round(avgRefundAmount),
      customerSatisfactionScore: 85.5,
    };
  }

  // ============ 유틸리티 함수 ============

  private generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${randomStr}`.toUpperCase();
  }

  private createStateTransitionEvent(
    eventId: string,
    requestId: string,
    fromStatus: ReturnRequestStatus,
    toStatus: ReturnRequestStatus,
    eventType: any,
    actor: string
  ): ReturnRequestStateTransitionEvent {
    return {
      eventId,
      requestId,
      fromStatus,
      toStatus,
      eventType,
      actor,
      timestamp: new Date(),
    };
  }

  private addStateTransitionEvent(
    request: ReturnRequest,
    fromStatus: ReturnRequestStatus,
    toStatus: ReturnRequestStatus,
    actor: string
  ): void {
    const event: ReturnRequestStateTransitionEvent = {
      eventId: this.generateId('EVT'),
      requestId: request.requestId,
      fromStatus,
      toStatus,
      eventType: `${toStatus}_EVENT` as any,
      actor,
      timestamp: new Date(),
    };
    request.events.push(event);
  }
}

export const returnRequestService = new ReturnRequestService();
