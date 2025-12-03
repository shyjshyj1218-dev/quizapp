// 퀴즈 문제 관련 서비스 함수
import { supabase } from './supabase';
import { QuizQuestion } from '../types/database';

/**
 * 영어 난이도를 한글 난이도로 변환
 */
function convertDifficultyToKorean(difficulty: string): string {
  const difficultyMap: { [key: string]: string } = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '상급',
    expert: '최상급',
  };
  return difficultyMap[difficulty] || difficulty;
}

/**
 * 모든 퀴즈 문제 가져오기
 */
export async function getAllQuizQuestions(): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
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
  // 영어 난이도를 한글 난이도로 변환
  const koreanDifficulty = convertDifficultyToKorean(difficulty);
  
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('difficulty', koreanDifficulty)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('난이도별 퀴즈 문제 가져오기 오류:', error);
    throw error;
  }

  return data || [];
}

/**
 * 카테고리별 퀴즈 문제 가져오기
 */
export async function getQuizQuestionsByCategory(
  category: string
): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('카테고리별 퀴즈 문제 가져오기 오류:', error);
    throw error;
  }

  return data || [];
}

/**
 * 랜덤 퀴즈 문제 가져오기 (개수 지정)
 */
export async function getRandomQuizQuestions(
  count: number = 10,
  difficulty?: string
): Promise<QuizQuestion[]> {
  try {
    console.log(`[quizService] 문제 가져오기 시작 - 난이도: ${difficulty || '전체'}, 개수: ${count}`);
    
  let query = supabase
    .from('quiz_questions')
    .select('*');

  if (difficulty) {
      // 영어 난이도를 한글 난이도로 변환
      const koreanDifficulty = convertDifficultyToKorean(difficulty);
      query = query.eq('difficulty', koreanDifficulty);
      console.log(`[quizService] 난이도 필터 적용: ${difficulty} → ${koreanDifficulty}`);
  }

  const { data, error } = await query;

  if (error) {
      console.error('[quizService] Supabase 쿼리 오류:', error);
      console.error('[quizService] 오류 코드:', error.code);
      console.error('[quizService] 오류 메시지:', error.message);
      console.error('[quizService] 오류 상세:', error.details);
    throw error;
  }

    console.log(`[quizService] 데이터베이스에서 가져온 문제 개수: ${data?.length || 0}`);

  // 클라이언트 사이드에서 랜덤 선택
    if (!data || data.length === 0) {
      console.warn(`[quizService] 문제가 없습니다. 난이도: ${difficulty || '전체'}`);
      return [];
    }
  
  const shuffled = [...data].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    console.log(`[quizService] 최종 선택된 문제 개수: ${selected.length}`);
    
    return selected;
  } catch (error: any) {
    console.error('[quizService] 예외 발생:', error);
    throw error;
  }
}

/**
 * 특정 ID의 퀴즈 문제 가져오기
 */
export async function getQuizQuestionById(
  id: number
): Promise<QuizQuestion | null> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('퀴즈 문제 가져오기 오류:', error);
    return null;
  }

  return data;
}

/**
 * 정답 확인
 */
export function checkAnswer(
  question: QuizQuestion,
  userAnswer: string
): boolean {
  return question.answer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
}

