/**
 * 재고 관리 React 훅
 * 재고 상태 관리 및 작업 수행
 */

'use client';

import { useState, useCallback } from 'react';
import { inventoryManagementService } from '@/services/inventoryManagementService';
import {
  InventoryItem,
  Location,
  InventoryMovement,
  InventoryAlert,
  InventoryKPI,
  SafetyStockPolicy,
  PhysicalCount,
} from '@/models/inventoryTypes';

interface UseInventoryManagementResult {
  // 상태
  inventory: InventoryItem[];
  locations: Location[];
  movements: InventoryMovement[];
  alerts: InventoryAlert[];
  kpis: InventoryKPI[];
  policies: Map<string, SafetyStockPolicy>;
  physicalCounts: PhysicalCount[];
  isLoading: boolean;
  error: string | null;

  // 재고 관리
  createInventory: (data: Partial<InventoryItem>) => void;
  updateQuantity: (
    itemId: string,
    quantity: number,
    operation: 'INBOUND' | 'OUTBOUND' | 'RESERVE' | 'RELEASE' | 'HOLD' | 'DAMAGE'
  ) => boolean;

  // 로케이션
  allocateLocation: (itemId: string, quantity: number) => boolean;
  updateLocation: (location: Location) => void;

  // 추적
  recordMovement: (
    itemId: string,
    quantity: number,
    movementType: 'INBOUND' | 'OUTBOUND' | 'REALLOCATION' | 'ADJUSTMENT' | 'DISPOSAL',
    fromLocation?: string,
    toLocation?: string
  ) => void;

  // 모니터링
  monitorInventory: () => void;
  acknowledgeAlert: (alertId: string) => void;

  // KPI
  calculateKPI: (period: 'DAILY' | 'WEEKLY' | 'MONTHLY') => void;
  getKPI: () => InventoryKPI | undefined;

  // 실사
  startPhysicalCount: (
    countType: 'FULL_COUNT' | 'CYCLE_COUNT' | 'SPOT_CHECK',
    conductedBy: string[],
    supervisedBy: string
  ) => void;
  completePhysicalCount: (countId: string, countedQuantities: Map<string, number>) => void;

  // 정책
  createSafetyStockPolicy: (
    itemId: string,
    averageDemand: number,
    demandVariability: number,
    leadTimeDays: number,
    serviceLevel: number,
    appliedBy: string
  ) => void;

  // 동기화
  syncWithOMS: () => Promise<boolean>;
  syncWithERP: () => Promise<boolean>;
}

