import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../utils/colors';

interface HeaderProps {
  nickname?: string;
  title?: string;
  coins?: number;
  tickets?: number;
  onProfilePress?: () => void;
}

export default function Header({
  nickname = '사용자',
  title = 'Thinker (사색가)',
  coins = 12450,
  tickets = 8,
  onProfilePress,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>👤</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.nickname}>{nickname}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.rightSection}>
        <View style={styles.coinContainer}>
          <Text style={styles.coinIcon}>🪙</Text>
          <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
        </View>
        <View style={styles.ticketContainer}>
          <Text style={styles.ticketIcon}>🎫</Text>
          <Text style={styles.ticketText}>{tickets}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.coin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    fontSize: 20,
  },
  profileInfo: {
    marginLeft: 8,
  },
  nickname: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  title: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.coinBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  coinIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  coinText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  ticketContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ticket,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ticketIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  ticketText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.white,
  },
});

