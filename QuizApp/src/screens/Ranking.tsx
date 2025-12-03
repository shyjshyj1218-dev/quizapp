import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header, BottomNavigation } from '../components';
import { colors } from '../utils/colors';
import { getRankings, getMyRanking, RankingUser, RankingPeriod } from '../utils/rankingService';

type NavigateFunction = (screen: string) => void;
type Tab = 'home' | 'mission' | 'challenge' | 'ranking' | 'shop';

interface RankingProps {
  navigate: NavigateFunction;
  currentTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

export default function Ranking({
  navigate,
  currentTab = 'ranking',
  onTabChange,
}: RankingProps) {
  const insets = useSafeAreaInsets();
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [myRanking, setMyRanking] = useState<{ rank: number; score: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<RankingPeriod>('weekly');

  useEffect(() => {
    loadRankings();
  }, [period]);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const [rankingData, myRankingData] = await Promise.all([
        getRankings('total', period, 100),
        getMyRanking('total', period),
      ]);
      setRankings(rankingData);
      setMyRanking(myRankingData);
    } catch (error) {
      console.error('랭킹 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // 금색
    if (rank === 2) return '#C0C0C0'; // 은색
    if (rank === 3) return '#CD7F32'; // 동색
    return colors.text.secondary;
  };

  const periodLabels: { [key in RankingPeriod]: string } = {
    weekly: '주간',
    monthly: '월간',
    all: '전체',
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header onProfilePress={() => navigate('Profile')} />
      
      <View style={styles.header}>
        <Text style={styles.title}>랭킹</Text>
        <View style={styles.periodContainer}>
          {(['weekly', 'monthly', 'all'] as RankingPeriod[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodButton, period === p && styles.periodButtonActive]}
              onPress={() => setPeriod(p)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  period === p && styles.periodButtonTextActive,
                ]}
              >
                {periodLabels[p]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>랭킹을 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 내 순위 카드 */}
          {myRanking && (
            <View style={styles.myRankingCard}>
              <Text style={styles.myRankingTitle}>내 순위</Text>
              <View style={styles.myRankingContent}>
                <View style={styles.myRankingLeft}>
                  <Text style={styles.myRankingRank}>{myRanking.rank}위</Text>
                  <Text style={styles.myRankingScore}>{myRanking.score.toLocaleString()}점</Text>
                </View>
                <View style={styles.myRankingRight}>
                  <Text style={styles.myRankingPeriod}>{periodLabels[period]} 랭킹</Text>
                </View>
              </View>
            </View>
          )}

          {/* 랭킹 리스트 */}
          {rankings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>랭킹 데이터가 없습니다.</Text>
              <Text style={styles.emptySubText}>
                퀴즈를 풀어보고 랭킹에 도전해보세요!
              </Text>
            </View>
          ) : (
            <View style={styles.rankingList}>
              {rankings.map((user, index) => {
                const rankIcon = getRankIcon(user.rank);
                const rankColor = getRankColor(user.rank);

                return (
                  <View
                    key={user.user_id}
                    style={[
                      styles.rankingItem,
                      user.rank <= 3 && styles.rankingItemTop,
                    ]}
                  >
                    <View style={styles.rankingLeft}>
                      <View
                        style={[
                          styles.rankBadge,
                          user.rank <= 3 && { backgroundColor: rankColor + '20' },
                        ]}
                      >
                        {rankIcon ? (
                          <Text style={styles.rankIcon}>{rankIcon}</Text>
                        ) : (
                          <Text
                            style={[
                              styles.rankNumber,
                              user.rank <= 3 && { color: rankColor, fontWeight: 'bold' },
                            ]}
                          >
                            {user.rank}
                          </Text>
                        )}
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userNickname}>
                          {user.nickname || '익명'}
                        </Text>
                        {user.rank <= 3 && (
                          <Text style={[styles.userTitle, { color: rankColor }]}>
                            {user.rank === 1 ? '챔피언' : user.rank === 2 ? '준우승' : '3위'}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.rankingRight}>
                      <Text style={styles.userScore}>
                        {user.score.toLocaleString()}점
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <BottomNavigation
        currentTab={currentTab}
        onTabChange={onTabChange || (() => {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  periodButtonTextActive: {
    color: colors.text.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  myRankingCard: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
  },
  myRankingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.white,
    opacity: 0.9,
    marginBottom: 12,
  },
  myRankingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myRankingLeft: {
    flex: 1,
  },
  myRankingRank: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.white,
    marginBottom: 4,
  },
  myRankingScore: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
    opacity: 0.9,
  },
  myRankingRight: {
    alignItems: 'flex-end',
  },
  myRankingPeriod: {
    fontSize: 14,
    color: colors.text.white,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  rankingList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  rankingItemTop: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankIcon: {
    fontSize: 24,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  userInfo: {
    flex: 1,
  },
  userNickname: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  userTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  rankingRight: {
    alignItems: 'flex-end',
  },
  userScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
