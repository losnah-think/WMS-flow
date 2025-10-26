/**
 * 재고 관리 서비스
 * 재고 상태, 로케이션, 동기화를 관리합니다.
 */

import {
  InventoryItem,
  InventoryQuantity,
  InventoryStatus,
  TemperatureZone,
  Location,
  Zone,
  InventoryMovement,
  InventoryAdjustment,
  InventoryAlert,
  InventorySyncLog,
  InventoryKPI,
  SafetyStockPolicy,
  PhysicalCount,
  CountItem,
} from '@/models/inventoryTypes';

class InventoryManagementService {
  /**
   * 재고 항목 생성
   */
  createInventoryItem(data: Partial<InventoryItem>): InventoryItem {
    const now = new Date();

    return {
      itemId: data.itemId || this.generateId('INV'),
      sku: data.sku || '',
      productName: data.productName || '',
      category: data.category || '',
      quantity: {
        physicalQuantity: data.quantity?.physicalQuantity || 0,
        availableQuantity: data.quantity?.availableQuantity || 0,
        reservedQuantity: data.quantity?.reservedQuantity || 0,
        safetyStockQuantity: data.quantity?.safetyStockQuantity || 0,
        holdQuantity: data.quantity?.holdQuantity || 0,
        damagedQuantity: data.quantity?.damagedQuantity || 0,
      },
      temperatureZone: data.temperatureZone || 'AMBIENT',
      status: data.status || 'AVAILABLE',
      createdAt: now,
      updatedAt: now,
      weight: data.weight,
      volume: data.volume,
      fragile: data.fragile,
      expirationDate: data.expirationDate,
    };
  }

  /**
   * 재고 수량 업데이트
   */
  updateInventoryQuantity(
    item: InventoryItem,
    quantity: number,
    operation: 'INBOUND' | 'OUTBOUND' | 'RESERVE' | 'RELEASE' | 'HOLD' | 'DAMAGE'
  ): {
    success: boolean;
    item?: InventoryItem;
    error?: string;
  } {
    const updatedItem = { ...item };
    const q = { ...item.quantity };

    switch (operation) {
      case 'INBOUND':
        q.physicalQuantity += quantity;
        q.availableQuantity += quantity;
        updatedItem.status = 'AVAILABLE';
        break;

      case 'OUTBOUND':
        if (q.availableQuantity < quantity) {
          return {
            success: false,
            error: `가용 재고 부족: ${q.availableQuantity}/${quantity}`,
          };
        }
        q.physicalQuantity -= quantity;
        q.availableQuantity -= quantity;
        break;

      case 'RESERVE':
        if (q.availableQuantity < quantity) {
          return {
            success: false,
            error: `예약할 가용 재고 부족`,
          };
        }
        q.availableQuantity -= quantity;
        q.reservedQuantity += quantity;
        break;

      case 'RELEASE':
        q.reservedQuantity = Math.max(0, q.reservedQuantity - quantity);
        q.availableQuantity += quantity;
        break;

      case 'HOLD':
        if (q.availableQuantity < quantity) {
          return {
            success: false,
            error: `보류할 가용 재고 부족`,
          };
        }
        q.availableQuantity -= quantity;
        q.holdQuantity += quantity;
        updatedItem.status = 'HOLD';
        break;

      case 'DAMAGE':
        const holdReduction = Math.min(quantity, q.holdQuantity);
        const availableReduction = quantity - holdReduction;

        if (q.availableQuantity < availableReduction) {
          return {
            success: false,
            error: `손상 처리할 재고 부족`,
          };
        }

        q.holdQuantity -= holdReduction;
        q.availableQuantity -= availableReduction;
        q.damagedQuantity += quantity;
        updatedItem.status = 'DAMAGED';
        break;
    }

    updatedItem.quantity = q;
    updatedItem.updatedAt = new Date();

    return {
      success: true,
      item: updatedItem,
    };
  }

  /**
   * 로케이션 할당
   */
  assignLocation(
    item: InventoryItem,
    availableLocations: Location[],
    quantity: number
  ): {
    success: boolean;
    location?: Location;
    error?: string;
  } {
    // 온도 요구사항에 맞는 로케이션 필터링
    const suitableLocations = availableLocations.filter(
      (loc) =>
        loc.temperatureZone === item.temperatureZone &&
        loc.status === 'ACTIVE' &&
        loc.availableCapacity >= quantity
    );

    if (suitableLocations.length === 0) {
      return {
        success: false,
        error: `적합한 로케이션 없음 (온도: ${item.temperatureZone}, 필요: ${quantity})`,
      };
    }

    // 가장 가용 공간이 적은 로케이션 선택 (First Fit Decreasing)
    const selectedLocation = suitableLocations.reduce((prev, curr) =>
      prev.availableCapacity < curr.availableCapacity ? prev : curr
    );

    const updatedLocation = {
      ...selectedLocation,
      currentOccupancy: selectedLocation.currentOccupancy + quantity,
      availableCapacity: selectedLocation.availableCapacity - quantity,
      occupancyRate:
        ((selectedLocation.currentOccupancy + quantity) /
          selectedLocation.maxCapacity) *
        100,
    };

    return {
      success: true,
      location: updatedLocation,
    };
  }

