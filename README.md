<<<<<<< HEAD
````markdown
# FULGO WMS - 3계층 프로세스 플로우 시각화

FULGO WMS의 입고, 출고, 반품, 보관 프로세스를 시각화한 Next.js 애플리케이션입니다.

🌍 **3가지 언어 지원**: 한국어, 영어, 베트남어 (next-intl)

## 프로젝트 개요

- 📊 **4가지 물류 프로세스** 시각화 (입고, 출고, 반품, 보관)
- 🎯 **3계층 구조** 명확한 표현 (FULGO 플랫폼, 물류사, 화주사)
- 🎨 **인터랙티브 다이어그램** - SVG 기반 애니메이션
- 🌐 **다국어 지원** - 한국어, 영어, 베트남어
- ⚡ **Next.js 14** - 최신 App Router 기반

## 프로젝트 구조 (MVC Pattern)

```
fulgo-wms-nextjs/
├── src/
│   ├── models/              # Model - 데이터 구조
│   │   ├── types.ts         # TypeScript 타입 정의
│   │   └── flowData.ts      # 프로세스 데이터
│   ├── components/          # View - UI 컴포넌트
│   │   ├── FlowControls.tsx
│   │   ├── HierarchyInfo.tsx
│   │   ├── ActorLegend.tsx
│   │   ├── FlowDiagram.tsx
│   │   ├── ProgressStatus.tsx
│   │   ├── StepDetails.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── hooks/               # Controller - 비즈니스 로직
│   │   └── useFlowController.ts
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [locale]/        # i18n 라우팅
│   ├── messages/            # 번역 파일
│   │   ├── ko.json
│   │   ├── en.json
│   │   └── vi.json
│   └── middleware.ts        # i18n 미들웨어
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── i18n.ts
└── middleware.ts
```

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 3. 프로덕션 빌드
```bash
npm run build
npm start
```

## 주요 기능

### 4가지 물류 프로세스

#### 입고 프로세스 (Inbound)
- 화주사의 입고 예정 등록
- FULGO 플랫폼의 물류사 알림
- 창고 도킹 및 상품 수령
- 검수 및 적치
- 재고 시스템 반영

#### 출고 프로세스 (Outbound)
- 판매처 주문 수집
- 재고 확인 및 예약
- 피킹 및 패킹
- 송장 생성 및 배송
- 실시간 배송 추적

#### 반품 프로세스 (Return)
- 고객 반품 신청
- 반품 승인 및 일정 협의
- 반품 상품 수령 및 검사
- 재판매/수리/폐기 판별
- 환불 처리

#### 보관 및 재고 관리 (Storage)
- 창고 구조 설정
- 상품 위치 이동
- 주기적 실사
- 재고 조회 및 분석

### 3계층 구조

| 계층 | 역할 | 책임 |
|------|------|------|
| **1계층** | FULGO 플랫폼 | 전체 시스템 관리, 정책 수립, 데이터 통합 |
| **2계층** | 물류사 | 창고 운영, 실제 입출고 작업, 작업자 관리 |
| **3계층** | 화주사 | 입출고 요청, 재고 조회, 판매 관리 |

### 인터랙티브 기능

- ⏯️ **재생/일시정지** - 프로세스 흐름 애니메이션 제어
- 🔄 **초기화** - 프로세스 단계 리셋
- 📊 **단계별 정보** - 현재 단계의 상세 설명
- 📈 **진행 상태** - 프로세스 진행률 표시
- 🌐 **다국어 전환** - 한국어/English/Tiếng Việt 버튼

## 기술 스택

| 분류 | 기술 |
|------|------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.3 |
| **Styling** | Tailwind CSS 3.4 |
| **i18n** | next-intl |
| **Architecture** | MVC Pattern |

## MVC 아키텍처 설명

### Model (데이터 계층)
- **types.ts**: Flow, Actor, Step 등의 TypeScript 타입 정의
- **flowData.ts**: 4가지 프로세스의 상세 데이터 (13~15 단계)

### View (프레젠테이션 계층)
- **FlowControls.tsx**: 프로세스 선택 및 재생/정지/초기화 버튼
- **HierarchyInfo.tsx**: 3계층 구조 설명 카드
- **ActorLegend.tsx**: 시스템 구성 요소 범례
- **FlowDiagram.tsx**: SVG 기반 인터랙티브 플로우 다이어그램
- **ProgressStatus.tsx**: 현재 진행 상태 및 진행률 표시
- **StepDetails.tsx**: 단계별 상세 설명 패널
- **LanguageSwitcher.tsx**: 다국어 전환 버튼

### Controller (비즈니스 로직 계층)
- **useFlowController.ts**: 
  - 플로우 상태 관리 (flowType, activeStep, isPlaying)
  - 2.5초 간격 애니메이션 제어
  - 사용자 인터랙션 핸들링
  - 액터 위치 계산

## 다국어 지원 (i18n)

### 지원 언어
- 🇰🇷 **한국어 (ko)** - 기본 언어
- 🇺🇸 **영어 (en)**
- 🇻🇳 **베트남어 (vi)** - 신규

### URL 구조
```
http://localhost:3000/ko   # 한국어
http://localhost:3000/en   # 영어
http://localhost:3000/vi   # 베트남어
```

더 자세한 i18n 설정은 [I18N_SETUP.md](./I18N_SETUP.md)를 참고하세요.

## Git 배포 정보

| 항목 | 내용 |
|------|------|
| **저장소** | https://github.com/losnah-think/WMS-flow |
| **브랜치** | main |
| **커밋** | 초기 커밋 + i18n 구성 + 배포 가이드 |

## 시작하기

```bash
# 1. 저장소 클론
git clone https://github.com/losnah-think/WMS-flow.git
cd WMS-flow

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 열기
# http://localhost:3000 (한국어로 자동 리다이렉트)
# http://localhost:3000/en (영어)
# http://localhost:3000/vi (베트남어)
```

## 문서

- [I18N_SETUP.md](./I18N_SETUP.md) - 다국어 설정 상세 가이드
- [GIT_DEPLOYMENT.md](./GIT_DEPLOYMENT.md) - Git 배포 가이드
- [GUIDE.md](./GUIDE.md) - 프로젝트 사용 가이드

## 라이선스

MIT

## 작성자

losnah-think (hansol416@tu.ac.kr)

## 최종 업데이트

2025년 10월 21일 - i18n 완성 (한국어, 영어, 베트남어)
````
=======
# WMS-flow
>>>>>>> 80db0dcf2c1db55d3b35987f20ac4f3e470abeab
