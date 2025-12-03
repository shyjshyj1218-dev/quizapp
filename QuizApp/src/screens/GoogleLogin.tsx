import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { signInWithGoogle } from '../utils/authService';

type NavigateFunction = (screen: string, params?: any) => void;

interface GoogleLoginProps {
  navigate: NavigateFunction;
}

export default function GoogleLogin({ navigate }: GoogleLoginProps) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);

    if (result.success) {
      // 로그인 성공 시 Home으로 이동 (App.tsx에서 세션 확인)
      navigate('Home');
    } else {
      Alert.alert('로그인 실패', result.error || '구글 로그인에 실패했습니다.');
    }
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
        <Text style={styles.title}>구글 로그인</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          구글 계정으로 로그인하시면 더 편리하게 이용하실 수 있습니다.
        </Text>

        <TouchableOpacity
          style={[styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.white} />
          ) : (
            <>
              <Text style={styles.googleButtonIcon}>🔵</Text>
              <Text style={styles.googleButtonText}>구글로 로그인</Text>
            </>
          )}
        </TouchableOpacity>
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
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 18,
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
  },
});

