-- ============================================
-- Users 테이블 생성 SQL
-- Supabase SQL Editor에 복사해서 실행하세요
-- ============================================

-- 기존 테이블이 있으면 삭제 (주의: 데이터가 모두 삭제됩니다)
-- DROP TABLE IF EXISTS users CASCADE;

-- Users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT UNIQUE NOT NULL,
  password TEXT,
  profile_image TEXT,
  title TEXT,
  coins INTEGER DEFAULT 0,
  tickets INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 닉네임 중복 체크를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- updated_at 자동 업데이트를 위한 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 자동 업데이트 트리거 생성
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Public read access" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- 모든 사용자가 읽기 가능 (닉네임 중복 체크를 위해 필요)
CREATE POLICY "Public read access" ON users 
  FOR SELECT 
  USING (true);

-- 사용자는 자신의 데이터를 수정할 수 있음
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 사용자는 자신의 데이터를 삽입할 수 있음 (회원가입 시)
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 완료 메시지
-- ============================================
-- 테이블이 성공적으로 생성되었습니다!
-- 
-- 주요 기능:
-- 1. 닉네임 중복 체크 가능 (nickname UNIQUE)
-- 2. 이메일 중복 체크 가능 (email UNIQUE)
-- 3. 자동 updated_at 업데이트
-- 4. RLS 정책으로 보안 설정
-- 
-- 사용 방법:
-- - 회원가입 시: INSERT INTO users (id, email, nickname) VALUES (...)
-- - 닉네임 중복 체크: SELECT * FROM users WHERE nickname = '닉네임'

