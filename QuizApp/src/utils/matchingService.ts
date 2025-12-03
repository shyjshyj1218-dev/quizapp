// 실시간 매칭 관련 서비스 함수
import { supabase } from './supabase';
import { getCurrentUser } from './authService';

const MATCHING_SERVER_URL = process.env.EXPO_PUBLIC_MATCHING_SERVER_URL || 'http://localhost:3001';

export interface MatchUser {
  id: string;
  nickname: string;
  rating: number;
  profile_image?: string;
}

export interface MatchResult {
  matchId: string;
  opponent: MatchUser;
  questions: any[];
  startTime: number;
}

/**
 * ELO 레이팅 계산
 */
export function calculateEloRating(
  playerRating: number,
  opponentRating: number,
  isWin: boolean,
  kFactor: number = 32
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const actualScore = isWin ? 1 : 0;
  const newRating = Math.round(playerRating + kFactor * (actualScore - expectedScore));
  return Math.max(0, newRating); // 레이팅은 0 이상
}

/**
 * 사용자 레이팅 가져오기
 */
export async function getUserRating(): Promise<number> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return 1000; // 기본 레이팅
    }

    const { data, error } = await supabase
      .from('users')
      .select('rating')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[matchingService] 레이팅 조회 오류:', error);
      return 1000;
    }

    return data?.rating ?? 1000;
  } catch (error) {
    console.error('[matchingService] 레이팅 조회 예외:', error);
    return 1000;
  }
}

/**
 * 레이팅 업데이트
 */
export async function updateUserRating(userId: string, newRating: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ rating: newRating })
      .eq('id', userId);

    if (error) {
      console.error('[matchingService] 레이팅 업데이트 오류:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[matchingService] 레이팅 업데이트 예외:', error);
    return false;
  }
}

/**
 * 매칭 가능한 상대 찾기 (레이팅 기반)
 */
export async function findMatch(rating: number, range: number = 200): Promise<MatchUser | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    // 레이팅 범위 내의 사용자 찾기
    const minRating = rating - range;
    const maxRating = rating + range;

    const { data, error } = await supabase
      .from('users')
      .select('id, nickname, rating, profile_image')
      .neq('id', user.id)
      .gte('rating', minRating)
      .lte('rating', maxRating)
      .order('rating', { ascending: true })
      .limit(10);

    if (error) {
      console.error('[matchingService] 매칭 상대 찾기 오류:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // 랜덤하게 선택
    const randomIndex = Math.floor(Math.random() * data.length);
    const opponent = data[randomIndex];

    return {
      id: opponent.id,
      nickname: opponent.nickname || '익명',
      rating: opponent.rating || 1000,
      profile_image: opponent.profile_image || undefined,
    };
  } catch (error) {
    console.error('[matchingService] 매칭 상대 찾기 예외:', error);
    return null;
  }
}

/**
 * 랜덤 문제 10개 가져오기
 */
export async function getRandomQuestions(count: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .limit(100); // 충분한 풀에서 선택

    if (error) {
      console.error('[matchingService] 문제 가져오기 오류:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // 랜덤하게 섞기
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  } catch (error) {
    console.error('[matchingService] 문제 가져오기 예외:', error);
    return [];
  }
}

