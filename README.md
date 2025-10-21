# FULGO WMS - 3계층 프로세스 플로우

FULGO WMS의 입고, 출고, 반품, 보관 프로세스를 시각화한 Next.js 애플리케이션입니다.

## 프로젝트 구조 (MVC)

```
fulgo-wms-nextjs/
├── src/
│   ├── models/              # Model - 데이터 구조
│   │   ├── types.ts         # TypeScript 타입 정의
│   │   └── flowData.ts      # 플로우 데이터
│   ├── components/          # View - UI 컴포넌트
│   │   ├── FlowControls.tsx
│   │   ├── HierarchyInfo.tsx
│   │   ├── ActorLegend.tsx
│   │   ├── FlowDiagram.tsx
│   │   ├── ProgressStatus.tsx
│   │   └── StepDetails.tsx
│   ├── hooks/               # Controller - 비즈니스 로직
│   │   └── useFlowController.ts
│   └── app/                 # Next.js App Router
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
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

### 4가지 프로세스
- **입고 프로세스**: 화주사 → FULGO → 물류사 작업 → 재고 증가
- **출고 프로세스**: 주문 수집 → 피킹/패킹 → 배송 추적
- **반품 프로세스**: 반품 요청 → 검수 → 재고 판별 → 환불
- **보관 및 재고 관리**: 창고 구조 설정 → 위치 이동 → 실사 → 조회

### 3계층 구조
- **1계층 (FULGO 플랫폼)**: 전체 시스템 관리
- **2계층 (물류사)**: 창고 운영 및 실제 작업
- **3계층 (화주사)**: 입출고 요청 및 재고 조회

### 인터랙티브 기능
- 실시간 애니메이션 재생/일시정지
- 단계별 상세 설명 표시
- 진행률 및 현재 단계 추적
- 프로세스 전환

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Architecture**: MVC Pattern
  - Model: 데이터 구조 및 상수
  - View: React 컴포넌트
  - Controller: Custom Hooks

## MVC 아키텍처 설명

### Model (데이터 계층)
- `types.ts`: Flow, Actor, Step 등의 타입 정의
- `flowData.ts`: 4가지 프로세스의 실제 데이터

### View (프레젠테이션 계층)
- `FlowControls.tsx`: 재생/일시정지/초기화 버튼
- `HierarchyInfo.tsx`: 3계층 구조 설명 카드
- `ActorLegend.tsx`: 시스템 구성 요소 범례
- `FlowDiagram.tsx`: SVG 기반 플로우 다이어그램
- `ProgressStatus.tsx`: 현재 진행 상태 표시
- `StepDetails.tsx`: 단계별 상세 설명 패널

### Controller (비즈니스 로직 계층)
- `useFlowController.ts`: 
  - 플로우 상태 관리 (flowType, activeStep, isPlaying)
  - 애니메이션 제어
  - 사용자 인터랙션 핸들링
  - 액터 위치 계산

## 라이선스

MIT
