import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { colors } from '../utils/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const banners = [
  {
    id: 1,
    title: '랭킹대전',
    subtitle: '챔피언에 도전해보세요',
    gradient: ['#F97316', '#FBBF24'],
    emoji: '🏆',
  },
  {
    id: 2,
    title: '신규 퀴즈',
    subtitle: '새로운 문제가 도착했어요',
    gradient: ['#8B5CF6', '#EC4899'],
    emoji: '✨',
  },
  {
    id: 3,
    title: '이벤트',
    subtitle: '특별한 보상을 받아보세요',
    gradient: ['#3B82F6', '#06B6D4'],
    emoji: '🎁',
  },
  {
    id: 4,
    title: '친구 초대',
    subtitle: '친구와 함께 즐겨보세요',
    gradient: ['#10B981', '#34D399'],
    emoji: '👥',
  },
];

export default function WeeklyRankingBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {banners.map((banner, index) => (
          <View
            key={banner.id}
            style={[
              styles.bannerCard,
              {
                backgroundColor: banner.gradient[0],
                width: SCREEN_WIDTH - 32,
              },
            ]}
          >
            <Text style={styles.bannerEmoji}>{banner.emoji}</Text>
            <Text style={styles.bannerTitle}>{banner.title}</Text>
            <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
            <View style={styles.indicatorContainer}>
              {banners.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.indicator,
                    idx === currentIndex && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  scrollView: {
    marginHorizontal: 16,
  },
  scrollContent: {
    paddingRight: 12,
  },
  bannerCard: {
    borderRadius: 16,
    padding: 16,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    marginRight: 12,
    position: 'relative',
  },
  bannerEmoji: {
    fontSize: 32,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.white,
    marginTop: 6,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 3,
  },
  activeIndicator: {
    width: 24,
    backgroundColor: colors.primary,
  },
});

