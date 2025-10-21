# i18n 국제화 설정 가이드

## 설치된 패키지
- `next-intl`: Next.js 14 공식 국제화 라이브러리

## 설정된 언어
- **한국어 (ko)**: 기본 언어
- **영어 (en)**: 추가 언어
- **베트남어 (vi)**: 추가 언어 (신규)

## 파일 구조

```
src/
├── app/
│   ├── layout.tsx                 # 루트 레이아웃
│   ├── page.tsx                   # 루트 페이지 (리다이렉트)
│   └── [locale]/
│       ├── layout.tsx             # 로케일별 레이아웃
│       ├── page.tsx               # 메인 페이지
│       └── globals.css
├── messages/
│   ├── ko.json                    # 한국어 번역
│   ├── en.json                    # 영어 번역
│   └── vi.json                    # 베트남어 번역 (신규)
├── components/
│   ├── LanguageSwitcher.tsx       # 언어 전환 버튼 (한국어/English/Tiếng Việt)
│   ├── FlowControls.tsx           # i18n 적용됨
│   ├── HierarchyInfo.tsx          # i18n 적용됨
│   ├── ActorLegend.tsx            # i18n 적용됨
│   ├── ProgressStatus.tsx         # i18n 적용됨
│   └── StepDetails.tsx            # i18n 적용됨
├── middleware.ts                  # i18n 미들웨어 (업데이트됨)
└── i18n.ts                        # i18n 설정 (업데이트됨)
├── next.config.js                 # i18n 설정 (업데이트됨)
```

## 주요 기능

### 1. URL 기반 로케일 라우팅
- 기본 URL: `http://localhost:3000/` → 한국어로 자동 리다이렉트
- 한국어: `http://localhost:3000/ko`
- 영어: `http://localhost:3000/en`
- 베트남어: `http://localhost:3000/vi`

### 2. 언어 전환 버튼
- 페이지 우측 상단에 **한국어 / English / Tiếng Việt** 버튼 3개 추가
- 클릭하여 해당 언어로 전환 가능
- 현재 언어는 파란색으로 강조 표시

### 3. 번역 파일
- `src/messages/ko.json`: 한국어 번역
- `src/messages/en.json`: 영어 번역
- `src/messages/vi.json`: 베트남어 번역 (신규)
- 계층 구조, 프로세스 제목, 버튼 텍스트 등 모두 번역 가능

## 사용 방법

### 컴포넌트에서 번역 사용
```typescript
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations();

  return (
    <button>{t('common.buttons.play')}</button>
  );
}
```

### 번역 추가 방법
`src/messages/ko.json`, `src/messages/en.json`, `src/messages/vi.json`에 새로운 키-값 쌍을 추가합니다.

예:
```json
{
  "mySection": {
    "myKey": "번역된 텍스트"
  }
}
```

그 후 컴포넌트에서 `t('mySection.myKey')`로 사용합니다.

## 구현된 번역 항목
- **흐름 타입**: 입고, 출고, 반품, 보관 (버튼)
- **컨트롤 버튼**: 재생, 일시정지, 초기화
- **상태 텍스트**: 현재 단계, 담당, 용어 등
- **프로세스 설명**: 각 프로세스의 제목과 설명
- **베트남어**: 모든 위 항목들이 베트남어로 번역됨

## 빌드 및 실행

### 개발 모드
```bash
npm run dev
# http://localhost:3000 접속
```

### 프로덕션 빌드
```bash
npm run build
npm start
```

## 베트남어 추가 내용

### 새로 추가된 파일
- `src/messages/vi.json`: 완전한 베트남어 번역

### 업데이트된 파일
- `i18n.ts`: `['ko', 'en', 'vi']` 지원 추가
- `next.config.js`: `locales: ['ko', 'en', 'vi']` 설정
- `src/middleware.ts`: 베트남어 라우트 추가 `/(ko|en|vi)/:path*`
- `src/app/[locale]/layout.tsx`: 베트남어 locale 지원
- `src/components/LanguageSwitcher.tsx`: 베트남어 버튼 추가

### 베트남어 번역 완료 항목
✅ 프로세스 제목 및 설명 (입고, 출고, 반품, 보관)
✅ UI 버튼 텍스트
✅ 컴포넌트 레이블
✅ 상태 메시지

## 추가 기능 구현 아이디어
1. 사용자의 브라우저 언어 설정 자동 감지
2. 사용자 언어 선택 저장 (localStorage/cookie)
3. 추가 언어 지원 (중국어, 일본어, 태국어 등)
4. 동적 번역 로딩
5. 백엔드 번역 문자열 관리

## 새 언어 추가 방법

1. `src/messages/` 폴더에 새 언어 파일 생성 (예: `ja.json`)
2. 모든 번역 문자열 추가
3. `i18n.ts` 수정: `const locales = ['ko', 'en', 'vi', 'ja'];`
4. `next.config.js` 수정: `locales: ['ko', 'en', 'vi', 'ja']`
5. `src/middleware.ts` 수정: `locales: ['ko', 'en', 'vi', 'ja']` 및 matcher 업데이트
6. `src/app/[locale]/layout.tsx` 수정: `const locales = ['ko', 'en', 'vi', 'ja'];`
7. `src/components/LanguageSwitcher.tsx`에 새 언어 버튼 추가

## 주의사항
- `flowData.ts`의 프로세스 데이터는 아직 한국어만 지원합니다.
- 필요시 동적 번역이 가능하도록 리팩토링하세요.
- 미들웨어는 모든 요청을 가로채므로, 성능이 필요하면 경로 제한을 고려하세요.
- 새 언어 추가 시 모든 파일에서 일관되게 업데이트해야 합니다.
