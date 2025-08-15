-- ============================================
-- 코드 컬럼 길이 확장 스크립트
-- ============================================
-- 이 스크립트는 type_code, position_code, status_code 컬럼의 길이를 
-- VARCHAR(30)에서 VARCHAR(50)으로 확장합니다
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. 현재 컬럼 길이 확인
SELECT 
    table_name,
    column_name, 
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name IN ('donation_types', 'positions', 'position_statuses')
    AND column_name IN ('type_code', 'position_code', 'status_code')
ORDER BY table_name, column_name;

-- 2. 컬럼 길이 확장 (30 -> 50)
ALTER TABLE donation_types 
    ALTER COLUMN type_code TYPE VARCHAR(50);

ALTER TABLE positions 
    ALTER COLUMN position_code TYPE VARCHAR(50);

ALTER TABLE position_statuses 
    ALTER COLUMN status_code TYPE VARCHAR(50);

-- 3. 변경 후 다시 확인
SELECT 
    table_name,
    column_name, 
    character_maximum_length as "새로운 길이"
FROM information_schema.columns
WHERE table_name IN ('donation_types', 'positions', 'position_statuses')
    AND column_name IN ('type_code', 'position_code', 'status_code')
ORDER BY table_name, column_name;

-- ============================================
-- 완료 메시지
-- ============================================
-- 컬럼 길이가 성공적으로 확장되었습니다.
-- 이제 더 긴 코드도 저장할 수 있습니다.
