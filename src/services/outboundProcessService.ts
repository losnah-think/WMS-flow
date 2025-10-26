/**
 * 출고 프로세스 관리 서비스
 * 재고 할당부터 배송 인계까지의 전체 절차를 담당합니다.
 */

import {
  OutboundRequest,
  OutboundRequestStatus,
  OutboundActorType,
  OutboundItem,
  PickingMethod,
  InventoryAllocation,
  AllocationItem,
  PickingInstruction,
  PickingItem,
  InspectionRecord,
  InspectionItem,
  PackingRecord,
  PackingItem,
  ShipmentInfo,
  StateTransitionEvent,
  ExceptionHandling,
  OutboundExceptionType,
  InventoryDeductionRecord,
  DeductionItem,
  OutboundKPI,
} from '@/models/outboundTypes';

class OutboundProcessService {
  /**
   * 출고 요청 생성
   * OMS/화주사가 출고 요청을 생성합니다.
   */
  createOutboundRequest(data: Partial<OutboundRequest>): OutboundRequest {
    const requestId = this.generateId('OBR');
    const now = new Date();

    return {
      requestId,
      orderId: data.orderId || this.generateId('ORD'),
      status: 'REQUEST_CREATED',
      shipperId: data.shipperId || '',
      shipperName: data.shipperName || '',
      requestDate: now,
      dueDate: data.dueDate,
      items: data.items || [],
      totalQuantity: data.items?.reduce((sum: number, item: OutboundItem) => sum + item.quantity, 0) || 0,
      totalWeight: data.items?.reduce((sum: number, item: OutboundItem) => sum + (item.weight || 0), 0),
      destination: data.destination || '',
      pickingMethod: data.pickingMethod || 'SINGLE_PICK',
      priority: data.priority || 'NORMAL',
      createdAt: now,
      updatedAt: now,
      customerId: data.customerId,
      shippingAddress: data.shippingAddress,
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      pickingInstructions: data.pickingInstructions,
      remarks: data.remarks,
      attachments: data.attachments,
    };
  }

  /**
   * 재고 할당
   */
  allocateInventory(
    requestId: string,
    items: OutboundItem[],
    availableInventory: Record<string, Record<string, number>> // {itemId: {location: quantity}}
  ): {
    success: boolean;
    allocation?: InventoryAllocation;
    shortageItems?: string[];
    error?: string;
  } {
    const allocationItems: AllocationItem[] = [];
    const shortageItems: string[] = [];
    let allocationStatus: 'ALLOCATED' | 'PARTIAL' | 'INSUFFICIENT' = 'ALLOCATED';

    for (const item of items) {
      const available = availableInventory[item.itemId] || {};
      const totalAvailable = Object.values(available).reduce((sum: number, qty) => sum + qty, 0);

      if (totalAvailable < item.quantity) {
        shortageItems.push(item.itemId);
        allocationStatus = 'INSUFFICIENT';
        continue;
      }

      // 그리디 할당 (단일 위치에서 할당 시도)
      let remainingQty = item.quantity;
      let allocatedQty = 0;

      for (const [location, qty] of Object.entries(available)) {
        if (remainingQty === 0) break;
        const allocate = Math.min(remainingQty, qty);
        allocatedQty += allocate;
        remainingQty -= allocate;
      }

      allocationItems.push({
        itemId: item.itemId,
        requestedQuantity: item.quantity,
        allocatedQuantity: allocatedQty,
        zone: item.locationZone,
        location: item.location,
        status: allocatedQty === item.quantity ? 'ALLOCATED' : 'PARTIAL',
      });
    }

    if (allocationStatus === 'INSUFFICIENT') {
      return {
        success: false,
        shortageItems,
        error: `재고 부족: ${shortageItems.join(', ')}`,
      };
    }

    const allocation: InventoryAllocation = {
      allocationId: this.generateId('IAL'),
      requestId,
      items: allocationItems,
      status: allocationStatus,
      allocatedAt: new Date(),
    };

    return {
      success: true,
      allocation,
    };
  }

  /**
   * 피킹 지시 생성
   */
  createPickingInstruction(
    requestId: string,
    items: OutboundItem[],
    pickingMethod: PickingMethod
  ): PickingInstruction {
    const pickingItems: PickingItem[] = items.map((item) => ({
      itemId: item.itemId,
      productName: item.productName,
      quantity: item.quantity,
      zone: item.locationZone,
      location: item.location,
      barcodeScanned: false,
    }));

    return {
      instructionId: this.generateId('PKI'),
      requestId,
      pickingMethod,
      items: pickingItems,
      status: 'WAITING',
      createdAt: new Date(),
    };
  }