  /**
   * 재고 이동 기록
   */
  recordMovement(
    itemId: string,
    quantity: number,
    movementType: 'INBOUND' | 'OUTBOUND' | 'REALLOCATION' | 'ADJUSTMENT' | 'DISPOSAL',
    fromLocation?: string,
    toLocation?: string
  ): InventoryMovement {
    return {
      movementId: this.generateId('MOV'),
      itemId,
      quantity,
      movementType,
      fromLocation,
      toLocation,
      movedAt: new Date(),
    };
  }

  /**
   * 재고 조정
   */
  adjustInventory(
    itemId: string,
    quantity: number,
    reason: 'PHYSICAL_COUNT' | 'DAMAGE' | 'EXPIRATION' | 'ERROR_CORRECTION' | 'OTHER',
    adjustedBy: string,
    before: number
  ): InventoryAdjustment {
    return {
      adjustmentId: this.generateId('ADJ'),
      itemId,
      quantity,
      reason,
      beforeQuantity: before,
      afterQuantity: Math.max(0, before + quantity),
      adjustedBy,
      adjustedAt: new Date(),
    };
  }

  /**
   * 재고 경고 생성
   */
  createAlert(
    itemId: string,
    type: 'STOCK_LOW' | 'STOCK_OUT' | 'EXPIRATION_SOON' | 'LONG_AGING' | 'LOCATION_FULL' | 'QUALITY_ISSUE',
    message: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ): InventoryAlert {
    return {
      alertId: this.generateId('ALT'),
      itemId,
      type,
      severity,
      message,
      status: 'ACTIVE',
      createdAt: new Date(),
    };
  }

