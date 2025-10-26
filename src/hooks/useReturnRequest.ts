/**
 * 반품 요청 React 훅
 * 반품 상태 관리 및 작업 수행
 */

'use client';

import { useState, useCallback } from 'react';
import { returnRequestService } from '@/services/returnRequestService';
import {
  ReturnRequest,
  ReturnRequestItem,
  ReturnReason,
  InspectionDetail,
} from '@/models/returnRequestTypes';

interface UseReturnRequestResult {
  // 상태
  requests: ReturnRequest[];
  currentRequest: ReturnRequest | null;
  isLoading: boolean;
  error: string | null;

  // 반품 요청 관리
  createRequest: (
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
    priority?: 'LOW' | 'NORMAL' | 'HIGH'
  ) => void;

  // 반품 승인/거부
  approveReturn: (requestId: string, approvedBy: string, pickupWindowDays?: number) => boolean;
  rejectReturn: (requestId: string, rejectedBy: string, rejectionReason: string) => void;

  // 입고 처리
  registerInboundExpectation: (requestId: string, trackingNumber: string) => void;
  completeInbound: (
    requestId: string,
    trackingNumber: string,
    receivedBy: string,
    physicalCondition: string,
    damageReport?: string
  ) => void;

  // 검수
  startInspection: (requestId: string) => void;
  performInspection: (
    requestId: string,
    itemId: string,
    inspectionData: Omit<InspectionDetail, 'inspectionId' | 'itemId' | 'inspectionDate'>,
    inspectedBy: string
  ) => boolean;

  // 처리 결정
  makeReworkDecision: (
    requestId: string,
    itemId: string,
    decision: 'RESTOCKING' | 'REPAIR' | 'DISPOSAL',
    reason: string,
    decidedBy: string,
    repairEstimate?: { cost: number; duration: number }
  ) => boolean;

  // 재입고
  executeRestocking: (
    requestId: string,
    itemId: string,
    locationId: string,
    zone: string,
    restockedBy: string,
    notes?: string
  ) => void;

  // 폐기
  approvDisposal: (
    requestId: string,
    itemId: string,
    approvedBy: string,
    approvalReason: string,
    disposalDeadlineDays?: number
  ) => void;
  executeDisposal: (
    requestId: string,
    itemId: string,
    disposalMethod: 'INCINERATION' | 'RECYCLING' | 'DONATION' | 'LANDFILL',
    disposedBy: string,
    certificateNumber?: string,
    photosUrl?: string[],
    notes?: string
  ) => void;

  // 환불
  processRefund: (
    requestId: string,
    refundMethod: 'ORIGINAL_PAYMENT' | 'CREDIT' | 'VOUCHER',
    processedBy: string
  ) => boolean;

  // 완료
  completeReturn: (requestId: string) => void;

  // 조회
  getRequest: (requestId: string) => ReturnRequest | undefined;
  getRequestsByStatus: (status: string) => ReturnRequest[];
}

