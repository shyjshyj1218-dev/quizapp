-- ============================================
-- Users 테이블 설명 변경 SQL
-- Supabase SQL Editor에 복사해서 실행하세요
-- ============================================

-- 테이블 설명을 한글로 변경
COMMENT ON TABLE users IS '유저 테이블 - 사용자 정보 및 코인/티켓 관리';

-- 컬럼 설명 추가 (선택사항)
COMMENT ON COLUMN users.id IS '사용자 ID (auth.users와 연동)';
COMMENT ON COLUMN users.email IS '이메일 주소';
COMMENT ON COLUMN users.nickname IS '닉네임 (중복 불가)';
COMMENT ON COLUMN users.coins IS '보유 코인';
COMMENT ON COLUMN users.tickets IS '보유 티켓';
COMMENT ON COLUMN users.created_at IS '생성일시';
COMMENT ON COLUMN users.updated_at IS '수정일시';

-- ============================================
-- 완료!
-- ============================================
-- 이제 Supabase Dashboard에서 테이블 설명이 "유저 테이블"로 표시됩니다.
-- 실제 테이블 이름은 여전히 "users"입니다.

