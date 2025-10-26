// src/models/flowData.ts
import { Flow } from './types';

export const flowData: Record<string, Flow> = {
  inbound: {
    title: '입고 프로세스 (Inbound Request) - 12단계 확장',
    description: '화주사의 입고 요청부터 OMS/ERP 동기화까지 완전한 입고 워크플로우. 승인 절차, 존 할당, 검수, 예외 처리, 모니터링, 리포팅을 포함한 엔터프라이즈급 프로세스입니다.',
    hierarchy: 'Fulgo(플랫폼) → 물류사(창고 운영자) → 화주사(고객사)',
    actors: [
      { id: 'shipper', name: '화주사', color: '#1976d2', desc: '입고 요청 주체', layer: '3계층' },
      { id: 'fulgo', name: 'FULGO 시스템', color: '#d32f2f', desc: '플랫폼 중앙', layer: '1계층' },
      { id: 'warehouse_manager', name: '창고장', color: '#ff6f00', desc: '입고 승인권자', layer: '2계층' },
      { id: 'worker', name: '현장 작업자', color: '#7b1fa2', desc: '검수 및 입고 실행', layer: '2계층' },
      { id: 'inventory_system', name: '재고 엔진', color: '#c2185b', desc: '재고 동기화', layer: '1계층' },
      { id: 'oms_erp', name: 'OMS/ERP', color: '#0288d1', desc: '주문/회계 연동', layer: '외부' },
    ],
    steps: [
      // 1단계: 입고 요청
      { from: 'shipper', to: 'fulgo', label: '[1] 입고 요청 생성', desc: '상품코드, 수량, 납품예정일 등 입력', detail: '화주사가 FULGO OMS를 통해 입고 요청서 생성: 상품코드, 수량, 송장번호, 필수 정보 입력. 상태: REQUEST_PENDING', actor: '화주사', term: '요청 대기', features: ['STK-008'] },
      
      // 2단계: 승인 요청 접수
      { from: 'fulgo', to: 'warehouse_manager', label: '[2] 승인 요청 접수', desc: '입고 유형 분류 및 승인 필요 판정', detail: 'FULGO 시스템이 입고 요청을 수신 후 자동 분류: 일반입고/반품입고/긴급입고. 승인 필요 조건 판정 (냉장·위험물·신규화주 등). 상태: APPROVAL_PENDING', actor: 'FULGO', term: '승인 대기', features: ['STK-008', 'CFG-001'] },
      
      // 3단계: 승인 처리
      { from: 'warehouse_manager', to: 'fulgo', label: '[3] 승인 처리', desc: '존 여유, 상품 적합성, 반입 제한 검토', detail: '창고장이 다음 기준으로 검토: 재고 수용 가능 여부(존 여유), 입고 상품 품목 적합성(온도구역), 반입 제한 품목. 승인/반려 결정. 상태: APPROVED 또는 REJECTED', actor: '창고장', term: '승인 완료', features: ['CFG-001', 'STK-006'] },
      
      // 4단계: 존 할당
      { from: 'fulgo', to: 'fulgo', label: '[4] 존 할당', desc: '상품 속성 기반 자동 할당 (냉장/일반/특수)', detail: 'FULGO가 상품 정책 기반으로 자동 할당: 냉장 식품→냉장존, 의류→일반존 등. 존 가용성 체크, 로케이션 코드 부여. 상태: ZONE_ASSIGNED', actor: 'FULGO', term: '존 할당 완료', features: ['CFG-001', 'STK-006', 'STK-013'] },
      
      // 5단계: 입고 실행
      { from: 'worker', to: 'warehouse_manager', label: '[5] 입고 실행 및 검수', desc: '상품 이동, 수량/파손/유효기간 확인', detail: '현장 작업자가 할당된 존으로 상품 이동. 검수 절차: 수량확인, 파손 확인, 유효기간 확인. 상태: INBOUND_CONFIRMED', actor: '작업자', term: '입고 완료', features: ['STK-005', 'STK-010'] },
      
      // 6단계: 송장 생성
      { from: 'fulgo', to: 'worker', label: '[6] 송장 자동 생성', desc: '상품코드/수량/존코드/입고일자 기록', detail: 'FULGO가 입고 완료 시 자동으로 송장 생성: 상품코드, 수량, 존코드, 입고일자 포함. OMS로 송장 데이터 전송. 상태: 송장 생성 완료', actor: 'FULGO', term: '송장 자동생성', features: ['STK-007', 'STK-003'] },
      
      // 7단계: 승인 이력 관리
      { from: 'fulgo', to: 'warehouse_manager', label: '[7] 승인 이력 저장', desc: '승인자/일시/결과/사유 기록', detail: 'FULGO가 승인 로그 저장: 승인자명, 승인일시, 승인결과, 사유, 요청ID. 변경 사항 발생 시 "변경 승인 요청"으로 재기안. 상태: CHANGE_REQUESTED (필요시)', actor: 'FULGO', term: '감사 추적', features: ['STK-010', 'RPT-001'] },
      
      // 8단계: 예외 처리
      { from: 'worker', to: 'warehouse_manager', label: '[8] 예외 처리', desc: 'SLA 초과/존 포화/상품 불일치 대응', detail: '예외 시나리오 처리: ① 승인 지연→자동 알림, ② 존 포화→ZONE_WAITING 대기열, ③ 검수 실패→HOLD 상태→재검수. 상태: HOLD 또는 ZONE_WAITING', actor: '창고장', term: '예외 관리', features: ['STK-006'] },
      
      // 9단계: 실시간 모니터링
      { from: 'warehouse_manager', to: 'fulgo', label: '[9] 실시간 모니터링', desc: '승인 대기/완료/입고중/반려 현황 시각화', detail: 'FULGO 대시보드: 승인 대기 건수, 승인 완료 건수, 입고 중 건수, 반려 건수. 존별 입고율(%), 입고 처리 속도 KPI 시각화. 병목 구간 붉은색 표시.', actor: 'FULGO', term: '대시보드', features: ['RPT-001', 'RPT-005'] },
      
      // 10단계: 리포팅 및 분석
      { from: 'fulgo', to: 'warehouse_manager', label: '[10] KPI 리포팅', desc: '승인 평균시간/반려율/지연율/존 포화율', detail: 'FULGO 자동 생성: 일간/주간/월간 리포트. KPI: 승인 평균 소요시간, 반려율(%), 입고 지연율, 존 포화율. 승인자별 성과 측정. BI Tool 연계 가능.', actor: 'FULGO', term: '리포팅', features: ['RPT-001', 'RPT-005'] },
      
      // 11단계: 승인 정책 관리
      { from: 'warehouse_manager', to: 'fulgo', label: '[11] 정책 기반 관리', desc: '승인 기준/권한/SLA 동적 조정', detail: 'FULGO 관리자가 정책 설정: 승인 필요 조건(입고유형/화주등급/카테고리), 승인 권한자(창고장/본부장), SLA 기준시간. 정책 버전별 관리 및 시행일자 표시.', actor: '시스템 관리자', term: '정책 버전화', features: ['CFG-001', 'USER-001'] },
      
      // 12단계: 종료 및 회계 연동
      { from: 'fulgo', to: 'oms_erp', label: '[12] OMS/ERP 동기화', desc: '입고 완료 후 정산 및 회계 처리', detail: '입고 완료 시점에 OMS로 "입고확정 송장" 전송. ERP와 입고 수불 내역 동기화. 월 단위 마감 보고서 생성. 반려/미입고 건 자동 이월. 상태: COMPLETED', actor: 'FULGO', term: '마감 처리', features: ['STK-002', 'STK-011'] },
    ]
  },
  outbound: {
    title: '출고 프로세스 (Outbound)',
    description: '외부 판매처(쿠팡, 네이버 쇼핑 등)에서 주문이 들어오면, FULGO가 이를 수집하고 물류사에 전달하여 상품을 포장해서 고객에게 배송하는 전체 과정입니다.',
    hierarchy: 'Fulgo(플랫폼) → 물류사(창고 운영자) → 화주사(고객사)',
    actors: [
      { id: 'customer', name: '고객', color: '#0288d1', desc: '상품 구매자', layer: '외부' },
      { id: 'channel', name: '판매처', color: '#1976d2', desc: '쿠팡, 네이버 등', layer: '외부' },
      { id: 'shipper', name: '화주사', color: '#1976d2', desc: '상품 주인 (판매자)', layer: '3계층' },
      { id: 'fulgo', name: 'FULGO', color: '#d32f2f', desc: '플랫폼 시스템', layer: '1계층' },
      { id: 'logistics', name: '물류사', color: '#f57c00', desc: '창고 운영 회사', layer: '2계층' },
      { id: 'worker', name: '작업자', color: '#7b1fa2', desc: '창고 현장 직원', layer: '2계층' },
      { id: 'inventory', name: '재고시스템', color: '#c2185b', desc: '재고 관리 엔진', layer: '1계층' },
      { id: 'carrier', name: '택배사', color: '#388e3c', desc: 'CJ대한통운 등', layer: '외부' }
    ],
    steps: [
      { from: 'customer', to: 'channel', label: '상품 주문', desc: '고객이 구매 버튼 클릭', detail: '고객이 쿠팡, 네이버 스마트스토어 등 외부 판매처에서 상품을 주문합니다.', actor: '고객', term: '', features: [] },
      { from: 'channel', to: 'shipper', label: '주문 접수', desc: '판매처가 주문 정보 생성', detail: '판매처 시스템이 주문 정보(주문번호, 상품, 수량, 배송지)를 생성하고 화주사에게 알립니다.', actor: '판매처', term: '', features: [] },
      { from: 'shipper', to: 'fulgo', label: '출고 요청 전송', desc: '화주사가 FULGO에 출고 지시', detail: '화주사가 "이 주문 건을 배송해주세요"라고 FULGO 시스템에 출고 요청을 보냅니다.', actor: '화주사', term: '', features: ['STK-004'] },
      { from: 'fulgo', to: 'inventory', label: '재고 확인', desc: '창고에 상품이 있는지 검증', detail: 'FULGO 재고 시스템이 "요청한 상품이 창고에 있나요? 몇 개나 있나요?"를 확인하고 주문 수량만큼 예약합니다.', actor: 'FULGO', term: '재고 예약', features: ['STK-002', 'STK-012'] },
      { from: 'fulgo', to: 'logistics', label: '출고 지시', desc: '물류사에 작업 요청', detail: 'FULGO가 물류사에게 "이 상품을 꺼내서 포장하고 배송해주세요"라고 지시합니다.', actor: 'FULGO', term: '', features: ['PIC-001', 'OUT-001'] },
      { from: 'logistics', to: 'worker', label: '작업 배정', desc: '여러 주문을 묶어서 할당', detail: '물류사가 효율적으로 작업하기 위해 비슷한 시간에 들어온 주문들을 묶어서 작업자에게 한 번에 배정합니다.', actor: '물류사', term: '웨이브 피킹', features: ['PIC-002', 'PIC-009'] },
      { from: 'worker', to: 'logistics', label: '상품 찾기 완료', desc: '선반에서 상품 꺼내기', detail: '작업자가 창고 선반을 돌아다니며 주문된 상품들을 하나씩 찾아서 바코드로 스캔하며 수거합니다.', actor: '작업자', term: '피킹', features: ['PIC-003', 'PIC-004'] },
      { from: 'worker', to: 'logistics', label: '포장 완료', desc: '박스에 담고 송장 부착', detail: '작업자가 상품을 박스에 담아 포장하고, 택배 송장 번호를 출력해서 붙입니다.', actor: '작업자', term: '패킹', features: ['PIC-005', 'PIC-006'] },
      { from: 'logistics', to: 'fulgo', label: '출고 완료 보고', desc: '송장 번호 함께 전송', detail: '물류사가 "포장 완료했고 송장번호는 123456입니다"라고 FULGO에 보고합니다.', actor: '물류사', term: '', features: ['OUT-001'] },
      { from: 'fulgo', to: 'inventory', label: '재고 차감', desc: '판매 가능 재고 감소', detail: 'FULGO 재고 시스템이 출고된 만큼 재고 수량을 줄입니다.', actor: 'FULGO', term: '', features: ['STK-004', 'STK-011'] },
      { from: 'fulgo', to: 'shipper', label: '출고 완료 알림', desc: '송장 번호 회신', detail: 'FULGO가 화주사에게 "출고가 완료되었고 송장번호는 이거입니다"라고 알립니다.', actor: 'FULGO', term: '', features: ['STK-002', 'RPT-001'] },
      { from: 'shipper', to: 'channel', label: '배송 정보 업데이트', desc: '판매처에 송장 전달', detail: '화주사가 판매처 시스템에 송장번호를 전송하여 고객이 배송 추적을 할 수 있게 합니다.', actor: '화주사', term: '', features: ['OUT-003'] },
      { from: 'logistics', to: 'carrier', label: '집하 요청', desc: '택배사에 픽업 의뢰', detail: '물류사가 택배사에 "포장된 물건 가져가주세요"라고 집하를 요청합니다.', actor: '물류사', term: '', features: ['OUT-002'] },
      { from: 'carrier', to: 'fulgo', label: '배송 상태 전송', desc: '실시간 위치 추적', detail: '택배사가 "집하 완료", "배송 중", "배송 완료" 등의 배송 진행 상황을 실시간으로 FULGO에 보냅니다.', actor: '택배사', term: '', features: ['OUT-003'] },
    ]
  },
  return: {
    title: '반품 프로세스 (Return)',
    description: '고객이 상품에 문제가 있어서 반품을 요청하면, 물류사가 상품을 다시 받아서 검사하고 재고로 돌려놓거나 폐기하는 전체 과정입니다.',
    hierarchy: 'Fulgo(플랫폼) → 물류사(창고 운영자) → 화주사(고객사)',
    actors: [
      { id: 'customer', name: '고객', color: '#0288d1', desc: '반품 요청자', layer: '외부' },
      { id: 'shipper', name: '화주사', color: '#1976d2', desc: '상품 주인 (판매자)', layer: '3계층' },
      { id: 'fulgo', name: 'FULGO', color: '#d32f2f', desc: '플랫폼 시스템', layer: '1계층' },
      { id: 'logistics', name: '물류사', color: '#f57c00', desc: '창고 운영 회사', layer: '2계층' },
      { id: 'worker', name: '작업자', color: '#7b1fa2', desc: '창고 현장 직원', layer: '2계층' },
      { id: 'inventory', name: '재고시스템', color: '#c2185b', desc: '재고 관리 엔진', layer: '1계층' },
    ],
    steps: [
      { from: 'customer', to: 'shipper', label: '반품 신청', desc: '고객이 반품 요청', detail: '고객이 화주사 고객센터에 "상품에 문제가 있어서 반품하고 싶습니다"라고 요청합니다.', actor: '고객', term: '', features: ['RET-001'] },
      { from: 'shipper', to: 'fulgo', label: '반품 승인', desc: '반품 사유 확인 후 승인', detail: '화주사가 반품 사유를 검토하고 "반품을 받겠습니다"라고 승인한 뒤 FULGO에 반품 번호와 함께 등록합니다.', actor: '화주사', term: '반품 승인 번호', features: ['RET-001', 'RET-004'] },
      { from: 'fulgo', to: 'logistics', label: '반품 입고 배정', desc: '물류사에 반품 예정 알림', detail: 'FULGO가 물류사에게 "곧 이 상품이 반품으로 들어올 예정입니다"라고 미리 알리고 일정을 조율합니다.', actor: 'FULGO', term: '', features: ['STK-008'] },
      { from: 'logistics', to: 'fulgo', label: '반품 접수 승인', desc: '창고에서 받을 준비 완료', detail: '물류사가 "이 날짜에 반품을 받을 수 있습니다"라고 확정하고 담당 작업자를 배정합니다.', actor: '물류사', term: '', features: ['CFG-001'] },
      { from: 'customer', to: 'logistics', label: '반품 상품 발송', desc: '고객이 택배로 반송', detail: '고객이 상품을 다시 포장해서 물류 창고 주소로 택배를 보냅니다.', actor: '고객', term: '', features: [] },
      { from: 'worker', to: 'logistics', label: '반품 도착 확인', desc: '창고에 택배 도착', detail: '작업자가 반품 상품이 도착한 것을 확인하고 시스템에 "반품 상품이 들어왔습니다"라고 등록합니다.', actor: '작업자', term: '', features: ['PIC-010', 'RET-001'] },
      { from: 'worker', to: 'logistics', label: '반품 상품 검사', desc: '상태 꼼꼼히 확인', detail: '작업자가 반품된 상품을 열어보고 "다시 팔 수 있을지, 수리가 필요한지, 버려야 할지"를 판단합니다.', actor: '작업자', term: '반품 검수', features: ['RET-002', 'RET-003'] },
      { from: 'logistics', to: 'fulgo', label: '검사 결과 보고', desc: '상품 상태 분류 전송', detail: '물류사가 검사 결과를 FULGO에 보고합니다. "재판매 가능 10개, 수리 필요 2개, 폐기 1개" 이런 식으로 분류합니다.', actor: '물류사', term: '', features: ['RET-003', 'RET-004'] },
      { from: 'fulgo', to: 'inventory', label: '재고 처리', desc: '재고 복귀 또는 차감', detail: 'FULGO가 다시 팔 수 있는 상품은 재고에 추가하고, 버려야 할 상품은 재고에서 뺍니다.', actor: 'FULGO', term: '', features: ['STK-011', 'RET-006'] },
      { from: 'worker', to: 'logistics', label: '상품 재배치', desc: '선반에 다시 정리하거나 폐기', detail: '재판매 가능한 상품은 다시 창고 선반에 정리하고, 폐기 대상은 별도로 처리합니다.', actor: '작업자', term: '', features: ['STK-006', 'RET-002'] },
      { from: 'fulgo', to: 'shipper', label: '반품 완료 알림', desc: '처리 결과 통보', detail: 'FULGO가 화주사에게 "반품 처리가 완료되었고 재고는 이렇게 변경되었습니다"라고 알립니다.', actor: 'FULGO', term: '', features: ['RET-004', 'RPT-001'] },
      { from: 'shipper', to: 'customer', label: '환불 처리', desc: '고객에게 돈 돌려주기', detail: '화주사가 고객에게 환불을 진행합니다.', actor: '화주사', term: '', features: ['RET-007'] },
    ]
  },
  storage: {
    title: '재고 관리 프로세스 (Inventory Management) - 11단계 완전 체계',
    description: '입고부터 출고까지 재고의 상태, 수량, 위치를 실시간으로 추적하고 관리. 가용/예약/보류/불량 상태 관리, FIFO/FEFO 최적화, OMS 동기화, 실시간 모니터링을 포함한 엔터프라이즈급 재고 관리 시스템.',
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
      { from: 'fulgo', to: 'fulgo', label: '[1] 재고 상태 분류', desc: '가용/예약/보류/불량 상태 구분', detail: 'FULGO가 재고 생명주기별 상태를 자동 추적: ① 가용(Available) - 출고 가능 정상 재고, ② 예약(Reserved) - 출고 지시 생성되었으나 피킹 전, ③ 피킹 중(Picking) - 피킹 작업 진행 중, ④ 보류(Hold) - 출고 불가 상태, ⑤ 불량(Defective) - 판매 불가 불량품, ⑥ 폐기 예정(To be Disposed) - 폐기 승인 대기', actor: 'FULGO', term: '상태 추적', features: ['STK-002', 'STK-011'] },
      
      // 2단계: 재고 수량 관리
      { from: 'fulgo', to: 'fulgo', label: '[2] 재고 수량 관리', desc: '물리/가용/예약/안전 재고 구분', detail: 'FULGO가 4가지 재고 수량을 실시간 관리: ① 물리 재고 - 창고 실제 존재 수량, ② 가용 재고 - 출고 가능 수량, ③ 예약 재고 - 출고 지시로 할당된 수량, ④ 안전 재고 - 재고 부족 방지 최소 유지 수량. 입고/출고/조정 시 자동 갱신', actor: 'FULGO', term: '수량 갱신', features: ['STK-002', 'STK-004', 'STK-012'] },
      
      // 3단계: 로케이션 관리
      { from: 'warehouse_manager', to: 'fulgo', label: '[3] 로케이션 구조 설정', desc: '존-로케이션 체계 정의 (구역-열-단)', detail: '창고 관리자가 로케이션 구조 설정: 존(Zone) - 대분류 구역(일반존/냉장존/냉동존/보류존/불량존), 로케이션 - 세부 위치코드(A-01-01 형식). 각 로케이션에 크기, 적재 중량, 속성 정보 입력. FIFO/FEFO 정책 설정', actor: '창고 관리자', term: '로케이션 체계', features: ['CFG-001', 'STK-006', 'STK-013'] },
      
      // 4단계: 자동 할당
      { from: 'fulgo', to: 'worker', label: '[4] 로케이션 자동 할당', desc: '상품 속성/상태 기반 존 할당', detail: 'FULGO가 입고 상품을 자동 할당: ① 상품 속성(온도/크기/보관기준) 확인 → ② 적합한 존 선택(상온→일반존, 냉장→냉장존 등) → ③ 빈 로케이션 검색 → ④ 자동 할당. 존 포화 시 자동 알림 및 재배치 요청', actor: 'FULGO', term: '자동 할당', features: ['STK-006', 'STK-013'] },
      
      // 5단계: 재고 이동 추적
      { from: 'worker', to: 'fulgo', label: '[5] 재고 이동 이력 기록', desc: '입고/이동/피킹/출고 전체 추적', detail: '모든 재고 이동을 추적 기록: 입고(OMS → WMS 입고 → 로케이션 A) → 이동(로케이션 A → B) → 피킹(로케이션 A → 피킹 존) → 출고(피킹 존 → 출하) → 반품(반품 존 → 로케이션 A). 로트/시리얼 번호 기반 추적. 전체 이력 조회 가능', actor: '작업자', term: '이동 추적', features: ['STK-005', 'STK-013'] },
      
      // 6단계: 재고 가시성
      { from: 'shipper', to: 'fulgo', label: '[6] 실시간 모니터링', desc: '재고 현황 대시보드 및 알림', detail: 'FULGO 대시보드에서 실시간 재고 현황 모니터링: ① 전체 재고 현황(가용/예약/보류/불량 비율) ② 존별 재고 분포 및 가동률 ③ 화주별 재고 현황 ④ 재고 회전율. 자동 알림: 재고 부족(안전 재고 이하) → 화주에게 자동 알림, 유효기한 임박(30일 이내) → 알림, 장기 재고(90일 이상 미출고) → 알림', actor: '화주사', term: '가시성', features: ['RPT-001', 'RPT-005'] },
      
      // 7단계: OMS 동기화
      { from: 'fulgo', to: 'oms_system', label: '[7] 재고 실시간 동기화', desc: '입출고 즉시 OMS와 동기화', detail: 'FULGO와 OMS 간 실시간 재고 동기화: ① 입고 완료 → WMS → OMS (재고 증가) ② 출고 확정 → WMS → OMS (재고 감소) ③ 재고 조정 → WMS → OMS (수량 변경) ④ 반품 재입고 → WMS → OMS (재고 증가). 동기화 실패 시 자동 재시도(최대 3회), 실패 시 관리자 알림', actor: 'FULGO', term: '동기화', features: ['STK-002', 'STK-011'] },
      
      // 8단계: 정합성 체크
      { from: 'warehouse_manager', to: 'fulgo', label: '[8] 재고 정합성 검증', desc: 'WMS vs 실물 vs OMS 재고 일치 확인', detail: '자동 정합성 체크 (일 1회 실행): ① WMS 재고 vs 실물 재고 비교 → 불일치 시 "재고 조정 필요" 알림 ② WMS 재고 vs OMS 재고 비교 → 차이 분석 ③ 불일치 원인 파악 및 기록. 작업자 실사 결과와 시스템 재고 자동 조정. 정합성 리포트 생성', actor: '창고 관리자', term: '정합성 검증', features: ['STK-010', 'RPT-001'] },
      
      // 9단계: 재고 정책 관리
      { from: 'warehouse_manager', to: 'fulgo', label: '[9] 재고 정책 설정', desc: '화주별/상품별 정책 관리', detail: '창고 관리자가 재고 운영 정책 설정: ① 화주별 정책 - 안전 재고(상품별), FIFO/FEFO 회전 정책, 로트/유효기한 관리 여부 ② 재고 분류 - ABC 분석(A등급:고빈도 상위20%, B등급:중빈도 중위30%, C등급:저빈도 하위50%) ③ 보유 비용 - 보관료(일/월 단위), 장기 보관 추가 비용, 존별 단가 설정', actor: '창고 관리자', term: '정책 설정', features: ['CFG-001', 'USER-001'] },
      
      // 10단계: 재고 예측 및 최적화
      { from: 'fulgo', to: 'warehouse_manager', label: '[10] 재고 예측 및 최적화', desc: '수요 예측, 공간 최적화 제안', detail: 'FULGO의 AI 엔진이 자동 분석 및 제안: ① 수요 예측 - 계절성 분석, 트렌드 파악, 발주량 제안 ② 공간 최적화 - 고빈도/저빈도 상품 배치 제안, 피킹 동선 최적화 ③ 재고 최적화 - 과재고 상품 할인 제안, 저회전 재고 반출 요청 ④ 비용 절감 - 보관료 절감 방안 제시', actor: 'FULGO', term: 'AI 최적화', features: ['RPT-005', 'STK-011'] },
      
      // 11단계: KPI 리포팅
      { from: 'fulgo', to: 'shipper', label: '[11] KPI 리포팅 및 분석', desc: '일간/주간/월간 KPI 자동 생성', detail: 'FULGO 자동 생성 리포트: ① 재고 정확도(%) - WMS vs 실물 비교 ② 재고 회전율 - 입고 대비 출고 비율 ③ 평균 체류 기간 - 입고부터 출고까지 소요 일수 ④ 존별 가동률(%) - 용량 대비 사용률 ⑤ 재고 가치 변동 - 수량×단가. 화주별 리포트, 추세 분석, 권장사항 포함', actor: 'FULGO', term: '리포팅', features: ['RPT-001', 'RPT-005'] },
    ]
  }
};