export function useReturnRequest(): UseReturnRequestResult {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<ReturnRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 반품 요청 생성
  const createRequest = useCallback(
    (
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
    ) => {
      try {
        setIsLoading(true);
        const newRequest = returnRequestService.createReturnRequest(
          orderId,
          omsOrderId,
          items,
          customerInfo,
          reasons,
          priority
        );
        setRequests((prev) => [...prev, newRequest]);
        setCurrentRequest(newRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '반품 요청 생성 실패');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 반품 승인
  const approveReturn = useCallback(
    (requestId: string, approvedBy: string, pickupWindowDays: number = 7): boolean => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return false;
        }

        const result = returnRequestService.approveReturn(
          request,
          approvedBy,
          pickupWindowDays
        );

        if (!result.success) {
          setError(result.error || '반품 승인 실패');
          return false;
        }

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? result.request! : r))
        );
        setCurrentRequest(result.request || null);
        setError(null);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : '반품 승인 중 오류');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 반품 거부
  const rejectReturn = useCallback(
    (requestId: string, rejectedBy: string, rejectionReason: string) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const updatedRequest = returnRequestService.rejectReturn(
          request,
          rejectedBy,
          rejectionReason
        );

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '반품 거부 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 입고 예정 등록
  const registerInboundExpectation = useCallback(
    (requestId: string, trackingNumber: string) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const updatedRequest = returnRequestService.registerInboundExpectation(
          request,
          trackingNumber
        );

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '입고 예정 등록 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 입고 완료
  const completeInbound = useCallback(
    (
      requestId: string,
      trackingNumber: string,
      receivedBy: string,
      physicalCondition: string,
      damageReport?: string
    ) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const updatedRequest = returnRequestService.completeInbound(
          request,
          trackingNumber,
          receivedBy,
          physicalCondition,
          damageReport
        );

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '입고 완료 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 검수 시작
  const startInspection = useCallback(
    (requestId: string) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const updatedRequest = returnRequestService.startInspection(request);

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '검수 시작 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 검수 수행
  const performInspection = useCallback(
    (
      requestId: string,
      itemId: string,
      inspectionData: Omit<InspectionDetail, 'inspectionId' | 'itemId' | 'inspectionDate'>,
      inspectedBy: string
    ): boolean => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return false;
        }

        const result = returnRequestService.performInspection(
          request,
          itemId,
          inspectionData,
          inspectedBy
        );

        if (!result.success) {
          setError(result.error || '검수 실패');
          return false;
        }

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? result.request! : r))
        );
        setCurrentRequest(result.request || null);
        setError(null);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : '검수 중 오류');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 처리 결정
  const makeReworkDecision = useCallback(
    (
      requestId: string,
      itemId: string,
      decision: 'RESTOCKING' | 'REPAIR' | 'DISPOSAL',
      reason: string,
      decidedBy: string,
      repairEstimate?: { cost: number; duration: number }
    ): boolean => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return false;
        }

        const result = returnRequestService.makeReworkDecision(
          request,
          itemId,
          decision,
          reason,
          decidedBy,
          repairEstimate
        );

        if (!result.success) {
          setError(result.error || '처리 결정 실패');
          return false;
        }

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? result.request! : r))
        );
        setCurrentRequest(result.request || null);
        setError(null);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : '처리 결정 중 오류');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 재입고
  const executeRestocking = useCallback(
    (
      requestId: string,
      itemId: string,
      locationId: string,
      zone: string,
      restockedBy: string,
      notes?: string
    ) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const updatedRequest = returnRequestService.executeRestocking(
          request,
          itemId,
          locationId,
          zone,
          restockedBy,
          notes
        );

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '재입고 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 폐기 승인
  const approvDisposal = useCallback(
    (
      requestId: string,
      itemId: string,
      approvedBy: string,
      approvalReason: string,
      disposalDeadlineDays: number = 7
    ) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const updatedRequest = returnRequestService.approvDisposal(
          request,
          itemId,
          approvedBy,
          approvalReason,
          disposalDeadlineDays
        );

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '폐기 승인 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 폐기 실행
  const executeDisposal = useCallback(
    (
      requestId: string,
      itemId: string,
      disposalMethod: 'INCINERATION' | 'RECYCLING' | 'DONATION' | 'LANDFILL',
      disposedBy: string,
      certificateNumber?: string,
      photosUrl?: string[],
      notes?: string
    ) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const updatedRequest = returnRequestService.executeDisposal(
          request,
          itemId,
          disposalMethod,
          disposedBy,
          certificateNumber,
          photosUrl,
          notes
        );

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '폐기 실행 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 환불 처리
  const processRefund = useCallback(
    (
      requestId: string,
      refundMethod: 'ORIGINAL_PAYMENT' | 'CREDIT' | 'VOUCHER',
      processedBy: string
    ): boolean => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return false;
        }

        const result = returnRequestService.processRefund(request, refundMethod, processedBy);

        if (!result.success) {
          setError(result.error || '환불 처리 실패');
          return false;
        }

        const updatedRequest = { ...request };
        updatedRequest.refundInfo = result.refund;

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : '환불 처리 중 오류');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 반품 완료
  const completeReturn = useCallback(
    (requestId: string) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const updatedRequest = returnRequestService.completeReturn(request);

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '반품 완료 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 조회 함수
  const getRequest = useCallback(
    (requestId: string) => {
      return requests.find((r) => r.requestId === requestId);
    },
    [requests]
  );

  const getRequestsByStatus = useCallback(
    (status: string) => {
      return requests.filter((r) => r.status === status);
    },
    [requests]
  );

  return {
    requests,
    currentRequest,
    isLoading,
    error,
    createRequest,
    approveReturn,
    rejectReturn,
    registerInboundExpectation,
    completeInbound,
    startInspection,
    performInspection,
    makeReworkDecision,
    executeRestocking,
    approvDisposal,
    executeDisposal,
    processRefund,
    completeReturn,
    getRequest,
    getRequestsByStatus,
  };
}
