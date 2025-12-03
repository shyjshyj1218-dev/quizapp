import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';

type Tab = 'home' | 'mission' | 'challenge' | 'ranking' | 'shop';

interface BottomNavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function BottomNavigation({
  currentTab,
  onTabChange,
}: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'home', label: '홈', icon: '🏠' },
    { key: 'mission', label: '미션', icon: '✅' },
    { key: 'challenge', label: '도전', icon: '⚔️' },
    { key: 'ranking', label: '랭킹', icon: '🏆' },
    { key: 'shop', label: '상점', icon: '🛒' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>{tab.icon}</Text>
          <Text
            style={[
              styles.label,
              currentTab === tab.key && styles.activeLabel,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 4,
    zIndex: 50,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});

