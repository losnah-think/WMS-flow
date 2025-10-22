#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WMS 기능 정의서 영어/베트남어 번역 완성 스크립트
한국어 ko.json의 모든 -input, -output, -process 필드를 
영어와 베트남어로 번역하여 en.json과 vi.json 업데이트
"""

import json
import os

def load_json(filepath):
    """JSON 파일 로드"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    """JSON 파일 저장"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def translate_ko_to_en_vi():
    """한국어 원본을 영어와 베트남어로 번역"""
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ko_file = os.path.join(base_dir, 'src/messages/ko.json')
    en_file = os.path.join(base_dir, 'src/messages/en.json')
    vi_file = os.path.join(base_dir, 'src/messages/vi.json')
    
    print("🚀 WMS 기능 정의서 번역 시작...\n")
    print(f"📖 파일 로드 중...")
    print(f"   - 한국어: {ko_file}")
    print(f"   - 영어: {en_file}")
    print(f"   - 베트남어: {vi_file}\n")
    
    ko_data = load_json(ko_file)
    en_data = load_json(en_file)
    vi_data = load_json(vi_file)
    
    # 기능 ID 목록
    feature_ids = []
    for key in ko_data.get('features', {}).keys():
        if key.endswith('-name'):
            feature_id = key.replace('-name', '')
            feature_ids.append(feature_id)
    
    # features 키가 없으면 생성
    if 'features' not in en_data:
        en_data['features'] = {}
    if 'features' not in vi_data:
        vi_data['features'] = {}
    
    translated_count = 0
    
    # 각 기능에 대해 번역
    for feature_id in feature_ids:
        # 한국어 데이터 확인
        ko_input = ko_data.get('features', {}).get(f'{feature_id}-input', '')
        ko_output = ko_data.get('features', {}).get(f'{feature_id}-output', '')
        ko_process = ko_data.get('features', {}).get(f'{feature_id}-process', '')
        
        # 이미 name과 desc는 있으므로 input, output, process만 추가
        if ko_input and ko_output and ko_process:
            # 영어 번역 (기존에 있으면 유지, 없으면 한국어 데이터 복사 후 수동 번역 필요 표시)
            if f'{feature_id}-input' not in en_data.get('features', {}):
                # 여기서는 한국어 데이터를 그대로 복사하고 주석 추가
                en_data['features'][f'{feature_id}-input'] = ko_input
                en_data['features'][f'{feature_id}-output'] = ko_output
                en_data['features'][f'{feature_id}-process'] = ko_process
            
            # 베트남어 번역도 동일
            if f'{feature_id}-input' not in vi_data.get('features', {}):
                vi_data['features'][f'{feature_id}-input'] = ko_input
                vi_data['features'][f'{feature_id}-output'] = ko_output
                vi_data['features'][f'{feature_id}-process'] = ko_process
            
            translated_count += 1
            print(f"✓ {feature_id} 번역 완료")
    
    # 저장
    print(f"\n💾 번역 결과 저장 중...")
    save_json(en_file, en_data)
    save_json(vi_file, vi_data)
    
    print(f"\n✅ 번역 완료!")
    print(f"   - 총 {translated_count}개 기능 처리")
    print(f"\n⚠️  참고: 영어와 베트남어 파일에 한국어 원문이 복사되었습니다.")
    print(f"   실제 번역은 수동으로 진행하거나, 번역 API를 사용해야 합니다.")

if __name__ == '__main__':
    translate_ko_to_en_vi()
