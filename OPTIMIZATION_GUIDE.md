# COMS 데이터베이스 최적화 가이드

## 🚨 문제 진단

### 현재 발견된 주요 문제들:
1. **DashboardEnhanced.tsx**: 11개 쿼리 동시 실행
2. **실시간 구독 남용**: 여러 컴포넌트에서 중복 구독
3. **인덱스 부재**: 느린 쿼리 성능
4. **캐싱 없음**: 매번 동일한 데이터 재조회

## ✅ 즉시 적용 가능한 해결책

### 1. 데이터베이스 인덱스 추가 (필수!)
```bash
# Supabase SQL Editor에서 실행
# database/optimize_performance.sql 파일 내용 실행
```

### 2. 최적화된 Supabase 클라이언트 사용
```typescript
// 기존 import 변경
// import { supabase } from '../utils/supabase';

// 새로운 import 사용
import { supabase, supabaseManager } from '../utils/supabaseOptimized';
```

### 3. DashboardEnhanced.tsx 수정
```typescript
// 기존 loadDashboardData 함수를 다음으로 교체:
import { getCachedDashboardData } from '../utils/dashboardQueries';

const loadDashboardData = async () => {
  try {
    setIsLoading(true);
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const data = await getCachedDashboardData({
      churchId: session.churchId,
      startOfMonth,
      startOfWeek,
      startOfToday
    });
    
    setStats(data);
  } catch (error) {
    console.error('Dashboard data loading error:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### 4. 실시간 구독 관리
```typescript
// 컴포넌트 언마운트 시 구독 해제
useEffect(() => {
  const subscription = supabaseManager.subscribe(
    'dashboard_updates',
    'donations',
    { church_id: session.churchId },
    loadDashboardData
  );
  
  return () => {
    if (subscription) {
      supabaseManager.unsubscribe('dashboard_updates');
    }
  };
}, [session.churchId]);
```

### 5. 연결 모니터링 추가
```typescript
// App.tsx에 추가
import ConnectionMonitor from './components/ConnectionMonitor';

function App() {
  return (
    <>
      {/* 기존 코드 */}
      <ConnectionMonitor /> {/* 개발 환경에서만 표시됨 */}
    </>
  );
}
```

## 📊 성능 개선 결과 예상

| 항목 | 이전 | 최적화 후 | 개선율 |
|------|------|----------|--------|
| 대시보드 로딩 | 11개 쿼리 | 2개 쿼리 | 82% ↓ |
| 응답 시간 | 3-5초 | 0.5-1초 | 80% ↓ |
| DB 연결 수 | 무제한 | 최대 5개 | 제한됨 |
| 캐시 사용 | 없음 | 1분 캐싱 | 추가됨 |

## 🔧 Supabase 대시보드 설정

1. **Project Settings** → **Database**
2. **Connection Pooling** 활성화
3. **Pool Mode**: Transaction
4. **Pool Size**: 15
5. **Statement Timeout**: 30초

## 📝 체크리스트

- [ ] `database/optimize_performance.sql` 실행
- [ ] `utils/supabaseOptimized.ts` 파일 사용
- [ ] `utils/dashboardQueries.ts` 파일 사용
- [ ] DashboardEnhanced.tsx 수정
- [ ] ConnectionMonitor 컴포넌트 추가
- [ ] Supabase Connection Pooling 설정
- [ ] 테스트 및 모니터링

## ⚠️ 주의사항

1. **인덱스 생성 시간**: 데이터가 많으면 시간이 걸릴 수 있음
2. **캐시 무효화**: 데이터 수정 시 캐시 갱신 필요
3. **구독 해제**: 컴포넌트 언마운트 시 반드시 구독 해제

## 🚀 추가 최적화 (선택사항)

### 1. React Query 도입
```bash
npm install @tanstack/react-query
```

### 2. 가상 스크롤링
```bash
npm install react-window
```

### 3. 이미지 최적화
```bash
npm install react-lazy-load-image-component
```

## 📞 문제 발생 시

1. Supabase 대시보드에서 **Logs** 확인
2. 브라우저 콘솔에서 에러 메시지 확인
3. ConnectionMonitor에서 연결 상태 확인
4. `supabaseManager.getConnectionStatus()` 콘솔 실행

## 💡 팁

- 개발 중에는 ConnectionMonitor를 항상 켜두세요
- 실시간 구독은 꼭 필요한 곳에만 사용하세요
- 대량 데이터는 페이지네이션을 사용하세요
- 정기적으로 VACUUM 명령어를 실행하세요

---

작성일: 2025-08-17
버전: 1.0.0