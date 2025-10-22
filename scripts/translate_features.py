#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WMS 기능 정의서 자동 번역 스크립트
한국어 원본을 기반으로 영어와 베트남어 번역 자동 생성
"""

import json
import re

def load_json(filepath):
    """JSON 파일 로드"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    """JSON 파일 저장"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 기능 ID 목록
FEATURE_IDS = [
    # 재고 관리
    'STK-001', 'STK-002', 'STK-003', 'STK-004', 'STK-005', 
    'STK-006', 'STK-007', 'STK-008', 'STK-009', 'STK-010',
    'STK-011', 'STK-012', 'STK-013', 'STK-014', 'STK-015',
    # 피킹/패킹
    'PIC-001', 'PIC-002', 'PIC-003', 'PIC-004', 'PIC-005',
    'PIC-006', 'PIC-007', 'PIC-008', 'PIC-009', 'PIC-010',
    # 반품/불량
    'RET-001', 'RET-002', 'RET-003', 'RET-004', 'RET-005',
    'RET-006', 'RET-007',
    # 출고/배송
    'OUT-001', 'OUT-002', 'OUT-003', 'OUT-004', 'OUT-005',
    # 시스템/인증
    'USER-001', 'USER-002', 'USER-003', 'USER-004',
    # 통계/리포트
    'RPT-001', 'RPT-002', 'RPT-003', 'RPT-004', 'RPT-005', 'RPT-006',
    # 설정/관리
    'CFG-001', 'CFG-002', 'CFG-003', 'CFG-004'
]

# 한국어 -> 영어 번역 매핑 (자주 사용되는 용어)
KO_TO_EN = {
    # 공통 용어
    '필수': 'Required',
    '선택': 'Optional',
    '기본값': 'Default',
    '상품': 'Product',
    '수량': 'Quantity',
    '재고': 'Stock',
    '창고': 'Warehouse',
    '주문': 'Order',
    '고객': 'Customer',
    '작업자': 'Worker',
    '담당자': 'Handler',
    '날짜': 'Date',
    '시간': 'Time',
    '상태': 'Status',
    '완료': 'Complete',
    '실패': 'Failed',
    '성공': 'Success',
    '정상': 'Normal',
    '예약': 'Reserved',
    '불량': 'Defective',
    '입고': 'Inbound',
    '출고': 'Outbound',
    '피킹': 'Picking',
    '패킹': 'Packing',
    '배송': 'Shipping',
    '반품': 'Return',
    '검수': 'Inspection',
    '승인': 'Approval',
    '거절': 'Rejection',
    '알림': 'Notification',
    '경고': 'Alert',
    '리포트': 'Report',
    '분석': 'Analysis',
    '통계': 'Statistics',
    '대시보드': 'Dashboard',
    '설정': 'Settings',
    '관리': 'Management',
    '등록': 'Registration',
    '수정': 'Modification',
    '삭제': 'Deletion',
    '조회': 'Inquiry',
    '검색': 'Search',
    '필터': 'Filter',
    '정렬': 'Sort',
    '목록': 'List',
    '상세': 'Detail',
    '기록': 'Record',
    '이력': 'History',
    '처리': 'Processing',
    '진행': 'Progress',
    '대기': 'Pending',
}

