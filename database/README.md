# 🚀 COMS 데이터베이스 최적화 실행 가이드

## ✅ 실행 순서

### Step 1: 인덱스 및 뷰 생성
1. Supabase Dashboard → **SQL Editor** 열기
2. **New Query** 클릭
3. `optimize_performance_part1.sql` 내용 전체 복사
4. **Run** 클릭
5. 성공 메시지 확인 (약 10-30초 소요)

```sql
-- 성공 시 메시지:
-- Success. No rows returned
```

### Step 2: 함수 생성
1. **New Query** 클릭 (새 쿼리 창)
2. `optimize_performance_part2.sql` 내용 전체 복사
3. **Run** 클릭
4. 성공 메시지 확인

### Step 3: VACUUM 실행 (선택사항)
**⚠️ 중요: 각 명령어를 개별적으로 실행**

1. **New Query** 클릭
2. 아래 명령어를 **하나씩** 복사해서 실행:

```sql
-- 첫 번째 실행
VACUUM ANALYZE donations;
```

```sql
-- 두 번째 실행
VACUUM ANALYZE members;
```

```sql
-- 세 번째 실행
VACUUM ANALYZE donation_types;
```

## 🔍 실행 확인

### 인덱스 생성 확인
```sql
-- 생성된 인덱스 확인
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('donations', 'members', 'donation_types')
ORDER BY tablename, indexname;
```

### 뷰 생성 확인
```sql
-- 생성된 뷰 확인
SELECT 
    table_name 
FROM information_schema.views 
WHERE table_schema = 'public';
```

### 함수 생성 확인
```sql
-- 함수 테스트
SELECT get_dashboard_data('ch2025001', '2025-08-01'::date);
```

## ⚡ 성능 테스트

### Before (최적화 전)
```sql
EXPLAIN ANALYZE
SELECT * FROM donations 
WHERE church_id = 'ch2025001' 
AND donation_date >= '2025-08-01';
```

### After (최적화 후)
```sql
EXPLAIN ANALYZE
SELECT * FROM donations 
WHERE church_id = 'ch2025001' 
AND donation_date >= '2025-08-01';
-- Index Scan 사용 확인!
```

## 📊 모니터링

### 쿼리 성능 확인
Supabase Dashboard에서:
1. **Database** → **Query Performance**
2. Slow queries 확인
3. Most time consuming 확인

### 인덱스 사용률 확인
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## ❌ 문제 해결

### "already exists" 에러
- 이미 생성된 인덱스/뷰입니다
- 무시하고 다음 단계 진행

### "permission denied" 에러
- Supabase 프로젝트 소유자 권한 필요
- Dashboard → Settings → Database → Database password 확인

### "VACUUM cannot run inside a transaction block" 에러
- 각 VACUUM 명령어를 개별적으로 실행
- SQL Editor에서 한 줄씩 실행

## 🎯 예상 결과

| 지표 | 개선 전 | 개선 후 |
|------|---------|---------|
| 대시보드 로딩 | 3-5초 | 0.5-1초 |
| 월별 집계 쿼리 | 500ms | 50ms |
| 인덱스 스캔 | 0% | 90%+ |
| CPU 사용률 | 높음 | 낮음 |

## 💡 추가 팁

1. **정기 유지보수**
   - 매월 1회 VACUUM ANALYZE 실행
   - 분기별 인덱스 사용률 점검

2. **캐시 활용**
   - 뷰(View) 사용으로 복잡한 JOIN 단순화
   - 함수 사용으로 서버 사이드 집계

3. **연결 관리**
   - Connection Pooling 활성화
   - 실시간 구독 최소화

## ✅ 완료 체크리스트

- [ ] Part 1 실행 (인덱스, 뷰)
- [ ] Part 2 실행 (함수)
- [ ] Part 3 실행 (VACUUM) - 선택사항
- [ ] 성능 테스트
- [ ] 앱에서 확인

---

완료 후 앱을 새로고침하면 즉시 성능 향상을 체감할 수 있습니다! 🚀