import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { checkNicknameAvailability, setUserNickname } from '../utils/authService';

type NavigateFunction = (screen: string, params?: any) => void;

interface NicknameSetupProps {
  navigate: NavigateFunction;
}

export default function NicknameSetup({ navigate }: NicknameSetupProps) {
  const insets = useSafeAreaInsets();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [nicknameError, setNicknameError] = useState<string>('');

  // 닉네임 중복 체크 (디바운싱)
  useEffect(() => {
    if (!nickname || nickname.trim().length < 2) {
      setNicknameStatus('idle');
      setNicknameError('');
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingNickname(true);
      setNicknameStatus('checking');
      
      const result = await checkNicknameAvailability(nickname);
      
      if (result.available) {
        setNicknameStatus('available');
        setNicknameError('');
      } else {
        setNicknameStatus('unavailable');
        setNicknameError(result.error || '이미 사용 중인 닉네임입니다.');
      }
      
      setCheckingNickname(false);
    }, 500); // 500ms 디바운싱

    return () => clearTimeout(timer);
  }, [nickname]);

  const handleSubmit = async () => {
    if (!nickname || nickname.trim().length < 2) {
      Alert.alert('알림', '닉네임은 2자 이상이어야 합니다.');
      return;
    }

    if (nicknameStatus !== 'available' && nicknameStatus !== 'idle') {
      Alert.alert('알림', '사용 가능한 닉네임을 입력해주세요.');
      return;
    }

    // 최종 닉네임 중복 체크
    const nicknameCheck = await checkNicknameAvailability(nickname);
    if (!nicknameCheck.available) {
      Alert.alert('알림', nicknameCheck.error || '이미 사용 중인 닉네임입니다.');
      return;
    }

    setLoading(true);
    const result = await setUserNickname(nickname.trim());
    setLoading(false);

    if (result.success) {
      // 닉네임 설정 완료 후 메인 화면으로 이동
      navigate('Home');
    } else {
      Alert.alert('닉네임 설정 실패', result.error || '닉네임 설정에 실패했습니다.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>닉네임 설정</Text>
          <Text style={styles.subtitle}>
            서비스를 이용하기 위해{'\n'}닉네임을 설정해주세요
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>닉네임</Text>
          <View style={styles.nicknameContainer}>
            <TextInput
              style={[
                styles.input,
                nicknameStatus === 'available' && styles.inputSuccess,
                nicknameStatus === 'unavailable' && styles.inputError,
              ]}
              placeholder="닉네임을 입력하세요 (2자 이상)"
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="none"
              autoFocus
            />
            {checkingNickname && (
              <ActivityIndicator size="small" color={colors.primary} style={styles.nicknameIndicator} />
            )}
            {nicknameStatus === 'available' && !checkingNickname && (
              <Text style={styles.nicknameSuccessText}>✓ 사용 가능</Text>
            )}
            {nicknameStatus === 'unavailable' && !checkingNickname && (
              <Text style={styles.nicknameErrorText}>✗ {nicknameError}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || nicknameStatus === 'unavailable' || !nickname || nickname.trim().length < 2) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || nicknameStatus === 'unavailable' || !nickname || nickname.trim().length < 2}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.white} />
          ) : (
            <Text style={styles.submitButtonText}>시작하기</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 32,
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
  nicknameContainer: {
    position: 'relative',
  },
  nicknameIndicator: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  nicknameSuccessText: {
    position: 'absolute',
    right: 12,
    top: 14,
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  nicknameErrorText: {
    position: 'absolute',
    right: 12,
    top: 14,
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  inputSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
  },
});

