# FULGO WMS Next.js 프로젝트 실행 가이드

## 프로젝트 다운로드 후 실행 방법

### 1단계: 프로젝트 디렉토리로 이동
```bash
cd fulgo-wms-nextjs
```

### 2단계: 의존성 설치
```bash
npm install
```

이 명령어는 package.json에 정의된 모든 패키지를 설치합니다:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### 3단계: 개발 서버 실행
```bash
npm run dev
```

서버가 시작되면 터미널에 다음과 같은 메시지가 표시됩니다:
```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
```

### 4단계: 브라우저에서 확인
웹 브라우저를 열고 다음 주소로 이동:
```
http://localhost:3000
```

## 프로젝트 구조 (MVC 패턴)

```
fulgo-wms-nextjs/
├── src/
│   ├── models/                    # MODEL - 데이터 구조
│   │   ├── types.ts              # 타입 정의
│   │   └── flowData.ts           # 플로우 데이터
│   │
│   ├── components/                # VIEW - UI 컴포넌트
│   │   ├── FlowControls.tsx      # 재생/일시정지/초기화 버튼
│   │   ├── HierarchyInfo.tsx     # 3계층 구조 설명
│   │   ├── ActorLegend.tsx       # 액터 범례
│   │   ├── FlowDiagram.tsx       # SVG 다이어그램
│   │   ├── ProgressStatus.tsx    # 진행 상태
│   │   └── StepDetails.tsx       # 단계별 상세 설명
│   │
│   ├── hooks/                     # CONTROLLER - 비즈니스 로직
│   │   └── useFlowController.ts  # 플로우 상태 관리
│   │
│   └── app/                       # Next.js App Router
│       ├── layout.tsx            # 레이아웃
│       ├── page.tsx              # 메인 페이지
│       └── globals.css           # 전역 스타일
│
├── package.json                   # 의존성 정의
├── tsconfig.json                  # TypeScript 설정
├── tailwind.config.js             # Tailwind CSS 설정
├── postcss.config.js              # PostCSS 설정
└── next.config.js                 # Next.js 설정
```

## MVC 패턴 설명

### Model (데이터 계층)
- **역할**: 애플리케이션의 데이터 구조 정의
- **파일**:
  - `types.ts`: Actor, Step, Flow 등의 TypeScript 인터페이스
  - `flowData.ts`: 입고/출고/반품/보관 프로세스의 실제 데이터

### View (프레젠테이션 계층)
- **역할**: 사용자에게 보여지는 UI 컴포넌트
- **파일**: 
  - `FlowControls.tsx`: 사용자 컨트롤 버튼
  - `FlowDiagram.tsx`: SVG 기반 시각화
  - `StepDetails.tsx`: 상세 정보 표시
  - 기타 UI 컴포넌트들

### Controller (제어 계층)
- **역할**: 사용자 입력 처리 및 비즈니스 로직
- **파일**:
  - `useFlowController.ts`: 
    - 플로우 타입 전환
    - 애니메이션 재생/정지
    - 활성 단계 관리
    - 액터 위치 계산

## 주요 기능

1. **4가지 프로세스 시각화**
   - 입고 프로세스 (13단계)
   - 출고 프로세스 (14단계)
   - 반품 프로세스 (12단계)
   - 보관 및 재고 관리 (11단계)

2. **인터랙티브 기능**
   - 자동 애니메이션 재생
   - 단계별 상세 설명 표시
   - 실시간 진행률 표시
   - 프로세스 전환

3. **3계층 구조 표현**
   - FULGO 플랫폼 (1계층)
   - 물류사 (2계층)
   - 화주사 (3계층)

## 프로덕션 빌드

개발이 완료되면 프로덕션용으로 빌드:

```bash
npm run build
npm start
```

## 문제 해결

### 포트가 이미 사용 중인 경우
다른 포트로 실행:
```bash
PORT=3001 npm run dev
```

### 의존성 문제
node_modules와 package-lock.json 삭제 후 재설치:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 기술 스택

- **Next.js 14**: React 프레임워크 (App Router)
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **React 18**: UI 라이브러리

## 개발 환경 요구사항

- Node.js 18.17 이상
- npm 또는 yarn
