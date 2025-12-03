import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';

type NavigateFunction = (screen: string, params?: any) => void;

interface NaverLoginProps {
  navigate: NavigateFunction;
}

export default function NaverLogin({ navigate }: NaverLoginProps) {
  const insets = useSafeAreaInsets();

  const handleNaverLogin = () => {
    Alert.alert('준비 중', '네이버 로그인은 준비 중입니다.');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigate('Auth')}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>네이버 로그인</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          네이버 계정으로 로그인하시면 더 편리하게 이용하실 수 있습니다.
        </Text>

        <TouchableOpacity
          style={styles.naverButton}
          onPress={handleNaverLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.naverButtonIcon}>🟢</Text>
          <Text style={styles.naverButtonText}>네이버로 로그인</Text>
        </TouchableOpacity>

        <Text style={styles.notice}>
          네이버 로그인 기능은 현재 준비 중입니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 32,
    lineHeight: 24,
  },
  naverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.naver,
    borderRadius: 12,
    paddingVertical: 18,
    marginTop: 20,
  },
  naverButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  naverButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
  },
  notice: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 20,
  },
});

