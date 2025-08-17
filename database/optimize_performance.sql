-- ============================================
-- COMS 데이터베이스 성능 최적화 SQL
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

-- 4. 함수 생성 (서버 사이드 집계)
-- ============================================

-- 대시보드 데이터 한 번에 가져오기
CREATE OR REPLACE FUNCTION get_dashboard_data(
  p_church_id TEXT,
  p_start_date DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'monthly_total', (
      SELECT COALESCE(SUM(amount), 0)
      FROM donations
      WHERE church_id = p_church_id
        AND status = 'active'
        AND donation_date >= p_start_date
    ),
    'monthly_count', (
      SELECT COUNT(*)
      FROM donations
      WHERE church_id = p_church_id
        AND status = 'active'
        AND donation_date >= p_start_date
    ),
    'member_count', (
      SELECT COUNT(*)
      FROM members
      WHERE church_id = p_church_id
        AND status = 'active'
    ),
    'top_donors', (
      SELECT json_agg(donor_data)
      FROM (
        SELECT 
          COALESCE(m.member_name, d.donor_name, '익명') as name,
          SUM(d.amount) as total
        FROM donations d
        LEFT JOIN members m ON d.member_id = m.member_id
        WHERE d.church_id = p_church_id
          AND d.status = 'active'
          AND d.donation_date >= p_start_date
        GROUP BY COALESCE(m.member_name, d.donor_name, '익명')
        ORDER BY SUM(d.amount) DESC
        LIMIT 10
      ) donor_data
    ),
    'recent_donations', (
      SELECT json_agg(recent_data)
      FROM (
        SELECT 
          d.donation_id,
          d.donation_date,
          d.amount,
          COALESCE(m.member_name, d.donor_name, '익명') as donor_name,
          dt.type_name
        FROM donations d
        LEFT JOIN members m ON d.member_id = m.member_id
        LEFT JOIN donation_types dt ON d.donation_type_id = dt.type_id
        WHERE d.church_id = p_church_id
          AND d.status = 'active'
        ORDER BY d.donation_date DESC, d.created_at DESC
        LIMIT 10
      ) recent_data
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. 통계 정보 업데이트
-- ============================================
ANALYZE donations;
ANALYZE members;
ANALYZE donation_types;

-- 6. RLS 정책 최적화
-- ============================================
-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "donations_select_policy" ON donations;

CREATE POLICY "donations_select_optimized" ON donations
FOR SELECT
TO authenticated
USING (
  church_id IN (
    SELECT church_id 
    FROM churches 
    WHERE church_id = donations.church_id
    LIMIT 1
  )
);

-- 7. VACUUM 실행 (공간 정리)
-- ============================================
VACUUM ANALYZE donations;
VACUUM ANALYZE members;

-- ============================================
-- 실행 방법:
-- 1. Supabase SQL Editor에서 실행
-- 2. 각 섹션을 순서대로 실행
-- 3. 에러 발생 시 개별 명령어로 실행
-- ============================================