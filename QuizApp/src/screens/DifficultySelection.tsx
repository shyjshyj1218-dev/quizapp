import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header, BottomNavigation } from '../components';
import { colors } from '../utils/colors';

type NavigateFunction = (screen: string, params?: any) => void;
type Tab = 'home' | 'mission' | 'challenge' | 'ranking' | 'shop';

interface DifficultySelectionProps {
  navigate: NavigateFunction;
  currentTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

const difficulties = [
  {
    id: 'beginner',
    name: '초급',
    description: '기초 문제로 시작하세요',
    color: colors.difficulty.beginner,
    icon: '🟢',
  },
  {
    id: 'intermediate',
    name: '중급',
    description: '조금 더 어려운 문제에 도전하세요',
    color: colors.difficulty.intermediate,
    icon: '🔵',
  },
  {
    id: 'advanced',
    name: '상급',
    description: '고난도 문제를 풀어보세요',
    color: colors.difficulty.advanced,
    icon: '🟠',
  },
  {
    id: 'expert',
    name: '최상급',
    description: '최고 난이도 문제입니다',
    color: colors.difficulty.expert,
    icon: '🔴',
  },
];

export default function DifficultySelection({
  navigate,
  currentTab = 'home',
  onTabChange,
}: DifficultySelectionProps) {
  const insets = useSafeAreaInsets();
  
  const handleDifficultySelect = (difficultyId: string) => {
    navigate('QuizRoom', { difficulty: difficultyId });
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header onProfilePress={() => navigate('Profile')} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>퀴즈방</Text>
          <Text style={styles.subtitle}>
            친구들과 경쟁하며 문제를 풀어보세요
          </Text>
        </View>

        <View style={styles.difficultyContainer}>
          {difficulties.map((difficulty) => (
            <TouchableOpacity
              key={difficulty.id}
              style={styles.difficultyCard}
              onPress={() => handleDifficultySelect(difficulty.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.difficultyIcon,
                  { backgroundColor: difficulty.color },
                ]}
              >
                <Text style={styles.difficultyIconText}>
                  {difficulty.name[0]}
                </Text>
              </View>
              <View style={styles.difficultyContent}>
                <Text style={styles.difficultyName}>{difficulty.name}</Text>
                <Text style={styles.difficultyDescription}>
                  {difficulty.description}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.enterButton}
                onPress={() => handleDifficultySelect(difficulty.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.enterButtonText}>입장하기</Text>
              </TouchableOpacity>
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
  difficultyContainer: {
    paddingHorizontal: 16,
  },
  difficultyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  difficultyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.white,
  },
  difficultyContent: {
    flex: 1,
    marginLeft: 12,
  },
  difficultyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  difficultyDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  enterButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.white,
  },
});

