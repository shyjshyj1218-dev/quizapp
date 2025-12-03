import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header, BottomNavigation } from '../components';
import { colors } from '../utils/colors';

type NavigateFunction = (screen: string) => void;
type Tab = 'home' | 'mission' | 'challenge' | 'ranking' | 'shop';

interface ChallengeQuizProps {
  navigate: NavigateFunction;
  currentTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

const challenges = [
  {
    id: 'infinite',
    title: '무한문제',
    description: '끝없이 문제를 풀어보세요',
    icon: '⭐',
    color: colors.difficulty.intermediate,
  },
  {
    id: 'wrong',
    title: '오답풀이',
    description: '틀린 문제를 다시 풀어보세요',
    icon: '📝',
    color: colors.difficulty.advanced,
  },
  {
    id: 'difficulty',
    title: '난이도 별',
    description: '난이도별로 문제를 풀어보세요',
    icon: '⭐',
    color: colors.ticket,
  },
];

export default function ChallengeQuiz({
  navigate,
  currentTab = 'challenge',
  onTabChange,
}: ChallengeQuizProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header onProfilePress={() => navigate('Profile')} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>도전</Text>
          <Text style={styles.subtitle}>혼자서 문제를 풀어보세요</Text>
        </View>

        <View style={styles.challengeContainer}>
          {challenges.map((challenge) => (
            <TouchableOpacity
              key={challenge.id}
              style={styles.challengeCard}
              onPress={() => navigate('QuizGame')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.challengeIcon,
                  { backgroundColor: challenge.color },
                ]}
              >
                <Text style={styles.challengeIconText}>{challenge.icon}</Text>
              </View>
              <View style={styles.challengeContent}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={styles.challengeDescription}>
                  {challenge.description}
                </Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  challengeContainer: {
    paddingHorizontal: 16,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  challengeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeIconText: {
    fontSize: 32,
  },
  challengeContent: {
    flex: 1,
    marginLeft: 16,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  arrow: {
    fontSize: 24,
    color: colors.text.secondary,
  },
});

