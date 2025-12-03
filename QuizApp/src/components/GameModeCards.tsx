import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';

interface GameModeCardsProps {
  onQuizRoomPress?: () => void;
  onChallengePress?: () => void;
  onGamePress?: () => void;
}

export default function GameModeCards({
  onQuizRoomPress,
  onChallengePress,
  onGamePress,
}: GameModeCardsProps) {
  const insets = useSafeAreaInsets();
  const bottomNavHeight = 60; // 하단바 높이 (대략)
  
  return (
    <View style={[styles.container, { bottom: bottomNavHeight + insets.bottom + 2, paddingBottom: 0 }]}>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.card}
          onPress={onQuizRoomPress}
          activeOpacity={0.8}
        >
          <Text style={styles.cardIcon}>📺</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>퀴즈방</Text>
            <Text style={styles.cardDescription}>
              경쟁하며 문제를 풀어보세요
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.cardMargin]}
          onPress={onChallengePress}
          activeOpacity={0.8}
        >
          <Text style={styles.cardIcon}>📚</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>도전</Text>
            <Text style={styles.cardDescription}>
              혼자서 문제를 풀어보세요
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.row, styles.rowMargin]}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <Text style={styles.cardIcon}>🏆</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>랭킹</Text>
            <Text style={styles.cardDescription}>
              순위를 확인해보세요
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.cardMargin]}
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <Text style={styles.cardIcon}>🎁</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>상점</Text>
            <Text style={styles.cardDescription}>
              아이템을 구매해보세요
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.gameButtonRow}>
        <TouchableOpacity
          style={styles.gameButton}
          onPress={onGamePress}
          activeOpacity={0.8}
        >
          <Text style={styles.gameButtonTitle}>시작하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.background,
    zIndex: 40,
  },
  row: {
    flexDirection: 'row',
  },
  rowMargin: {
    marginTop: 10,
  },
  card: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
  },
  cardMargin: {
    marginLeft: 12,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardContent: {
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.white,
  },
  cardDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 3,
  },
  gameButtonRow: {
    marginTop: 10,
  },
  gameButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.white,
  },
});

