// 랭킹 관련 서비스 함수
import { supabase } from './supabase';

export interface RankingUser {
  user_id: string;
  nickname: string | null;
  score: number;
  rank: number;
  profile_image?: string | null;
}

export type RankingPeriod = 'weekly' | 'monthly' | 'all';
export type RankingType = 'total' | 'quiz_room' | 'challenge';

/**
 * 랭킹 데이터 가져오기
 */
export async function getRankings(
  type: RankingType = 'total',
  period: RankingPeriod = 'weekly',
  limit: number = 100
): Promise<RankingUser[]> {
  try {
    // period에 따라 날짜 필터링
    let dateFilter = '';
    const now = new Date();
    
    if (period === 'weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = weekAgo.toISOString();
    } else if (period === 'monthly') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = monthAgo.toISOString();
    }

    // quiz_results 테이블에서 랭킹 계산
    let query = supabase
      .from('quiz_results')
      .select(`
        user_id,
        score,
        users(nickname, profile_image)
      `);

    // 기간 필터 적용
    if (dateFilter) {
      query = query.gte('created_at', dateFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[rankingService] 랭킹 조회 오류:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // 사용자별로 점수 합계 계산
    const userScores: { [key: string]: { score: number; nickname: string | null; profile_image: string | null } } = {};
    
    data.forEach((result: any) => {
      const userId = result.user_id;
      if (!userScores[userId]) {
        // users가 배열일 수도 있고 객체일 수도 있음
        const userData = Array.isArray(result.users) ? result.users[0] : result.users;
        userScores[userId] = {
          score: 0,
          nickname: userData?.nickname || null,
          profile_image: userData?.profile_image || null,
        };
      }
      userScores[userId].score += result.score || 0;
    });

    // 점수 순으로 정렬
    const sortedUsers = Object.entries(userScores)
      .map(([user_id, data]) => ({
        user_id,
        nickname: data.nickname,
        score: data.score,
        rank: 0, // 나중에 설정
        profile_image: data.profile_image,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // 순위 부여
    sortedUsers.forEach((user, index) => {
      user.rank = index + 1;
    });

    return sortedUsers;
  } catch (error: any) {
    console.error('[rankingService] 랭킹 조회 예외:', error);
    return [];
  }
}

/**
 * 내 랭킹 가져오기
 */
export async function getMyRanking(
  type: RankingType = 'total',
  period: RankingPeriod = 'weekly'
): Promise<{ rank: number; score: number } | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const rankings = await getRankings(type, period, 1000);
    const myRanking = rankings.find(r => r.user_id === user.id);

    if (myRanking) {
      return {
        rank: myRanking.rank,
        score: myRanking.score,
      };
    }

    return null;
  } catch (error) {
    console.error('[rankingService] 내 랭킹 조회 오류:', error);
    return null;
  }
}

