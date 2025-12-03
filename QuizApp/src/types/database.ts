// Supabase 데이터베이스 타입 정의

// quiz_questions 테이블 타입
export interface QuizQuestion {
  id: number; // bigserial
  question: string; // text
  options: string[]; // jsonb 배열
  answer: string; // text
  category: string | null; // text (nullable)
  difficulty: string | null; // text (nullable)
  created_at: string; // timestamp with time zone (ISO string)
  updated_at: string; // timestamp with time zone (ISO string)
}

