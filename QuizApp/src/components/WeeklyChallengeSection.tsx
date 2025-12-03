import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../utils/colors';

export default function WeeklyChallengeSection() {
  const [isRegistered, setIsRegistered] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={styles.headerTitle}>주간 대전 순위</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.timeText}>20:00</Text>
          <Text style={styles.clockIcon}>🕐</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>1,234명</Text>
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
    fontSize: 18,
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

