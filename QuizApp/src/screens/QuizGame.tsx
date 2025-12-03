import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../components';
import { colors } from '../utils/colors';

type NavigateFunction = (screen: string) => void;

interface QuizGameProps {
  navigate: NavigateFunction;
}

export default function QuizGame({ navigate }: QuizGameProps) {
  return (
    <View style={styles.container}>
      <Header onProfilePress={() => navigate('Profile')} />
      <View style={styles.content}>
        <Text style={styles.title}>퀴즈 게임</Text>
        <Text style={styles.subtitle}>퀴즈 게임 페이지입니다</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
});

