import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
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
  
  const tabs: { key: Tab; label: string; icon?: string; iconComponent?: (isActive: boolean) => React.ReactNode }[] = [
    { 
      key: 'home', 
      label: '홈', 
      iconComponent: (isActive: boolean) => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={isActive ? colors.primary : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
          <Path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </Svg>
      )
    },
    { 
      key: 'mission', 
      label: '미션', 
      iconComponent: (isActive: boolean) => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={isActive ? colors.primary : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
          <Path d="m9 12 2 2 4-4"/>
        </Svg>
      )
    },
    { 
      key: 'challenge', 
      label: '도전', 
      iconComponent: (isActive: boolean) => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={isActive ? colors.primary : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M12.035 17.012a3 3 0 0 0-3-3l-.311-.002a.72.72 0 0 1-.505-1.229l1.195-1.195A2 2 0 0 1 10.828 11H12a2 2 0 0 0 0-4H9.243a3 3 0 0 0-2.122.879l-2.707 2.707A4.83 4.83 0 0 0 3 14a8 8 0 0 0 8 8h2a8 8 0 0 0 8-8V7a2 2 0 1 0-4 0v2a2 2 0 1 0 4 0"/>
          <Path d="M13.888 9.662A2 2 0 0 0 17 8V5A2 2 0 1 0 13 5"/>
          <Path d="M9 5A2 2 0 1 0 5 5V10"/>
          <Path d="M9 7V4A2 2 0 1 1 13 4V7.268"/>
        </Svg>
      )
    },
    { 
      key: 'ranking', 
      label: '랭킹', 
      iconComponent: (isActive: boolean) => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={isActive ? colors.primary : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/>
          <Path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/>
          <Path d="M18 9h1.5a1 1 0 0 0 0-5H18"/>
          <Path d="M4 22h16"/>
          <Path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/>
          <Path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>
        </Svg>
      )
    },
    { 
      key: 'shop', 
      label: '상점', 
      iconComponent: (isActive: boolean) => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={isActive ? colors.primary : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="8" cy="21" r="1"/>
          <Circle cx="19" cy="21" r="1"/>
          <Path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </Svg>
      )
    },
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
          {tab.iconComponent ? (
            tab.iconComponent(currentTab === tab.key)
          ) : (
            <Text style={styles.icon}>{tab.icon}</Text>
          )}
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

