-- ============================================
-- Users 테이블 생성 SQL (안전 버전)
-- Supabase SQL Editor에 복사해서 실행하세요
-- ============================================

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
-- 기존 트리거가 있으면 무시하고 새로 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_users_updated_at'
    ) THEN
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (기존 정책이 있으면 무시)
DO $$
BEGIN
    -- Public read access 정책
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Public read access'
    ) THEN
        CREATE POLICY "Public read access" ON users 
          FOR SELECT 
          USING (true);
    END IF;

    -- Users can update own data 정책
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can update own data'
    ) THEN
        CREATE POLICY "Users can update own data" ON users
          FOR UPDATE
          USING (auth.uid() = id)
          WITH CHECK (auth.uid() = id);
    END IF;

    -- Users can insert own data 정책
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can insert own data'
    ) THEN
        CREATE POLICY "Users can insert own data" ON users
          FOR INSERT
          WITH CHECK (auth.uid() = id);
    END IF;
END $$;

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

