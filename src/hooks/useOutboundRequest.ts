/**
 * 출고 요청 React 훅
 * 출고 요청 상태 관리 및 작업 수행
 */

'use client';

import { useState, useCallback } from 'react';
import { outboundRequestService } from '@/services/outboundRequestService';
import {
  OutboundRequest,
  OutboundRequestItem,
  PickingMethod,
  PickingInstruction,
  InspectionRecord,
  Waybill,
} from '@/models/outboundRequestTypes';

interface UseOutboundRequestResult {
  // 상태
  requests: OutboundRequest[];
  currentRequest: OutboundRequest | null;
  isLoading: boolean;
  error: string | null;

  // 출고 요청 관리
  createRequest: (
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
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  ) => void;

  // 재고 할당
  allocateInventory: (
    requestId: string,
    availableInventory: Map<string, { quantity: number; locationId: string; zone: string }[]>
  ) => boolean;

  // 피킹 지시
  createPickingInstructions: (requestId: string, pickingMethod?: PickingMethod) => void;
  startPicking: (requestId: string, instructionId: string, assignedTo: string) => void;
  scanBarcode: (
    requestId: string,
    instructionId: string,
    scannedBarcode: string,
    expectedBarcode: string,
    scannedBy: string
  ) => boolean;
  completePicking: (requestId: string, instructionId: string) => void;

  // 검수
  performInspection: (
    requestId: string,
    inspectionRecords: Omit<InspectionRecord, 'inspectionId'>[],
    inspectedBy: string
  ) => boolean;
  repickItems: (requestId: string, inspectionId: string) => void;

  // 포장
  startPacking: (requestId: string, packedBy: string) => void;
  generateWaybill: (
    requestId: string,
    carrier: string,
    carrierService: 'EXPRESS' | 'STANDARD' | 'ECONOMY'
  ) => void;
  completePacking: (requestId: string, packedBy: string) => void;

  // 출고 확정
  confirmShipment: (requestId: string, loadedBy: string, shippedBy: string) => void;
  completeOutbound: (requestId: string) => void;

  // 조회
  getRequest: (requestId: string) => OutboundRequest | undefined;
  getRequestsByStatus: (status: string) => OutboundRequest[];
  getPickingInstructions: (requestId: string) => PickingInstruction[];
}

