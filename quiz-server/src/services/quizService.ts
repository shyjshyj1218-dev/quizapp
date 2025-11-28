// 백엔드 퀴즈 문제 관련 서비스 함수
import { supabaseAdmin } from '../lib/supabase';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
  category: string | null;
  difficulty: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 모든 퀴즈 문제 가져오기
 */
export async function getAllQuizQuestions(): Promise<QuizQuestion[]> {
  if (!supabaseAdmin) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await supabaseAdmin
    .from('quiz_questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('퀴즈 문제 가져오기 오류:', error);
    throw error;
  }

  return data || [];
}

/**
 * 난이도별 퀴즈 문제 가져오기
 */
export async function getQuizQuestionsByDifficulty(
  difficulty: string
): Promise<QuizQuestion[]> {
  if (!supabaseAdmin) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await supabaseAdmin
    .from('quiz_questions')
    .select('*')
    .eq('difficulty', difficulty)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('난이도별 퀴즈 문제 가져오기 오류:', error);
    throw error;
  }

  return data || [];
}

/**
 * 랜덤 퀴즈 문제 가져오기
 */
export async function getRandomQuizQuestions(
  count: number = 10,
  difficulty?: string
): Promise<QuizQuestion[]> {
  if (!supabaseAdmin) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  let query = supabaseAdmin
    .from('quiz_questions')
    .select('*');

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }

  const { data, error } = await query;

  if (error) {
    console.error('랜덤 퀴즈 문제 가져오기 오류:', error);
    throw error;
  }

  // 클라이언트 사이드에서 랜덤 선택
  if (!data) return [];
  
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