  /**
   * 재고 모니터링
   */
  monitorInventory(
    items: InventoryItem[],
    policies: Map<string, SafetyStockPolicy>
  ): InventoryAlert[] {
    const alerts: InventoryAlert[] = [];

    for (const item of items) {
      const policy = policies.get(item.itemId);

      // 재고 부족 확인
      if (item.quantity.availableQuantity === 0) {
        alerts.push(
          this.createAlert(
            item.itemId,
            'STOCK_OUT',
            `${item.productName} 품절`,
            'CRITICAL'
          )
        );
      } else if (policy && item.quantity.availableQuantity <= policy.safetyStockQuantity) {
        alerts.push(
          this.createAlert(
            item.itemId,
            'STOCK_LOW',
            `${item.productName} 안전 재고 이하 (${item.quantity.availableQuantity}/${policy.safetyStockQuantity})`,
            'HIGH'
          )
        );
      }

      // 유효기한 확인
      if (item.expirationDate) {
        const daysUntilExpiry = Math.floor(
          (item.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          alerts.push(
            this.createAlert(
              item.itemId,
              'EXPIRATION_SOON',
              `${item.productName} 유효기한 ${daysUntilExpiry}일 이내`,
              'MEDIUM'
            )
          );
        } else if (daysUntilExpiry <= 0) {
          alerts.push(
            this.createAlert(
              item.itemId,
              'EXPIRATION_SOON',
              `${item.productName} 유효기한 만료됨`,
              'CRITICAL'
            )
          );
        }
      }

      // 장기 보관 확인
      if (item.lastOutboundDate) {
        const daysSinceLastSale = Math.floor(
          (new Date().getTime() - item.lastOutboundDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastSale > 90 && item.quantity.availableQuantity > 0) {
          alerts.push(
            this.createAlert(
              item.itemId,
              'LONG_AGING',
              `${item.productName} 장기 보관 (${daysSinceLastSale}일)`,
              'MEDIUM'
            )
          );
        }
      }
    }

    return alerts;
  }

  /**
   * 동기화 로그 생성
   */
  createSyncLog(
    syncType: 'TO_OMS' | 'FROM_OMS' | 'TO_ERP' | 'FROM_ERP' | 'FULL_SYNC',
    itemsCount: number,
    successCount: number,
    failureCount: number,
    status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED'
  ): InventorySyncLog {
    return {
      syncId: this.generateId('SYN'),
      timestamp: new Date(),
      syncType,
      itemsCount,
      successCount,
      failureCount,
      status,
    };
  }

  /**
   * KPI 계산
   */
  calculateInventoryKPI(
    items: InventoryItem[],
    movements: InventoryMovement[],
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  ): InventoryKPI {
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity.physicalQuantity, 0);
    const totalDamagedQuantity = items.reduce(
      (sum, item) => sum + item.quantity.damagedQuantity,
      0
    );
    const totalExpiryCount = items.filter((item) => {
      if (!item.expirationDate) return false;
      const daysUntilExpiry = Math.floor(
        (item.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 0;
    }).length;

    // 회전율 계산
    const outboundCount = movements.filter((m) => m.movementType === 'OUTBOUND').length;
    const annualTurnover =
      period === 'DAILY'
        ? outboundCount * 365
        : period === 'WEEKLY'
          ? outboundCount * 52
          : outboundCount * 12;

    // 평균 체류 일수
    const averageStayDays =
      movements.length > 0
        ? Math.round(
            movements.reduce((sum, m) => {
              const diff = new Date().getTime() - m.movedAt.getTime();
              return sum + diff / (1000 * 60 * 60 * 24);
            }, 0) / movements.length
          )
        : 0;

    return {
      kpiId: this.generateId('KPI'),
      period,
      date: new Date(),
      inventoryAccuracy: 99.5, // 실제로는 실사 기반
      countVariance: 0.5,
      turnoverRate: totalItems > 0 ? annualTurnover / totalItems : 0,
      averageStayDays,
      stockoutRate: items.filter((i) => i.quantity.availableQuantity === 0).length / totalItems,
      spaceUtilization: 75, // 실제 계산 필요
      zoneUtilization: 75,
      holdingCostPerItem: 10,
      totalHoldingCost: totalQuantity * 10,
      damageRate: totalQuantity > 0 ? (totalDamagedQuantity / totalQuantity) * 100 : 0,
      expirationRate: totalItems > 0 ? (totalExpiryCount / totalItems) * 100 : 0,
    };
  }

  /**
   * 실사 기록 생성
   */
  createPhysicalCount(
    countType: 'FULL_COUNT' | 'CYCLE_COUNT' | 'SPOT_CHECK',
    items: InventoryItem[],
    conductedBy: string[],
    supervisedBy: string
  ): PhysicalCount {
    const countItems: CountItem[] = items.map((item) => ({
      itemId: item.itemId,
      sku: item.sku,
      systemQuantity: item.quantity.physicalQuantity,
      countedQuantity: item.quantity.physicalQuantity, // 임시 (실제는 입력받음)
      discrepancy: 0,
      discrepancyPercentage: 0,
      variance: 'CORRECT',
    }));

    const correctCount = countItems.filter((ci) => ci.variance === 'CORRECT').length;
    const accuracy =
      countItems.length > 0 ? (correctCount / countItems.length) * 100 : 100;

    return {
      countId: this.generateId('CNT'),
      countDate: new Date(),
      countType,
      conductedBy,
      supervisedBy,
      zonesIncluded: [],
      itemsCounted: items.length,
      items: countItems,
      discrepancyCount: countItems.filter((ci) => ci.variance !== 'CORRECT').length,
      accuracy,
      status: 'IN_PROGRESS',
    };
  }

  /**
   * 안전 재고 정책 생성
   */
  createSafetyStockPolicy(
    itemId: string,
    averageDemand: number,
    demandVariability: number,
    leadTimeDays: number,
    serviceLevel: number,
    appliedBy: string
  ): SafetyStockPolicy {
    // 안전 재고 = Z * 표준편차 * sqrt(리드타임)
    const zScore = this.getZScore(serviceLevel);
    const standardDeviation = averageDemand * demandVariability;
    const safetyStock = Math.ceil(zScore * standardDeviation * Math.sqrt(leadTimeDays));

    return {
      policyId: this.generateId('POL'),
      itemId,
      safetyStockQuantity: safetyStock,
      reorderPoint: averageDemand * leadTimeDays + safetyStock,
      reorderQuantity: Math.ceil(averageDemand * 30), // 월간 주문량
      leadTimeDays,
      demandVariabilityFactor: demandVariability,
      serviceLevel,
      createdAt: new Date(),
      updatedAt: new Date(),
      appliedBy,
    };
  }

  // ============ 유틸리티 함수 ============

  private generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${randomStr}`.toUpperCase();
  }

  private getZScore(serviceLevel: number): number {
    // 서비스 레벨에 따른 Z-스코어
    const scores: Record<number, number> = {
      90: 1.28,
      95: 1.65,
      99: 2.33,
      99.9: 3.09,
    };
    return scores[serviceLevel] || 1.65;
  }
}

export const inventoryManagementService = new InventoryManagementService();
