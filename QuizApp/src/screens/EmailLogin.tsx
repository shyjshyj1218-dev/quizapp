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
  const [showPassword, setShowPassword] = useState(false);

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
      <View style={styles.content}>
        <Text style={styles.title}>
          {isSignUp ? 'Sign Up' : 'Login'}
        </Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholderTextColor={colors.text.secondary}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              placeholderTextColor={colors.text.secondary}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isSignUp && (
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[
                  styles.input,
                  passwordConfirm && password !== passwordConfirm && styles.inputError,
                  passwordConfirm && password === passwordConfirm && styles.inputSuccess,
                ]}
                placeholder="Confirm Password"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                placeholderTextColor={colors.text.secondary}
              />
            </View>
            {passwordConfirm && password !== passwordConfirm && (
              <Text style={styles.passwordErrorText}>비밀번호가 일치하지 않습니다.</Text>
            )}
            {passwordConfirm && password === passwordConfirm && password.length >= 6 && (
              <Text style={styles.passwordSuccessText}>✓ 비밀번호가 일치합니다.</Text>
            )}
          </View>
        )}

        {!isSignUp && (
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => Alert.alert('비밀번호 찾기', '비밀번호 찾기 기능은 준비 중입니다.')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
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
              {isSignUp ? 'Sign Up' : 'Login'}
            </Text>
          )}
        </TouchableOpacity>

        {/* 구분선 */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>or</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* 소셜 로그인 버튼들 */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => navigate('GoogleLogin')}
          activeOpacity={0.7}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, styles.appleButton]}
          onPress={() => navigate('NaverLogin')}
          activeOpacity={0.7}
        >
          <Text style={styles.appleIcon}>🍎</Text>
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => navigate('Home')}
          activeOpacity={0.7}
        >
          <Text style={styles.guestIcon}>👤</Text>
          <Text style={styles.socialButtonText}>Continue As Guest</Text>
        </TouchableOpacity>

        {/* 회원가입/로그인 링크 */}
        <TouchableOpacity
          style={styles.signUpLink}
          onPress={() => {
            if (isSignUp) {
              setIsSignUp(false);
              setEmail('');
              setPassword('');
              setPasswordConfirm('');
            } else {
              setIsSignUp(true);
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.signUpLinkText}>
            {isSignUp ? 'Already have an account? ' : 'Need an account? '}
            <Text style={styles.signUpLinkBold}>
              {isSignUp ? 'Log in' : 'Sign up'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundWhite,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text.primary,
  },
  eyeIcon: {
    padding: 4,
  },
  eyeIconText: {
    fontSize: 20,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.text.primary,
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderGray,
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.text.secondary,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  appleButton: {
    backgroundColor: colors.primaryLight,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
    color: colors.google,
  },
  appleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  guestIcon: {
    fontSize: 20,
    marginRight: 12,
    color: colors.text.secondary,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  signUpLink: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 12,
  },
  signUpLinkText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  signUpLinkBold: {
    fontWeight: '600',
    color: colors.primaryDark,
    textDecorationLine: 'underline',
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
    marginTop: 8,
    marginLeft: 4,
  },
  passwordSuccessText: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '600',
  },
});

