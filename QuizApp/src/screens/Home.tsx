import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Header,
  BottomNavigation,
  WeeklyRankingBanner,
  WeeklyChallengeSection,
  GameModeCards,
} from '../components';
import { colors } from '../utils/colors';

type NavigateFunction = (screen: string) => void;
type Tab = 'home' | 'mission' | 'challenge' | 'ranking' | 'shop';

interface HomeProps {
  navigate: NavigateFunction;
  currentTab?: Tab;
  onTabChange?: (tab: Tab) => void;
  onQuizRoomPress?: () => void;
  onChallengePress?: () => void;
  onProfilePress?: () => void;
  userNickname?: string;
  userCoins?: number;
  userTickets?: number;
}

export default function Home({
  navigate,
  currentTab = 'home',
  onTabChange,
  onQuizRoomPress,
  onChallengePress,
  onProfilePress,
  userNickname = '사용자',
  userCoins = 0,
  userTickets = 0,
}: HomeProps) {
  const insets = useSafeAreaInsets();

  const handleTabChange = (tab: Tab) => {
    onTabChange?.(tab);
    if (tab === 'mission') navigate('Mission');
    else if (tab === 'challenge') navigate('ChallengeQuiz');
    else if (tab === 'ranking') navigate('Ranking');
    else if (tab === 'shop') navigate('Shop');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header 
        nickname={userNickname}
        coins={userCoins}
        tickets={userTickets}
        onProfilePress={onProfilePress || (() => navigate('Profile'))} 
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <WeeklyRankingBanner />
        <View style={styles.bannerSpacer} />
        <WeeklyChallengeSection />
      </ScrollView>
      <GameModeCards
        onQuizRoomPress={onQuizRoomPress || (() => navigate('DifficultySelection'))}
        onChallengePress={onChallengePress || (() => navigate('ChallengeQuiz'))}
        onGamePress={() => navigate('Matching')}
      />
      <BottomNavigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 340, // 그리드 버튼 공간 확보 (3행 x 90 + 간격 + 하단바)
  },
  spacer: {
    height: 12,
  },
  bannerSpacer: {
    height: 16,
  },
});
