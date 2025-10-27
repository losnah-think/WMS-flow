// src/models/flowData.ts
import { Flow } from './types';

export const flowData: Record<string, Flow> = {
  inbound: {
    title: '입고 프로세스 (Inbound)',
    description: '화주사의 OMS 입고 요청부터 WMS 검수, 재입고까지 완전한 입고 워크플로우. 승인 절차, 존 할당, 검수, 예외 처리, 모니터링, 리포팅을 포함합니다.',
    hierarchy: 'Fulgo(플랫폼) → 물류사(창고 운영자) → 화주사(고객사)',
    actors: [
      { id: 'shipper', name: '화주사', color: '#1976d2', desc: 'OMS에서 입고 진행', layer: '3계층' },
      { id: 'oms_system', name: 'FULGO OMS', color: '#2196f3', desc: '입고 요청 접수', layer: '1계층' },
      { id: 'fulgo_wms', name: 'FULGO WMS', color: '#d32f2f', desc: '입고 조율 및 재고 관리', layer: '1계층' },
      { id: 'warehouse_manager', name: '창고장', color: '#ff6f00', desc: '입고 승인권자', layer: '2계층' },
      { id: 'worker', name: '현장 작업자', color: '#7b1fa2', desc: '입고 실행 및 검수', layer: '2계층' },
    ],
    steps: [
      // 1단계: OMS 입고 요청
      { from: 'shipper', to: 'oms_system', label: '[1] OMS 입고 요청', desc: '화주사가 OMS에서 입고 요청 진행', detail: '화주사가 FULGO OMS를 통해 입고 요청 진행: ① 필수 항목 입력(상품코드, 수량, 납품예정일, 송장번호) ② 입고 유형 지정(일반입고/긴급입고) ③ 요청 제출. OMS가 입고 요청 데이터 생성. 상태: REQUEST_PENDING', actor: '화주사', term: '요청 접수', features: ['STK-008'] },
      
      // 2단계: OMS → WMS 데이터 전송
      { from: 'oms_system', to: 'fulgo_wms', label: '[2] OMS에서 WMS로 데이터 전송', desc: 'OMS가 입고 데이터를 WMS로 전달', detail: 'FULGO OMS가 입고 요청 데이터를 FULGO WMS로 전송: ① 입고 요청 상세 정보 전달 ② SKU 기반 매핑 ③ 검증 데이터 함께 전송. WMS가 데이터 수신 및 검증. 상태: DATA_RECEIVED', actor: 'OMS 시스템', term: '데이터 전송', features: ['STK-008', 'OUT-001'] },
      
      // 3단계: WMS 검증 및 판정
      { from: 'fulgo_wms', to: 'fulgo_wms', label: '[3] WMS 입고 검증 및 승인 판정', desc: '입고 데이터 자동 검증 및 승인 필요 여부 판단', detail: 'FULGO WMS 내부 엔진이 OMS에서 받은 입고 데이터 검증: ① 입고 유형 자동 분류 ② 재고 수용 가능 여부 확인 ③ 승인 필요 조건 판정(신규화주/대량입고/특수상품). 승인 필요 시: 창고장에 승인 요청. 승인 불필요 시: 직진. 상태: APPROVAL_PENDING 또는 READY', actor: 'FULGO WMS', term: '검증 완료', features: ['STK-008', 'CFG-001'] },
      
      // 4단계: 창고장 승인
      { from: 'fulgo_wms', to: 'warehouse_manager', label: '[4] 창고장 승인 요청', desc: '창고장에게 입고 승인 요청 지시', detail: 'FULGO WMS가 승인이 필요한 입고에 대해 창고장에 승인 요청: ① 입고 요청 상세 정보 제시 ② 승인 필요 사유 명시(신규화주/대량입고/특수상품 등) ③ 창고장에게 검토 요청. 상태: 승인 대기', actor: 'FULGO WMS', term: '요청 발행', features: ['CFG-001'] },
      
      // 5단계: 승인 처리
      { from: 'warehouse_manager', to: 'fulgo_wms', label: '[5] 입고 승인 처리', desc: '입고 적합성 검토 및 승인 결정', detail: '창고장이 다음 기준으로 검토: ① 재고 수용 가능 여부(존 여유/수량) ② 입고 상품 품목 적합성(상태/보관구역) ③ 반입 제한 품목 여부. 승인 시 APPROVED, 반려 시 REJECTED + 사유 기입 및 FULGO WMS에 결과 보고. 상태: APPROVED 또는 REJECTED', actor: '창고장', term: '승인 완료', features: ['CFG-001', 'STK-006'] },
      
      // 6단계: 존 할당 지시
      { from: 'fulgo_wms', to: 'worker', label: '[6] 존 할당 및 입고 지시', desc: '상품 속성 기반 로케이션 할당 및 입고 지시', detail: 'FULGO WMS가 상품 정책 기반으로 자동 할당: 크기/컬러/카테고리별 적합 존 선택. 로케이션 코드 부여. 작업자에게 입고 지시 발행: ① 할당된 로케이션 정보 ② 상품 정보(상품코드/수량/배송건 정보) ③ 작업자에게 지시 전달. 상태: 입고 대기', actor: 'FULGO WMS', term: '지시 발행', features: ['STK-005', 'STK-006'] },
      
      // 7단계: 입고 실행
      { from: 'worker', to: 'fulgo_wms', label: '[7] 입고 실행 완료 보고', desc: '상품 수령 및 할당 위치에 적치 확인', detail: '현장 작업자가 입고 작업 수행: ① 상품 수령 및 바코드 스캔 ② 상품 수량/파손/상태 확인 ③ 할당된 존으로 상품 이동 ④ 검수 수행(수량/파손/상태 최종 확인) ⑤ FULGO WMS에 입고 완료 보고. 상태: INBOUND_CONFIRMED', actor: '작업자', term: '입고 완료', features: ['STK-005', 'STK-010'] },
      
      // 8단계: 재고 상태 업데이트 및 OMS 동기화
      { from: 'fulgo_wms', to: 'oms_system', label: '[8] 재고 상태 업데이트 및 OMS 동기화', desc: '입고 완료 시 재고 상태 변경 및 OMS 동기화', detail: 'FULGO WMS 내부 재고 엔진이 입고 완료 처리: ① 재고 상태 변경(입고중→가용) ② 재고 수량 증가 ③ OMS로 입고확정 데이터 전송 ④ 송장 정보 등록 ⑤ 재고 정합성 체크. OMS에 최종 동기화. 상태: COMPLETED', actor: 'FULGO WMS', term: '동기화 완료', features: ['STK-002', 'STK-011', 'STK-007'] },
      
      // 9단계: 예외 처리 및 모니터링
      { from: 'fulgo_wms', to: 'warehouse_manager', label: '[9] 예외 처리 및 실시간 모니터링', desc: '승인 지연/존 포화/검수 실패 등 비정상 상황 감지 및 대응', detail: 'FULGO WMS 대시보드에서 예외 시나리오 자동 감지 및 관리자 알림: ① 승인 지연(목표 2시간 초과)→자동 알림 ② 존 포화(용량 90% 이상)→ZONE_WAITING 대기열 등록, 자동 재할당 제안 ③ 검수 실패→HOLD 상태, 재검수 요청 ④ 정보 불일치→상품 확인 후 조정. 요청/검증대기/승인대기/입고중/완료별 현황 시각화.', actor: '창고장', term: '모니터링', features: ['STK-006', 'RPT-001'] },
      
      // 10단계: KPI 리포팅 (시스템 내부 분석)
      { from: 'fulgo_wms', to: 'fulgo_wms', label: '[10] KPI 리포팅 및 분석', desc: '입고 효율성 및 성과 분석 리포트 생성', detail: 'FULGO WMS 자동 생성: 일간/주간/월간 리포트. KPI: 승인 평균 소요시간, 반려율(%), 입고 지연율, 존 포화율, 재고 정합성율(%). 추세 분석 및 개선 권고안 포함.', actor: 'FULGO WMS', term: '리포팅', features: ['RPT-001', 'RPT-005'] },
    ]
  },
  outbound: {
    title: '출고 프로세스 (Outbound)',
    description: '외부 채널 주문부터 OMS 접수, WMS 출고 지시, 작업자의 피킹/검수/포장/출하까지의 전 과정을 관리. 재고 할당 우선화, 피킹 최적화, 검수 필수화, 송장 자동 생성, OMS 실시간 동기화를 포함합니다.',
    hierarchy: 'Fulgo(플랫폼) → 물류사(창고 운영자) → 화주사(고객사)',
    actors: [
      { id: 'channel', name: '주문 채널', color: '#424242', desc: '고객 주문 수신', layer: '외부' },
      { id: 'oms_system', name: 'FULGO OMS', color: '#2196f3', desc: '주문 접수 및 처리', layer: '1계층' },
      { id: 'fulgo_wms', name: 'FULGO WMS', color: '#d32f2f', desc: '출고 조율 및 재고 할당', layer: '1계층' },
      { id: 'worker', name: '현장 작업자', color: '#7b1fa2', desc: '피킹/검수/포장/출하 수행', layer: '2계층' },
      { id: 'carrier', name: '배송사', color: '#00897b', desc: '택배 운송', layer: '외부' },
    ],
    steps: [
      // 1단계: 주문 수신
      { from: 'channel', to: 'oms_system', label: '[1] 주문 수신', desc: '외부 채널에서 고객 주문 수신', detail: '고객이 쿠팡, 네이버, 스마트스토어 등 외부 판매채널에서 주문: ① 주문 정보(상품코드/수량/배송지/연락처) 생성 ② 판매채널 시스템에서 화주사로 주문 전달. 상태: 주문 수신', actor: '채널', term: '주문 수신', features: ['OUT-001'] },
      
      // 2단계: OMS 주문 접수 (시스템 내부 처리)
      { from: 'oms_system', to: 'fulgo_wms', label: '[2] OMS 주문 접수 및 처리', desc: 'OMS에서 주문 검증 및 출고 요청 생성 후 WMS로 전달', detail: 'FULGO OMS가 외부 채널 주문 접수: ① 주문 정보 수신 및 검증 ② 화주사 계정 확인 ③ 상품 정보 매핑(SKU 기반) ④ 출고 요청서 생성 ⑤ 배송 유형 결정(일반/긴급/합배송). OMS에서 WMS로 출고 요청 전달. 상태: 출고 요청', actor: 'FULGO OMS', term: '요청 생성', features: ['OUT-001', 'STK-004'] },
      
      // 3단계: 재고 할당
      { from: 'oms_system', to: 'fulgo_wms', label: '[3] 출고 요청 전달 및 재고 할당', desc: 'OMS가 WMS로 출고 요청 전달, WMS가 재고 확인 및 할당', detail: 'FULGO OMS가 출고 요청을 FULGO WMS로 전달: ① 주문 상세 정보 송신 ② WMS의 재고 할당 엔진이 내부 처리: - 가용 재고 확인(FIFO 정책: 먼저 입고된 상품 우선) - 로케이션별 재고 분포 확인 - 재고 부족 시 처리 또는 부분출고 판단 ③ 재고 할당 완료(상태 변경: 가용→예약). 상태: 재고 예약', actor: 'FULGO WMS', term: '할당 완료', features: ['STK-002', 'STK-012', 'OUT-001'] },
      
      // 4단계: 출고 지시 발행
      { from: 'fulgo_wms', to: 'worker', label: '[4] 출고 지시 발행', desc: '작업자에게 피킹/검수/포장/출하 종합 지시', detail: 'FULGO WMS가 작업자에게 출고 작업 지시: ① 피킹 방식 결정(단일/배치/존 피킹) ② 배송 우선순위 설정(긴급주문/마감임박) ③ 작업 리스트 생성(피킹 위치, 상품정보, 수량) ④ 송장 사전 생성 ⑤ 작업자 모바일 디바이스로 실시간 전달. 상태: 작업 준비', actor: 'FULGO WMS', term: '지시 발행', features: ['PIC-001', 'PIC-002', 'OUT-002'] },
      
      // 5단계: 피킹 (작업 실행)
      { from: 'worker', to: 'fulgo_wms', label: '[5] 피킹', desc: '지정된 로케이션에서 상품 수집 및 완료 보고', detail: '현장 작업자가 피킹 작업 수행: ① 모바일 디바이스로 피킹 리스트 확인 ② 지정된 로케이션으로 이동 ③ 바코드 스캔으로 상품 확인(스캔 횟수=주문 수량 매칭) ④ 불일치 시 오류 알림 및 즉시 재확인 ⑤ 상품 수집 완료. WMS에 피킹 완료 보고. 상태: 피킹 완료', actor: '작업자', term: '피킹 완료', features: ['PIC-001', 'PIC-003', 'STK-005'] },
      
      // 6단계: 검수 (품질 검증)
      { from: 'worker', to: 'fulgo_wms', label: '[6] 검수', desc: '피킹된 상품 정확성 및 상태 검증 후 보고', detail: '현장 작업자가 검수 작업 수행: ① 피킹된 상품코드 재확인 ② 수량 재점검 ③ 상품 상태 확인(파손/변형/오염/유효기한). 결과: [검수 통과]→다음 단계로 진행 / [검수 실패]→FULGO에 보고, 재피킹 또는 취소 지시 대기. 상태: 검수 완료 또는 HOLD', actor: '작업자', term: '검수 완료', features: ['PIC-004', 'PIC-010', 'STK-005'] },
      
      // 7단계: 포장 (작업 실행)
      { from: 'worker', to: 'fulgo_wms', label: '[7] 포장', desc: '상품 포장 및 송장 부착 후 완료 보고', detail: '현장 작업자가 포장 작업 수행: ① 포장 자재 선택(박스 크기/완충재/충전제) ② 상품을 박스에 포장 ③ 송장 바코드/QR 출력 및 박스에 부착 ④ 포장 완료 스캔 ⑤ 검수 구역에서 출하 구역으로 이동 후 WMS에 보고. 상태: 포장 완료', actor: '작업자', term: '포장 완료', features: ['PIC-005', 'PIC-006', 'OUT-002'] },
      
      // 8단계: 출하
      { from: 'worker', to: 'fulgo_wms', label: '[8] 출하 완료 보고', desc: '배송사별 그룹핑 및 차량 적재 완료', detail: '현장 작업자가 출하 작업 수행: ① 포장 완료된 상품을 배송사별로 그룹핑 ② 바코드 스캔으로 차량 적재 확인 ③ 배송사 인수증 서명 ④ FULGO에 출고 확정 보고. FULGO가 수신하여: ⑤ WMS 재고 차감(예약→출고 완료) ⑥ OMS로 출고 완료 데이터 및 송장번호 전송. 상태: 출고 확정', actor: '작업자', term: '출하 완료', features: ['OUT-002', 'OUT-003', 'STK-011'] },
      
      // 9단계: 배송 추적
      { from: 'fulgo_wms', to: 'carrier', label: '[9] 배송 추적 API 연동', desc: '배송사 API로 배송 상태 실시간 추적', detail: 'FULGO WMS가 출고 후속 처리: ① 배송사 API 연동하여 배송 상태 실시간 업데이트(집하→수송중→배송완료) ② 배송 상태 변경 시 자동 알림 ③ 고객 조회 페이지 제공. 상태: 배송 추적 중 → 배송 완료', actor: 'FULGO WMS', term: '추적 중', features: ['OUT-003', 'STK-002'] },
      
      // 10단계: 최종 완료
      { from: 'fulgo_wms', to: 'oms_system', label: '[10] 출고 완료 및 OMS 동기화', desc: '배송 완료 후 최종 처리 및 OMS 동기화', detail: 'FULGO WMS가 배송 완료 수신 후 최종 처리: ① 출고 로그 기록(출고일시/작업자/송장번호/배송사/배송완료시각) ② 출고 상태 최종 완료 ③ OMS로 최종 동기화 전송 ④ 고객 배송 완료 알림. 예외상황 자동 알림(배송 지연/배송 불가/반품 요청 등)', actor: 'FULGO WMS', term: '완료', features: ['OUT-003', 'STK-011', 'RPT-001'] },
    ]
  },
  return: {
    title: '반품 프로세스 (Return)',
    description: '고객 반품 신청부터 OMS 접수, WMS 검수/처리, 재입고 또는 폐기까지의 전 과정을 관리. 반품 정책 검증, 검수 등급 분류(A/B/C), 3가지 처리 경로(재입고/불량/폐기), 증빙 관리를 포함합니다.',
    hierarchy: 'Fulgo(플랫폼) → 물류사(창고 운영자) → 화주사(고객사)',
    actors: [
      { id: 'customer', name: '고객', color: '#424242', desc: '반품 신청', layer: '외부' },
      { id: 'oms_system', name: 'FULGO OMS', color: '#2196f3', desc: '반품 접수 및 승인', layer: '1계층' },
      { id: 'fulgo_wms', name: 'FULGO WMS', color: '#d32f2f', desc: '반품 조율 및 재고 처리', layer: '1계층' },
      { id: 'worker', name: '현장 작업자', color: '#7b1fa2', desc: '반품 수령/검수/처리 수행', layer: '2계층' },
      { id: 'warehouse_manager', name: '창고장', color: '#ff6f00', desc: '재입고/폐기 최종 승인', layer: '2계층' },
    ],
    steps: [
      // 1단계: 반품 신청
      { from: 'customer', to: 'oms_system', label: '[1] 반품 신청', desc: '고객이 반품 요청', detail: '고객이 반품 사유와 함께 반품 신청: ① 주문번호/상품코드/수량 확인 ② 반품 사유 선택(고객 변심/상품 하자/배송 문제) ③ 반품 신청 제출. OMS에서 요청 수신. 상태: 반품 신청', actor: '고객', term: '신청 접수', features: ['RET-001', 'RET-004'] },
      
      // 2단계: OMS 반품 접수 및 정책 검증 (시스템 내부 처리)
      { from: 'oms_system', to: 'fulgo_wms', label: '[2] OMS 반품 접수 및 정책 검증', desc: 'OMS에서 반품 정책 자동 검증 후 WMS로 전달', detail: 'FULGO OMS가 반품 정책 자동 검증: ① 반품 가능 기간 확인(구매 후 30일 이내 등) ② 반품 불가 조건 체크(기한초과/고객 귀책/불가 상품) ③ 승인/거부 결정 ④ 승인 시: 택배사 회수 요청 생성, 반품 송장 발행, 반품 정보 등록 ⑤ 거부 시: 고객 거부 통보. WMS로 승인된 반품 전달. 상태: 승인 또는 거부', actor: 'FULGO OMS', term: '검증 완료', features: ['RET-001', 'STK-008'] },
      
      // 3단계: WMS 반품 입고 지시
      { from: 'oms_system', to: 'fulgo_wms', label: '[3] WMS 반품 입고 지시', desc: 'OMS가 승인된 반품을 WMS에 전달', detail: 'FULGO OMS가 승인된 반품을 FULGO WMS로 전달: ① 반품 상세 정보 송신(원 주문번호/상품/반품 사유) ② 반품 송장번호 전달 ③ 반품 전용 존 정보 포함. WMS가 반품 입고 대기. 상태: 반품 입고 준비', actor: 'FULGO OMS', term: '데이터 전달', features: ['RET-001', 'STK-008'] },
      
      // 4단계: 작업자 - 반품 상품 입고 수령
      { from: 'fulgo_wms', to: 'worker', label: '[4] 반품 상품 입고 수령', desc: '작업자가 택배로 도착한 반품 상품 수령', detail: '현장 작업자가 반품 입고 프로세스 수행: ① 택배사로부터 반품 상품 수령 ② 반품 송장 바코드 스캔 ③ 상품을 반품 전용 존으로 이동 ④ FULGO에 입고 완료 보고. 상태: 입고 완료', actor: '작업자', term: '입고 완료', features: ['PIC-010', 'STK-008'] },
      
      // 5단계: 작업자 - 반품 검수 (품질 검증)
      { from: 'worker', to: 'fulgo_wms', label: '[5] 반품 검수', desc: '작업자가 반품 상품 검수 및 등급 판정 후 보고', detail: '현장 작업자가 반품 검수 수행: ① 외관 검수(포장상태/손상여부/라벨태그) ② 기능 검수(작동 여부/부속품 완전성) ③ 상품 상태 확인(색상 변화/변형/오염) ④ 검수 등급 판정 및 사진 촬영(증빙): [A등급-정상]재판매 가능, [B등급-경미한 하자]재고조정 후 재판매 가능, [C등급-불량]재판매 불가/폐기 대상 ⑤ FULGO에 검수 결과 보고. 상태: 검수 완료', actor: '작업자', term: '검수 완료', features: ['RET-002', 'RET-003', 'PIC-004'] },
      
      // 6단계: 작업자 - 처리 경로 실행
      { from: 'worker', to: 'fulgo_wms', label: '[6] 처리 경로 실행', desc: '작업자가 검수 결과 기반 처리 경로 실행', detail: '현장 작업자가 WMS의 지시에 따라 처리 경로 실행: [A등급-재입고] ① 반품 존 → 일반 존으로 상품 이동 ② 로케이션 재할당 ③ 상품 상태 변경(반품→가용) ④ 보고 [B등급-불량] ① 반품 존 → 불량품 존으로 이동 ② 보고 [C등급-폐기] ① 폐기 전 사진 촬영(증빙) ② 폐기 승인 요청 ③ 보고. 상태: 처리 완료', actor: '작업자', term: '처리 완료', features: ['RET-002', 'RET-006', 'STK-011'] },
      
      // 7단계: WMS 최종 승인 및 처리
      { from: 'fulgo_wms', to: 'warehouse_manager', label: '[7] 재입고/폐기 최종 승인', desc: 'WMS에서 처리 경로별 최종 승인', detail: 'FULGO WMS가 작업자 처리 결과 검증 및 최종 승인: [재입고] ① WMS 재고 수량 증가(상품 상태: 반품→가용) ② OMS로 재입고 완료 데이터 전송 ③ 환불 처리 지시 ④ 상태: 재입고 완료. [불량품] ① 불량 재고 승인 ② 화주 처리 방안 문의. [폐기] ① 창고장 폐기 승인 필요 시 전달 ② 상태: 폐기 승인. 상태: 처리 최종 완료', actor: 'FULGO WMS', term: '승인 완료', features: ['RET-006', 'STK-011', 'RPT-001'] },
      
      // 8단계: 최종 정산 및 OMS 동기화
      { from: 'fulgo_wms', to: 'oms_system', label: '[8] 반품 최종 정산 및 완료', desc: '반품 완료 후 환불 및 OMS 동기화', detail: 'FULGO WMS 최종 정산: ① 환불 처리(재입고 완료 시→고객 환불, 검수 실패→부분환불/거부) ② 재고 회계 처리(재입고 시→자산증가, 폐기 시→자산감소) ③ 반품 완료(상태: 완료) ④ OMS로 반품 완료 데이터 전송 ⑤ 고객 반품 진행 상황 최종 전달 ⑥ 반품 사유 분석 및 기록(반품이력 추적, KPI 수집)', actor: 'FULGO WMS', term: '완료', features: ['RET-007', 'STK-011', 'RPT-001'] },
    ]
  },
  storage: {
    title: '재고 관리 프로세스 (Inventory Management)',
    description: '입고부터 출고까지 재고의 상태, 수량, 위치를 실시간으로 추적하고 관리. 실사 지시, 실사 실행, 결과 보고, 수량 조정의 체계적인 관리. 가용/예약/보류/불량 상태 관리, OMS 동기화, 실시간 모니터링을 포함합니다.',
    hierarchy: 'Fulgo(플랫폼) → 물류사(창고 운영자) → 화주사(고객사)',
    actors: [
      { id: 'fulgo_wms', name: 'FULGO WMS', color: '#d32f2f', desc: '재고 중앙 엔진', layer: '1계층' },
      { id: 'warehouse_manager', name: '창고장', color: '#ff6f00', desc: '재고 정책/실사 지시', layer: '2계층' },
      { id: 'worker', name: '현장 작업자', color: '#7b1fa2', desc: '재고 적치/실사/수량 조정 실행', layer: '2계층' },
      { id: 'shipper', name: '화주사', color: '#1976d2', desc: '재고 모니터링', layer: '3계층' },
      { id: 'oms_system', name: 'OMS 시스템', color: '#0288d1', desc: '재고 동기화', layer: '외부' },
    ],
    steps: [
      // 1단계: 재고 상태 자동 추적 (시스템 내부 모니터링)
      { from: 'fulgo_wms', to: 'fulgo_wms', label: '[1] 재고 상태 분류 및 추적', desc: '가용/예약/보류/불량 상태 구분 및 자동 추적', detail: 'FULGO WMS 내부 재고 엔진이 재고 생명주기별 상태를 실시간 자동 추적: ① 가용(Available) - 출고 가능한 정상 재고 ② 예약(Reserved) - 출고 지시 생성되었으나 피킹 전 ③ 피킹 중(Picking) - 피킹 작업 진행 중 ④ 보류(Hold) - 검수 대기 또는 문제 발생으로 출고 불가 ⑤ 불량(Defective) - 판매 불가 불량품 ⑥ 폐기 예정(To be Disposed) - 폐기 승인 대기. 각 상태 변환은 자동 기록됨', actor: 'FULGO WMS', term: '상태 추적', features: ['STK-002', 'STK-011'] },
      
      // 2단계: 재고 수량 실시간 관리 (시스템 내부 계산)
      { from: 'fulgo_wms', to: 'fulgo_wms', label: '[2] 재고 수량 실시간 관리', desc: '물리/가용/예약/안전 재고 수량 4단계 구분 관리', detail: 'FULGO WMS 내부에서 4가지 재고 수량을 실시간 관리: ① 물리 재고(Physical) - 창고 실제 적치된 수량 ② 가용 재고(Available) - 출고 가능한 수량(=물리-예약-보류) ③ 예약 재고(Reserved) - 출고 지시로 할당된 수량 ④ 안전 재고(Safety Stock) - 화주 정책에 따라 최소로 유지할 수량. 입고/출고/조정/반품 시점에 자동 갱신', actor: 'FULGO WMS', term: '수량 관리', features: ['STK-002', 'STK-004', 'STK-012'] },
      
      // 3단계: 로케이션 구조 설정
      { from: 'warehouse_manager', to: 'fulgo_wms', label: '[3] 창고 구조 설정', desc: '존-로케이션 체계 정의 및 FULGO 등록', detail: '창고장이 창고의 기본 구조를 FULGO에 등록: 존(Zone) - 대분류 구역(의류존/악세서리존/신발존/보류존/불량존/폐기존) 정의. 각 존별 용량, 특성, 관리 정책 설정. 로케이션(Location) - 세부 위치코드 체계 설정(A-01-01 형식: 존-열-단). FIFO/FEFO 정책 설정 및 FULGO에 반영.', actor: '창고장', term: '설정 완료', features: ['CFG-001', 'STK-006', 'STK-013'] },
      
      // 4단계: 보관 위치 등록
      { from: 'warehouse_manager', to: 'fulgo_wms', label: '[4] 보관 위치 등록 및 관리', desc: '물리적 로케이션별 세부 정보 등록', detail: '창고장이 실제 보관 위치의 상세 정보를 FULGO에 등록: ① 존-로케이션 맵핑(존 A의 A-01-01~A-05-10 물리 위치 등록) ② 각 로케이션별 특성 입력(크기/높이/적재 중량 한계/온습도 관리 필요 여부/보관 상품 카테고리) ③ 상품-로케이션 친화도 설정(의류→온습도 관리, 전자제품→정전기 방지 구역 등) ④ 보관료 단가 설정(크기별 일/월 단위 보관료). 전체 로케이션 현황을 FULGO에 등록 완료.', actor: '창고장', term: '등록 완료', features: ['STK-013', 'CFG-001'] },
      
      // 5단계: 로케이션 할당 지시
      { from: 'fulgo_wms', to: 'worker', label: '[5] 로케이션 할당 및 적치 지시', desc: '상품 속성 기반 로케이션 자동 할당 및 작업 지시', detail: 'FULGO가 입고 상품에 대해 로케이션 자동 할당 및 작업자에 지시: ① 상품 속성(카테고리/크기/수량) 확인 ② 적합한 존 선택 ③ 빈 로케이션 자동 검색 ④ 로케이션 할당 완료 ⑤ 작업자에게 적치 위치 지시 전달(QR코드/위치도 포함). 존 포화 시 자동 알림 및 재배치 제안.', actor: 'FULGO WMS', term: '지시 발행', features: ['STK-006', 'STK-013'] },
      
      // 6단계: 재고 이동 이력 기록 (추적 및 기록)
      { from: 'worker', to: 'fulgo_wms', label: '[6] 재고 적치 및 이동 완료 보고', desc: '작업자의 재고 이동/적치 작업 완료 보고 및 이력 자동 기록', detail: '작업자가 적치/이동 작업 완료 후 FULGO에 보고: ① 작업 완료(바코드 스캔으로 확인) ② FULGO가 모든 재고 이동 자동 기록: 입고(OMS→WMS→로케이션 A)→이동(로케이션 A→B)→피킹(로케이션 A→피킹 존)→출고(피킹 존→출하)→반품(반품 존→로케이션 A) ③ 로트/시리얼 번호 기반 추적 ④ 전체 이력 조회 가능', actor: '작업자', term: '완료 보고', features: ['STK-005', 'STK-013'] },
      
      // 7단계: 재고 정책 관리
      { from: 'warehouse_manager', to: 'fulgo_wms', label: '[7] 재고 운영 정책 설정', desc: '화주별/상품별 재고 운영 정책 관리', detail: '창고장이 FULGO에 재고 운영 정책 설정: ① 화주별 정책-안전 재고(상품별), FIFO/FEFO 회전 정책, 로트/유효기한 관리 여부 ② 재고 분류-ABC 분석(A:고빈도 20%, B:중빈도 30%, C:저빈도 50%) ③ 보유 비용-보관료(일/월 단위), 장기 보관 추가 비용, 존별 단가 설정. FULGO가 정책 반영하여 자동 운영.', actor: '창고장', term: '정책 설정', features: ['CFG-001', 'USER-001'] },
      
      // 8단계: 실사 지시
      { from: 'warehouse_manager', to: 'worker', label: '[8] 실사 지시', desc: '창고장이 작업자에게 재고 실사 지시', detail: '창고장이 주기적(주/월 단위) 또는 필요 시 실사 지시 발행: ① 실사 대상 범위(전체/존별/상품별) 결정 ② 실사 기간 설정 ③ 실사 담당자 배정 ④ 작업자에게 실사 지시 전달(실사표 생성). 상태: 실사 대기', actor: '창고장', term: '지시 발행', features: ['STK-010', 'STK-013'] },
      
      // 9단계: 실사 실행
      { from: 'worker', to: 'fulgo_wms', label: '[9] 재고 실사 실행', desc: '작업자가 현장 재고 실사 수행', detail: '현장 작업자가 실사 수행: ① 실사 대상 구역 이동 ② 상품별 바코드 스캔 및 수량 확인 ③ 손상/파손/변형 여부 확인 ④ 실사 현황 실시간 입력(모바일 디바이스) ⑤ 실사 완료 시 FULGO에 제출. 상태: 실사 완료', actor: '작업자', term: '실사 완료', features: ['STK-010', 'STK-005'] },
      
      // 10단계: 실사 결과 분석 및 보고
      { from: 'fulgo_wms', to: 'shipper', label: '[10] 실사 결과 보고 및 분석', desc: '실사 결과를 WMS 재고와 비교 및 화주사 보고', detail: 'FULGO WMS가 실사 결과 자동 분석: ① 실사 수량 vs WMS 수량 비교 ② 차이 발생 현황(증가/감소/손실) 분석 ③ 이상 항목 리스트 생성(도난 의심/오류/파손) ④ 실사 결과 리포트 생성 ⑤ 화주사에게 실사 결과 보고(차이율 %, 문제 항목, 권고사항). 상태: 검증 대기', actor: 'FULGO WMS', term: '보고 완료', features: ['STK-010', 'RPT-001'] },
      
      // 11단계: 수량 조정
      { from: 'worker', to: 'fulgo_wms', label: '[11] 재고 수량 조정', desc: '작업자가 실사 결과 기반 수량 조정 실행', detail: '현장 작업자가 창고장 승인 하 실사 결과에 따라 수량 조정: ① 증가분(입고 누락 등)→시스템에 입력(입고 처리) ② 감소분(도난/파손 등)→시스템에 입력(폐기/차감 처리) ③ 이동 필요 상품→로케이션 재배치 ④ 조정 완료 후 바코드 스캔으로 확인 ⑤ FULGO에 조정 완료 보고. 상태: 조정 완료', actor: '작업자', term: '조정 완료', features: ['STK-011', 'STK-005'] },
      
      // 12단계: 조정 결과 확정 및 OMS 동기화
      { from: 'fulgo_wms', to: 'oms_system', label: '[12] 수량 조정 확정 및 OMS 동기화', desc: '조정 결과를 최종 확정 및 OMS 동기화', detail: 'FULGO WMS가 수량 조정 최종 처리: ① 조정 내용 검증(증감액 재확인) ② 재고 상태 최종 변경(=실사 수량으로 확정) ③ 조정 로그 기록(일시/담당자/사유/수량 변화) ④ OMS로 최종 동기화 전송(WMS 재고 수량 = OMS 수량) ⑤ 정합성 재검증. 상태: 조정 확정', actor: 'FULGO WMS', term: '동기화 완료', features: ['STK-002', 'STK-011'] },
      
      // 13단계: 재고 가시성 제공
      { from: 'fulgo_wms', to: 'shipper', label: '[13] 실시간 재고 모니터링 대시보드', desc: '화주사에게 실시간 재고 현황 제공', detail: 'FULGO 대시보드에서 화주사에게 실시간 재고 현황 제공: ① 전체 재고 현황(가용/예약/보류/불량 비율) ② 존별 재고 분포 및 가동률 ③ 화주별 재고 현황 및 변동 추이 ④ 재고 회전율 ⑤ 최근 실사 결과(정합성 %). 자동 알림: 재고 부족(안전 재고 이하)→알림, 계절 상품 잔여(시즌 종료 30일 전)→알림, 장기 재고(90일 이상 미출고)→알림', actor: '화주사', term: '모니터링', features: ['RPT-001', 'RPT-005'] },
      
      // 14단계: 재고 KPI 리포팅
      { from: 'fulgo_wms', to: 'shipper', label: '[14] 재고 KPI 리포팅', desc: '일간/주간/월간 KPI 자동 생성 및 제공', detail: 'FULGO 자동 생성 리포트: ① 재고 정확도(%) - 실사 기반 정합성율 ② 재고 회전율 - 입고 대비 출고 비율 ③ 평균 체류 기간 - 입고부터 출고까지 소요 일수 ④ 존별 가동률(%) - 용량 대비 사용률 ⑤ 재고 가치 변동 - 수량×단가 ⑥ 손실액 분석 - 파손/도난/손실 규모. 화주별 리포트, 추세 분석, 개선 권고안 포함.', actor: 'FULGO WMS', term: '리포팅 완료', features: ['RPT-001', 'RPT-005'] },
    ]
  }
};