import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../utils/colors';

export default function WeeklyChallengeSection() {
  const [isRegistered, setIsRegistered] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.starIcon}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.text.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
            </Svg>
          </View>
          <Text style={styles.headerTitle}>오늘 랭킹 대전</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.timeText}>20:00</Text>
          <Text style={styles.clockIcon}>🕐</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0명</Text>
          <Text style={styles.statLabel}>참여 인원</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>🪙 5만</Text>
          <Text style={styles.statLabel}>상금</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isRegistered && styles.buttonRegistered]}
        onPress={() => setIsRegistered(!isRegistered)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.buttonText,
            isRegistered && styles.buttonTextRegistered,
          ]}
        >
          {isRegistered ? '신청완료' : '대전 신청'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -12,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 18,
    height: 18,
    marginRight: 0,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.white,
    marginLeft: 6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: colors.text.white,
  },
  clockIcon: {
    fontSize: 16,
    marginLeft: 6,
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statItem: {
    marginRight: 24,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.white,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 3,
  },
  button: {
    backgroundColor: colors.text.white,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonRegistered: {
    backgroundColor: colors.background,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  buttonTextRegistered: {
    color: colors.text.primary,
  },
});

