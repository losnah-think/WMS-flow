// src/models/flowData.ts
import { Flow } from './types';

export const flowData: Record<string, Flow> = {
  inbound: {
    title: '입고 프로세스 (Inbound)',
    description: '화주사의 입고 요청부터 최종 회계 처리까지 완전한 입고 워크플로우. 승인 절차, 존 할당, 검수, 예외 처리, 모니터링, 리포팅, 정책 관리를 포함합니다.',
    hierarchy: 'Fulgo(플랫폼) → 물류사(창고 운영자) → 화주사(고객사)',
    actors: [
      { id: 'shipper', name: '화주사', color: '#1976d2', desc: '입고 요청 주체', layer: '3계층' },
      { id: 'fulgo', name: 'FULGO 시스템', color: '#d32f2f', desc: '입고 승인 및 할당', layer: '1계층' },
      { id: 'warehouse_manager', name: '창고장', color: '#ff6f00', desc: '입고 승인권자', layer: '2계층' },
      { id: 'worker', name: '현장 작업자', color: '#7b1fa2', desc: '입고 실행 및 검수', layer: '2계층' },
      { id: 'inventory_system', name: '재고 엔진', color: '#c2185b', desc: '재고 동기화', layer: '1계층' },
      { id: 'oms_erp', name: 'OMS/ERP', color: '#0288d1', desc: '회계 및 정산', layer: '외부' },
    ],
    steps: [
      // 1단계: 입고 요청
      { from: 'shipper', to: 'fulgo', label: '[1] 입고 요청 생성', desc: '화주사가 입고 요청서 작성 및 송신', detail: '화주사가 FULGO OMS를 통해 입고 요청서 생성: 필수 항목(상품코드, 수량, 납품예정일, 송장번호) 입력. 상태: REQUEST_PENDING. OMS → WMS로 데이터 송신 및 SKU 기반 매핑.', actor: '화주사', term: '요청 접수', features: ['STK-008'] },
      
      // 2단계: 승인 요청 접수
      { from: 'fulgo', to: 'warehouse_manager', label: '[2] 승인 요청 접수 및 검토', desc: '입고 유형 분류 및 승인 필요 판정', detail: 'FULGO가 입고 요청을 수신 후 자동 분류: 일반입고/반품입고/긴급입고. 승인 필요 조건 판정(신규화주/대량입고/특수상품). 승인 필요 시 창고장에 승인요청 생성. 상태: APPROVAL_PENDING', actor: 'FULGO', term: '승인 대기', features: ['STK-008', 'CFG-001'] },
      
      // 3단계: 승인 처리
      { from: 'warehouse_manager', to: 'fulgo', label: '[3] 승인 처리 (또는 반려)', desc: '입고 적합성 검토 및 결정', detail: '창고장이 다음 기준으로 검토: ① 재고 수용 가능 여부(존 여유/수량) ② 입고 상품 품목 적합성(상태/보관구역) ③ 반입 제한 품목 여부. 승인 시 APPROVED, 반려 시 REJECTED + 사유 기입. 상태: APPROVED 또는 REJECTED', actor: '창고장', term: '승인 완료', features: ['CFG-001', 'STK-006'] },
      
      // 4단계: 존 할당 및 입고 실행
      { from: 'fulgo', to: 'worker', label: '[4] 존 할당 및 입고 실행', desc: '상품 속성 기반 로케이션 할당 및 물리적 입고', detail: 'FULGO가 상품 정책 기반으로 자동 할당: 크기/컬러/카테고리별 적합 존 선택. 로케이션 코드 부여. 작업자에게 할당 지시. 현장 작업자가 할당된 존으로 상품 이동 및 검수 수행(수량/파손/상태 확인). 상태: INBOUND_CONFIRMED', actor: '작업자', term: '입고 완료', features: ['STK-005', 'STK-010', 'STK-006'] },
      
      // 5단계: 송장 생성 및 동기화
      { from: 'fulgo', to: 'inventory_system', label: '[5] 송장 자동 생성 및 재고 동기화', desc: '입고 완료 시 송장 생성 및 OMS 연동', detail: 'FULGO가 입고 완료 시 자동으로 송장 생성: 상품코드, 수량, 존코드, 입고일자 포함. OMS로 입고확정 송장 전송. 재고 엔진이 재고 상태 업데이트(가용재고 증가). 재고 정합성 체크. 상태: COMPLETED', actor: 'FULGO', term: '동기화 완료', features: ['STK-007', 'STK-002', 'STK-011'] },
      
      // 6단계: 회계 연동
      { from: 'inventory_system', to: 'oms_erp', label: '[6] 회계 연동 및 마감', desc: '입고 완료 후 정산 및 회계 처리', detail: 'ERP와 입고 수불 내역 동기화. 월 단위 마감 보고서 생성. 반려/미입고 건 자동 이월. 화주별 정산 데이터 생성. 상태: COMPLETED (종료)', actor: 'FULGO', term: '마감 처리', features: ['STK-002', 'STK-011', 'RPT-001'] },
      
      // 7단계: 승인 이력 관리
      { from: 'fulgo', to: 'warehouse_manager', label: '[7] 승인 이력 관리', desc: '승인/반려 이력 기록 및 변경 관리', detail: 'FULGO가 모든 승인 로그 저장: 승인자, 일시, 결과, 사유, 요청 ID. 승인 이후 수정 항목은 "변경 승인 요청"으로 재기안. 기간별/승인자별/입고유형별 이력 조회 가능. 감사 대응용 정보 보관.', actor: '시스템', term: '감사 추적', features: ['STK-010', 'RPT-001'] },
      
      // 8단계: 예외 처리
      { from: 'fulgo', to: 'warehouse_manager', label: '[8] 예외 처리 관리', desc: '승인 지연(기준시간 초과)/존 포화/검수 실패 등 비정상 상황 대응', detail: '예외 시나리오 처리: ① 승인 지연(목표 2시간 초과)→자동 알림 ② 존 포화(용량 90% 이상)→ZONE_WAITING 대기열 등록, 자동 재할당 제안 ③ 검수 실패→HOLD 상태, 재검수 요청 ④ 정보 불일치→상품 확인 후 조정. 모든 예외는 로그 기록되며 관리자가 확인할 수 있는 알림 발송.', actor: '창고장', term: '예외 관리', features: ['STK-006'] },
      
      // 9단계: 실시간 모니터링
      { from: 'warehouse_manager', to: 'fulgo', label: '[9] 실시간 모니터링', desc: '입고 프로세스 현황 시각화 및 알림', detail: 'FULGO 대시보드: 요청/승인대기/승인완료/입고중/완료별 현황 카운트. 존별 입고율(%), 입고 처리 속도 KPI 시각화. 승인 병목 구간 붉은색 표시. 자동 알림: 승인 누락/존 포화/반려 사유 반복 시 경보.', actor: 'FULGO', term: '대시보드', features: ['RPT-001', 'RPT-005'] },
      
      // 10단계: 리포팅 및 분석
      { from: 'fulgo', to: 'warehouse_manager', label: '[10] KPI 리포팅 및 분석', desc: '입고 효율성 및 성과 분석', detail: 'FULGO 자동 생성: 일간/주간/월간 리포트. KPI: 승인 평균 소요시간, 반려율(%), 입고 지연율, 존 포화율, 승인자별 처리율. BI Tool 연계 가능. 추세 분석 및 개선 권고안 포함.', actor: 'FULGO', term: '리포팅', features: ['RPT-001', 'RPT-005'] },
      
      // 11단계: 승인 정책 관리
      { from: 'warehouse_manager', to: 'fulgo', label: '[11] 승인 정책 관리', desc: '승인 기준 동적 조정 및 정책 버전 관리', detail: '창고 관리자가 정책 설정: ① 승인 필요 조건(입고유형/화주등급/카테고리별로 승인 여부 결정) ② 승인 권한자(창고장/본부장 등 승인자 지정) ③ 목표 처리 시간(예: 승인 목표 2시간 이내). 정책 버전별 관리(v1.0→v1.1 업데이트 시 이전 버전 이력 보관) 및 시행일자 표시. 상품 정책과 자동 연동.', actor: '시스템 관리자', term: '정책 설정', features: ['CFG-001', 'USER-001'] },
      
      // 12단계: 통합 관리 및 모니터링
      { from: 'fulgo', to: 'system_dashboard', label: '[12] 프로세스 통합 관리', desc: '통합 모니터링 및 성과 분석', detail: '시스템 통합 모니터링. 주요 KPI: ① 승인 누적 시간(기준: 2시간 이내) ② 입고 정확도(WMS vs 실물 일치율) ③ 존 활용율(%). 실시간 대시보드에서 병목 구간 표시, 이상 상황 자동 알림.', actor: 'FULGO', term: '통합 모니터링', features: ['STK-011', 'RPT-005'] },
    ]
  },
  outbound: {
    title: '출고 프로세스 (Outbound)',
    description: '주문 접수부터 상품 피킹, 검수, 포장, 출고 확정까지의 전 과정을 관리. 재고 할당 우선화, 피킹 최적화(단일/배치/존 피킹), 검수 필수화, 송장 자동 생성, OMS 실시간 동기화를 포함합니다.',
    hierarchy: 'Fulgo(플랫폼) → 물류사(창고 운영자) → 화주사(고객사)',
    actors: [
      { id: 'oms_shipper', name: 'OMS / 화주사', color: '#1976d2', desc: '출고 요청 주체', layer: '3계층' },
      { id: 'fulgo', name: 'FULGO 시스템', color: '#d32f2f', desc: '재고 할당 엔진', layer: '1계층' },
      { id: 'worker', name: '현장 작업자', color: '#7b1fa2', desc: '피킹 및 작업 수행', layer: '2계층' },
      { id: 'quality_inspector', name: '검수 담당자', color: '#ff6f00', desc: '출고 검수 담당', layer: '2계층' },
      { id: 'packing_staff', name: '포장 담당자', color: '#f57c00', desc: '포장 및 송장 부착', layer: '2계층' },
      { id: 'shipping_staff', name: '출하 담당자', color: '#388e3c', desc: '차량 적재 및 인계', layer: '2계층' },
      { id: 'carrier', name: '배송사', color: '#00897b', desc: '택배 운송', layer: '외부' },
    ],
    steps: [
      // 1단계: 출고 요청
      { from: 'oms_shipper', to: 'fulgo', label: '[1] 출고 요청', desc: '주문 접수 및 출고 지시 생성', detail: 'OMS/화주사가 출고 요청서 생성: 필수항목(주문번호, 상품코드, 수량, 배송지, 배송 요청일) 입력. 출고 유형 지정(일반출고/긴급출고/합배송). FULGO에 데이터 전송 및 SKU 기반 매핑. 상태: 출고 요청', actor: 'OMS/화주사', term: '요청 접수', features: ['OUT-001', 'STK-004'] },
      
      // 2단계: 재고 할당
      { from: 'fulgo', to: 'system_allocation', label: '[2] 재고 할당', desc: '가용 재고 확인 및 예약 처리', detail: 'FULGO가 재고 할당 프로세스 수행: ① 가용 재고 확인(FIFO 정책: 먼저 입고된 상품 우선) ② 로케이션별 재고 분포 확인 ③ 재고 부족 시 처리(부족 수량 계산, 부분출고 가능 여부 판단) ④ 재고 할당 완료(상태 변경: 가용→예약). FIFO 적소도 정책으로 공정한 배분 보증', actor: 'FULGO', term: '재고 예약', features: ['STK-002', 'STK-012', 'OUT-001'] },
      
      // 3단계: 피킹 지시
      { from: 'fulgo', to: 'worker', label: '[3] 피킹 지시 생성', desc: '작업자에게 집품 지시 배정', detail: 'FULGO가 피킹 작업 생성 및 배정: ① 피킹 방식 결정(단일 피킹/배치 피킹/존 피킹) ② 작업 우선순위(긴급주문/배송 마감 임박) ③ 작업자별 피킹 리스트 생성 및 배정 ④ 모바일 디바이스로 실시간 전달. 상태: 피킹 대기', actor: 'FULGO', term: '지시 배정', features: ['PIC-001', 'PIC-002', 'PIC-009'] },
      
      // 4단계: 피킹 실행
      { from: 'worker', to: 'worker', label: '[4] 피킹 실행 및 검증', desc: '상품 수집 및 바코드 스캔 검증', detail: '작업자가 피킹 작업 수행: ① 모바일 디바이스로 피킹 리스트 확인 ② 지정된 로케이션으로 이동 ③ 상품 수집(상태: 피킹 중) ④ 바코드 스캔으로 검증(스캔 횟수=주문 수량 확인) ⑤ 불일치 시 오류 알림 및 즉시 재확인 ⑥ 전체 상품 수집 완료 후 검수 구역으로 이동', actor: '작업자', term: '피킹 완료', features: ['PIC-003', 'PIC-004', 'STK-005'] },
      
      // 5단계: 검수
      { from: 'quality_inspector', to: 'packing_staff', label: '[5] 출고 검수', desc: '피킹된 상품 정확성 확인', detail: '검수 담당자가 피킹 상품 검증: ① 상품코드 일치 확인 ② 수량 재확인 ③ 상품 상태 확인(파손/유효기한/온전성). 결과처리: [검수 통과] 상태: 검수 완료→포장 단계 이동 / [검수 실패] 상태: 검수 보류→오류 유형 분류(상품 불일치/수량 부족/상품 파손)→재피킹 요청 또는 주문 취소', actor: '검수 담당자', term: '검수 완료', features: ['PIC-010', 'STK-005'] },
      
      // 6단계: 포장
      { from: 'packing_staff', to: 'shipping_staff', label: '[6] 포장 및 송장 부착', desc: '상품 포장 및 배송 준비', detail: '포장 담당자가 포장 작업 수행: ① 포장 자재 선택(박스 크기/완충재) ② 상품 포장(상태: 포장 중) ③ 택배 송장 자동 생성(배송사 API 연동) ④ 바코드/QR 송장 출력 및 박스에 부착 ⑤ 포장 완료 스캔 후 출하 대기 구역으로 이동(상태: 포장 완료)', actor: '포장 담당자', term: '포장 완료', features: ['PIC-005', 'PIC-006'] },
      
      // 7단계: 출고 확정
      { from: 'shipping_staff', to: 'carrier', label: '[7] 출고 확정 및 배송 인계', desc: '차량 적재 및 배송사 인수', detail: '출하 담당자가 출고 확정 프로세스: ① 출하 스테이징(배송사별 그룹핑, 차량 배정) ② 차량 적재(송장 스캔으로 적재 확인) ③ 배송사 인수증 발행(상태: 출고 확정) ④ WMS 재고 차감(예약→출고 완료) ⑤ OMS로 출고 완료 데이터 전송 및 송장번호 전달', actor: '출하 담당자', term: '출고 확정', features: ['OUT-002', 'STK-011'] },
      
      // 8단계: 후속 처리 및 모니터링
      { from: 'fulgo', to: 'carrier', label: '[8] 배송 추적 및 이력 관리', desc: '배송 상태 업데이트 및 완료', detail: 'FULGO 시스템이 출고 후속 처리: ① 출고 로그 기록(출고일시/작업자/송장번호/배송사) ② 배송사 API 연동하여 배송 상태 실시간 업데이트(집하→수송중→배송완료) ③ 출고 완료(상태: 완료) ④ OMS와 최종 동기화 ⑤ 고객 배송 추적 정보 제공. 예외상황 자동 알림(배송 지연/반품 요청 등)', actor: 'FULGO', term: '완료', features: ['OUT-003', 'STK-002', 'STK-011'] },
    ]
  },
  return: {
    title: '반품 프로세스 (Return)',
    description: '반품 접수부터 검수, 재입고 또는 폐기까지의 전 과정을 관리. 반품 승인/거부 자동화, 검수 등급 분류(A/B/C), 3가지 처리 경로(재입고/불량/폐기), 증빙 관리, 반품 사유별 차별화 처리를 포함합니다.',
    hierarchy: 'Fulgo(플랫폼) → 물류사(창고 운영자) → 화주사(고객사)',
    actors: [
      { id: 'customer_service', name: 'OMS / 고객서비스팀', color: '#1976d2', desc: '반품 접수 및 승인', layer: '3계층' },
      { id: 'fulgo', name: 'FULGO 시스템', color: '#d32f2f', desc: '반품 관리 엔진', layer: '1계층' },
      { id: 'inbound_staff', name: '입고 담당자', color: '#7b1fa2', desc: '반품 상품 수령', layer: '2계층' },
      { id: 'quality_inspector', name: '검수 담당자', color: '#ff6f00', desc: '반품 검수 및 등급 판정', layer: '2계층' },
      { id: 'return_manager', name: '반품 담당자', color: '#f57c00', desc: '처리 방법 결정', layer: '2계층' },
      { id: 'warehouse_manager', name: '창고장', color: '#0288d1', desc: '폐기 승인', layer: '2계층' },
      { id: 'disposal_staff', name: '폐기 담당자', color: '#388e3c', desc: '폐기 실행', layer: '2계층' },
    ],
    steps: [
      // 1단계: 반품 접수
      { from: 'customer_service', to: 'fulgo', label: '[1] 반품 접수 및 승인', desc: '반품 요청 접수 및 정책 검증', detail: 'OMS/고객서비스팀이 반품 접수: ① 반품 요청 채널(OMS/고객센터/쇼핑몰) ② 필수정보(주문번호/상품코드/수량/사유) ③ 반품 유형 분류(고객 변심/상품 하자/배송 문제) ④ 상태: 반품 접수. FULGO가 정책 검증: 반품 가능 기간 확인, 반품 불가 조건 체크(기한초과/고객 귀책/불가 상품). 승인/거부 결정. 상태: 반품 승인 또는 반품 거부(→ 고객 통보 → 종료)', actor: 'OMS/고객서비스팀', term: '승인 완료', features: ['RET-001', 'RET-004'] },
      
      // 2단계: 반품 입고 대기
      { from: 'fulgo', to: 'system_return_prep', label: '[2] 반품 입고 대기', desc: '반품 상품 도착 준비 및 검수 기준 설정', detail: 'FULGO가 반품 입고 준비: ① 반품 정보 등록(원 주문번호/상품코드/수량/반품 사유) ② 반품 전용 존 도착 및 보관 가능 재고 도착 ③ 반품 사유별 검수 기준 설정(고객 변심→포장/상태 확인, 상품 하자→불량 유형 판단) ④ 택배사 회수 요청 생성, 반품 송장 발행 ⑤ 상태: 입고 대기', actor: 'FULGO', term: '준비 완료', features: ['STK-008', 'RET-001'] },
      
      // 3단계: 반품 상품 입고
      { from: 'inbound_staff', to: 'quality_inspector', label: '[3] 반품 상품 입고', desc: '택배로 도착한 반품 상품 수령', detail: '입고 담당자가 반품 입고 프로세스: ① 택배사로부터 반품 상품 수령 ② 송장 바코드 스캔 ③ 상태: 입고 완료 ④ 반품 전용 존으로 상품 이동 ⑤ 검수 대기 상태로 적치', actor: '입고 담당자', term: '입고 완료', features: ['PIC-010', 'STK-008'] },
      
      // 4단계: 반품 검수
      { from: 'quality_inspector', to: 'return_manager', label: '[4] 반품 검수 및 등급 판정', desc: '반품 상품 상태 확인 및 등급 분류', detail: '검수 담당자가 반품 검수 수행: ① 외관 검수(포장상태/손상여부/라벨태그 상태) ② 기능 검수(작동 여부/부속품 완전성) ③ 상품 상태 확인(색상 변화/변형/오염 여부) ④ 상태: 검수 중. 검수 등급 판정 및 사진 촬영(증빙용): [A등급-정상]재판매 가능, [B등급-경미한 하자]재고조정 후 재판매 가능, [C등급-불량]재판매 불가/폐기 대상', actor: '검수 담당자', term: '등급 판정', features: ['RET-002', 'RET-003'] },
      
      // 5단계: 처리 방법 결정
      { from: 'return_manager', to: 'fulgo', label: '[5] 반품 처리 결정', desc: '검수 결과 기반 후속 조치 결정', detail: '반품 담당자가 처리 방법 결정: [A등급] 상태: 재입고 결정 → 일반 존으로 이동 지시 [B등급] 상태: 불량 재고 전환 → 불량품 존으로 이동, 화주에게 처리 방안 문의(할인판매/폐기) [C등급] 상태: 폐기 대상 → 폐기 승인 요청. 반품 사유별 처리: ①고객 변심-검수통과→재입고, 실패→거부/차감 ②상품하자-하자확인→폐기/제조사반품, 미확인→재입고 ③배송문제-파손확인→배상청구/폐기, 정상→재입고', actor: '반품 담당자', term: '처리 결정', features: ['RET-002', 'RET-006'] },
      
      // 6단계: 재입고 실행
      { from: 'fulgo', to: 'warehouse_manager', label: '[6] 재입고 실행 또는 폐기 준비', desc: '결정된 처리 경로 실행', detail: '[재입고 경로] ① 반품 존 → 일반 존으로 이동 ② 로케이션 재할당 ③ 재고 상태 변경(반품 검수 → 가용) ④ WMS 재고 수량 증가 ⑤ OMS로 재입고 완료 데이터 전송 ⑥ 상태: 재입고 완료. [폐기 경로] ① 폐기 전 사진 촬영(증빙) ② 폐기 승인 대기 → 상태: 폐기 승인 대기', actor: '반품 담당자', term: '실행 완료', features: ['STK-011', 'RET-006'] },
      
      // 7단계: 폐기 처리
      { from: 'warehouse_manager', to: 'disposal_staff', label: '[7] 폐기 승인 및 실행', desc: '폐기 대상 상품의 처리', detail: '창고장이 폐기 승인: ① 폐기 사유 기록 ② 상태: 폐기 승인 대기 → 폐기 승인 완료. 폐기 담당자가 폐기 실행: ① 폐기 전 사진 촬영(증빙) ② 폐기 방법 선택(일반폐기/파쇄/환경폐기) ③ 폐기 실행 ④ 상태: 폐기 완료 ⑤ 폐기 로그 기록(일시/담당자/수량/사유) ⑥ 폐기 증빙 서류 보관', actor: '폐기 담당자', term: '폐기 완료', features: ['RET-006', 'STK-011'] },
      
      // 8단계: 환불 및 정산
      { from: 'fulgo', to: 'customer_service', label: '[8] 환불 처리 및 회계 정산', desc: '반품 완료 후 환불 및 정산 처리', detail: '반품 완료 시 최종 처리: ① 환불 처리(재입고 완료 시→고객 환불, 검수 실패→부분환불 또는 거부) ② 재고 회계 처리(재입고 시→자산증가, 폐기 시→자산감소/폐기손실기록) ③ 반품 완료 상태: 완료. ④ 고객 반품 진행 상황 전달. ⑤ 반품 사유 분석 및 기록(반품이력 추적, 반복반품 모니터링, KPI 수집)', actor: 'FULGO', term: '완료', features: ['RET-007', 'STK-011', 'RPT-001'] },
    ]
  },
  storage: {
    title: '재고 관리 프로세스 (Inventory Management)',
    description: '입고부터 출고까지 재고의 상태, 수량, 위치를 실시간으로 추적하고 관리. 가용/예약/보류/불량 상태 관리, FIFO/FEFO 최적화, OMS 동기화, 실시간 모니터링을 포함합니다.',
    hierarchy: 'Fulgo(플랫폼) → 물류사(창고 운영자) → 화주사(고객사)',
    actors: [
      { id: 'fulgo', name: 'FULGO 시스템', color: '#d32f2f', desc: '재고 엔진 중앙', layer: '1계층' },
      { id: 'warehouse_manager', name: '창고 관리자', color: '#ff6f00', desc: '재고 정책 설정', layer: '2계층' },
      { id: 'worker', name: '현장 작업자', color: '#7b1fa2', desc: '재고 적치/이동', layer: '2계층' },
      { id: 'shipper', name: '화주사', color: '#1976d2', desc: '재고 모니터링', layer: '3계층' },
      { id: 'oms_system', name: 'OMS 시스템', color: '#0288d1', desc: '재고 동기화', layer: '외부' },
    ],
    steps: [
      // 1단계: 재고 상태 관리
      { from: 'fulgo', to: 'system_inventory_engine', label: '[1] 재고 상태 분류', desc: '가용/예약/보류/불량 상태 구분 및 추적', detail: 'FULGO 재고 엔진이 재고 생명주기별 상태를 자동 추적: ① 가용(Available) - 출고 가능한 정상 재고 ② 예약(Reserved) - 출고 지시 생성되었으나 피킹 전 ③ 피킹 중(Picking) - 피킹 작업 진행 중 ④ 보류(Hold) - 검수 대기 또는 문제 발생으로 출고 불가 ⑤ 불량(Defective) - 판매 불가 불량품 ⑥ 폐기 예정(To be Disposed) - 폐기 승인 대기. 각 상태 변환은 자동 기록됨', actor: 'FULGO', term: '상태 추적', features: ['STK-002', 'STK-011'] },
      
      // 2단계: 재고 수량 관리
      { from: 'fulgo', to: 'system_inventory_engine', label: '[2] 재고 수량 관리', desc: '물리/가용/예약/안전 재고 수량 구분 관리', detail: 'FULGO가 4가지 재고 수량을 실시간 관리: ① 물리 재고(Physical) - 창고 실제 적치된 수량 ② 가용 재고(Available) - 출고 가능한 수량(=물리-예약-보류) ③ 예약 재고(Reserved) - 출고 지시로 할당된 수량 ④ 안전 재고(Safety Stock) - 화주 정책에 따라 최소로 유지할 수량. 입고/출고/조정/반품 시점에 자동 갱신', actor: 'FULGO', term: '수량 갱신', features: ['STK-002', 'STK-004', 'STK-012'] },
      
      // 3단계: 로케이션 관리
      { from: 'warehouse_manager', to: 'fulgo', label: '[3] 로케이션 구조 설정', desc: '존-로케이션 체계 정의 (구역-열-단)', detail: '창고 관리자가 로케이션 구조 설정: 존(Zone) - 대분류 구역(의류존/악세서리존/신발존/보류존/불량존), 로케이션 - 세부 위치코드(A-01-01 형식). 각 로케이션에 크기, 적재 중량, 속성 정보 입력. FIFO/FEFO 정책 설정', actor: '창고 관리자', term: '로케이션 체계', features: ['CFG-001', 'STK-006', 'STK-013'] },
      
      // 4단계: 자동 할당
      { from: 'fulgo', to: 'worker', label: '[4] 로케이션 자동 할당', desc: '상품 속성/상태 기반 존 할당', detail: 'FULGO가 입고 상품을 자동 할당: ① 상품 속성(카테고리/크기/수량) 확인 → ② 적합한 존 선택(의류→의류존, 신발→신발존, 악세서리→악세서리존 등) → ③ 빈 로케이션 검색 → ④ 자동 할당. 존 포화 시 자동 알림 및 재배치 요청', actor: 'FULGO', term: '자동 할당', features: ['STK-006', 'STK-013'] },
      
      // 5단계: 재고 이동 추적
      { from: 'worker', to: 'fulgo', label: '[5] 재고 이동 이력 기록', desc: '입고/이동/피킹/출고 전체 추적', detail: '모든 재고 이동을 추적 기록: 입고(OMS → WMS 입고 → 로케이션 A) → 이동(로케이션 A → B) → 피킹(로케이션 A → 피킹 존) → 출고(피킹 존 → 출하) → 반품(반품 존 → 로케이션 A). 로트/시리얼 번호 기반 추적. 전체 이력 조회 가능', actor: '작업자', term: '이동 추적', features: ['STK-005', 'STK-013'] },
      
      // 6단계: 재고 가시성
      { from: 'fulgo', to: 'shipper', label: '[6] 실시간 모니터링', desc: '재고 현황 대시보드 및 알림', detail: 'FULGO 대시보드에서 실시간 재고 현황 모니터링: ① 전체 재고 현황(가용/예약/보류/불량 비율) ② 존별 재고 분포 및 가동률 ③ 화주별 재고 현황 ④ 재고 회전율. 자동 알림: 재고 부족(안전 재고 이하) → 화주에게 자동 알림, 계절 상품 잔여(시즌 종료 30일 전) → 알림, 장기 재고(90일 이상 미출고) → 알림', actor: '화주사', term: '가시성', features: ['RPT-001', 'RPT-005'] },
      
      // 7단계: OMS 동기화
      { from: 'fulgo', to: 'oms_system', label: '[7] 재고 실시간 동기화', desc: '입출고 즉시 OMS와 동기화', detail: 'FULGO와 OMS 간 실시간 재고 동기화: ① 입고 완료 → WMS → OMS (재고 증가) ② 출고 확정 → WMS → OMS (재고 감소) ③ 재고 조정 → WMS → OMS (수량 변경) ④ 반품 재입고 → WMS → OMS (재고 증가). 동기화 실패 시 자동 재시도(최대 3회), 실패 시 관리자 알림', actor: 'FULGO', term: '동기화', features: ['STK-002', 'STK-011'] },
      
      // 8단계: 정합성 체크
      { from: 'warehouse_manager', to: 'fulgo', label: '[8] 재고 정합성 검증', desc: 'WMS vs 실물 vs OMS 재고 일치 확인', detail: '자동 정합성 체크 (일 1회 실행): ① WMS 재고 vs 실물 재고 비교 → 불일치 시 "재고 조정 필요" 알림 ② WMS 재고 vs OMS 재고 비교 → 차이 분석 ③ 불일치 원인 파악 및 기록. 작업자 실사 결과와 시스템 재고 자동 조정. 정합성 리포트 생성', actor: '창고 관리자', term: '정합성 검증', features: ['STK-010', 'RPT-001'] },
      
      // 9단계: 재고 정책 관리
      { from: 'warehouse_manager', to: 'fulgo', label: '[9] 재고 정책 설정', desc: '화주별/상품별 정책 관리', detail: '창고 관리자가 재고 운영 정책 설정: ① 화주별 정책 - 안전 재고(상품별), FIFO/FEFO 회전 정책, 로트/유효기한 관리 여부 ② 재고 분류 - ABC 분석(A등급:고빈도 상위20%, B등급:중빈도 중위30%, C등급:저빈도 하위50%) ③ 보유 비용 - 보관료(일/월 단위), 장기 보관 추가 비용, 존별 단가 설정', actor: '창고 관리자', term: '정책 설정', features: ['CFG-001', 'USER-001'] },
      
      // 10단계: 재고 분석 및 리포팅
      { from: 'fulgo', to: 'warehouse_manager', label: '[10] 재고 분석 및 개선 제안', desc: '통계 분석 기반 재고 운영 개선 제안', detail: 'FULGO가 재고 데이터 분석 및 개선 제안: ① 재고 분석 - 회전 속도, 평균 체류 기간, ABC 분류(A:고빈도 상위20%, B:중빈도 중위30%, C:저빈도 하위50%) ② 공간 활용 분석 - 고빈도 상품 위치 개선, 피킹 동선 효율성 분석 제안 ③ 과재고 현황 - 90일 이상 미출고 상품 리스트, 할인판매 또는 반출 제안 ④ 비용 분석 - 보관료 추이, 보관 구역별 수익률 분석.', actor: 'FULGO', term: '분석 완료', features: ['RPT-005', 'STK-011'] },
      
      // 11단계: KPI 리포팅
      { from: 'fulgo', to: 'shipper', label: '[11] KPI 리포팅 및 분석', desc: '일간/주간/월간 KPI 자동 생성', detail: 'FULGO 자동 생성 리포트: ① 재고 정확도(%) - WMS vs 실물 비교 ② 재고 회전율 - 입고 대비 출고 비율 ③ 평균 체류 기간 - 입고부터 출고까지 소요 일수 ④ 존별 가동률(%) - 용량 대비 사용률 ⑤ 재고 가치 변동 - 수량×단가. 화주별 리포트, 추세 분석, 권장사항 포함', actor: 'FULGO', term: '리포팅', features: ['RPT-001', 'RPT-005'] },
    ]
  }
};