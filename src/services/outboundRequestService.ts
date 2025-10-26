/**
 * 출고 요청 서비스
 * 출고 요청 생성, 재고 할당, 피킹, 검수, 포장, 출고 확정을 관리합니다.
 */

import {
  OutboundRequest,
  OutboundRequestStatus,
  OutboundRequestItem,
  InventoryAllocation,
  PickingInstruction,
  BarcodeScanned,
  InspectionRecord,
  PackingInfo,
  Waybill,
  ShipmentConfirmation,
  OutboundRequestStateTransitionEvent,
  OutboundRequestKPI,
  ALLOWED_STATUS_TRANSITIONS,
  STATUS_ACTOR_PERMISSIONS,
  PickingMethod,
} from '@/models/outboundRequestTypes';

class OutboundRequestService {
  /**
   * 출고 요청 생성
   */
  createOutboundRequest(
    orderId: string,
    omsOrderId: string,
    items: OutboundRequestItem[],
    customerInfo: {
      customerId: string;
      customerName: string;
      shippingAddress: string;
      phoneNumber: string;
    },
    requiredDeliveryDate?: Date,
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL'
  ): OutboundRequest {
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      requestId: this.generateId('ORR'),
      orderId,
      omsOrderId,
      status: 'OUTBOUND_REQUEST',
      priority,
      items,
      allocations: [],
      pickingInstructions: [],
      pickingMethod: 'SINGLE_PICK',
      barcodeScans: [],
      inspectionRecords: [],
      totalAmount,
      requiredDeliveryDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'OMS_SYSTEM',
      events: [this.createStateTransitionEvent(
        this.generateId('EVT'),
        this.generateId('ORR'),
        'OUTBOUND_REQUEST' as OutboundRequestStatus,
        'OUTBOUND_REQUEST' as OutboundRequestStatus,
        'REQUEST_CREATED',
        'OMS_SYSTEM'
      )],
      exceptions: [],
      customerInfo,
    };
  }

  /**
   * 재고 할당
   */
  allocateInventory(
    request: OutboundRequest,
    availableInventory: Map<string, { quantity: number; locationId: string; zone: string }[]>
  ): {
    success: boolean;
    request?: OutboundRequest;
    shortageItems?: OutboundRequestItem[];
    error?: string;
  } {
    const updatedRequest = { ...request };
    const shortageItems: OutboundRequestItem[] = [];

    for (const item of request.items) {
      const availableLocations = availableInventory.get(item.sku) || [];
      let remainingQuantity = item.requestedQuantity;

      for (const location of availableLocations) {
        if (remainingQuantity <= 0) break;

        const allocateQuantity = Math.min(remainingQuantity, location.quantity);
        const allocation: InventoryAllocation = {
          allocationId: this.generateId('ALO'),
          itemId: item.itemId,
          allocatedQuantity: allocateQuantity,
          locationId: location.locationId,
          zone: location.zone,
          reservedAt: new Date(),
          status: 'ALLOCATED',
        };

        updatedRequest.allocations.push(allocation);
        item.allocatedQuantity += allocateQuantity;
        remainingQuantity -= allocateQuantity;
      }

      if (remainingQuantity > 0) {
        shortageItems.push(item);
        updatedRequest.exceptions.push('INVENTORY_INSUFFICIENT');
      }
    }

    // 상태 업데이트
    if (shortageItems.length > 0) {
      updatedRequest.status = 'INVENTORY_SHORTAGE';
      this.addStateTransitionEvent(
        updatedRequest,
        'INVENTORY_SHORTAGE',
        'INVENTORY_SHORTAGE',
        'WMS_SYSTEM'
      );
      return {
        success: false,
        request: updatedRequest,
        shortageItems,
        error: `${shortageItems.length}개 항목 재고 부족`,
      };
    }

    updatedRequest.status = 'INVENTORY_ALLOCATED';
    this.addStateTransitionEvent(
      updatedRequest,
      'OUTBOUND_REQUEST',
      'INVENTORY_ALLOCATED',
      'WMS_SYSTEM'
    );

    return {
      success: true,
      request: updatedRequest,
    };
  }

  /**
   * 피킹 지시 생성
   */
  createPickingInstructions(
    request: OutboundRequest,
    pickingMethod: PickingMethod = 'SINGLE_PICK'
  ): OutboundRequest {
    const updatedRequest = { ...request };
    updatedRequest.pickingMethod = pickingMethod;

    const instructions: PickingInstruction[] = [];

    if (pickingMethod === 'SINGLE_PICK') {
      // 단일 피킹: 주문별로 생성
      for (const allocation of request.allocations) {
        const item = request.items.find((i) => i.itemId === allocation.itemId);
        if (!item) continue;

        const instruction: PickingInstruction = {
          instructionId: this.generateId('PIN'),
          requestId: request.requestId,
          itemId: allocation.itemId,
          quantity: allocation.allocatedQuantity,
          fromLocation: allocation.locationId,
          toStagingArea: `STAGING-${request.requestId}`,
          pickingMethod: 'SINGLE_PICK',
          priorityLevel: request.priority,
          createdAt: new Date(),
          status: 'PENDING',
        };
        instructions.push(instruction);
      }
    } else if (pickingMethod === 'BATCH_PICK') {
      // 배치 피킹: 시간대별 그룹핑
      const groupedByZone = this.groupAllocationsByZone(request.allocations);
      for (const [zone, allocations] of Object.entries(groupedByZone)) {
        const instruction: PickingInstruction = {
          instructionId: this.generateId('PIN'),
          requestId: request.requestId,
          itemId: allocations[0].itemId,
          quantity: allocations.reduce((sum, a) => sum + a.allocatedQuantity, 0),
          fromLocation: zone,
          toStagingArea: `STAGING-${request.requestId}`,
          pickingMethod: 'BATCH_PICK',
          priorityLevel: request.priority,
          createdAt: new Date(),
          status: 'PENDING',
        };
        instructions.push(instruction);
      }
    } else if (pickingMethod === 'ZONE_PICK') {
      // 존 피킹: 구역별 분담
      const groupedByZone = this.groupAllocationsByZone(request.allocations);
      for (const [zone, allocations] of Object.entries(groupedByZone)) {
        const instruction: PickingInstruction = {
          instructionId: this.generateId('PIN'),
          requestId: request.requestId,
          itemId: allocations[0].itemId,
          quantity: allocations.reduce((sum, a) => sum + a.allocatedQuantity, 0),
          fromLocation: zone,
          toStagingArea: `STAGING-${request.requestId}`,
          pickingMethod: 'ZONE_PICK',
          priorityLevel: request.priority,
          createdAt: new Date(),
          status: 'PENDING',
        };
        instructions.push(instruction);
      }
    }

    updatedRequest.pickingInstructions = instructions;
    updatedRequest.status = 'PICKING_WAIT';
    this.addStateTransitionEvent(
      updatedRequest,
      'INVENTORY_ALLOCATED',
      'PICKING_WAIT',
      'WMS_SYSTEM'
    );

    return updatedRequest;
  }

  /**
   * 피킹 시작
   */
  startPicking(
    request: OutboundRequest,
    instructionId: string,
    assignedTo: string
  ): OutboundRequest {
    const updatedRequest = { ...request };
    const instruction = updatedRequest.pickingInstructions.find(
      (i) => i.instructionId === instructionId
    );

    if (instruction) {
      instruction.status = 'IN_PROGRESS';
      instruction.assignedTo = assignedTo;
    }

    updatedRequest.status = 'PICKING_IN_PROGRESS';
    this.addStateTransitionEvent(
      updatedRequest,
      'PICKING_WAIT',
      'PICKING_IN_PROGRESS',
      assignedTo
    );

    return updatedRequest;
  }

  /**
   * 바코드 스캔 및 검증
   */
  scanBarcode(
    request: OutboundRequest,
    instructionId: string,
    scannedBarcode: string,
    expectedBarcode: string,
    scannedBy: string,
    location?: string
  ): {
    success: boolean;
    request?: OutboundRequest;
    error?: string;
  } {
    const isMatched = scannedBarcode === expectedBarcode;
    const updatedRequest = { ...request };

    const scan: BarcodeScanned = {
      scanId: this.generateId('SCA'),
      instructionId,
      scannedBarcode,
      expectedBarcode,
      isMatched,
      quantity: 0,
      scannedAt: new Date(),
      scannedBy,
      location,
    };

    updatedRequest.barcodeScans.push(scan);

    if (!isMatched) {
      updatedRequest.exceptions.push('BARCODE_MISMATCH');
      return {
        success: false,
        request: updatedRequest,
        error: `바코드 불일치: ${scannedBarcode} != ${expectedBarcode}`,
      };
    }

    return {
      success: true,
      request: updatedRequest,
    };
  }

  /**
   * 피킹 완료
   */
  completePicking(request: OutboundRequest, instructionId: string): OutboundRequest {
    const updatedRequest = { ...request };
    const instruction = updatedRequest.pickingInstructions.find(
      (i) => i.instructionId === instructionId
    );

    if (instruction) {
      instruction.status = 'COMPLETED';
      instruction.completedAt = new Date();
    }

    // 모든 피킹이 완료되면 상태 변경
    const allCompleted = updatedRequest.pickingInstructions.every(
      (i) => i.status === 'COMPLETED'
    );

    if (allCompleted) {
      updatedRequest.status = 'PICKING_COMPLETED';
      this.addStateTransitionEvent(
        updatedRequest,
        'PICKING_IN_PROGRESS',
        'PICKING_COMPLETED',
        instruction?.assignedTo || 'SYSTEM'
      );
    }

    return updatedRequest;
  }

  /**
   * 검수 실행
   */
  performInspection(
    request: OutboundRequest,
    inspectionRecords: Omit<InspectionRecord, 'inspectionId'>[],
    inspectedBy: string
  ): {
    success: boolean;
    request?: OutboundRequest;
    failedItems?: InspectionRecord[];
    error?: string;
  } {
    const updatedRequest = { ...request };
    const failedItems: InspectionRecord[] = [];

    for (const record of inspectionRecords) {
      const inspection: InspectionRecord = {
        inspectionId: this.generateId('INS'),
        ...record,
      };

      updatedRequest.inspectionRecords.push(inspection);

      if (inspection.status !== 'PASSED') {
        failedItems.push(inspection);
        updatedRequest.exceptions.push('PRODUCT_DAMAGED');
      }
    }

    if (failedItems.length > 0) {
      updatedRequest.status = 'INSPECTION_HOLD';
      this.addStateTransitionEvent(
        updatedRequest,
        'PICKING_COMPLETED',
        'INSPECTION_HOLD',
        inspectedBy
      );
      return {
        success: false,
        request: updatedRequest,
        failedItems,
        error: `${failedItems.length}개 항목 검수 불합격`,
      };
    }

    updatedRequest.status = 'INSPECTION_PASSED';
    this.addStateTransitionEvent(
      updatedRequest,
      'PICKING_COMPLETED',
      'INSPECTION_PASSED',
      inspectedBy
    );

    return {
      success: true,
      request: updatedRequest,
    };
  }

  /**
   * 포장 정보 생성
   */
  createPackingInfo(request: OutboundRequest, packedBy: string): PackingInfo {
    const totalWeight = request.items.reduce(
      (sum, item) => sum + (item.requestedQuantity * 1.5), // 평균 무게 추정
      0
    );

    return {
      packingId: this.generateId('PCK'),
      requestId: request.requestId,
      items: request.items,
      totalWeight,
      packageDimensions: {
        length: 30,
        width: 20,
        height: 15,
      },
      packedBy,
      packedAt: new Date(),
    };
  }

  /**
   * 송장 자동 생성
   */
  generateWaybill(
    request: OutboundRequest,
    carrier: string,
    carrierService: string
  ): Waybill {
    const waybillNumber = `${carrier}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // 배송 예상 기간 계산 (서비스별)
    const daysToDeliver = carrierService === 'EXPRESS' ? 1 : carrierService === 'STANDARD' ? 2 : 3;
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + daysToDeliver);

    return {
      waybillId: this.generateId('WAY'),
      waybillNumber,
      requestId: request.requestId,
      carrier,
      carrier_service: carrierService,
      from_address: '123 Warehouse St, Seoul',
      to_address: request.customerInfo.shippingAddress,
      weight: 5, // 임시
      generateDate: new Date(),
      estimatedDeliveryDate,
    };
  }

  /**
   * 포장 완료
   */
  completePacking(
    request: OutboundRequest,
    packingInfo: PackingInfo,
    waybill: Waybill,
    packedBy: string
  ): OutboundRequest {
    const updatedRequest = { ...request };
    updatedRequest.packingInfo = packingInfo;
    updatedRequest.waybill = waybill;
    updatedRequest.status = 'PACKING_COMPLETED';

    this.addStateTransitionEvent(
      updatedRequest,
      'PACKING_IN_PROGRESS',
      'PACKING_COMPLETED',
      packedBy
    );

    return updatedRequest;
  }

  /**
   * 출고 확정
   */
  confirmShipment(
    request: OutboundRequest,
    loadedBy: string,
    shippedBy: string
  ): OutboundRequest {
    const updatedRequest = { ...request };

    const confirmation: ShipmentConfirmation = {
      confirmationId: this.generateId('SHC'),
      requestId: request.requestId,
      loadedAt: new Date(),
      loadedBy,
      waybill: updatedRequest.waybill!,
      shippedAt: new Date(),
      shippedBy,
      cargoQuantity: updatedRequest.items.reduce(
        (sum, item) => sum + item.packedQuantity,
        0
      ),
      omsNotified: false,
    };

    updatedRequest.shipmentConfirmation = confirmation;
    updatedRequest.status = 'SHIPMENT_CONFIRMED';

    this.addStateTransitionEvent(
      updatedRequest,
      'PACKING_COMPLETED',
      'SHIPMENT_CONFIRMED',
      shippedBy
    );

    return updatedRequest;
  }

  /**
   * 출고 완료
   */
  completeOutbound(request: OutboundRequest): OutboundRequest {
    const updatedRequest = { ...request };
    updatedRequest.status = 'COMPLETED';
    updatedRequest.updatedAt = new Date();

    this.addStateTransitionEvent(
      updatedRequest,
      'SHIPMENT_CONFIRMED',
      'COMPLETED',
      'WMS_SYSTEM'
    );

    return updatedRequest;
  }

  /**
   * 상태 전이 검증
   */
  validateStatusTransition(
    currentStatus: OutboundRequestStatus,
    targetStatus: OutboundRequestStatus,
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
  calculateOutboundKPI(
    requests: OutboundRequest[],
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  ): OutboundRequestKPI {
    const completedRequests = requests.filter((r) => r.status === 'COMPLETED');
    const totalRequests = requests.length;

    let totalPickingTime = 0;
    let totalInspectionTime = 0;
    let totalPackingTime = 0;
    let inspectionFailureCount = 0;
    let partialShipmentCount = 0;

    for (const request of requests) {
      // 피킹 시간
      const firstPickStart = request.events.find(
        (e) => e.eventType === 'PICKING_STARTED'
      )?.timestamp;
      const lastPickComplete = request.events.find(
        (e) => e.eventType === 'PICKING_COMPLETED'
      )?.timestamp;

      if (firstPickStart && lastPickComplete) {
        totalPickingTime +=
          (lastPickComplete.getTime() - firstPickStart.getTime()) / (1000 * 60);
      }

      // 검수 실패율
      if (request.inspectionRecords.length > 0) {
        const failedInspections = request.inspectionRecords.filter(
          (i) => i.status !== 'PASSED'
        ).length;
        inspectionFailureCount += failedInspections;
      }

      // 부분 출고율
      const totalRequested = request.items.reduce((sum, i) => sum + i.requestedQuantity, 0);
      const totalShipped = request.items.reduce((sum, i) => sum + i.shippedQuantity, 0);
      if (totalShipped < totalRequested) {
        partialShipmentCount++;
      }
    }

    const averagePickingTime =
      completedRequests.length > 0 ? totalPickingTime / completedRequests.length : 0;
    const inspectionFailureRate =
      requests.length > 0
        ? (inspectionFailureCount / requests.reduce((sum, r) => sum + r.inspectionRecords.length, 0)) * 100
        : 0;
    const partialShipmentRate =
      totalRequests > 0 ? (partialShipmentCount / totalRequests) * 100 : 0;
    const averageOrderValue =
      totalRequests > 0
        ? requests.reduce((sum, r) => sum + r.totalAmount, 0) / totalRequests
        : 0;

    return {
      kpiId: this.generateId('KPI'),
      period,
      date: new Date(),
      totalRequests,
      completedRequests: completedRequests.length,
      averagePickingTime: Math.round(averagePickingTime),
      averageInspectionTime: 0,
      averagePackingTime: 0,
      totalPickingTime: Math.round(totalPickingTime),
      pickingAccuracy: 99.5,
      inspectionFailureRate: Math.round(inspectionFailureRate * 100) / 100,
      partialShipmentRate: Math.round(partialShipmentRate * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue),
      onTimeShipmentRate: 95.0,
      carriageExceptionRate: 0.5,
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
    fromStatus: OutboundRequestStatus,
    toStatus: OutboundRequestStatus,
    eventType: any,
    actor: string
  ): OutboundRequestStateTransitionEvent {
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
    request: OutboundRequest,
    fromStatus: OutboundRequestStatus,
    toStatus: OutboundRequestStatus,
    actor: string
  ): void {
    const event: OutboundRequestStateTransitionEvent = {
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

  private groupAllocationsByZone(allocations: InventoryAllocation[]): Record<string, InventoryAllocation[]> {
    return allocations.reduce(
      (grouped, allocation) => {
        const zone = allocation.zone || 'DEFAULT';
        if (!grouped[zone]) {
          grouped[zone] = [];
        }
        grouped[zone].push(allocation);
        return grouped;
      },
      {} as Record<string, InventoryAllocation[]>
    );
  }
}

export const outboundRequestService = new OutboundRequestService();
