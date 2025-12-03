import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../utils/colors';
import { Header } from '../components';
import { getUserRating } from '../utils/matchingService';
import { getCurrentUser } from '../utils/authService';
import { connectSocket, disconnectSocket, getSocket } from '../utils/socketService';

type NavigateFunction = (screen: string, params?: any) => void;

interface MatchingProps {
  navigate: NavigateFunction;
}

export default function Matching({ navigate }: MatchingProps) {
  const [matching, setMatching] = useState(true);
  const [waitingTime, setWaitingTime] = useState(0);
  const [queueSize, setQueueSize] = useState(0);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    startMatching();
    const timer = setInterval(() => {
      setWaitingTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      // 매칭이 성공했으면 Socket 연결을 유지 (RealtimeMatchGame에서 사용)
      // 매칭이 취소되거나 실패한 경우에만 Socket 연결 해제
      if (socketRef.current && !matching) {
        // 매칭이 완료되었으면 Socket을 끊지 않음
        return;
      }
      if (socketRef.current) {
        socketRef.current.emit('cancel-match');
        // 매칭 중일 때만 Socket 연결 해제
        disconnectSocket();
      }
    };
  }, [matching]);

  const startMatching = async () => {
    try {
      // 사용자 정보 가져오기
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('오류', '로그인이 필요합니다.');
        navigate('Home');
        return;
      }

      const userRating = await getUserRating();

      // Socket.io 연결
      const socket = connectSocket();
      socketRef.current = socket;

      // 연결 성공 시 매칭 요청
      socket.on('connect', () => {
        console.log('[Matching] Socket 연결 성공:', socket.id);
        
        // 매칭 요청
        socket.emit('request-match', {
          userId: user.id,
          nickname: user.nickname || '익명',
          rating: userRating,
          profileImage: user.profile_image,
        });
      });

      // 매칭 성공 이벤트
      socket.on('match-found', (data: any) => {
        console.log('[Matching] 매칭 성공:', data);
        setMatching(false);
        // Socket 연결을 유지하기 위해 disconnectSocket()을 호출하지 않음
        // RealtimeMatchGame에서 같은 Socket 인스턴스를 사용할 수 있도록 함
        navigate('RealtimeMatchGame', {
          opponent: data.opponent,
          questions: data.questions,
          matchId: data.matchId,
          startTime: data.startTime,
        });
      });

      // 큐에 추가됨
      socket.on('match-queued', (data: { queueSize: number }) => {
        console.log('[Matching] 큐에 추가됨:', data.queueSize);
        setQueueSize(data.queueSize);
      });

      // 매칭 취소됨
      socket.on('match-cancelled', () => {
        console.log('[Matching] 매칭 취소됨');
      });

      // 연결 오류
      socket.on('connect_error', (error) => {
        console.error('[Matching] 연결 오류:', error);
        console.error('[Matching] 오류 상세:', error.message);
        Alert.alert(
          '연결 오류', 
          `서버에 연결할 수 없습니다.\n\n서버 주소: ${socket.io?.uri || '알 수 없음'}\n\n서버가 실행 중인지 확인해주세요.`
        );
      });

      // 연결 타임아웃
      socket.on('disconnect', (reason) => {
        console.log('[Matching] 연결 끊김:', reason);
        if (reason === 'io server disconnect') {
          // 서버가 연결을 끊음 (재연결 시도)
          socket.connect();
        }
      });
    } catch (error) {
      console.error('매칭 오류:', error);
      Alert.alert('오류', '매칭을 시작할 수 없습니다.');
      navigate('Home');
    }
  };

  const handleCancel = () => {
    if (socketRef.current) {
      socketRef.current.emit('cancel-match');
      disconnectSocket();
    }
    navigate('Home');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Header onProfilePress={() => navigate('Profile')} />
      <View style={styles.content}>
        <Text style={styles.title}>매칭 중...</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        <Text style={styles.subtitle}>상대방을 찾고 있습니다</Text>
        <Text style={styles.timeText}>대기 시간: {formatTime(waitingTime)}</Text>
        {queueSize > 0 && (
          <Text style={styles.queueText}>대기 인원: {queueSize}명</Text>
        )}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  loader: {
    marginVertical: 24,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
  },
  timeText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 16,
  },
  queueText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 32,
    backgroundColor: colors.white,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
});

