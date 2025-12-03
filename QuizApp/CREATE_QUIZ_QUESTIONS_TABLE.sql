-- quiz_questions 테이블 생성 SQL
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 퀴즈 문제 테이블 생성
CREATE TABLE IF NOT EXISTS quiz_questions (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  difficulty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- 읽기 정책 설정 (모든 사용자가 읽기 가능)
CREATE POLICY "Public read access" ON quiz_questions 
  FOR SELECT 
  USING (true);

-- 샘플 데이터 삽입 (테스트용)
-- 난이도 값: 'beginner', 'intermediate', 'advanced', 'expert'

INSERT INTO quiz_questions (question, options, answer, difficulty, category) VALUES
('1 + 1은?', '["1", "2", "3", "4"]'::jsonb, '2', 'beginner', '수학'),
('한국의 수도는?', '["서울", "부산", "대구", "인천"]'::jsonb, '서울', 'beginner', '지리'),
('태양계의 행성 개수는?', '["7개", "8개", "9개", "10개"]'::jsonb, '8개', 'beginner', '과학'),
('2 × 3은?', '["5", "6", "7", "8"]'::jsonb, '6', 'beginner', '수학'),
('지구의 위성은?', '["화성", "금성", "달", "태양"]'::jsonb, '달', 'beginner', '과학'),
('10 - 5는?', '["3", "4", "5", "6"]'::jsonb, '5', 'beginner', '수학'),
('한국의 공용어는?', '["영어", "중국어", "한국어", "일본어"]'::jsonb, '한국어', 'beginner', '언어'),
('가장 큰 대륙은?', '["아프리카", "유럽", "아시아", "남극"]'::jsonb, '아시아', 'beginner', '지리'),
('4 ÷ 2는?', '["1", "2", "3", "4"]'::jsonb, '2', 'beginner', '수학'),
('물의 화학식은?', '["H2O", "CO2", "O2", "NaCl"]'::jsonb, 'H2O', 'beginner', '과학'),

('피타고라스의 정리는?', '["a²+b²=c²", "a+b=c", "a×b=c", "a÷b=c"]'::jsonb, 'a²+b²=c²', 'intermediate', '수학'),
('원주율의 대략적인 값은?', '["2.14", "3.14", "4.14", "5.14"]'::jsonb, '3.14', 'intermediate', '수학'),
('지구의 자전 주기는?', '["12시간", "24시간", "36시간", "48시간"]'::jsonb, '24시간', 'intermediate', '과학'),
('프랑스의 수도는?', '["런던", "베를린", "파리", "마드리드"]'::jsonb, '파리', 'intermediate', '지리'),
('인체의 혈액형은 몇 가지?', '["2가지", "4가지", "6가지", "8가지"]'::jsonb, '4가지', 'intermediate', '과학'),

('양자역학의 기본 원리는?', '["불확정성 원리", "상대성 원리", "중력 원리", "마찰 원리"]'::jsonb, '불확정성 원리', 'advanced', '과학'),
('미적분학의 기본 정리는?', '["뉴턴-라이프니츠 정리", "피타고라스 정리", "페르마 정리", "오일러 정리"]'::jsonb, '뉴턴-라이프니츠 정리', 'advanced', '수학'),
('상대성 이론을 제시한 과학자는?', '["뉴턴", "아인슈타인", "갈릴레오", "다윈"]'::jsonb, '아인슈타인', 'advanced', '과학'),

('슈뢰딩거 방정식은 무엇을 설명하는가?', '["양자 상태", "중력", "전자기력", "핵력"]'::jsonb, '양자 상태', 'expert', '과학'),
('리만 가설은 무엇에 관한 것인가?', '["소수 분포", "기하학", "대수학", "통계학"]'::jsonb, '소수 분포', 'expert', '수학');

