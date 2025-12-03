-- ============================================
-- Users 테이블에 coins와 tickets 컬럼 추가
-- Supabase SQL Editor에 복사해서 실행하세요
-- ============================================

-- coins 컬럼 추가 (없는 경우에만)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'coins'
    ) THEN
        ALTER TABLE users ADD COLUMN coins INTEGER DEFAULT 0;
    END IF;
END $$;

-- tickets 컬럼 추가 (없는 경우에만)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'tickets'
    ) THEN
        ALTER TABLE users ADD COLUMN tickets INTEGER DEFAULT 0;
    END IF;
END $$;

-- 기존 사용자들의 coins와 tickets를 0으로 초기화 (NULL인 경우)
UPDATE users 
SET coins = 0 
WHERE coins IS NULL;

UPDATE users 
SET tickets = 0 
WHERE tickets IS NULL;

-- ============================================
-- 완료 메시지
-- ============================================
-- coins와 tickets 컬럼이 성공적으로 추가되었습니다!
-- 기존 사용자들의 값은 0으로 초기화되었습니다.

