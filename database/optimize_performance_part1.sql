-- ============================================
-- COMS 데이터베이스 성능 최적화 SQL
-- Part 1: 인덱스 및 뷰 생성
-- ============================================

-- 1. 인덱스 생성 (쿼리 속도 향상)
-- ============================================

-- donations 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_donations_church_date 
ON donations(church_id, donation_date DESC);

CREATE INDEX IF NOT EXISTS idx_donations_church_status_date 
ON donations(church_id, status, donation_date DESC);

CREATE INDEX IF NOT EXISTS idx_donations_member 
ON donations(member_id);

CREATE INDEX IF NOT EXISTS idx_donations_type 
ON donations(donation_type_id);

-- members 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_members_church_status 
ON members(church_id, status);

CREATE INDEX IF NOT EXISTS idx_members_church_name 
ON members(church_id, member_name);

-- donation_types 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_donation_types_church_active 
ON donation_types(church_id, is_active);

-- 2. 복합 인덱스 (JOIN 최적화)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_donations_complex 
ON donations(church_id, status, donation_date DESC, member_id, donation_type_id);

-- 3. 뷰(View) 생성 (복잡한 쿼리 단순화)
-- ============================================

-- 대시보드용 통합 뷰
CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT 
  d.church_id,
  d.donation_date,
  d.amount,
  d.member_id,
  d.donor_name,
  d.donation_type_id,
  d.payment_method,
  d.created_at,
  m.member_name,
  m.phone as member_phone,
  dt.type_name
FROM donations d
LEFT JOIN members m ON d.member_id = m.member_id
LEFT JOIN donation_types dt ON d.donation_type_id = dt.type_id
WHERE d.status = 'active';

-- 월별 집계 뷰
CREATE OR REPLACE VIEW v_monthly_summary AS
SELECT 
  church_id,
  DATE_TRUNC('month', donation_date::date) as month,
  COUNT(*) as donation_count,
  SUM(amount) as total_amount,
  COUNT(DISTINCT COALESCE(member_id, donor_name)) as unique_donors
FROM donations
WHERE status = 'active'
GROUP BY church_id, DATE_TRUNC('month', donation_date::date);

-- 주별 집계 뷰
CREATE OR REPLACE VIEW v_weekly_summary AS
SELECT 
  church_id,
  DATE_TRUNC('week', donation_date::date) as week,
  COUNT(*) as donation_count,
  SUM(amount) as total_amount
FROM donations
WHERE status = 'active'
GROUP BY church_id, DATE_TRUNC('week', donation_date::date);

-- 4. 통계 정보 업데이트
-- ============================================
ANALYZE donations;
ANALYZE members;
ANALYZE donation_types;

-- ============================================
-- ✅ Part 1 완료!
-- 다음 파일(optimize_performance_part2.sql) 실행
-- ============================================