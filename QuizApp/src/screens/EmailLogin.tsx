import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { signInWithEmail, signUpWithEmail } from '../utils/authService';

type NavigateFunction = (screen: string, params?: any) => void;

interface EmailLoginProps {
  navigate: NavigateFunction;
}

export default function EmailLogin({ navigate }: EmailLoginProps) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    const result = await signInWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      // 로그인 성공 시 Home으로 이동
      // App.tsx에서 세션을 확인하므로 여기서는 navigate만 호출
      navigate('Home');
    } else {
      Alert.alert('로그인 실패', result.error || '로그인에 실패했습니다.');
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !passwordConfirm) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('알림', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    const result = await signUpWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      // 회원가입 성공 시 바로 로그인 처리
      navigate('Home');
    } else {
      Alert.alert('회원가입 실패', result.error || '회원가입에 실패했습니다.');
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
        <Text style={styles.title}>
          {isSignUp ? '회원가입' : '아이디 로그인'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            placeholder="이메일을 입력하세요"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호를 입력하세요 (6자 이상)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />
        </View>

        {isSignUp && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호 재확인</Text>
            <TextInput
              style={[
                styles.input,
                passwordConfirm && password !== passwordConfirm && styles.inputError,
                passwordConfirm && password === passwordConfirm && styles.inputSuccess,
              ]}
              placeholder="비밀번호를 다시 입력하세요"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />
            {passwordConfirm && password !== passwordConfirm && (
              <Text style={styles.passwordErrorText}>비밀번호가 일치하지 않습니다.</Text>
            )}
            {passwordConfirm && password === passwordConfirm && password.length >= 6 && (
              <Text style={styles.passwordSuccessText}>✓ 비밀번호가 일치합니다.</Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={isSignUp ? handleSignUp : handleLogin}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.white} />
          ) : (
            <Text style={styles.submitButtonText}>
              {isSignUp ? '회원가입' : '로그인'}
            </Text>
          )}
        </TouchableOpacity>

        {!isSignUp && (
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => setIsSignUp(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.signUpButtonText}>
              계정이 없으신가요? <Text style={styles.signUpButtonTextBold}>회원가입</Text>
            </Text>
          </TouchableOpacity>
        )}

        {isSignUp && (
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => {
              setIsSignUp(false);
              setEmail('');
              setPassword('');
              setPasswordConfirm('');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.signUpButtonText}>
              이미 계정이 있으신가요? <Text style={styles.signUpButtonTextBold}>로그인</Text>
            </Text>
          </TouchableOpacity>
        )}
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
  },
  signUpButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  signUpButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  signUpButtonTextBold: {
    fontWeight: '600',
    color: colors.primary,
  },
  inputSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  passwordErrorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  passwordSuccessText: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
});

