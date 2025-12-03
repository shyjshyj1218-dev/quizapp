-- ============================================
-- Users 테이블에 rating 컬럼 추가 (ELO 레이팅 시스템)
-- Supabase SQL Editor에 복사해서 실행하세요
-- ============================================

-- rating 컬럼 추가 (없는 경우에만)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'rating'
    ) THEN
        ALTER TABLE users ADD COLUMN rating INTEGER DEFAULT 1000;
    END IF;
END $$;

-- 기존 사용자들의 rating을 1000으로 초기화 (NULL인 경우)
UPDATE users 
SET rating = 1000 
WHERE rating IS NULL;

-- rating 인덱스 생성 (매칭 성능 향상)
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating);

-- ============================================
-- 완료 메시지
-- ============================================
-- rating 컬럼이 성공적으로 추가되었습니다!
-- 기본 레이팅은 1000입니다.

