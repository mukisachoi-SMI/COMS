-- ============================================
-- COMS 데이터베이스 성능 최적화 SQL
-- Part 2: 함수 및 정책 생성
-- ============================================

-- 1. 함수 생성 (서버 사이드 집계)
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

-- 2. RLS 정책 최적화 (선택사항)
-- ============================================
-- 주의: 기존 정책이 있는 경우에만 실행
-- DROP POLICY IF EXISTS "donations_select_policy" ON donations;

-- CREATE POLICY "donations_select_optimized" ON donations
-- FOR SELECT
-- TO authenticated
-- USING (
--   church_id IN (
--     SELECT church_id 
--     FROM churches 
--     WHERE church_id = donations.church_id
--     LIMIT 1
--   )
-- );

-- ============================================
-- ✅ Part 2 완료!
-- 다음: VACUUM 명령어를 별도로 실행 (선택사항)
-- ============================================