import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header, BottomNavigation } from '../components';
import { colors } from '../utils/colors';

type NavigateFunction = (screen: string) => void;
type Tab = 'home' | 'mission' | 'challenge' | 'ranking' | 'shop';

interface ShopProps {
  navigate: NavigateFunction;
  currentTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

export default function Shop({
  navigate,
  currentTab = 'shop',
  onTabChange,
}: ShopProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header onProfilePress={() => navigate('Profile')} />
      <View style={styles.content}>
        <Text style={styles.title}>상점</Text>
        <Text style={styles.subtitle}>상점 페이지입니다</Text>
      </View>
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