export function useInventoryManagement(): UseInventoryManagementResult {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [kpis, setKpis] = useState<InventoryKPI[]>([]);
  const [policies, setPolicies] = useState<Map<string, SafetyStockPolicy>>(new Map());
  const [physicalCounts, setPhysicalCounts] = useState<PhysicalCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 재고 생성
  const createInventory = useCallback(
    (data: Partial<InventoryItem>) => {
      try {
        setIsLoading(true);
        const newItem = inventoryManagementService.createInventoryItem(data);
        setInventory((prev) => [...prev, newItem]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '재고 생성 실패');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 수량 업데이트
  const updateQuantity = useCallback(
    (
      itemId: string,
      quantity: number,
      operation: 'INBOUND' | 'OUTBOUND' | 'RESERVE' | 'RELEASE' | 'HOLD' | 'DAMAGE'
    ): boolean => {
      try {
        setIsLoading(true);
        const item = inventory.find((i) => i.itemId === itemId);

        if (!item) {
          setError(`재고 항목을 찾을 수 없음: ${itemId}`);
          return false;
        }

        const result = inventoryManagementService.updateInventoryQuantity(
          item,
          quantity,
          operation
        );

        if (!result.success) {
          setError(result.error || '수량 업데이트 실패');
          return false;
        }

        setInventory((prev) =>
          prev.map((i) => (i.itemId === itemId ? result.item! : i))
        );

        // 이동 기록
        const movement = inventoryManagementService.recordMovement(
          itemId,
          quantity,
          operation === 'INBOUND'
            ? 'INBOUND'
            : operation === 'OUTBOUND'
              ? 'OUTBOUND'
              : 'ADJUSTMENT',
          undefined,
          undefined
        );
        setMovements((prev) => [...prev, movement]);

        setError(null);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : '수량 업데이트 중 오류');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [inventory]
  );

  // 로케이션 할당
  const allocateLocation = useCallback(
    (itemId: string, quantity: number): boolean => {
      try {
        setIsLoading(true);
        const item = inventory.find((i) => i.itemId === itemId);

        if (!item) {
          setError(`재고 항목을 찾을 수 없음: ${itemId}`);
          return false;
        }

        const result = inventoryManagementService.assignLocation(
          item,
          locations,
          quantity
        );

        if (!result.success) {
          setError(result.error || '로케이션 할당 실패');
          return false;
        }

        // 로케이션 업데이트
        setLocations((prev) =>
          prev.map((loc) =>
            loc.locationId === result.location!.locationId ? result.location! : loc
          )
        );

        setError(null);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : '로케이션 할당 중 오류');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [inventory, locations]
  );

  // 로케이션 업데이트
  const updateLocation = useCallback((location: Location) => {
    setLocations((prev) =>
      prev.map((loc) => (loc.locationId === location.locationId ? location : loc))
    );
  }, []);

  // 이동 기록
  const recordMovement = useCallback(
    (
      itemId: string,
      quantity: number,
      movementType: 'INBOUND' | 'OUTBOUND' | 'REALLOCATION' | 'ADJUSTMENT' | 'DISPOSAL',
      fromLocation?: string,
      toLocation?: string
    ) => {
      try {
        const movement = inventoryManagementService.recordMovement(
          itemId,
          quantity,
          movementType,
          fromLocation,
          toLocation
        );
        setMovements((prev) => [...prev, movement]);
      } catch (err) {
        setError(err instanceof Error ? err.message : '이동 기록 실패');
      }
    },
    []
  );

  // 재고 모니터링
  const monitorInventory = useCallback(() => {
    try {
      setIsLoading(true);
      const newAlerts = inventoryManagementService.monitorInventory(
        inventory,
        policies
      );

      // 기존 활성 경고와 병합
      setAlerts((prev) => {
        const existingIds = new Set(prev.map((a) => a.alertId));
        const uniqueNewAlerts = newAlerts.filter((a) => !existingIds.has(a.alertId));
        return [...prev.filter((a) => a.status === 'ACTIVE'), ...uniqueNewAlerts];
      });

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '모니터링 실패');
    } finally {
      setIsLoading(false);
    }
  }, [inventory, policies]);

  // 경고 확인
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.alertId === alertId ? { ...alert, status: 'ACKNOWLEDGED' } : alert
      )
    );
  }, []);

  // KPI 계산
  const calculateKPI = useCallback(
    (period: 'DAILY' | 'WEEKLY' | 'MONTHLY') => {
      try {
        setIsLoading(true);
        const kpi = inventoryManagementService.calculateInventoryKPI(
          inventory,
          movements,
          period
        );
        setKpis((prev) => [...prev, kpi]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'KPI 계산 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [inventory, movements]
  );

  // KPI 조회
  const getKPI = useCallback(() => {
    return kpis.length > 0 ? kpis[kpis.length - 1] : undefined;
  }, [kpis]);

  // 실사 시작
  const startPhysicalCount = useCallback(
    (
      countType: 'FULL_COUNT' | 'CYCLE_COUNT' | 'SPOT_CHECK',
      conductedBy: string[],
      supervisedBy: string
    ) => {
      try {
        setIsLoading(true);
        const count = inventoryManagementService.createPhysicalCount(
          countType,
          inventory,
          conductedBy,
          supervisedBy
        );
        setPhysicalCounts((prev) => [...prev, count]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '실사 시작 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [inventory]
  );

  // 실사 완료
  const completePhysicalCount = useCallback(
    (countId: string, countedQuantities: Map<string, number>) => {
      try {
        setIsLoading(true);
        const count = physicalCounts.find((c) => c.countId === countId);

        if (!count) {
          setError(`실사를 찾을 수 없음: ${countId}`);
          return;
        }

        // 각 항목의 수량 조정
        for (const [itemId, countedQuantity] of countedQuantities.entries()) {
          const item = inventory.find((i) => i.itemId === itemId);
          if (item) {
            const discrepancy =
              countedQuantity - item.quantity.physicalQuantity;

            if (discrepancy !== 0) {
              const adjustment = inventoryManagementService.adjustInventory(
                itemId,
                discrepancy,
                'PHYSICAL_COUNT',
                'SYSTEM',
                item.quantity.physicalQuantity
              );

              // 조정 기록
              recordMovement(itemId, Math.abs(discrepancy), 'ADJUSTMENT');

              // 재고 수량 업데이트
              if (discrepancy > 0) {
                updateQuantity(itemId, discrepancy, 'INBOUND');
              } else {
                updateQuantity(itemId, Math.abs(discrepancy), 'OUTBOUND');
              }
            }
          }
        }

        // 실사 완료
        setPhysicalCounts((prev) =>
          prev.map((c) =>
            c.countId === countId ? { ...c, status: 'COMPLETED' } : c
          )
        );

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '실사 완료 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [inventory, physicalCounts, recordMovement, updateQuantity]
  );

  // 안전 재고 정책 생성
  const createSafetyStockPolicy = useCallback(
    (
      itemId: string,
      averageDemand: number,
      demandVariability: number,
      leadTimeDays: number,
      serviceLevel: number,
      appliedBy: string
    ) => {
      try {
        setIsLoading(true);
        const policy = inventoryManagementService.createSafetyStockPolicy(
          itemId,
          averageDemand,
          demandVariability,
          leadTimeDays,
          serviceLevel,
          appliedBy
        );
        setPolicies((prev) => new Map(prev).set(itemId, policy));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '정책 생성 실패');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // OMS 동기화
  const syncWithOMS = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // 시뮬레이션
      const successCount = Math.floor(inventory.length * 0.95);
      const failureCount = inventory.length - successCount;

      const syncLog = inventoryManagementService.createSyncLog(
        'TO_OMS',
        inventory.length,
        successCount,
        failureCount,
        failureCount === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS'
      );

      // 실제 API 호출로 대체 필요
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setError(null);
      return failureCount === 0;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OMS 동기화 실패');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [inventory]);

  // ERP 동기화
  const syncWithERP = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      const successCount = Math.floor(inventory.length * 0.95);
      const failureCount = inventory.length - successCount;

      const syncLog = inventoryManagementService.createSyncLog(
        'TO_ERP',
        inventory.length,
        successCount,
        failureCount,
        failureCount === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS'
      );

      // 실제 API 호출로 대체 필요
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setError(null);
      return failureCount === 0;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ERP 동기화 실패');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [inventory]);

  return {
    inventory,
    locations,
    movements,
    alerts,
    kpis,
    policies,
    physicalCounts,
    isLoading,
    error,
    createInventory,
    updateQuantity,
    allocateLocation,
    updateLocation,
    recordMovement,
    monitorInventory,
    acknowledgeAlert,
    calculateKPI,
    getKPI,
    startPhysicalCount,
    completePhysicalCount,
    createSafetyStockPolicy,
    syncWithOMS,
    syncWithERP,
  };
}
