-- 매치 상태 관리 테이블 생성
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  player1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player1_finished BOOLEAN DEFAULT false,
  player2_finished BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'playing' CHECK (status IN ('playing', 'waiting', 'finished')),
  questions JSONB, -- 문제 목록
  start_time BIGINT, -- 시작 시간 (Unix timestamp)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_matches_player1_id ON matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2_id ON matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_matches_updated_at_trigger
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_matches_updated_at();

-- RLS (Row Level Security) 활성화
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신이 참여한 매치만 조회 가능
CREATE POLICY "Users can view their own matches"
  ON matches
  FOR SELECT
  USING (
    auth.uid() = player1_id OR 
    auth.uid() = player2_id
  );

-- RLS 정책: 사용자는 자신이 참여한 매치만 업데이트 가능
CREATE POLICY "Users can update their own matches"
  ON matches
  FOR UPDATE
  USING (
    auth.uid() = player1_id OR 
    auth.uid() = player2_id
  );

-- RLS 정책: 서버는 모든 매치를 관리할 수 있음 (서비스 롤 사용)
-- 주의: 서버에서는 서비스 롤 키를 사용하므로 RLS를 우회합니다.

-- 코멘트 추가
COMMENT ON TABLE matches IS '실시간 매치 상태 관리 테이블';
COMMENT ON COLUMN matches.id IS '매치 고유 ID (예: match_1764656679951_user1_user2)';
COMMENT ON COLUMN matches.player1_id IS '플레이어 1의 사용자 ID';
COMMENT ON COLUMN matches.player2_id IS '플레이어 2의 사용자 ID';
COMMENT ON COLUMN matches.player1_finished IS '플레이어 1의 완료 여부';
COMMENT ON COLUMN matches.player2_finished IS '플레이어 2의 완료 여부';
COMMENT ON COLUMN matches.status IS '매치 상태: playing(진행중), waiting(대기중), finished(종료)';
COMMENT ON COLUMN matches.questions IS '문제 목록 (JSON 배열)';
COMMENT ON COLUMN matches.start_time IS '게임 시작 시간 (Unix timestamp)';


