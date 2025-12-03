import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
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
          <View style={styles.cardIcon}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.text.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13"/>
              <Path d="m8 6 2-2"/>
              <Path d="m18 16 2-2"/>
              <Path d="m17 11 4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17"/>
              <Path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
              <Path d="m15 5 4 4"/>
            </Svg>
          </View>
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
          <View style={styles.cardIcon}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.text.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M2 6h4"/>
              <Path d="M2 10h4"/>
              <Path d="M2 14h4"/>
              <Path d="M2 18h4"/>
              <Rect width="16" height="20" x="4" y="2" rx="2"/>
              <Path d="M16 2v20"/>
            </Svg>
          </View>
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
          <View style={styles.cardIcon}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.text.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <Path d="M16 3.128a4 4 0 0 1 0 7.744"/>
              <Path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <Circle cx="9" cy="7" r="4"/>
            </Svg>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>방만들기</Text>
            <Text style={styles.cardDescription}>
              친구랑 같이 해보세요
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.cardMargin]}
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <View style={styles.cardIcon}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.text.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M12 7v14"/>
              <Path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
            </Svg>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>멘사</Text>
            <Text style={styles.cardDescription}>
              새로운 도전을 해보세요
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
    width: 28,
    height: 28,
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