  /**
   * 피킹 시작
   */
  startPicking(instruction: PickingInstruction, pickedBy: string): PickingInstruction {
    return {
      ...instruction,
      status: 'IN_PROGRESS',
      pickedBy,
      startedAt: new Date(),
    };
  }

  /**
   * 바코드 스캔 검증
   */
  validateBarcodeScan(
    instruction: PickingInstruction,
    itemId: string,
    scannedBarcode: string,
    itemBarcode: string
  ): {
    valid: boolean;
    message: string;
    item?: PickingItem;
  } {
    const item = instruction.items.find((i: PickingItem) => i.itemId === itemId);

    if (!item) {
      return {
        valid: false,
        message: '해당 상품을 찾을 수 없습니다.',
      };
    }

    if (scannedBarcode !== itemBarcode) {
      return {
        valid: false,
        message: '바코드가 일치하지 않습니다.',
      };
    }

    return {
      valid: true,
      message: '바코드 인증 완료',
      item,
    };
  }

  /**
   * 피킹 완료
   */
  completePicking(instruction: PickingInstruction): {
    success: boolean;
    instruction?: PickingInstruction;
    missingItems?: string[];
  } {
    const missingItems = instruction.items
      .filter((item: PickingItem) => !item.barcodeScanned || !item.pickedQuantity)
      .map((item: PickingItem) => item.itemId);

    if (missingItems.length > 0) {
      return {
        success: false,
        missingItems,
      };
    }

    return {
      success: true,
      instruction: {
        ...instruction,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    };
  }

  /**
   * 검수 기록 생성
   */
  createInspectionRecord(
    requestId: string,
    items: PickingItem[],
    inspectedBy: string
  ): InspectionRecord {
    const inspectionItems: InspectionItem[] = items.map((item) => ({
      itemId: item.itemId,
      productName: item.productName,
      pickedQuantity: item.pickedQuantity || 0,
      inspectedQuantity: 0,
      result: 'PASS',
    }));

    return {
      inspectionId: this.generateId('INS'),
      requestId,
      inspectedBy,
      inspectionDate: new Date(),
      items: inspectionItems,
      overallResult: 'PASS',
    };
  }

  /**
   * 포장 기록 생성
   */
  createPackingRecord(
    requestId: string,
    items: OutboundItem[],
    packedBy: string,
    totalPackages: number
  ): PackingRecord {
    const packingItems: PackingItem[] = items.map((item) => ({
      itemId: item.itemId,
      productName: item.productName,
      quantity: item.quantity,
      packageNumber: Math.ceil(Math.random() * totalPackages), // 임시 배정
      weight: item.weight || 0,
    }));

    const totalWeight = packingItems.reduce((sum, item) => sum + item.weight, 0);

    return {
      packingId: this.generateId('PKG'),
      requestId,
      packedBy,
      packingDate: new Date(),
      items: packingItems,
      totalPackages,
      totalWeight,
      trackingNumbers: Array.from({ length: totalPackages }, () => this.generateTrackingNumber()),
      status: 'IN_PROGRESS',
    };
  }

  /**
   * 송장 번호 자동 생성
   */
  generateTrackingNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `TR-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * 배송 정보 생성
   */
  createShipmentInfo(
    requestId: string,
    shippingCompany: string,
    trackingNumbers: string[],
    loadQuantity: number,
    loadWeight: number
  ): ShipmentInfo {
    const estimatedDays = shippingCompany.includes('EXPRESS') ? 1 : 3;
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + estimatedDays);

    return {
      shipmentId: this.generateId('SHP'),
      requestId,
      shippingCompany,
      trackingNumber: trackingNumbers[0],
      departureTime: new Date(),
      estimatedDeliveryDate,
      loadQuantity,
      loadWeight,
      status: 'LOADED',
    };
  }

  /**
   * 상태 전이 검증
   */
  canTransition(
    currentStatus: OutboundRequestStatus,
    nextStatus: OutboundRequestStatus
  ): { allowed: boolean; reason?: string } {
    const validTransitions: Record<OutboundRequestStatus, OutboundRequestStatus[]> = {
      REQUEST_CREATED: ['INVENTORY_ALLOCATED', 'INVENTORY_SHORTAGE'],
      INVENTORY_ALLOCATED: ['PICKING_WAITING'],
      INVENTORY_SHORTAGE: ['REQUEST_CREATED'],
      PICKING_WAITING: ['PICKING_IN_PROGRESS'],
      PICKING_IN_PROGRESS: ['PICKING_COMPLETED'],
      PICKING_COMPLETED: ['INSPECTION_COMPLETED', 'INSPECTION_HOLD'],
      INSPECTION_COMPLETED: ['PACKING_IN_PROGRESS'],
      INSPECTION_HOLD: ['PICKING_IN_PROGRESS'],
      PACKING_IN_PROGRESS: ['PACKING_COMPLETED'],
      PACKING_COMPLETED: ['SHIPMENT_CONFIRMED'],
      SHIPMENT_CONFIRMED: ['COMPLETED'],
      COMPLETED: [],
    };

    const allowed = validTransitions[currentStatus]?.includes(nextStatus) ?? false;

    return {
      allowed,
      reason: allowed ? undefined : `${currentStatus}에서 ${nextStatus}로 전이 불가능`,
    };
  }

  /**
   * 상태 전이
   */
  transitionStatus(
    request: OutboundRequest,
    newStatus: OutboundRequestStatus,
    actor: OutboundActorType,
    reason?: string
  ): {
    success: boolean;
    request?: OutboundRequest;
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

    // 상태별 타임스탐프 업데이트
    if (newStatus === 'INVENTORY_ALLOCATED') {
      updatedRequest.allocationDate = new Date();
    } else if (newStatus === 'PICKING_IN_PROGRESS') {
      updatedRequest.pickingStartDate = new Date();
    } else if (newStatus === 'PICKING_COMPLETED') {
      updatedRequest.pickingCompletedDate = new Date();
    } else if (newStatus === 'INSPECTION_COMPLETED') {
      updatedRequest.inspectionDate = new Date();
    } else if (newStatus === 'PACKING_COMPLETED') {
      updatedRequest.packingCompletedDate = new Date();
    } else if (newStatus === 'SHIPMENT_CONFIRMED') {
      updatedRequest.shippedDate = new Date();
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
   * 예외 처리 등록
   */
  createException(
    requestId: string,
    type: OutboundExceptionType,
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
   * 재고 차감
   */
  deductInventory(
    requestId: string,
    items: OutboundItem[]
  ): InventoryDeductionRecord {
    const deductionItems: DeductionItem[] = items.map((item) => ({
      itemId: item.itemId,
      quantity: item.quantity,
      zone: item.locationZone,
      previousQuantity: 0, // 실제로는 DB에서 조회
      newQuantity: 0,      // 실제로는 차감 후 값
      deductionStatus: 'SUCCESS',
    }));

    return {
      deductionId: this.generateId('DED'),
      requestId,
      timestamp: new Date(),
      items: deductionItems,
      status: 'COMPLETED',
      omsSyncStatus: 'PENDING',
    };
  }

  /**
   * KPI 계산
   */
  calculateKPI(
    requestId: string,
    request: OutboundRequest,
    pickingDuration: number,
    inspectionDuration: number,
    packingDuration: number,
    inspectedItems: InspectionItem[],
    pickingAccuracy: number
  ): OutboundKPI {
    const requestToPickingDuration = request.pickingStartDate
      ? Math.round((request.pickingStartDate.getTime() - request.createdAt.getTime()) / (1000 * 60))
      : 0;

    const totalProcessTime =
      requestToPickingDuration + pickingDuration + inspectionDuration + packingDuration;

    const passedItems = inspectedItems.filter((item) => item.result === 'PASS').length;
    const inspectionPassRate = inspectedItems.length > 0 ? (passedItems / inspectedItems.length) * 100 : 0;

    const itemsPerMinute = request.totalQuantity > 0 ? request.totalQuantity / totalProcessTime : 0;

    const damagedItems = inspectedItems.filter(
      (item) => item.damageLevel === 'MAJOR'
    ).length;

    return {
      kpiId: this.generateId('KPI'),
      requestId,
      requestToPickingDuration,
      pickingDuration,
      inspectionDuration,
      packingDuration,
      totalProcessTime,
      pickingAccuracy,
      inspectionPassRate,
      itemsPerMinute,
      damagedItems,
    };
  }

  // ============ 유틸리티 함수 ============

  private generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${randomStr}`.toUpperCase();
  }
}

export const outboundProcessService = new OutboundProcessService();
