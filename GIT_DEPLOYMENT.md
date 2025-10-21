# Git 배포 가이드

## 현재 상태
- ✅ 로컬 Git 저장소 초기화 완료
- ✅ 모든 파일 커밋 완료
- 커밋 ID: `c378586`
- 브랜치: `master`

## GitHub에 푸시하기

### 1단계: GitHub에 저장소 생성
1. GitHub 웹사이트에 로그인
2. 우측 상단 `+` → `New repository` 클릭
3. Repository name: `WMS-Flow` (또는 원하는 이름)
4. Description: `FULGO WMS 3-Layer Process Flow Visualization with i18n Support`
5. Public 또는 Private 선택
6. "Create repository" 클릭

### 2단계: 원격 저장소 연결 및 푸시

다음 명령어를 실행하세요:

```bash
# GitHub 저장소 URL 추가
# HTTPS 방식 (권장)
git remote add origin https://github.com/YOUR_USERNAME/WMS-Flow.git

# 또는 SSH 방식 (SSH 키 설정된 경우)
git remote add origin git@github.com:YOUR_USERNAME/WMS-Flow.git

# master 브랜치를 origin으로 푸시
git branch -M main
git push -u origin main
```

### 3단계: WMS-Flow 디렉토리 구조로 배포

만약 기존 저장소가 있고 이 프로젝트를 하위 디렉토리로 추가하려면:

```bash
# 기존 저장소로 이동
cd /path/to/existing/repository

# WMS-Flow 폴더 생성
mkdir WMS-Flow

# 현재 프로젝트의 모든 파일을 WMS-Flow로 복사
cp -r /Users/sotatekthor/Desktop/fulgo-wms-nextjs/* WMS-Flow/

# 변경사항 커밋
git add WMS-Flow/
git commit -m "Add WMS Flow project to WMS-Flow directory"
git push
```

## 현재 Git 저장소 정보

```
저장소 경로: /Users/sotatekthor/Desktop/fulgo-wms-nextjs
브랜치: master (main으로 이름 변경 가능)
커밋 수: 1
사용자: losnah-think (hansol416@tu.ac.kr)
```

## 커밋된 파일 목록

### 핵심 파일
- `i18n.ts` - i18n 설정
- `next.config.js` - Next.js 설정
- `middleware.ts` - 라우팅 미들웨어

### 소스 코드
- `src/app/[locale]/layout.tsx` - 로케일 레이아웃
- `src/app/[locale]/page.tsx` - 메인 페이지
- `src/components/` - React 컴포넌트들
- `src/models/` - 타입 정의 및 데이터

### 번역 파일
- `src/messages/ko.json` - 한국어
- `src/messages/en.json` - 영어
- `src/messages/vi.json` - 베트남어

### 설정 및 문서
- `package.json` - 의존성 패키지
- `tsconfig.json` - TypeScript 설정
- `tailwind.config.js` - Tailwind CSS 설정
- `README.md` - 프로젝트 설명
- `I18N_SETUP.md` - i18n 설정 가이드
- `GUIDE.md` - 사용 가이드

## 다음 단계

### 옵션 1: 새로운 GitHub 저장소 생성
```bash
cd /Users/sotatekthor/Desktop/fulgo-wms-nextjs
git remote add origin https://github.com/YOUR_USERNAME/WMS-Flow.git
git branch -M main
git push -u origin main
```

### 옵션 2: 기존 저장소의 WMS-Flow 폴더로 추가
```bash
# 프로젝트 디렉토리 이동
# 하위 디렉토리로 복사 후 푸시
```

## 주요 기능
✅ 3계층 프로세스 플로우 시각화
✅ 4가지 프로세스 (입고, 출고, 반품, 보관)
✅ 3가지 언어 지원 (한국어, 영어, 베트남어)
✅ 반응형 디자인
✅ 실시간 애니메이션

## 기술 스택
- Next.js 14.1
- React 18.2
- TypeScript 5.3
- Tailwind CSS 3.4
- next-intl (다국어 지원)

## 문의
프로젝트 관련 질문이 있으시면 README.md와 I18N_SETUP.md를 참고하세요.
