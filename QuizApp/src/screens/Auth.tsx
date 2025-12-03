import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { signInWithGoogle } from '../utils/authService';

type NavigateFunction = (screen: string, params?: any) => void;

interface AuthProps {
  navigate: NavigateFunction;
}

export default function Auth({ navigate }: AuthProps) {
  const insets = useSafeAreaInsets();
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Expo Go에서는 구글 로그인 비활성화 (배포 후 true로 변경)
  const ENABLE_GOOGLE_LOGIN = false;

  const handleGoogleLogin = async () => {
    // Expo Go에서는 구글 로그인 비활성화
    if (!ENABLE_GOOGLE_LOGIN) {
      Alert.alert(
        '구글 로그인',
        'Expo Go에서는 구글 로그인이 작동하지 않습니다.\n배포된 앱에서만 사용 가능합니다.',
        [{ text: '확인' }]
      );
      return;
    }

    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        // 로그인 성공 - App.tsx의 onAuthStateChange가 자동으로 화면 전환
        // 추가 확인을 위해 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('Home');
      } else {
        Alert.alert('로그인 실패', result.error || '구글 로그인에 실패했습니다.');
      }
    } catch (error: any) {
      Alert.alert('로그인 오류', error.message || '구글 로그인 중 오류가 발생했습니다.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단: 앱 로고 및 앱 이름 */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>📚</Text>
          </View>
          <Text style={styles.appName}>퀴즈마니아</Text>
          <Text style={styles.subtitle}>퀴즈로 실력을 키워보세요</Text>
        </View>

        {/* 로그인 버튼들 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigate('EmailLogin')}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>👤</Text>
            <Text style={styles.buttonText}>아이디 로그인</Text>
          </TouchableOpacity>

          {/* Expo Go에서는 구글 로그인이 작동하지 않으므로 일시적으로 비활성화 */}
          {/* 배포 후 ENABLE_GOOGLE_LOGIN을 true로 변경하여 활성화 */}
          <TouchableOpacity
            style={[
              styles.button, 
              styles.googleButton, 
              (!ENABLE_GOOGLE_LOGIN || googleLoading) && styles.buttonDisabled
            ]}
            onPress={handleGoogleLogin}
            disabled={!ENABLE_GOOGLE_LOGIN || googleLoading}
            activeOpacity={0.7}
          >
            {googleLoading ? (
              <ActivityIndicator color={colors.text.white} />
            ) : (
              <>
            <Text style={styles.buttonIcon}>🔵</Text>
                <Text style={[styles.buttonText, styles.googleButtonText]}>구글 로그인</Text>
                {!ENABLE_GOOGLE_LOGIN && (
                  <Text style={[styles.buttonText, styles.googleButtonText, { fontSize: 12, marginLeft: 8, opacity: 0.8 }]}>
                    (배포 후 활성화)
                  </Text>
                )}
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.naverButton]}
            onPress={() => navigate('NaverLogin')}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>🟢</Text>
            <Text style={[styles.buttonText, styles.naverButtonText]}>
              네이버 로그인
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 64,
    marginTop: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoIcon: {
    fontSize: 50,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  naverButton: {
    backgroundColor: colors.naver,
    borderColor: colors.naver,
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  googleButtonText: {
    color: colors.text.white,
  },
  naverButtonText: {
    color: colors.text.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

