// src/models/flowData.ts
import { Flow } from './types';

export const flowData: Record<string, Flow> = {
  inbound: {
    title: '입고 프로세스 (Inbound)',
    description: '화주사가 FULGO WMS에 입고 계획을 등록하면, 물류사가 이를 승인하고 실제 상품을 받아서 창고에 보관하는 전체 과정입니다. FULGO 플랫폼은 모든 진행 상황을 실시간으로 추적하고 관리합니다.',
    hierarchy: 'Fulgo(플랫폼) → 물류사(창고 운영자) → 화주사(고객사)',
    actors: [
      { id: 'shipper', name: '화주사', color: '#1976d2', desc: '상품 주인 (입고 요청)', layer: '3계층' },
      { id: 'fulgo', name: 'FULGO', color: '#d32f2f', desc: '플랫폼 시스템', layer: '1계층' },
      { id: 'logistics', name: '물류사', color: '#f57c00', desc: '창고 운영 회사', layer: '2계층' },
      { id: 'worker', name: '작업자', color: '#7b1fa2', desc: '창고 현장 직원', layer: '2계층' },
      { id: 'inventory', name: '재고시스템', color: '#c2185b', desc: '재고 관리 엔진', layer: '1계층' }
    ],
    steps: [
      { from: 'shipper', to: 'fulgo', label: '입고 예정 등록', desc: '어떤 상품이 언제 들어올지 등록', detail: '화주사가 FULGO 시스템에 입고될 상품 정보(상품명, 수량, 도착 예정일)를 미리 등록합니다.', actor: '화주사', term: '' },
      { from: 'fulgo', to: 'logistics', label: '입고 정보 전달', desc: '물류사에 입고 예정 알림', detail: 'FULGO가 물류사에게 "곧 이런 상품이 들어올 예정입니다"라고 사전에 알려주고 승인을 요청합니다.', actor: 'FULGO', term: 'ASN (사전 입고 알림)' },
      { from: 'logistics', to: 'fulgo', label: '입고 일정 승인', desc: '창고 공간 확보 및 일정 조율', detail: '물류사가 창고 상황을 검토하고 "이 날짜에 받을 수 있습니다"라고 확정합니다. 하역장 위치도 함께 배정합니다.', actor: '물류사', term: '도크 배정' },
      { from: 'logistics', to: 'worker', label: '입고 작업 지시', desc: '담당 직원에게 작업 할당', detail: '물류사 관리자가 창고 작업자에게 "오늘 이 상품 입고 처리 부탁합니다"라고 작업을 배정합니다.', actor: '물류사', term: '' },
      { from: 'worker', to: 'logistics', label: '상품 도착 확인', desc: '트럭 도착, 하역 시작', detail: '상품을 실은 트럭이 도착하면 작업자가 시스템에 "상품이 도착했습니다"라고 등록합니다.', actor: '작업자', term: '' },
      { from: 'worker', to: 'logistics', label: '임시 입고 처리', desc: '검사 전 임시 보관', detail: '아직 검사하지 않은 상태로 일단 창고에 들여놓고 "검사 대기 중"으로 표시합니다.', actor: '작업자', term: '가입고' },
      { from: 'worker', to: 'logistics', label: '상품 검사 완료', desc: '바코드 스캔 및 품질 확인', detail: '작업자가 하나하나 바코드를 스캔하면서 "수량이 맞는지, 상품이 온전한지, 파손은 없는지" 꼼꼼하게 검사합니다.', actor: '작업자', term: '검수' },
      { from: 'logistics', to: 'fulgo', label: '검사 결과 보고', desc: '정상/불량 여부 전달', detail: '물류사가 검사 결과를 FULGO에 보고합니다. 만약 불량품이나 수량 차이가 있으면 화주사에게 자동으로 알림이 갑니다.', actor: '물류사', term: '' },
      { from: 'fulgo', to: 'worker', label: '상품 라벨 발급', desc: '바코드 스티커 출력', detail: 'FULGO 시스템이 각 상품에 붙일 바코드 라벨을 자동으로 생성하고, 작업자가 이를 출력해서 부착합니다.', actor: 'FULGO', term: '' },
      { from: 'worker', to: 'logistics', label: '보관 위치 배치', desc: '지정된 선반에 상품 정리', detail: '작업자가 시스템이 알려준 보관 위치(예: A구역-3번선반-5번칸)로 가서 상품을 정리합니다.', actor: '작업자', term: '적치' },
      { from: 'logistics', to: 'fulgo', label: '입고 완료 보고', desc: '모든 작업 종료', detail: '물류사가 "이제 모든 상품이 창고에 잘 들어왔고, 판매 가능합니다"라고 FULGO에 최종 보고합니다.', actor: '물류사', term: '' },
      { from: 'fulgo', to: 'inventory', label: '재고 수량 증가', desc: '판매 가능 재고 추가', detail: 'FULGO의 재고 시스템이 해당 상품의 재고 수를 증가시킵니다. 이제 판매할 수 있습니다.', actor: 'FULGO', term: '' },
      { from: 'fulgo', to: 'shipper', label: '입고 완료 알림', desc: '화주사에 완료 통보', detail: 'FULGO가 화주사에게 "입고가 완료되었습니다. 이제 재고를 확인하실 수 있습니다"라고 알립니다.', actor: 'FULGO', term: '' },
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
      { from: 'customer', to: 'channel', label: '상품 주문', desc: '고객이 구매 버튼 클릭', detail: '고객이 쿠팡, 네이버 스마트스토어 등 외부 판매처에서 상품을 주문합니다.', actor: '고객', term: '' },
      { from: 'channel', to: 'shipper', label: '주문 접수', desc: '판매처가 주문 정보 생성', detail: '판매처 시스템이 주문 정보(주문번호, 상품, 수량, 배송지)를 생성하고 화주사에게 알립니다.', actor: '판매처', term: '' },
      { from: 'shipper', to: 'fulgo', label: '출고 요청 전송', desc: '화주사가 FULGO에 출고 지시', detail: '화주사가 "이 주문 건을 배송해주세요"라고 FULGO 시스템에 출고 요청을 보냅니다.', actor: '화주사', term: '' },
      { from: 'fulgo', to: 'inventory', label: '재고 확인', desc: '창고에 상품이 있는지 검증', detail: 'FULGO 재고 시스템이 "요청한 상품이 창고에 있나요? 몇 개나 있나요?"를 확인하고 주문 수량만큼 예약합니다.', actor: 'FULGO', term: '재고 예약' },
      { from: 'fulgo', to: 'logistics', label: '출고 지시', desc: '물류사에 작업 요청', detail: 'FULGO가 물류사에게 "이 상품을 꺼내서 포장하고 배송해주세요"라고 지시합니다.', actor: 'FULGO', term: '' },
      { from: 'logistics', to: 'worker', label: '작업 배정', desc: '여러 주문을 묶어서 할당', detail: '물류사가 효율적으로 작업하기 위해 비슷한 시간에 들어온 주문들을 묶어서 작업자에게 한 번에 배정합니다.', actor: '물류사', term: '웨이브 피킹' },
      { from: 'worker', to: 'logistics', label: '상품 찾기 완료', desc: '선반에서 상품 꺼내기', detail: '작업자가 창고 선반을 돌아다니며 주문된 상품들을 하나씩 찾아서 바코드로 스캔하며 수거합니다.', actor: '작업자', term: '피킹' },
      { from: 'worker', to: 'logistics', label: '포장 완료', desc: '박스에 담고 송장 부착', detail: '작업자가 상품을 박스에 담아 포장하고, 택배 송장 번호를 출력해서 붙입니다.', actor: '작업자', term: '패킹' },
      { from: 'logistics', to: 'fulgo', label: '출고 완료 보고', desc: '송장 번호 함께 전송', detail: '물류사가 "포장 완료했고 송장번호는 123456입니다"라고 FULGO에 보고합니다.', actor: '물류사', term: '' },
      { from: 'fulgo', to: 'inventory', label: '재고 차감', desc: '판매 가능 재고 감소', detail: 'FULGO 재고 시스템이 출고된 만큼 재고 수량을 줄입니다.', actor: 'FULGO', term: '' },
      { from: 'fulgo', to: 'shipper', label: '출고 완료 알림', desc: '송장 번호 회신', detail: 'FULGO가 화주사에게 "출고가 완료되었고 송장번호는 이거입니다"라고 알립니다.', actor: 'FULGO', term: '' },
      { from: 'shipper', to: 'channel', label: '배송 정보 업데이트', desc: '판매처에 송장 전달', detail: '화주사가 판매처 시스템에 송장번호를 전송하여 고객이 배송 추적을 할 수 있게 합니다.', actor: '화주사', term: '' },
      { from: 'logistics', to: 'carrier', label: '집하 요청', desc: '택배사에 픽업 의뢰', detail: '물류사가 택배사에 "포장된 물건 가져가주세요"라고 집하를 요청합니다.', actor: '물류사', term: '' },
      { from: 'carrier', to: 'fulgo', label: '배송 상태 전송', desc: '실시간 위치 추적', detail: '택배사가 "집하 완료", "배송 중", "배송 완료" 등의 배송 진행 상황을 실시간으로 FULGO에 보냅니다.', actor: '택배사', term: '' },
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
      { from: 'customer', to: 'shipper', label: '반품 신청', desc: '고객이 반품 요청', detail: '고객이 화주사 고객센터에 "상품에 문제가 있어서 반품하고 싶습니다"라고 요청합니다.', actor: '고객', term: '' },
      { from: 'shipper', to: 'fulgo', label: '반품 승인', desc: '반품 사유 확인 후 승인', detail: '화주사가 반품 사유를 검토하고 "반품을 받겠습니다"라고 승인한 뒤 FULGO에 반품 번호와 함께 등록합니다.', actor: '화주사', term: '반품 승인 번호' },
      { from: 'fulgo', to: 'logistics', label: '반품 입고 배정', desc: '물류사에 반품 예정 알림', detail: 'FULGO가 물류사에게 "곧 이 상품이 반품으로 들어올 예정입니다"라고 미리 알리고 일정을 조율합니다.', actor: 'FULGO', term: '' },
      { from: 'logistics', to: 'fulgo', label: '반품 접수 승인', desc: '창고에서 받을 준비 완료', detail: '물류사가 "이 날짜에 반품을 받을 수 있습니다"라고 확정하고 담당 작업자를 배정합니다.', actor: '물류사', term: '' },
      { from: 'customer', to: 'logistics', label: '반품 상품 발송', desc: '고객이 택배로 반송', detail: '고객이 상품을 다시 포장해서 물류 창고 주소로 택배를 보냅니다.', actor: '고객', term: '' },
      { from: 'worker', to: 'logistics', label: '반품 도착 확인', desc: '창고에 택배 도착', detail: '작업자가 반품 상품이 도착한 것을 확인하고 시스템에 "반품 상품이 들어왔습니다"라고 등록합니다.', actor: '작업자', term: '' },
      { from: 'worker', to: 'logistics', label: '반품 상품 검사', desc: '상태 꼼꼼히 확인', detail: '작업자가 반품된 상품을 열어보고 "다시 팔 수 있을지, 수리가 필요한지, 버려야 할지"를 판단합니다.', actor: '작업자', term: '반품 검수' },
      { from: 'logistics', to: 'fulgo', label: '검사 결과 보고', desc: '상품 상태 분류 전송', detail: '물류사가 검사 결과를 FULGO에 보고합니다. "재판매 가능 10개, 수리 필요 2개, 폐기 1개" 이런 식으로 분류합니다.', actor: '물류사', term: '' },
      { from: 'fulgo', to: 'inventory', label: '재고 처리', desc: '재고 복귀 또는 차감', detail: 'FULGO가 다시 팔 수 있는 상품은 재고에 추가하고, 버려야 할 상품은 재고에서 뺍니다.', actor: 'FULGO', term: '' },
      { from: 'worker', to: 'logistics', label: '상품 재배치', desc: '선반에 다시 정리하거나 폐기', detail: '재판매 가능한 상품은 다시 창고 선반에 정리하고, 폐기 대상은 별도로 처리합니다.', actor: '작업자', term: '' },
      { from: 'fulgo', to: 'shipper', label: '반품 완료 알림', desc: '처리 결과 통보', detail: 'FULGO가 화주사에게 "반품 처리가 완료되었고 재고는 이렇게 변경되었습니다"라고 알립니다.', actor: 'FULGO', term: '' },
      { from: 'shipper', to: 'customer', label: '환불 처리', desc: '고객에게 돈 돌려주기', detail: '화주사가 고객에게 환불을 진행합니다.', actor: '화주사', term: '' },
    ]
  },
  storage: {
    title: '보관 및 재고 관리 (Storage)',
    description: '물류사가 창고 공간을 효율적으로 관리하고, FULGO가 화주사별로 재고 현황을 정확하게 추적하는 일상 운영 과정입니다.',
    hierarchy: 'Fulgo(플랫폼) → 물류사(창고 운영자) → 화주사(고객사)',
    actors: [
      { id: 'fulgo', name: 'FULGO', color: '#d32f2f', desc: '플랫폼 시스템', layer: '1계층' },
      { id: 'logistics', name: '물류사', color: '#f57c00', desc: '창고 운영 회사', layer: '2계층' },
      { id: 'worker', name: '작업자', color: '#7b1fa2', desc: '창고 현장 직원', layer: '2계층' },
      { id: 'inventory', name: '재고시스템', color: '#c2185b', desc: '재고 관리 엔진', layer: '1계층' },
      { id: 'shipper', name: '화주사', color: '#1976d2', desc: '상품 주인', layer: '3계층' },
    ],
    steps: [
      { from: 'fulgo', to: 'logistics', label: '창고 구조 설정', desc: '구역-선반-칸 구조 정의', detail: 'FULGO 시스템에서 물류사별 창고를 구역(Zone), 선반(Rack), 칸(Bin)으로 나누어 체계적으로 등록합니다.', actor: 'FULGO', term: '로케이션 체계' },
      { from: 'logistics', to: 'fulgo', label: '보관 위치 등록', desc: '각 위치에 바코드 부여', detail: '물류사가 실제 창고 선반 하나하나에 위치 정보를 입력하고 바코드 스티커를 붙입니다. 예: "A구역-3번선반-5번칸"', actor: '물류사', term: '' },
      { from: 'worker', to: 'logistics', label: '상품 위치 이동', desc: '다른 선반으로 옮기기', detail: '작업자가 "이 상품을 더 꺼내기 쉬운 곳으로 옮기자"라며 상품을 다른 선반으로 이동하고 바코드로 스캔합니다.', actor: '작업자', term: '' },
      { from: 'logistics', to: 'fulgo', label: '이동 내역 전송', desc: '위치 변경 기록', detail: '물류사가 "A-3-5번 칸에 있던 상품을 B-2-1번 칸으로 옮겼습니다"라고 FULGO에 보고합니다.', actor: '물류사', term: '' },
      { from: 'fulgo', to: 'inventory', label: '재고 위치 업데이트', desc: '실시간 위치 정보 반영', detail: 'FULGO 재고 시스템이 상품의 새로운 위치를 즉시 업데이트합니다.', actor: 'FULGO', term: '' },
      { from: 'logistics', to: 'worker', label: '재고 실사 지시', desc: '실제 수량 확인 작업', detail: '물류사가 정기적으로 또는 필요할 때 작업자에게 "선반에 실제로 몇 개가 있는지 세어보세요"라고 지시합니다.', actor: '물류사', term: '정기 실사' },
      { from: 'worker', to: 'logistics', label: '실사 수행', desc: '직접 세어서 기록', detail: '작업자가 창고를 돌며 선반마다 상품을 직접 세고 바코드를 스캔하며 실제 수량을 기록합니다.', actor: '작업자', term: '' },
      { from: 'logistics', to: 'fulgo', label: '실사 결과 전송', desc: '실제 수량과 차이 보고', detail: '물류사가 "시스템에는 100개라고 되어 있는데 실제로는 98개만 있습니다"라고 차이를 FULGO에 보고합니다.', actor: '물류사', term: '' },
      { from: 'fulgo', to: 'inventory', label: '재고 수량 조정', desc: '시스템 수량 보정', detail: 'FULGO가 실제 수량에 맞춰 시스템 재고를 100개에서 98개로 수정합니다.', actor: 'FULGO', term: '' },
      { from: 'fulgo', to: 'shipper', label: '재고 현황 제공', desc: '실시간 재고 조회 가능', detail: 'FULGO가 화주사에게 "현재 창고에 이 상품이 몇 개 있고, 어디에 보관되어 있습니다"라는 정보를 제공합니다.', actor: 'FULGO', term: '' },
      { from: 'shipper', to: 'fulgo', label: '재고 분석 확인', desc: '상품 회전율 등 리포트', detail: '화주사가 FULGO 대시보드에서 "어떤 상품이 잘 팔리는지, 재고가 얼마나 오래 머물렀는지" 등을 확인합니다.', actor: '화주사', term: '' },
    ]
  }
};
