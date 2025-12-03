// Socket.io 클라이언트 서비스
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// 개발 환경에서 모바일 기기 테스트용 IP 주소
// 실제 배포 시에는 환경 변수나 app.json에서 설정
const getServerUrl = (): string => {
  // 환경 변수가 있으면 우선 사용
  if (process.env.EXPO_PUBLIC_MATCHING_SERVER_URL) {
    return process.env.EXPO_PUBLIC_MATCHING_SERVER_URL;
  }
  
  // app.json의 extra 설정 확인
  if (Constants.expoConfig?.extra?.matchingServerUrl) {
    return Constants.expoConfig.extra.matchingServerUrl;
  }
  
  // 개발 환경에서 모바일 기기 테스트 시 로컬 IP 사용
  // iOS 시뮬레이터나 Android 에뮬레이터는 localhost 사용 가능
  // 실제 기기에서는 컴퓨터의 로컬 IP 주소 사용 필요
  if (__DEV__ && Platform.OS !== 'web') {
    // 실제 기기에서 테스트할 때는 이 IP를 컴퓨터의 로컬 IP로 변경하세요
    // 예: 'http://192.168.219.102:3001'
    return 'http://192.168.219.102:3001';
  }
  
  // 기본값
  return 'http://localhost:3001';
};

const SERVER_URL = getServerUrl();

let socket: Socket | null = null;

/**
 * Socket.io 연결
 */
export function connectSocket(): Socket {
  if (socket?.connected) {
    return socket;
  }

  console.log('[Socket] 서버 연결 시도:', SERVER_URL);
  
  socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
    timeout: 20000,
    forceNew: false,
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('[Socket] 연결됨:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('[Socket] 연결 끊김');
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] 연결 오류:', error);
  });

  return socket;
}

/**
 * Socket.io 연결 해제
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * 현재 Socket 인스턴스 가져오기
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Socket 연결 상태 확인
 */
export function isSocketConnected(): boolean {
  return socket?.connected || false;
}

