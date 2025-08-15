-- ============================================
-- UUID DEFAULT 값 확인 및 수정 스크립트
-- ============================================
-- 이 스크립트는 테이블의 DEFAULT 값을 확인하고 수정합니다
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. 현재 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('donation_types', 'positions', 'position_statuses')
    AND column_name IN ('type_id', 'position_id', 'status_id')
ORDER BY table_name, ordinal_position;

-- 2. DEFAULT 값이 없다면 추가
ALTER TABLE donation_types 
    ALTER COLUMN type_id SET DEFAULT gen_random_uuid();

ALTER TABLE positions 
    ALTER COLUMN position_id SET DEFAULT gen_random_uuid();

ALTER TABLE position_statuses 
    ALTER COLUMN status_id SET DEFAULT gen_random_uuid();

-- 3. 수정 후 다시 확인
SELECT 
    table_name,
    column_name, 
    column_default
FROM information_schema.columns
WHERE table_name IN ('donation_types', 'positions', 'position_statuses')
    AND column_name IN ('type_id', 'position_id', 'status_id')
ORDER BY table_name;

-- ============================================
-- 테스트: UUID 자동 생성 확인
-- ============================================
-- 아래 쿼리로 UUID가 자동 생성되는지 테스트 (주의: 실제 데이터가 생성됨)
-- INSERT INTO donation_types (church_id, type_name, type_code) 
-- VALUES ('your-church-id-here', 'TEST', 'TEST_CODE') 
-- RETURNING type_id;

-- 테스트 데이터 삭제
-- DELETE FROM donation_types WHERE type_code = 'TEST_CODE';