# 한국어 -> 베트남어 번역 매핑
KO_TO_VI = {
    # 공통 용어
    '필수': 'Bắt buộc',
    '선택': 'Tùy chọn',
    '기본값': 'Mặc định',
    '상품': 'Sản phẩm',
    '수량': 'Số lượng',
    '재고': 'Tồn kho',
    '창고': 'Kho',
    '주문': 'Đơn hàng',
    '고객': 'Khách hàng',
    '작업자': 'Nhân viên',
    '담당자': 'Người phụ trách',
    '날짜': 'Ngày',
    '시간': 'Thời gian',
    '상태': 'Trạng thái',
    '완료': 'Hoàn thành',
    '실패': 'Thất bại',
    '성공': 'Thành công',
    '정상': 'Bình thường',
    '예약': 'Đặt trước',
    '불량': 'Lỗi',
    '입고': 'Nhập kho',
    '출고': 'Xuất kho',
    '피킹': 'Picking',
    '패킹': 'Đóng gói',
    '배송': 'Giao hàng',
    '반품': 'Trả hàng',
    '검수': 'Kiểm tra',
    '승인': 'Phê duyệt',
    '거절': 'Từ chối',
    '알림': 'Thông báo',
    '경고': 'Cảnh báo',
    '리포트': 'Báo cáo',
    '분석': 'Phân tích',
    '통계': 'Thống kê',
    '대시보드': 'Bảng điều khiển',
    '설정': 'Cài đặt',
    '관리': 'Quản lý',
    '등록': 'Đăng ký',
    '수정': 'Sửa đổi',
    '삭제': 'Xóa',
    '조회': 'Tra cứu',
    '검색': 'Tìm kiếm',
    '필터': 'Lọc',
    '정렬': 'Sắp xếp',
    '목록': 'Danh sách',
    '상세': 'Chi tiết',
    '기록': 'Bản ghi',
    '이력': 'Lịch sử',
    '처리': 'Xử lý',
    '진행': 'Tiến trình',
    '대기': 'Chờ',
}

def translate_text(text, mapping):
    """텍스트 번역 (간단한 용어 기반 번역)"""
    if not text or text == '-':
        return text
    
    result = text
    for ko, translated in mapping.items():
        result = result.replace(ko, translated)
    
    return result

def translate_features():
    """모든 기능 번역"""
    print("🚀 WMS 기능 정의서 자동 번역 시작...\n")
    
    # 파일 경로
    ko_file = '../src/messages/ko.json'
    en_file = '../src/messages/en.json'
    vi_file = '../src/messages/vi.json'
    
    # JSON 파일 로드
    print("📖 JSON 파일 로드 중...")
    ko_data = load_json(ko_file)
    en_data = load_json(en_file)
    vi_data = load_json(vi_file)
    
    translated_en = 0
    translated_vi = 0
    
    # 각 기능 ID에 대해 번역
    for feature_id in FEATURE_IDS:
        # 한국어 데이터 가져오기
        ko_input = ko_data.get(f'features.{feature_id}-input', '')
        ko_output = ko_data.get(f'features.{feature_id}-output', '')
        ko_process = ko_data.get(f'features.{feature_id}-process', '')
        
        # 영어 번역
        if ko_input and ko_output and ko_process:
            en_input = translate_text(ko_input, KO_TO_EN)
            en_output = translate_text(ko_output, KO_TO_EN)
            en_process = translate_text(ko_process, KO_TO_EN)
            
            en_data[f'features.{feature_id}-input'] = en_input
            en_data[f'features.{feature_id}-output'] = en_output
            en_data[f'features.{feature_id}-process'] = en_process
            translated_en += 1
        
        # 베트남어 번역
        if ko_input and ko_output and ko_process:
            vi_input = translate_text(ko_input, KO_TO_VI)
            vi_output = translate_text(ko_output, KO_TO_VI)
            vi_process = translate_text(ko_process, KO_TO_VI)
            
            vi_data[f'features.{feature_id}-input'] = vi_input
            vi_data[f'features.{feature_id}-output'] = vi_output
            vi_data[f'features.{feature_id}-process'] = vi_process
            translated_vi += 1
    
    # 번역된 데이터 저장
    print(f"\n💾 번역 결과 저장 중...")
    save_json(en_file, en_data)
    save_json(vi_file, vi_data)
    
    print(f"\n✅ 번역 완료!")
    print(f"   - 영어: {translated_en}개 기능 번역")
    print(f"   - 베트남어: {translated_vi}개 기능 번역")
    print(f"\n📁 저장 위치:")
    print(f"   - {en_file}")
    print(f"   - {vi_file}")

if __name__ == '__main__':
    translate_features()
