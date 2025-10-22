#!/usr/bin/env python3
"""
WMS 기능 정의서 번역 스크립트
한국어 원본을 기반으로 영어와 베트남어 번역 생성
"""

import json

# 한국어 -> 영어 번역 매핑 (기능별 상세 데이터)
translations_en = {
    # STK-013부터 STK-015
    "STK-013-output": "Movement History (Date, Type, Quantity, Handler, Memo)\nInbound Cumulative, Outbound Cumulative\nPath Map",
    "STK-013-process": "Receive Product ID\nApply period filter\nQuery all inbound/outbound records for the period from DB\nApply movement type filter (Inbound/Outbound)\nSort in reverse chronological order\nCalculate cumulative amounts\nMap movement path\nDisplay results in timeline format on screen",
    
    "STK-014-name": "Monthly Inventory Trends",
    "STK-014-desc": "Monthly inventory increase/decrease trend report",
    "STK-014-input": "Product ID (Optional)\nInquiry Period (Last 3/6/12 Months)\nGrouping (By Product/By Category)",
    "STK-014-output": "Monthly Data (Month, Opening Stock, Inbound, Outbound, Closing Stock)\nTrend Chart, Growth Rate\nAverage Stock",
    "STK-014-process": "Select inquiry period\nQuery first-day stock for each month in period\nAggregate monthly inbound amount\nAggregate monthly outbound amount\nCalculate month-end stock\nCalculate monthly growth rate\nCalculate average stock\nGenerate trend chart\nDisplay on report screen",
    
    "STK-015-name": "Low Stock Alert",
    "STK-015-desc": "Automatic alert notification when stock is low",
    "STK-015-input": "Product ID (Required)\nAlert Threshold (Required)\nNotification Method (Email/SMS/Screen/All)",
    "STK-015-output": "Alert ID\nSetting Status (Active/Inactive)\nCurrent Stock, Alert Status",
    "STK-015-process": "Select product\nSet alert threshold\nSelect notification method\nSave settings\nSystem monitors periodically\nAlert triggered when current stock < threshold\nSend notification via configured method\nRecord alert history",
}

# 베트남어 번역 매핑
translations_vi = {
    # STK-013부터 STK-015
    "STK-013-output": "Lịch sử Di chuyển (Ngày, Loại, Số lượng, Người xử lý, Ghi chú)\nNhập kho Tích lũy, Xuất kho Tích lũy\nBản đồ Đường đi",
    "STK-013-process": "Nhận Product ID\nÁp dụng bộ lọc thời gian\nTruy vấn tất cả bản ghi nhập/xuất kho trong kỳ từ DB\nÁp dụng bộ lọc loại di chuyển (Nhập/Xuất)\nSắp xếp theo thứ tự thời gian ngược\nTính tổng tích lũy\nLập bản đồ đường đi\nHiển thị kết quả dạng timeline trên màn hình",
    
    "STK-014-name": "Xu hướng Tồn kho Hàng tháng",
    "STK-014-desc": "Báo cáo xu hướng tăng/giảm tồn kho hàng tháng",
    "STK-014-input": "Product ID (Tùy chọn)\nKỳ Tra cứu (3/6/12 Tháng gần đây)\nNhóm (Theo Sản phẩm/Theo Danh mục)",
    "STK-014-output": "Dữ liệu Hàng tháng (Tháng, Tồn đầu, Nhập, Xuất, Tồn cuối)\nBiểu đồ Xu hướng, Tỷ lệ Tăng trưởng\nTồn kho Trung bình",
    "STK-014-process": "Chọn kỳ tra cứu\nTruy vấn tồn kho ngày đầu tiên của mỗi tháng trong kỳ\nTổng hợp lượng nhập hàng tháng\nTổng hợp lượng xuất hàng tháng\nTính tồn kho cuối tháng\nTính tỷ lệ tăng trưởng hàng tháng\nTính tồn kho trung bình\nTạo biểu đồ xu hướng\nHiển thị trên màn hình báo cáo",
    
    "STK-015-name": "Cảnh báo Thiếu Tồn kho",
    "STK-015-desc": "Thông báo cảnh báo tự động khi tồn kho thấp",
    "STK-015-input": "Product ID (Bắt buộc)\nNgưỡng Cảnh báo (Bắt buộc)\nPhương thức Thông báo (Email/SMS/Màn hình/Tất cả)",
    "STK-015-output": "Alert ID\nTrạng thái Cài đặt (Kích hoạt/Tắt)\nTồn kho Hiện tại, Trạng thái Cảnh báo",
    "STK-015-process": "Chọn sản phẩm\nĐặt ngưỡng cảnh báo\nChọn phương thức thông báo\nLưu cài đặt\nHệ thống giám sát định kỳ\nKích hoạt cảnh báo khi tồn kho hiện tại < ngưỡng\nGửi thông báo qua phương thức đã cấu hình\nGhi lại lịch sử cảnh báo",
}

print("번역 매핑 데이터 준비 완료")
print(f"영어 번역: {len(translations_en)} 항목")
print(f"베트남어 번역: {len(translations_vi)} 항목")
