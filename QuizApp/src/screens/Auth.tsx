import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../utils/colors';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../utils/authService';

type NavigateFunction = (screen: string, params?: any) => void;

interface AuthProps {
  navigate: NavigateFunction;
}

export default function Auth({ navigate }: AuthProps) {
  const insets = useSafeAreaInsets();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  
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

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setEmailLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      if (result.success) {
        navigate('Home');
      } else {
        Alert.alert('로그인 실패', result.error || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      Alert.alert('로그인 오류', error.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단: 앱 이름 */}
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>Qumo</Text>
        </View>

        {/* 이메일/비밀번호 입력 */}
        <View style={styles.emailLoginContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="아이디"
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
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
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

          <TouchableOpacity
            style={[styles.emailLoginButton, emailLoading && styles.emailLoginButtonDisabled]}
            onPress={handleEmailLogin}
            disabled={emailLoading}
            activeOpacity={0.7}
          >
            {emailLoading ? (
              <ActivityIndicator color={colors.text.white} />
            ) : (
              <Text style={styles.emailLoginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signUpLink}
            onPress={() => navigate('EmailLogin')}
            activeOpacity={0.7}
          >
            <Text style={styles.signUpLinkText}>
              아이디가 없으신가요? <Text style={styles.signUpLinkBold}>회원가입</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* 구분선 */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>or</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* 소셜 로그인 버튼들 */}
        <View style={styles.buttonContainer}>
          {/* Expo Go에서는 구글 로그인이 작동하지 않으므로 일시적으로 비활성화 */}
          {/* 배포 후 ENABLE_GOOGLE_LOGIN을 true로 변경하여 활성화 */}
          <TouchableOpacity
            style={[
              styles.googleMaterialButton,
              (!ENABLE_GOOGLE_LOGIN || googleLoading) && styles.googleButtonDisabled
            ]}
            onPress={handleGoogleLogin}
            disabled={!ENABLE_GOOGLE_LOGIN || googleLoading}
            activeOpacity={0.88}
          >
            {googleLoading ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <View style={styles.googleButtonContentWrapper}>
                <View style={styles.googleButtonIcon}>
                  {/* Google 로고 SVG */}
                  <Svg width={20} height={20} viewBox="0 0 48 48">
                    <Path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <Path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <Path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <Path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <Path fill="none" d="M0 0h48v48H0z" />
                  </Svg>
                </View>
                <Text style={styles.googleButtonContents}>Google 로 로그인</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.naverLoginButton}
            onPress={() => navigate('NaverLogin')}
            activeOpacity={0.8}
          >
            <View style={styles.naverIconContainer}>
              <Image
                source={{ uri: 'https://static.nid.naver.com/oauth/bt_nav_login.png' }}
                style={styles.naverIcon}
                resizeMode="contain"
                onError={(error) => console.log('네이버 로고 로드 오류:', error)}
                onLoad={() => console.log('네이버 로고 로드 성공')}
              />
            </View>
            <Text style={styles.naverButtonText}>네이버로 로그인</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundWhite,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  appName: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 0,
  },
  googleMaterialButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 4,
    height: 40,
    paddingHorizontal: 12,
    paddingVertical: 0,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minWidth: 'auto',
  },
  googleButtonDisabled: {
    backgroundColor: '#ffffff61',
    borderColor: '#1f1f1f1f',
  },
  googleButtonContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  googleButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    minWidth: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonContents: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: 0.25,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  appleButton: {
    backgroundColor: colors.primaryLight,
  },
  naverLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: 16,
    paddingVertical: 0,
    backgroundColor: '#03C75A',
    borderRadius: 4,
    marginBottom: 12,
    borderWidth: 0,
  },
  naverIconContainer: {
    width: 20,
    height: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  naverIcon: {
    width: 20,
    height: 20,
    backgroundColor: 'transparent',
  },
  naverButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Roboto',
    fontWeight: '400',
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 12,
    color: colors.text.secondary,
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
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  googleButtonText: {
    color: colors.text.primary,
  },
  appleButtonText: {
    color: colors.text.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emailLoginContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
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
  emailLoginButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  emailLoginButtonDisabled: {
    opacity: 0.6,
  },
  emailLoginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
  },
  signUpLink: {
    alignItems: 'center',
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
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
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
});