export function useOutboundRequest(): UseOutboundRequestResult {
  const [requests, setRequests] = useState<OutboundRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<OutboundRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 출고 요청 생성
  const createRequest = useCallback(
    (
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
    ) => {
      try {
        setIsLoading(true);
        const newRequest = outboundRequestService.createOutboundRequest(
          orderId,
          omsOrderId,
          items,
          customerInfo,
          requiredDeliveryDate,
          priority
        );
        setRequests((prev) => [...prev, newRequest]);
        setCurrentRequest(newRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '출고 요청 생성 실패');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 재고 할당
  const allocateInventory = useCallback(
    (
      requestId: string,
      availableInventory: Map<string, { quantity: number; locationId: string; zone: string }[]>
    ): boolean => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return false;
        }

        const result = outboundRequestService.allocateInventory(request, availableInventory);

        if (!result.success) {
          setError(result.error || '재고 할당 실패');
          setRequests((prev) =>
            prev.map((r) => (r.requestId === requestId ? result.request! : r))
          );
          return false;
        }

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? result.request! : r))
        );
        setCurrentRequest(result.request || null);
        setError(null);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : '재고 할당 중 오류');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 피킹 지시 생성
  const createPickingInstructions = useCallback(
    (requestId: string, pickingMethod: PickingMethod = 'SINGLE_PICK') => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const updatedRequest = outboundRequestService.createPickingInstructions(
          request,
          pickingMethod
        );

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '피킹 지시 생성 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 피킹 시작
  const startPicking = useCallback(
    (requestId: string, instructionId: string, assignedTo: string) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const updatedRequest = outboundRequestService.startPicking(
          request,
          instructionId,
          assignedTo
        );

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '피킹 시작 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 바코드 스캔
  const scanBarcode = useCallback(
    (
      requestId: string,
      instructionId: string,
      scannedBarcode: string,
      expectedBarcode: string,
      scannedBy: string
    ): boolean => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return false;
        }

        const result = outboundRequestService.scanBarcode(
          request,
          instructionId,
          scannedBarcode,
          expectedBarcode,
          scannedBy
        );

        if (!result.success) {
          setError(result.error || '바코드 스캔 실패');
          setRequests((prev) =>
            prev.map((r) => (r.requestId === requestId ? result.request! : r))
          );
          return false;
        }

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? result.request! : r))
        );
        setCurrentRequest(result.request || null);
        setError(null);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : '바코드 스캔 중 오류');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 피킹 완료
  const completePicking = useCallback(
    (requestId: string, instructionId: string) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const updatedRequest = outboundRequestService.completePicking(request, instructionId);

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '피킹 완료 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 검수
  const performInspection = useCallback(
    (
      requestId: string,
      inspectionRecords: Omit<InspectionRecord, 'inspectionId'>[],
      inspectedBy: string
    ): boolean => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return false;
        }

        const result = outboundRequestService.performInspection(
          request,
          inspectionRecords,
          inspectedBy
        );

        if (!result.success) {
          setError(result.error || '검수 실패');
          setRequests((prev) =>
            prev.map((r) => (r.requestId === requestId ? result.request! : r))
          );
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

  // 재피킹
  const repickItems = useCallback(
    (requestId: string, inspectionId: string) => {
      try {
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        // 상태를 PICKING_IN_PROGRESS로 되돌림
        request.status = 'PICKING_IN_PROGRESS';
        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? request : r))
        );
        setCurrentRequest(request);
      } catch (err) {
        setError(err instanceof Error ? err.message : '재피킹 실패');
      }
    },
    [requests]
  );

  // 포장 시작
  const startPacking = useCallback(
    (requestId: string, packedBy: string) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const updatedRequest = { ...request };
        updatedRequest.status = 'PACKING_IN_PROGRESS';
        updatedRequest.lastUpdatedBy = packedBy;

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '포장 시작 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 송장 생성
  const generateWaybill = useCallback(
    (
      requestId: string,
      carrier: string,
      carrierService: 'EXPRESS' | 'STANDARD' | 'ECONOMY'
    ) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const waybill = outboundRequestService.generateWaybill(
          request,
          carrier,
          carrierService
        );

        const updatedRequest = { ...request };
        updatedRequest.waybill = waybill;

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '송장 생성 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 포장 완료
  const completePacking = useCallback(
    (requestId: string, packedBy: string) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const packingInfo = outboundRequestService.createPackingInfo(request, packedBy);
        const waybill = request.waybill || outboundRequestService.generateWaybill(
          request,
          'DHL',
          'STANDARD'
        );

        const updatedRequest = outboundRequestService.completePacking(
          request,
          packingInfo,
          waybill,
          packedBy
        );

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '포장 완료 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 출고 확정
  const confirmShipment = useCallback(
    (requestId: string, loadedBy: string, shippedBy: string) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const updatedRequest = outboundRequestService.confirmShipment(
          request,
          loadedBy,
          shippedBy
        );

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '출고 확정 실패');
      } finally {
        setIsLoading(false);
      }
    },
    [requests]
  );

  // 출고 완료
  const completeOutbound = useCallback(
    (requestId: string) => {
      try {
        setIsLoading(true);
        const request = requests.find((r) => r.requestId === requestId);

        if (!request) {
          setError(`요청을 찾을 수 없음: ${requestId}`);
          return;
        }

        const updatedRequest = outboundRequestService.completeOutbound(request);

        setRequests((prev) =>
          prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
        );
        setCurrentRequest(updatedRequest);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '출고 완료 실패');
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

  const getPickingInstructions = useCallback(
    (requestId: string) => {
      const request = requests.find((r) => r.requestId === requestId);
      return request?.pickingInstructions || [];
    },
    [requests]
  );

  return {
    requests,
    currentRequest,
    isLoading,
    error,
    createRequest,
    allocateInventory,
    createPickingInstructions,
    startPicking,
    scanBarcode,
    completePicking,
    performInspection,
    repickItems,
    startPacking,
    generateWaybill,
    completePacking,
    confirmShipment,
    completeOutbound,
    getRequest,
    getRequestsByStatus,
    getPickingInstructions,
  };
}
