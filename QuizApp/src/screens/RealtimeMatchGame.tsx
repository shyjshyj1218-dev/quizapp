import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { getCurrentUser } from '../utils/authService';
import { getRandomQuestions, MatchUser, calculateEloRating, updateUserRating, getUserRating } from '../utils/matchingService';
import { QuizQuestion } from '../types/database';
import { connectSocket, disconnectSocket, getSocket, isSocketConnected } from '../utils/socketService';

type NavigateFunction = (screen: string, params?: any) => void;

interface RealtimeMatchGameProps {
  navigate: NavigateFunction;
  opponent?: MatchUser;
  matchId?: string;
  questions?: QuizQuestion[];
  startTime?: number;
}

export default function RealtimeMatchGame({
  navigate,
  opponent: initialOpponent,
  matchId: initialMatchId,
  questions: initialQuestions,
  startTime: initialStartTime,
}: RealtimeMatchGameProps) {
  const insets = useSafeAreaInsets();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [opponent, setOpponent] = useState<MatchUser | null>(initialOpponent || null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState(0); // 사용자가 푼 문제 수
  const [userCorrectCount, setUserCorrectCount] = useState(0); // 사용자가 맞춘 문제 수
  const [opponentProgress, setOpponentProgress] = useState(0); // 상대방이 푼 문제 수
  const [opponentCorrectCount, setOpponentCorrectCount] = useState(0); // 상대방이 맞춘 문제 수
  const [userFinishTime, setUserFinishTime] = useState<number | null>(null); // 사용자가 문제를 다 푼 시간
  const [opponentFinishTime, setOpponentFinishTime] = useState<number | null>(null); // 상대방이 문제를 다 푼 시간
  const [gameResult, setGameResult] = useState<'win' | 'lose' | 'draw' | null>(null); // 게임 결과
  const [opponentSurrendered, setOpponentSurrendered] = useState(false); // 상대방이 기권했는지 여부
  const [ratingChange, setRatingChange] = useState<number>(0); // 레이팅 변화량
  const [newRating, setNewRating] = useState<number | null>(null); // 새로운 레이팅
  const [userFinished, setUserFinished] = useState(false); // 사용자가 문제를 다 풀었는지 여부
  const [opponentFinished, setOpponentFinished] = useState(false); // 상대방이 문제를 다 풀었는지 여부
  
  // ref 업데이트
  useEffect(() => {
    userProgressRef.current = userProgress;
  }, [userProgress]);
  
  useEffect(() => {
    opponentProgressRef.current = opponentProgress;
    
    // 상대방이 10문제를 다 풀었는지 확인
    if (opponentProgress >= 10) {
      console.log('[RealtimeMatchGame] opponentProgress >= 10, opponentFinished를 true로 설정');
      if (!opponentFinished) {
        setOpponentFinished(true);
      }
      if (opponentFinishTime === null) {
        setOpponentFinishTime(Date.now());
      }
    }
  }, [opponentProgress, opponentFinished, opponentFinishTime]);
  
  // 사용자가 문제를 다 풀었을 때 타이머 정지
  useEffect(() => {
    if (userFinished && timerRef.current) {
      console.log('[RealtimeMatchGame] 사용자가 문제를 다 풀어서 타이머 정지');
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [userFinished]);

  // finishGame 함수 먼저 정의 (compareResults에서 사용)
  const finishGame = useCallback(async (result: 'win' | 'lose' | 'draw' | 'pending') => {
    if (result === 'pending') {
      // 결과가 아직 결정되지 않았으면 대기
      return;
    }
    if (isFinishedRef.current) return;

    setIsFinished(true);
    isFinishedRef.current = true;
    setIsWinner(result === 'win');
    setGameResult(result);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (opponentTimerRef.current) {
      clearInterval(opponentTimerRef.current);
    }

    // Socket.io로 게임 종료 전송
    if (socketRef.current && socketRef.current.connected && initialMatchId) {
      socketRef.current.emit('game-finished', {
        matchId: initialMatchId,
        result: result,
        timeElapsed: timeElapsedRef.current,
        progress: userProgressRef.current,
        correctCount: userCorrectCount,
        finishTime: userFinishTime || Date.now(),
      });
      
      // 게임이 종료되었으므로 Socket 연결 해제
      console.log('[RealtimeMatchGame] 게임 종료, Socket 연결 해제');
      disconnectSocket();
    }

    // ELO 레이팅 업데이트
    if (currentUser && opponent) {
      try {
        const userRating = currentUser.rating || 1000;
        const opponentRating = opponent.rating || 1000;
        let calculatedRatingChange = 0;
        let finalNewRating = userRating;
        
        if (result === 'draw') {
          // 무승부: 승리 시 받을 점수의 50%
          const winRatingChange = calculateEloRating(userRating, opponentRating, true) - userRating;
          calculatedRatingChange = Math.round(winRatingChange * 0.5);
          finalNewRating = userRating + calculatedRatingChange;
        } else {
          const isWin = result === 'win';
          finalNewRating = calculateEloRating(userRating, opponentRating, isWin);
          calculatedRatingChange = finalNewRating - userRating;
        }
        
        await updateUserRating(currentUser.id, finalNewRating);
        setRatingChange(calculatedRatingChange);
        setNewRating(finalNewRating);
        console.log(`[Game] ELO 업데이트: ${userRating} -> ${finalNewRating} (변화: ${calculatedRatingChange})`);
      } catch (error) {
        console.error('레이팅 업데이트 오류:', error);
      }
    }
  }, [userCorrectCount, userFinishTime, currentUser, opponent, initialMatchId]);

  // 결과 비교 함수 (useEffect보다 먼저 정의)
  const compareResults = useCallback(() => {
    console.log('[compareResults] 함수 호출됨');
    
    if (isFinishedRef.current) {
      console.log('[compareResults] 이미 게임 종료됨');
      return;
    }
    
    // 진행 상황도 확인
    const userProgressCheck = userProgressRef.current >= 10;
    const opponentProgressCheck = opponentProgressRef.current >= 10;
    
    console.log('[compareResults] 상태 확인:', {
      userFinished,
      opponentFinished,
      userProgress: userProgressRef.current,
      opponentProgress: opponentProgressRef.current,
      userProgressCheck,
      opponentProgressCheck,
      userFinishTime,
      opponentFinishTime,
      userCorrectCount,
      opponentCorrectCount,
      isFinished: isFinishedRef.current,
    });
    
    // 둘 다 끝나지 않았으면 대기
    // 진행 상황으로도 확인 (상태가 false여도 진행 상황이 10이면 완료로 간주)
    if (!userProgressCheck || !opponentProgressCheck) {
      console.log('[compareResults] 진행 상황이 부족함:', { 
        userProgressCheck,
        opponentProgressCheck,
        userFinished,
        opponentFinished,
      });
      return;
    }
    
    // 진행 상황이 10이면 강제로 finished 상태 설정 (동기적으로 처리)
    let finalUserFinished = userFinished;
    let finalOpponentFinished = opponentFinished;
    
    if (userProgressCheck && !userFinished) {
      console.log('[compareResults] userProgress >= 10인데 userFinished가 false, 강제로 true 설정');
      finalUserFinished = true;
      setUserFinished(true);
      if (userFinishTime === null) {
        const now = Date.now();
        setUserFinishTime(now);
      }
    }
    
    if (opponentProgressCheck && !opponentFinished) {
      console.log('[compareResults] opponentProgress >= 10인데 opponentFinished가 false, 강제로 true 설정');
      finalOpponentFinished = true;
      setOpponentFinished(true);
      if (opponentFinishTime === null) {
        const now = Date.now();
        setOpponentFinishTime(now);
      }
    }
    
    // finishTime이 없으면 설정 (안전장치)
    const finalUserFinishTime = userFinishTime || Date.now();
    const finalOpponentFinishTime = opponentFinishTime || Date.now();
    
    if (userFinishTime === null) {
      setUserFinishTime(finalUserFinishTime);
    }
    if (opponentFinishTime === null) {
      setOpponentFinishTime(finalOpponentFinishTime);
    }
    
    const userFinalCorrectCount = userCorrectCount;
    const opponentFinalCorrectCount = opponentCorrectCount;
    
    let result: 'win' | 'lose' | 'draw' = 'draw';
    
    // 1. 정답 개수 비교
    if (userFinalCorrectCount > opponentFinalCorrectCount) {
      result = 'win';
    } else if (userFinalCorrectCount < opponentFinalCorrectCount) {
      result = 'lose';
    } else {
      // 2. 정답 개수가 같으면 시간 비교
      if (finalUserFinishTime < finalOpponentFinishTime) {
        result = 'win';
      } else if (finalUserFinishTime > finalOpponentFinishTime) {
        result = 'lose';
      } else {
        // 3. 정답 개수와 시간이 모두 같으면 무승부
        result = 'draw';
      }
    }
    
    console.log('[compareResults] 결과 결정:', result, {
      userCorrectCount: userFinalCorrectCount,
      opponentCorrectCount: opponentFinalCorrectCount,
      userTime: finalUserFinishTime,
      opponentTime: finalOpponentFinishTime,
    });
    setGameResult(result);
    finishGame(result);
  }, [userFinished, opponentFinished, userFinishTime, opponentFinishTime, userCorrectCount, opponentCorrectCount, finishGame]);

  // 둘 다 끝났는지 확인하는 useEffect (both-finished 이벤트가 오지 않았을 때를 위한 백업)
  useEffect(() => {
    if (isFinishedRef.current) {
      return; // 이미 게임 종료됨
    }
    
    const userProgressCheck = userProgressRef.current >= 10;
    const opponentProgressCheck = opponentProgressRef.current >= 10;
    
    console.log('[RealtimeMatchGame] useEffect 체크:', {
      userFinished,
      opponentFinished,
      isFinished: isFinishedRef.current,
      userProgress: userProgressRef.current,
      opponentProgress: opponentProgressRef.current,
      userProgressCheck,
      opponentProgressCheck,
    });

    // 진행 상황으로도 확인 (opponentFinished가 false여도 진행 상황이 10이면 true로 간주)
    const bothFinished = (userFinished && opponentFinished) || (userProgressCheck && opponentProgressCheck);

    if (bothFinished && !isFinishedRef.current) {
      console.log('[RealtimeMatchGame] useEffect: 둘 다 끝남, 결과 비교 시도 (백업 로직)');
      
      // opponentFinished가 false인데 진행 상황이 10이면 강제로 true로 설정
      if (opponentProgressCheck && !opponentFinished) {
        console.log('[RealtimeMatchGame] opponentProgress >= 10인데 opponentFinished가 false, 강제로 true 설정');
        setOpponentFinished(true);
        if (opponentFinishTime === null) {
          setOpponentFinishTime(Date.now());
        }
      }
      
      // userFinished가 false인데 진행 상황이 10이면 강제로 true로 설정
      if (userProgressCheck && !userFinished) {
        console.log('[RealtimeMatchGame] userProgress >= 10인데 userFinished가 false, 강제로 true 설정');
        setUserFinished(true);
        if (userFinishTime === null) {
          setUserFinishTime(Date.now());
        }
      }
      
      // 상태 업데이트 후 결과 비교 (약간의 딜레이)
      const timer = setTimeout(() => {
        console.log('[RealtimeMatchGame] compareResults 호출 (useEffect 백업)');
        compareResults();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [userFinished, opponentFinished, compareResults, userProgress, opponentProgress, opponentFinishTime, userFinishTime]);
  
  const opponentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userProgressRef = useRef(0);
  const opponentProgressRef = useRef(0);
  const socketRef = useRef<any>(null);
  const [timeElapsed, setTimeElapsed] = useState(0); // 경과 시간 (초)
  const [finalTimeElapsed, setFinalTimeElapsed] = useState<number | null>(null); // 문제를 다 풀었을 때의 시간
  const [isFinished, setIsFinished] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [hasSurrendered, setHasSurrendered] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(initialStartTime || Date.now());
  const isFinishedRef = useRef(false);
  const timeElapsedRef = useRef(0);

  // ref 업데이트 (isFinished와 timeElapsed 선언 이후)
  useEffect(() => {
    isFinishedRef.current = isFinished;
  }, [isFinished]);

  useEffect(() => {
    timeElapsedRef.current = timeElapsed;
  }, [timeElapsed]);

  useEffect(() => {
    initializeGame();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (opponentTimerRef.current) {
        clearInterval(opponentTimerRef.current);
      }
      if (socketRef.current) {
        disconnectSocket();
      }
    };
  }, []);

  const initializeGame = async () => {
    try {
      setLoading(true);
      
      // 현재 사용자 정보 가져오기
      const user = await getCurrentUser();
      if (user) {
        // 레이팅 정보도 가져오기
        const rating = await getUserRating();
        setCurrentUser({ ...user, rating });
      }

      // 상대방이 없으면 매칭 시도
      if (!opponent) {
        // 실제로는 서버에서 매칭된 상대방 정보를 받아야 함
        // 여기서는 임시로 처리
        Alert.alert('오류', '상대방을 찾을 수 없습니다.');
        navigate('Home');
        return;
      }

      // 문제 가져오기 (props로 받았으면 사용, 없으면 새로 가져오기)
      let randomQuestions: QuizQuestion[] = [];
      if (initialQuestions && initialQuestions.length > 0) {
        randomQuestions = initialQuestions;
      } else {
        randomQuestions = await getRandomQuestions(10);
        if (randomQuestions.length === 0) {
          Alert.alert('오류', '문제를 불러올 수 없습니다.');
          navigate('Home');
          return;
        }
      }

      setQuestions(randomQuestions);
      setLoading(false);
      startTimer();
      setupSocketConnection();
    } catch (error) {
      console.error('게임 초기화 오류:', error);
      Alert.alert('오류', '게임을 시작할 수 없습니다.');
      navigate('Home');
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  // Socket.io 연결 및 이벤트 리스너 설정
  const setupSocketConnection = () => {
    let socket = getSocket();
    
    // Socket이 없거나 연결이 끊어졌으면 재연결 시도
    if (!socket || !socket.connected) {
      console.warn('[RealtimeMatchGame] Socket이 연결되지 않음, 재연결 시도');
      socket = connectSocket();
      
         // 재연결 대기
         socket.on('connect', () => {
           console.log('[RealtimeMatchGame] Socket 재연결 성공:', socket?.id);
           socketRef.current = socket;
           
           // 서버에 재연결 알림 및 Socket ID 업데이트 요청
           if (socket && currentUser && initialMatchId) {
             console.log('[RealtimeMatchGame] 재연결 알림 전송:', {
               matchId: initialMatchId,
               userId: currentUser.id,
             });
             socket.emit('reconnect-match', {
               matchId: initialMatchId,
               userId: currentUser.id,
             });
           }
           
           if (socket) {
             setupSocketListeners(socket);
           }
         });
      
      // 재연결 실패 시 시뮬레이션 모드
      socket.on('connect_error', () => {
        console.warn('[RealtimeMatchGame] Socket 재연결 실패, 시뮬레이션 모드로 전환');
        simulateOpponentProgress();
      });
      
      return;
    }

    socketRef.current = socket;
    setupSocketListeners(socket);
  };

  // Socket 이벤트 리스너 설정
  const setupSocketListeners = (socket: any) => {
    // 기존 이벤트 리스너 제거 (중복 방지)
    socket.off('opponent-progress');
    socket.off('opponent-finished');
    socket.off('opponent-disconnected');
    socket.off('opponent-surrendered');
    socket.off('both-finished');
    
    // 상대방 진행 상황 받기
    socket.on('opponent-progress', (data: { progress: number; correctCount?: number }) => {
      console.log('[RealtimeMatchGame] ===== opponent-progress 이벤트 수신 =====', data);
      const newProgress = data.progress;
      setOpponentProgress(newProgress);
      opponentProgressRef.current = newProgress;
      
      if (data.correctCount !== undefined) {
        setOpponentCorrectCount(data.correctCount);
      }
      
      // 상대방이 10문제를 다 풀었는지 확인
      if (newProgress >= 10) {
        console.log('[RealtimeMatchGame] opponent-progress: 상대방이 10문제 완료');
        if (!opponentFinished) {
          console.log('[RealtimeMatchGame] opponentFinished를 true로 설정 (opponent-progress)');
          setOpponentFinished(true);
        }
        // finishTime이 없으면 현재 시간으로 설정
        if (opponentFinishTime === null) {
          setOpponentFinishTime(Date.now());
        }
        
        // 사용자도 끝났는지 확인하고 결과 비교
        const userProgressCheck = userProgressRef.current >= 10;
        if (userProgressCheck || userFinished) {
          console.log('[RealtimeMatchGame] opponent-progress: 둘 다 끝남, 결과 비교 시도');
          setTimeout(() => {
            compareResults();
          }, 1000);
        }
      }
    });

    // 상대방이 게임 종료
    socket.on('opponent-finished', (data: { 
      result?: 'win' | 'lose' | 'draw';
      isWinner?: boolean; // 하위 호환성
      timeElapsed: number; 
      progress: number;
      correctCount?: number;
      finishTime?: number;
    }) => {
      console.log('[RealtimeMatchGame] opponent-finished 이벤트 수신:', data);
      
      setOpponentProgress(data.progress);
      opponentProgressRef.current = data.progress;
      
      if (data.correctCount !== undefined) {
        setOpponentCorrectCount(data.correctCount);
      }
      
      if (data.finishTime !== undefined) {
        setOpponentFinishTime(data.finishTime);
      }
      
      // 상대방이 10문제를 다 풀었는지 확인
      if (data.progress >= 10) {
        console.log('[RealtimeMatchGame] opponent-finished: 상대방이 10문제 완료');
        if (!opponentFinished) {
          console.log('[RealtimeMatchGame] opponentFinished를 true로 설정 (opponent-finished)');
          setOpponentFinished(true);
        }
        if (data.finishTime === undefined && opponentFinishTime === null) {
          setOpponentFinishTime(Date.now());
        } else if (data.finishTime !== undefined) {
          setOpponentFinishTime(data.finishTime);
        }
        
        // 사용자도 끝났는지 확인하고 결과 비교
        const userProgressCheck = userProgressRef.current >= 10;
        if (userProgressCheck || userFinished) {
          console.log('[RealtimeMatchGame] opponent-finished: 둘 다 끝남, 결과 비교 시도');
          setTimeout(() => {
            compareResults();
          }, 1000);
        }
      }
      
      // 상대방이 끝났고, 사용자도 끝났으면 결과 비교
      if (userFinished && userFinishTime !== null && data.progress >= 10) {
        console.log('[RealtimeMatchGame] opponent-finished: 둘 다 끝남, 결과 비교 시작');
        // compareResults는 useEffect에서 호출되므로 여기서는 상태만 업데이트
      }
    });

    // 서버에서 "둘 다 끝남" 이벤트 수신
    socket.on('both-finished', (data: {
      matchId: string;
      myProgress: { progress: number; correctCount: number; finishTime: number | null; finished: boolean };
      opponentProgress: { progress: number; correctCount: number; finishTime: number | null; finished: boolean };
    }) => {
      console.log('[RealtimeMatchGame] ===== both-finished 이벤트 수신 =====');
      console.log('[RealtimeMatchGame] 데이터:', JSON.stringify(data, null, 2));
      console.log('[RealtimeMatchGame] 현재 isFinished:', isFinished);
      
      if (isFinished) {
        console.log('[RealtimeMatchGame] both-finished: 이미 게임 종료됨, 무시');
        return;
      }
      
      // 서버에서 확인된 상대방 진행 상황으로 상태 업데이트
      if (data.opponentProgress.finished) {
        console.log('[RealtimeMatchGame] both-finished: 상대방 진행 상황 업데이트');
        setOpponentProgress(data.opponentProgress.progress);
        opponentProgressRef.current = data.opponentProgress.progress;
        setOpponentCorrectCount(data.opponentProgress.correctCount);
        if (data.opponentProgress.finishTime !== null) {
          setOpponentFinishTime(data.opponentProgress.finishTime);
        }
        setOpponentFinished(true);
      }
      
      // 사용자 진행 상황도 서버 데이터로 동기화 (안전장치)
      if (data.myProgress.finished) {
        console.log('[RealtimeMatchGame] both-finished: 사용자 진행 상황 업데이트');
        setUserFinished(true);
        if (data.myProgress.finishTime !== null && userFinishTime === null) {
          setUserFinishTime(data.myProgress.finishTime);
        }
        setUserCorrectCount(data.myProgress.correctCount);
        userProgressRef.current = data.myProgress.progress;
      }
      
      // 서버 데이터로 직접 결과 계산
      const myCorrectCount = data.myProgress.correctCount;
      const opponentCorrectCount = data.opponentProgress.correctCount;
      const myFinishTime = data.myProgress.finishTime || Date.now();
      const opponentFinishTime = data.opponentProgress.finishTime || Date.now();
      
      console.log('[RealtimeMatchGame] both-finished: 결과 계산 시작', {
        myCorrectCount,
        opponentCorrectCount,
        myFinishTime,
        opponentFinishTime,
      });
      
      let result: 'win' | 'lose' | 'draw' = 'draw';
      
      // 1. 정답 개수 비교
      if (myCorrectCount > opponentCorrectCount) {
        result = 'win';
      } else if (myCorrectCount < opponentCorrectCount) {
        result = 'lose';
      } else {
        // 2. 정답 개수가 같으면 시간 비교
        if (myFinishTime < opponentFinishTime) {
          result = 'win';
        } else if (myFinishTime > opponentFinishTime) {
          result = 'lose';
        } else {
          // 3. 정답 개수와 시간이 모두 같으면 무승부
          result = 'draw';
        }
      }
      
      console.log('[RealtimeMatchGame] both-finished: 결과 결정:', result);
      
      // 상태 업데이트 후 finishGame 호출
      setTimeout(() => {
        console.log('[RealtimeMatchGame] both-finished: finishGame 호출, result:', result);
        finishGame(result);
      }, 500);
    });

    // 상대방 기권
    socket.on('opponent-surrendered', () => {
      console.log('[RealtimeMatchGame] 상대방이 기권함');
      setOpponentSurrendered(true);
      // 기권 시 자동 승리 처리
      if (!isFinished) {
        finishGame('win'); // 상대방이 기권했으므로 승리 처리
      }
    });

    // 상대방 연결 끊김
    socket.on('opponent-disconnected', () => {
      Alert.alert('알림', '상대방이 연결을 끊었습니다.');
      finishGame('win'); // 상대방이 나갔으므로 승리 처리
    });
  };

  // 상대방 진행 상황 시뮬레이션 (Socket.io 연결 실패 시 사용)
  const simulateOpponentProgress = () => {
    // 상대방이 랜덤한 시간에 문제를 풀도록 시뮬레이션
    opponentTimerRef.current = setInterval(() => {
      if (isFinished || hasSurrendered || opponentProgressRef.current >= 10) {
        return;
      }
      
      // 상대방이 아직 게임 중이고, 랜덤하게 문제를 풀도록 시뮬레이션
      if (Math.random() > 0.6) {
        const newProgress = opponentProgressRef.current + 1;
        setOpponentProgress(newProgress);
        opponentProgressRef.current = newProgress;
        
        // 상대방이 먼저 10문제를 다 풀었지만, 사용자가 아직 안 끝났으면 대기
        // 사용자가 끝나면 compareResults에서 처리
      }
    }, 1500 + Math.random() * 2500); // 1.5-4초마다 랜덤하게 문제 해결
  };

  const handleAnswerSelect = (answer: string) => {
    if (isFinished || hasSurrendered) return;
    
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || isFinished || hasSurrendered) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;
    
    // 정답이면 정답 개수 증가
    if (isCorrect) {
      setUserCorrectCount(prev => prev + 1);
    }

    // 문제를 풀면 진행도 증가
    const newProgress = userProgress + 1;
    setUserProgress(newProgress);
    userProgressRef.current = newProgress;

    // Socket.io로 진행 상황 전송 (정답 개수 포함)
    const finalCorrectCount = userCorrectCount + (isCorrect ? 1 : 0);
    if (socketRef.current && socketRef.current.connected && initialMatchId) {
      console.log('[RealtimeMatchGame] game-progress 전송:', {
        matchId: initialMatchId,
        progress: newProgress,
        correctCount: finalCorrectCount,
        socketConnected: socketRef.current.connected,
      });
      socketRef.current.emit('game-progress', {
        matchId: initialMatchId,
        progress: newProgress,
        correctCount: finalCorrectCount,
      });
    } else {
      console.warn('[RealtimeMatchGame] game-progress 전송 실패:', {
        socketExists: !!socketRef.current,
        socketConnected: socketRef.current?.connected,
        matchId: initialMatchId,
      });
    }

    // 10문제를 모두 풀었는지 확인
    if (newProgress >= 10 && !userFinished) {
      const finishTime = Date.now();
      const finalCorrectCount = userCorrectCount + (isCorrect ? 1 : 0);
      
      console.log('[RealtimeMatchGame] 사용자가 10문제 완료', {
        correctCount: finalCorrectCount,
        finishTime,
      });
      
      setUserFinishTime(finishTime);
      setUserFinished(true);
      
      // Socket.io로 게임 종료 전송 (결과는 아직 결정되지 않음)
      if (socketRef.current && socketRef.current.connected && initialMatchId && currentUser) {
        // 기존 game-finished 이벤트도 유지 (하위 호환성)
        console.log('[RealtimeMatchGame] ===== game-finished 전송 =====', {
          matchId: initialMatchId,
          result: 'pending',
          timeElapsed,
          progress: newProgress,
          correctCount: finalCorrectCount,
          finishTime: finishTime,
          socketConnected: socketRef.current.connected,
        });
        socketRef.current.emit('game-finished', {
          matchId: initialMatchId,
          result: 'pending', // 결과는 나중에 비교
          timeElapsed,
          progress: newProgress,
          correctCount: finalCorrectCount,
          finishTime: finishTime,
        });

        // 데이터베이스 기반 player-finished 이벤트 전송
        // 서버에서 userId로 player1인지 player2인지 판단
        console.log('[RealtimeMatchGame] ===== player-finished 전송 =====', {
          matchId: initialMatchId,
          userId: currentUser.id,
        });
        socketRef.current.emit('player-finished', {
          matchId: initialMatchId,
          userId: currentUser.id,
        });
      } else {
        console.warn('[RealtimeMatchGame] game-finished 전송 실패:', {
          socketExists: !!socketRef.current,
          socketConnected: socketRef.current?.connected,
          matchId: initialMatchId,
          currentUser: !!currentUser,
        });
      }
      
      // 상대방도 이미 끝났는지 확인
      if (opponentFinished && opponentFinishTime !== null) {
        console.log('[RealtimeMatchGame] 둘 다 끝남 (사용자 완료 시점), 결과 비교 시작');
        // 둘 다 끝났으면 결과 비교
        setTimeout(() => {
          compareResults();
        }, 500);
      } else {
        console.log('[RealtimeMatchGame] 상대방 대기 중', {
          opponentFinished,
          opponentFinishTime,
        });
      }
      // 상대방이 아직 안 끝났으면 대기 (opponent-finished 또는 opponent-progress 이벤트에서 처리)
      return;
    }

    // 다음 문제로
    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    }
  };

  // compareResults와 finishGame은 이미 위에서 useCallback으로 정의됨 (중복 제거)

  const handleSurrender = () => {
    if (isFinished) return;

    // 상대방이 이미 기권했으면 나가기 버튼으로 동작
    if (opponentSurrendered) {
      navigate('Home');
      return;
    }

    Alert.alert(
      '기권',
      '기권하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '기권',
          style: 'destructive',
          onPress: () => {
            setHasSurrendered(true);
            
            // Socket.io로 기권 알림 전송
            if (socketRef.current && socketRef.current.connected && initialMatchId) {
              socketRef.current.emit('surrender', {
                matchId: initialMatchId,
              });
            }
            
            finishGame('lose'); // 기권은 패배
          },
        },
      ]
    );
  };

  const handleRematch = () => {
    navigate('Matching');
  };

  const handleGoHome = () => {
    navigate('Home');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>게임 준비 중...</Text>
        </View>
      </View>
    );
  }

  if (isFinished) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.resultContainer}>
          <Text style={[
            styles.resultTitle, 
            gameResult === 'win' ? styles.winTitle : 
            gameResult === 'lose' ? styles.loseTitle : 
            styles.drawTitle
          ]}>
            {gameResult === 'win' ? '승리' : 
             gameResult === 'lose' ? '패배' : 
             '무승부'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {gameResult === 'win'
              ? '축하합니다! 정답 개수가 더 많거나 시간이 더 빠릅니다!'
              : gameResult === 'lose'
              ? hasSurrendered
                ? '기권하셨습니다.'
                : '상대방이 정답 개수가 더 많거나 시간이 더 빠릅니다.'
              : '정답 개수와 시간이 모두 같습니다.'}
          </Text>
          <Text style={styles.resultTime}>소요 시간: {formatTime(timeElapsed)}</Text>
          <Text style={styles.resultProgress}>
            내 정답: {userCorrectCount}/10
          </Text>
          <Text style={styles.resultProgress}>
            상대방 정답: {opponentCorrectCount}/10
          </Text>
          {newRating !== null && (
            <>
              <Text style={styles.ratingInfo}>
                레이팅 변화: {ratingChange > 0 ? '+' : ''}{ratingChange}점
              </Text>
              <Text style={styles.ratingInfo}>
                총 레이팅: {newRating}점
              </Text>
            </>
          )}
          
          <View style={styles.resultButtonContainer}>
            <TouchableOpacity
              style={[styles.resultButton, styles.rematchButton]}
              onPress={handleRematch}
              activeOpacity={0.7}
            >
              <Text style={styles.resultButtonText}>다시하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resultButton, styles.homeButton]}
              onPress={handleGoHome}
              activeOpacity={0.7}
            >
              <Text style={styles.homeButtonText}>홈으로</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const remainingQuestions = 10 - userProgress;
  const userFinishedAllQuestions = userProgress >= 10;
  const opponentFinishedAllQuestions = opponentProgress >= 10;

  // 먼저 문제를 다 푼 사람만 대기 화면 표시
  // 사용자가 먼저 끝났고 상대방이 아직 안 끝났으면 대기 화면 표시
  // (나중에 끝난 사람은 대기 화면을 건너뛰고 바로 결과 화면으로)
  if (userFinishedAllQuestions && !opponentFinishedAllQuestions && !isFinished) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* 상단: 사용자 정보 */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser?.nickname?.[0]?.toUpperCase() || '👤'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userNickname}>{currentUser?.nickname || '나'}</Text>
              <Text style={styles.userProgress}>완료</Text>
            </View>
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {formatTime(userFinished ? (finalTimeElapsed ?? timeElapsed) : timeElapsed)}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <View style={styles.userDetails}>
              <Text style={[styles.userNickname, styles.opponentNickname]}>
                {opponent?.nickname || '상대방'}
              </Text>
              <Text style={styles.userProgress}>
                {opponentFinished ? '완료' : `${10 - opponentProgress}문제 남음`}
              </Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {opponent?.nickname?.[0]?.toUpperCase() || '👤'}
              </Text>
            </View>
          </View>
        </View>

        {/* 대기 화면 */}
        <View style={styles.waitingScreen}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.waitingScreenTitle}>상대방을 기다리는 중...</Text>
          <Text style={styles.waitingScreenSubtitle}>
            상대방이 문제를 다 풀 때까지 기다려주세요
          </Text>
          
          {/* 기권 버튼 */}
          <TouchableOpacity
            style={[styles.surrenderButtonWaiting, opponentSurrendered && styles.exitButton]}
            onPress={handleSurrender}
            activeOpacity={0.7}
          >
            <Text style={styles.surrenderButtonText}>
              {opponentSurrendered ? '나가기' : '기권'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 상단: 사용자 정보 */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser?.nickname?.[0]?.toUpperCase() || '👤'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userNickname}>{currentUser?.nickname || '나'}</Text>
            <Text style={styles.userProgress}>
              {userFinished ? '완료' : `${remainingQuestions}문제 남음`}
            </Text>
          </View>
        </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {formatTime(userFinished ? (finalTimeElapsed ?? timeElapsed) : timeElapsed)}
            </Text>
          </View>

        <View style={styles.userInfo}>
          <View style={styles.userDetails}>
            <Text style={[styles.userNickname, styles.opponentNickname]}>
              {opponent?.nickname || '상대방'}
            </Text>
            <Text style={styles.userProgress}>
              {opponentFinished ? '완료' : `${10 - opponentProgress}문제 남음`}
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {opponent?.nickname?.[0]?.toUpperCase() || '👤'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.surrenderButton, opponentSurrendered && styles.exitButton]}
          onPress={handleSurrender}
          activeOpacity={0.7}
        >
          <Text style={styles.surrenderButtonText}>
            {opponentSurrendered ? '나가기' : '기권'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 문제 영역 */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>
          문제 {currentQuestionIndex + 1} / {questions.length}
        </Text>
        <Text style={styles.questionText}>{currentQuestion?.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion?.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === option && styles.optionButtonSelected,
              ]}
              onPress={() => handleAnswerSelect(option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedAnswer === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            !selectedAnswer && styles.submitButtonDisabled,
            userProgress === 9 && styles.submitButtonComplete,
          ]}
          onPress={handleSubmitAnswer}
          disabled={!selectedAnswer || userProgress >= 10}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>
            {userProgress === 9 ? '완료' : '다음'}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
  },
  userDetails: {
    flex: 1,
  },
  userNickname: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  opponentNickname: {
    textAlign: 'right',
  },
  userProgress: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  timerContainer: {
    paddingHorizontal: 16,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  surrenderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    marginLeft: 8,
  },
  exitButton: {
    backgroundColor: '#6B7280',
  },
  surrenderButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.white,
  },
  questionContainer: {
    flex: 1,
    padding: 24,
  },
  questionNumber: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0F9FF',
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonComplete: {
    backgroundColor: '#10B981',
  },
  waitingContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  resultTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  winTitle: {
    color: '#10B981',
  },
  loseTitle: {
    color: '#EF4444',
  },
  drawTitle: {
    color: '#F59E0B',
  },
  resultSubtitle: {
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  resultTime: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  resultProgress: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  ratingInfo: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  resultButtonContainer: {
    width: '100%',
    gap: 12,
  },
  resultButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rematchButton: {
    backgroundColor: colors.primary,
  },
  homeButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  waitingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  waitingScreenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  waitingScreenSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  surrenderButtonWaiting: {
    marginTop: 24,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
});

