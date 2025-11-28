# Supabase 연결 완료 가이드

## ✅ 완료된 작업

1. **환경 변수 파일 생성**
   - `QuizApp/.env` - React Native 앱용
   - `quiz-server/.env` - 백엔드 서버용

2. **Supabase 클라이언트 설정**
   - React Native 앱: `src/utils/supabase.ts`
   - 백엔드 서버: `src/lib/supabase.ts`

3. **패키지 설치 완료**
   - `@supabase/supabase-js` 설치됨

## 🔧 마지막 단계

### 1. Expo 환경 변수 로드 확인

Expo는 `.env` 파일을 자동으로 읽지 않습니다. 다음 중 하나를 선택하세요:

**방법 A: expo-constants 사용 (현재 설정)**
- 이미 `expo-constants`를 사용 중
- 환경 변수는 런타임에 `process.env.EXPO_PUBLIC_*`로 접근 가능

**방법 B: 앱 재시작**
```bash
cd QuizApp
npm start
# 앱을 완전히 종료하고 다시 시작
```

### 2. Supabase 테이블 생성

Supabase Dashboard에서 테이블을 생성해야 합니다:

1. **Supabase Dashboard 접속**: https://supabase.com/dashboard
2. **프로젝트 선택**
3. **SQL Editor** 클릭
4. **New Query** 클릭
5. 아래 SQL 실행:

```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  password TEXT,
  profile_image TEXT,
  title TEXT,
  coins INTEGER DEFAULT 0,
  tickets INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 퀴즈 테이블
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 문제 테이블
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 퀴즈 문제 테이블 (앱에서 사용하는 구조)
CREATE TABLE quiz_questions (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  difficulty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 퀴즈방 테이블
CREATE TABLE quiz_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  max_players INTEGER DEFAULT 4,
  current_players INTEGER DEFAULT 0,
  status TEXT DEFAULT 'waiting',
  host_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- 퀴즈방 플레이어 테이블
CREATE TABLE quiz_room_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES quiz_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INTEGER DEFAULT 0,
  rank INTEGER,
  UNIQUE(room_id, user_id)
);

-- 퀴즈 결과 테이블
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  quiz_id UUID REFERENCES quizzes(id),
  room_id UUID REFERENCES quiz_rooms(id),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_spent INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 미션 테이블
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  reward INTEGER NOT NULL,
  target INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 미션 테이블
CREATE TABLE user_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  mission_id UUID REFERENCES missions(id),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

-- 랭킹 테이블
CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  score INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  period TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type, period)
);

-- 상점 아이템 테이블
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  price INTEGER NOT NULL,
  currency TEXT DEFAULT 'coin',
  image_url TEXT,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

-- 기본 정책 설정 (모든 사용자가 읽기 가능)
CREATE POLICY "Public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Public read access" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON questions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON quiz_rooms FOR SELECT USING (true);
CREATE POLICY "Public read access" ON quiz_room_players FOR SELECT USING (true);
CREATE POLICY "Public read access" ON quiz_results FOR SELECT USING (true);
CREATE POLICY "Public read access" ON missions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON user_missions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON rankings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON shop_items FOR SELECT USING (true);
```

### 3. 연결 테스트

**React Native 앱에서:**
```typescript
import { supabase } from './src/utils/supabase';

// 테스트
const test = async () => {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log('Supabase 연결:', error ? '실패' : '성공');
};
```

**백엔드 서버에서:**
```bash
cd quiz-server
npm run dev
# 브라우저에서 http://localhost:3001/health 접속
```

## ✅ 완료 체크리스트

- [x] 환경 변수 파일 생성
- [x] Supabase 클라이언트 설정
- [x] 패키지 설치
- [ ] Supabase 테이블 생성 (SQL Editor에서 실행)
- [ ] 연결 테스트

테이블 생성 후 연결이 완료됩니다!

