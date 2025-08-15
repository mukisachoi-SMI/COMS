-- ============================================
-- 긴급 수정: UUID 컬럼 타입 확인 및 수정
-- ============================================
-- UUID는 36자이므로 VARCHAR(30)으로는 저장할 수 없습니다
-- 이 스크립트는 모든 ID 컬럼을 UUID 타입으로 변경합니다
-- ============================================

-- 1. 현재 컬럼 타입 및 길이 확인
SELECT 
    table_name,
    column_name, 
    data_type,
    character_maximum_length,
    column_default
FROM information_schema.columns
WHERE table_name IN ('donation_types', 'positions', 'position_statuses')
    AND column_name IN ('type_id', 'position_id', 'status_id', 'type_code', 'position_code', 'status_code')
ORDER BY table_name, column_name;

-- 2. ID 컬럼들을 UUID 타입으로 변경 (이미 UUID 타입이 아닌 경우)
-- 주의: 기존 데이터가 있다면 백업 필요

-- 2-1. donation_types 테이블
DO $$ 
BEGIN
    -- type_id를 UUID로 변경
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donation_types' 
        AND column_name = 'type_id' 
        AND data_type != 'uuid'
    ) THEN
        -- 기존 데이터 백업 (필요시)
        -- CREATE TABLE donation_types_backup AS SELECT * FROM donation_types;
        
        -- 테이블이 비어있다면 간단히 타입 변경
        ALTER TABLE donation_types DROP COLUMN type_id CASCADE;
        ALTER TABLE donation_types ADD COLUMN type_id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
    END IF;
END $$;

-- 2-2. positions 테이블
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'positions' 
        AND column_name = 'position_id' 
        AND data_type != 'uuid'
    ) THEN
        -- 기존 데이터 백업 (필요시)
        -- CREATE TABLE positions_backup AS SELECT * FROM positions;
        
        ALTER TABLE positions DROP COLUMN position_id CASCADE;
        ALTER TABLE positions ADD COLUMN position_id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
    END IF;
END $$;

-- 2-3. position_statuses 테이블
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'position_statuses' 
        AND column_name = 'status_id' 
        AND data_type != 'uuid'
    ) THEN
        -- 기존 데이터 백업 (필요시)
        -- CREATE TABLE position_statuses_backup AS SELECT * FROM position_statuses;
        
        ALTER TABLE position_statuses DROP COLUMN status_id CASCADE;
        ALTER TABLE position_statuses ADD COLUMN status_id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
    END IF;
END $$;

-- 3. CODE 컬럼들의 길이를 50으로 확장
ALTER TABLE donation_types 
    ALTER COLUMN type_code TYPE VARCHAR(50);

ALTER TABLE positions 
    ALTER COLUMN position_code TYPE VARCHAR(50);

ALTER TABLE position_statuses 
    ALTER COLUMN status_code TYPE VARCHAR(50);

-- 4. 변경 후 확인
SELECT 
    table_name,
    column_name, 
    data_type,
    character_maximum_length as "길이",
    column_default as "기본값"
FROM information_schema.columns
WHERE table_name IN ('donation_types', 'positions', 'position_statuses')
    AND column_name IN ('type_id', 'position_id', 'status_id', 'type_code', 'position_code', 'status_code')
ORDER BY table_name, column_name;

-- ============================================
-- 예상 결과:
-- type_id, position_id, status_id: uuid 타입
-- type_code, position_code, status_code: varchar(50)
-- ============================================