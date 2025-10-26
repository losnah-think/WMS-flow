/**
 * 입고 요청 프로세스 관리 훅
 * React 컴포넌트에서 입고 프로세스 상태를 관리합니다.
 */

'use client';

import { useState, useCallback } from 'react';
import { InboundRequest, InboundRequestStatus, ActorType, ExceptionType, InventorySyncRecord } from '@/models/inboundTypes';
import { inboundProcessService } from '@/services/inboundProcessService';

export const useInboundProcess = () => {
  const [request, setRequest] = useState<InboundRequest | null>(null);
  const [history, setHistory] = useState<InboundRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 입고 요청 생성
  const createRequest = useCallback(
    (data: Partial<InboundRequest>) => {
      try {
        setError(null);
        const newRequest = inboundProcessService.createInboundRequest(data);
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

  // 입고 유형 분류 및 승인 필요 여부 판단
  const classify = useCallback(() => {
    if (!request) {
      setError('요청이 없습니다');
      return null;
    }

    try {
      setError(null);
      return inboundProcessService.classifyAndDetermine(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : '분류 실패';
      setError(message);
      return null;
    }
  }, [request]);

  // 상태 전이
  const transitionStatus = useCallback(
    (newStatus: InboundRequestStatus, actor: ActorType, reason?: string) => {
      if (!request) {
        setError('요청이 없습니다');
        return false;
      }

      try {
        setError(null);
        const result = inboundProcessService.transitionStatus(
          request,
          newStatus,
          actor,
          reason
        );

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

  // 승인 처리
  const approve = useCallback(
    (approverId: string, approved: boolean, reason?: string) => {
      if (!request) {
        setError('요청이 없습니다');
        return false;
      }

      const nextStatus = approved ? 'APPROVAL_COMPLETED' : 'APPROVAL_REJECTED';
      return transitionStatus(nextStatus, 'WAREHOUSE_MANAGER', reason);
    },
    [request, transitionStatus]
  );

  // 존 할당
  const assignZone = useCallback(
    (zone: string, zoneName: string, availableSpace: number) => {
      if (!request) {
        setError('요청이 없습니다');
        return null;
      }

      try {
        setError(null);
        const requiredSpace = Math.ceil(request.totalQuantity / 100);
        const result = inboundProcessService.assignZone(
          request.requestId,
          zone,
          zoneName,
          availableSpace,
          requiredSpace
        );

        if (!result.success) {
          setError(result.error || '존 할당 실패');
          return null;
        }

        return result.assignment;
      } catch (err) {
        const message = err instanceof Error ? err.message : '존 할당 실패';
        setError(message);
        return null;
      }
    },
    [request]
  );

  // 검수 기록 생성
  const createInspection = useCallback(
    (inspectedBy: string) => {
      if (!request) {
        setError('요청이 없습니다');
        return null;
      }

      try {
        setError(null);
        return inboundProcessService.createInspectionRecord(
          request.requestId,
          request,
          inspectedBy
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : '검수 기록 생성 실패';
        setError(message);
        return null;
      }
    },
    [request]
  );

  // 예외 처리 등록
  const registerException = useCallback(
    (type: ExceptionType, description: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM') => {
      if (!request) {
        setError('요청이 없습니다');
        return null;
      }

      try {
        setError(null);
        return inboundProcessService.createException(
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

  // 재고 동기화
  const syncInventory = useCallback(
    (items: Array<{
      itemId: string;
      quantity: number;
      zone: string;
      location: string;
    }>) => {
      if (!request) {
        setError('요청이 없습니다');
        return null;
      }

      try {
        setError(null);
        return inboundProcessService.recordInventorySync(request.requestId, items);
      } catch (err) {
        const message = err instanceof Error ? err.message : '재고 동기화 실패';
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
    classify,
    transitionStatus,
    approve,
    assignZone,
    createInspection,
    registerException,
    syncInventory,

    // 편의 메서드
    reset: () => {
      setRequest(null);
      setHistory([]);
      setError(null);
    },
  };
};
