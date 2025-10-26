/**
 * 출고 프로세스 관리 훅
 * React 컴포넌트에서 출고 프로세스 상태를 관리합니다.
 */

'use client';

import { useState, useCallback } from 'react';
import {
  OutboundRequest,
  OutboundRequestStatus,
  OutboundActorType,
  OutboundItem,
  PickingMethod,
  OutboundExceptionType,
  PickingInstruction,
  PickingItem,
  InspectionItem,
} from '@/models/outboundTypes';
import { outboundProcessService } from '@/services/outboundProcessService';

export const useOutboundProcess = () => {
  const [request, setRequest] = useState<OutboundRequest | null>(null);
  const [history, setHistory] = useState<OutboundRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 출고 요청 생성
  const createRequest = useCallback(
    (data: Partial<OutboundRequest>) => {
      try {
        setError(null);
        const newRequest = outboundProcessService.createOutboundRequest(data);
        setRequest(newRequest);
        setHistory([newRequest]);
        return newRequest;
      } catch (err) {
        const message = err instanceof Error ? err.message : '요청 생성 실패';
        setError(message);
        return null;
      }
    },
    []
  );

  // 재고 할당
  const allocateInventory = useCallback(
    (items: OutboundItem[], availableInventory: Record<string, Record<string, number>>) => {
      if (!request) {
        setError('요청이 없습니다');
        return null;
      }

      try {
        setError(null);
        return outboundProcessService.allocateInventory(request.requestId, items, availableInventory);
      } catch (err) {
        const message = err instanceof Error ? err.message : '재고 할당 실패';
        setError(message);
        return null;
      }
    },
    [request]
  );

  // 피킹 지시 생성
  const createPickingInstruction = useCallback(
    (items: OutboundItem[], method: PickingMethod) => {
      if (!request) {
        setError('요청이 없습니다');
        return null;
      }

      try {
        setError(null);
        return outboundProcessService.createPickingInstruction(request.requestId, items, method);
      } catch (err) {
        const message = err instanceof Error ? err.message : '피킹 지시 생성 실패';
        setError(message);
        return null;
      }
    },
    [request]
  );

  // 피킹 시작
  const startPicking = useCallback(
    (instruction: PickingInstruction, pickedBy: string) => {
      try {
        setError(null);
        return outboundProcessService.startPicking(instruction, pickedBy);
      } catch (err) {
        const message = err instanceof Error ? err.message : '피킹 시작 실패';
        setError(message);
        return null;
      }
    },
    []
  );

  // 바코드 검증
  const validateBarcode = useCallback(
    (instruction: PickingInstruction, itemId: string, scannedCode: string, actualCode: string) => {
      try {
        setError(null);
        return outboundProcessService.validateBarcodeScan(
          instruction,
          itemId,
          scannedCode,
          actualCode
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : '바코드 검증 실패';
        setError(message);
        return null;
      }
    },
    []
  );

  // 피킹 완료
  const completePicking = useCallback(
    (instruction: PickingInstruction) => {
      try {
        setError(null);
        return outboundProcessService.completePicking(instruction);
      } catch (err) {
        const message = err instanceof Error ? err.message : '피킹 완료 실패';
        setError(message);
        return null;
      }
    },
    []
  );

  // 검수 기록 생성
  const createInspection = useCallback(
    (items: PickingItem[], inspectedBy: string) => {
      if (!request) {
        setError('요청이 없습니다');
        return null;
      }

      try {
        setError(null);
        return outboundProcessService.createInspectionRecord(request.requestId, items, inspectedBy);
      } catch (err) {
        const message = err instanceof Error ? err.message : '검수 기록 생성 실패';
        setError(message);
        return null;
      }
    },
    [request]
  );

  // 포장 기록 생성
  const createPacking = useCallback(
    (items: OutboundItem[], packedBy: string, totalPackages: number) => {
      if (!request) {
        setError('요청이 없습니다');
        return null;
      }

      try {
        setError(null);
        return outboundProcessService.createPackingRecord(
          request.requestId,
          items,
          packedBy,
          totalPackages
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : '포장 기록 생성 실패';
        setError(message);
        return null;
      }
    },
    [request]
  );

  // 배송 정보 생성
  const createShipment = useCallback(
    (
      shippingCompany: string,
      trackingNumbers: string[],
      loadQuantity: number,
      loadWeight: number
    ) => {
      if (!request) {
        setError('요청이 없습니다');
        return null;
      }

      try {
        setError(null);
        return outboundProcessService.createShipmentInfo(
          request.requestId,
          shippingCompany,
          trackingNumbers,
          loadQuantity,
          loadWeight
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : '배송 정보 생성 실패';
        setError(message);
        return null;
      }
    },
    [request]
  );

  // 상태 전이
  const transitionStatus = useCallback(
    (newStatus: OutboundRequestStatus, actor: OutboundActorType, reason?: string) => {
      if (!request) {
        setError('요청이 없습니다');
        return false;
      }

      try {
        setError(null);
        const result = outboundProcessService.transitionStatus(request, newStatus, actor, reason);

        if (!result.success) {
          setError(result.error || '상태 전이 실패');
          return false;
        }

        if (result.request) {
          setRequest(result.request);
          setHistory([...history, result.request]);
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '상태 전이 실패';
        setError(message);
        return false;
      }
    },
    [request, history]
  );

  // 예외 처리 등록
  const registerException = useCallback(
    (
      type: OutboundExceptionType,
      description: string,
      severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
    ) => {
      if (!request) {
        setError('요청이 없습니다');
        return null;
      }

      try {
        setError(null);
        return outboundProcessService.createException(
          request.requestId,
          type,
          description,
          severity
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : '예외 등록 실패';
        setError(message);
        return null;
      }
    },
    [request]
  );

  // 재고 차감
  const deductInventory = useCallback(
    (items: OutboundItem[]) => {
      if (!request) {
        setError('요청이 없습니다');
        return null;
      }

      try {
        setError(null);
        return outboundProcessService.deductInventory(request.requestId, items);
      } catch (err) {
        const message = err instanceof Error ? err.message : '재고 차감 실패';
        setError(message);
        return null;
      }
    },
    [request]
  );

  // KPI 계산
  const calculateKPI = useCallback(
    (
      pickingDuration: number,
      inspectionDuration: number,
      packingDuration: number,
      inspectedItems: any[],
      pickingAccuracy: number
    ) => {
      if (!request) {
        setError('요청이 없습니다');
        return null;
      }

      try {
        setError(null);
        return outboundProcessService.calculateKPI(
          request.requestId,
          request,
          pickingDuration,
          inspectionDuration,
          packingDuration,
          inspectedItems,
          pickingAccuracy
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'KPI 계산 실패';
        setError(message);
        return null;
      }
    },
    [request]
  );

  return {
    // 상태
    request,
    history,
    error,

    // 메서드
    createRequest,
    allocateInventory,
    createPickingInstruction,
    startPicking,
    validateBarcode,
    completePicking,
    createInspection,
    createPacking,
    createShipment,
    transitionStatus,
    registerException,
    deductInventory,
    calculateKPI,

    // 편의 메서드
    reset: () => {
      setRequest(null);
      setHistory([]);
      setError(null);
    },
  };
};
