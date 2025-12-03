import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Header } from '../components';
import { colors } from '../utils/colors';
import { getCurrentUser, getUserNickname, setUserNickname, checkNicknameAvailability } from '../utils/authService';

type NavigateFunction = (screen: string) => void;

interface ProfileProps {
  navigate: NavigateFunction;
}

export default function Profile({ navigate }: ProfileProps) {
  const [user, setUser] = useState<any>(null);
  const [nickname, setNickname] = useState<string>('');
  const [displayNickname, setDisplayNickname] = useState<string>('사용자');
  const [coins, setCoins] = useState<number>(0);
  const [tickets, setTickets] = useState<number>(0);
  const [rating, setRating] = useState<number>(1000);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [nicknameError, setNicknameError] = useState<string>('');

  // 사용자 정보 및 닉네임 가져오기
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        // 닉네임이 있으면 사용, 없으면 이메일 앞부분 사용
        const dbNickname = await getUserNickname();
        if (dbNickname) {
          setNickname(dbNickname);
          setDisplayNickname(dbNickname);
        } else if (currentUser.email) {
          const tempNickname = currentUser.email.split('@')[0];
          setDisplayNickname(tempNickname);
        }
        
        // coins, tickets, rating 설정
        setCoins(currentUser.coins ?? 0);
        setTickets(currentUser.tickets ?? 0);
        setRating(currentUser.rating ?? 1000);
      }
    } catch (error) {
      console.error('사용자 정보 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 닉네임 수정 모달 열기
  const handleNicknamePress = () => {
    setEditNickname(nickname || displayNickname);
    setModalVisible(true);
    setNicknameStatus('idle');
    setNicknameError('');
  };

  // 닉네임 중복 체크 (디바운싱)
  useEffect(() => {
    if (!modalVisible) return;
    
    if (!editNickname || editNickname.trim().length < 2) {
      setNicknameStatus('idle');
      setNicknameError('');
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingNickname(true);
      setNicknameStatus('checking');
      
      const result = await checkNicknameAvailability(editNickname);
      
      if (result.available) {
        setNicknameStatus('available');
        setNicknameError('');
      } else {
        setNicknameStatus('unavailable');
        setNicknameError(result.error || '이미 사용 중인 닉네임입니다.');
      }
      
      setCheckingNickname(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [editNickname, modalVisible]);

  // 닉네임 저장
  const handleSaveNickname = async () => {
    if (!editNickname || editNickname.trim().length < 2) {
      Alert.alert('알림', '닉네임은 2자 이상이어야 합니다.');
      return;
    }

    if (nicknameStatus !== 'available' && nicknameStatus !== 'idle') {
      Alert.alert('알림', '사용 가능한 닉네임을 입력해주세요.');
      return;
    }

    // 최종 닉네임 중복 체크
    const nicknameCheck = await checkNicknameAvailability(editNickname);
    if (!nicknameCheck.available) {
      Alert.alert('알림', nicknameCheck.error || '이미 사용 중인 닉네임입니다.');
      return;
    }

    setEditLoading(true);
    const result = await setUserNickname(editNickname.trim());
    setEditLoading(false);

    if (result.success) {
      setNickname(editNickname.trim());
      setDisplayNickname(editNickname.trim());
      setModalVisible(false);
      Alert.alert('성공', '닉네임이 변경되었습니다.', [
        { text: '확인', onPress: () => navigate('Home') }
      ]);
    } else {
      Alert.alert('닉네임 변경 실패', result.error || '닉네임 변경에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header onProfilePress={() => {}} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onProfilePress={() => {}} nickname={displayNickname} coins={coins} tickets={tickets} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <TouchableOpacity onPress={handleNicknamePress} activeOpacity={0.7}>
            <View style={styles.nicknameContainer}>
              <Text style={styles.nickname}>{displayNickname}</Text>
              <Text style={styles.editHint}>탭하여 수정</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>Thinker (사색가)</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>레이팅</Text>
            <Text style={styles.ratingValue}>{rating}점</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigate('Home')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuText}>홈으로 돌아가기</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 닉네임 수정 모달 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>닉네임 수정</Text>
            
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>닉네임</Text>
              <View style={styles.modalNicknameContainer}>
                <TextInput
                  style={[
                    styles.modalInput,
                    nicknameStatus === 'available' && styles.modalInputSuccess,
                    nicknameStatus === 'unavailable' && styles.modalInputError,
                  ]}
                  placeholder="닉네임을 입력하세요 (2자 이상)"
                  value={editNickname}
                  onChangeText={setEditNickname}
                  autoCapitalize="none"
                  autoFocus
                />
                {checkingNickname && (
                  <ActivityIndicator size="small" color={colors.primary} style={styles.modalNicknameIndicator} />
                )}
                {nicknameStatus === 'available' && !checkingNickname && (
                  <Text style={styles.modalNicknameSuccessText}>✓ 사용 가능</Text>
                )}
                {nicknameStatus === 'unavailable' && !checkingNickname && (
                  <Text style={styles.modalNicknameErrorText}>✗ {nicknameError}</Text>
                )}
              </View>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalSaveButton,
                  (editLoading || nicknameStatus === 'unavailable' || !editNickname || editNickname.trim().length < 2) && styles.modalSaveButtonDisabled,
                ]}
                onPress={handleSaveNickname}
                disabled={editLoading || nicknameStatus === 'unavailable' || !editNickname || editNickname.trim().length < 2}
                activeOpacity={0.7}
              >
                {editLoading ? (
                  <ActivityIndicator color={colors.text.white} />
                ) : (
                  <Text style={styles.modalSaveButtonText}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.coin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
  },
  nickname: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 12,
  },
  title: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 12,
  },
  ratingContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  menuSection: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  arrow: {
    fontSize: 20,
    color: colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nicknameContainer: {
    alignItems: 'center',
  },
  editHint: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalInputContainer: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  modalNicknameContainer: {
    position: 'relative',
  },
  modalInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalNicknameIndicator: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  modalNicknameSuccessText: {
    position: 'absolute',
    right: 12,
    top: 14,
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  modalNicknameErrorText: {
    position: 'absolute',
    right: 12,
    top: 14,
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  modalInputSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  modalInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F3F4F6',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalSaveButton: {
    backgroundColor: colors.primary,
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.white,
  },
});

