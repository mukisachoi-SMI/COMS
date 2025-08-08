# 교회 헌금관리시스템 v2.0

## 시스템 개요
교회의 교인 정보와 헌금 내역을 체계적으로 관리하는 웹 기반 시스템입니다.

## 주요 기능
- ✅ **교인 관리**: 교인 정보 등록/수정/삭제
- ✅ **헌금 관리**: 헌금 내역 등록/수정/삭제
- ✅ **직분 관리**: 교인 직분 및 상태 관리
- ✅ **통계/보고**: 헌금 통계 및 보고서 생성

## 최신 업데이트 (v2.0)

### 헌금 종류 개선
기존 4개 → 10개로 확대:
1. **주정헌금** (WEEKLY_OFFERING)
2. **감사헌금** (THANKSGIVING)
3. **십일조** (TITHE)
4. **선교헌금** (MISSION)
5. **절기헌금** (SEASONAL)
6. **건축헌금** (BUILDING)
7. **임직헌금** (ORDINATION)
8. **장학헌금** (SCHOLARSHIP)
9. **주일헌금** (SUNDAY_OFFERING)
10. **목적헌금** (PURPOSE_OFFERING)

### 헌금방법 간소화
- 기존: 납부방법 (다양한 옵션)
- 변경: **헌금방법** (현금, 온라인 2개만)

## 기술 스택
- **Frontend**: React + TypeScript
- **Backend**: Supabase
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS

## 설치 및 실행

### 1. 필수 요구사항
- Node.js 16.0 이상
- npm 또는 yarn
- Supabase 계정

### 2. 설치 방법
```bash
# 저장소 클론
cd church-donation-system

# 의존성 설치
npm install

# 환경 변수 설정
# .env 파일 생성 후 Supabase 정보 입력
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 데이터베이스 설정
```sql
-- Supabase SQL 에디터에서 실행
-- 1. 기본 스키마 실행: database_schema_positions_fixed.sql
-- 2. 헌금 종류 업데이트: database_donation_types_update_v2.sql
```

### 4. 실행
```bash
# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build
```

## 데이터베이스 구조

### 주요 테이블
- **churches**: 교회 정보
- **members**: 교인 정보
- **donations**: 헌금 내역
- **donation_types**: 헌금 종류
- **positions**: 직분 정보
- **position_statuses**: 직분 상태

## 화면 구성
1. **로그인**: 교회별 로그인
2. **대시보드**: 전체 현황 요약
3. **교인 관리**: 교인 등록/수정/조회
4. **헌금 관리**: 헌금 등록/수정/조회
5. **설정**: 교회 정보, 헌금 종류, 직분 관리

## 보안
- Supabase Row Level Security (RLS) 적용
- 교회별 데이터 격리
- 세션 기반 인증

## 라이선스
MIT License

## 문의
프로젝트 관련 문의사항은 Issues 탭을 이용해주세요.