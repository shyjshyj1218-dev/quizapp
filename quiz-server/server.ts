import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabaseAdmin } from './src/lib/supabase';
import { getRandomQuizQuestions } from './src/services/quizService';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

app.use(cors());
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Quiz Server is running!' });
});

// Supabase 연결 테스트
app.get('/health', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.json({ status: 'ok', supabase: 'not_configured', message: '환경 변수가 설정되지 않았습니다.' });
    }
    // quiz_questions 테이블 연결 테스트
    const { data, error } = await supabaseAdmin.from('quiz_questions').select('*').limit(1);
    if (error) throw error;
    res.json({ status: 'ok', supabase: 'connected', table: 'quiz_questions', count: data?.length || 0 });
  } catch (error: any) {
    res.json({ status: 'ok', supabase: 'error', error: error?.message || 'Unknown error' });
  }
});

// 퀴즈 문제 가져오기 API
app.get('/api/quiz/questions', async (req, res) => {
  try {
    const { difficulty, count } = req.query;
    const questions = await getRandomQuizQuestions(
      count ? parseInt(count as string) : 10,
      difficulty as string | undefined
    );
    res.json({ success: true, questions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 매칭 큐 관리
interface MatchQueueUser {
  socketId: string;
  userId: string;
  nickname: string;
  rating: number;
  profileImage?: string;
}

const matchQueue: MatchQueueUser[] = [];
const activeMatches: Map<string, { 
  player1: MatchQueueUser; 
  player2: MatchQueueUser; 
  questions: any[]; 
  startTime: number;
  player1Progress: { progress: number; correctCount: number; finishTime: number | null; finished: boolean };
  player2Progress: { progress: number; correctCount: number; finishTime: number | null; finished: boolean };
}> = new Map();

// 매칭 함수 (레이팅 기반)
function findMatch(user: MatchQueueUser): MatchQueueUser | null {
  // 레이팅 범위 내의 사용자 찾기 (±50)
  const ratingRange = 50;
  const minRating = user.rating - ratingRange;
  const maxRating = user.rating + ratingRange;

  // 가장 가까운 레이팅의 사용자 찾기
  let bestMatch: MatchQueueUser | null = null;
  let minDiff = Infinity;

  for (const queuedUser of matchQueue) {
    if (queuedUser.userId === user.userId || queuedUser.socketId === user.socketId) {
      continue; // 자기 자신은 제외
    }

    if (queuedUser.rating >= minRating && queuedUser.rating <= maxRating) {
      const diff = Math.abs(queuedUser.rating - user.rating);
      if (diff < minDiff) {
        minDiff = diff;
        bestMatch = queuedUser;
      }
    }
  }

  return bestMatch;
}

// Socket.io 연결
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 재연결 시 매치의 Socket ID 업데이트
  socket.on('reconnect-match', (data: { matchId: string; userId: string }) => {
    console.log(`[Game] 재연결 요청: matchId=${data.matchId}, userId=${data.userId}, newSocketId=${socket.id}`);
    
    // activeMatches에서 해당 matchId를 찾아서 Socket ID 업데이트
    const match = activeMatches.get(data.matchId);
    if (match) {
      // Player1 또는 Player2의 userId로 확인하여 Socket ID 업데이트
      if (match.player1.userId === data.userId) {
        console.log(`[Game] Player1 Socket ID 업데이트: ${match.player1.socketId} -> ${socket.id}`);
        match.player1.socketId = socket.id;
      } else if (match.player2.userId === data.userId) {
        console.log(`[Game] Player2 Socket ID 업데이트: ${match.player2.socketId} -> ${socket.id}`);
        match.player2.socketId = socket.id;
      }
    } else {
      console.log(`[Game] 재연결: 매치를 찾을 수 없음 (matchId: ${data.matchId})`);
      // 데이터베이스에서 매치 정보 복원 시도
      if (supabaseAdmin) {
        supabaseAdmin
          .from('matches')
          .select('*')
          .eq('id', data.matchId)
          .single()
          .then(({ data: matchData, error }) => {
            if (!error && matchData) {
              console.log(`[Game] 데이터베이스에서 매치 복원: ${data.matchId}`);
              // TODO: activeMatches에 복원 (필요시)
            }
          });
      }
    }
  });

  // 플레이어 완료 이벤트 (데이터베이스 기반)
  socket.on('player-finished', async (data: { matchId: string; userId?: string }) => {
    console.log(`[Game] player-finished 이벤트 수신: matchId=${data.matchId}, userId=${data.userId}`);
    
    if (!supabaseAdmin) {
      console.error('[Game] Supabase 클라이언트가 없습니다.');
      return;
    }

    try {
      // 먼저 매치 정보 가져오기
      const { data: matchData, error: fetchError } = await supabaseAdmin
        .from('matches')
        .select('*')
        .eq('id', data.matchId)
        .single();

      if (fetchError || !matchData) {
        console.error(`[Game] 매치 조회 오류:`, fetchError);
        return;
      }

      // userId로 player1인지 player2인지 판단
      let playerId: 'player1' | 'player2';
      let updateField: { player1_finished?: boolean; player2_finished?: boolean };

      if (data.userId) {
        if (matchData.player1_id === data.userId) {
          playerId = 'player1';
          updateField = { player1_finished: true };
        } else if (matchData.player2_id === data.userId) {
          playerId = 'player2';
          updateField = { player2_finished: true };
        } else {
          console.error(`[Game] userId가 매치에 속하지 않음: ${data.userId}`);
          return;
        }
      } else {
        // userId가 없으면 activeMatches에서 확인
        const activeMatch = activeMatches.get(data.matchId);
        if (!activeMatch) {
          console.error(`[Game] activeMatches에서 매치를 찾을 수 없음: ${data.matchId}`);
          return;
        }
        
        if (activeMatch.player1.socketId === socket.id) {
          playerId = 'player1';
          updateField = { player1_finished: true };
        } else if (activeMatch.player2.socketId === socket.id) {
          playerId = 'player2';
          updateField = { player2_finished: true };
        } else {
          console.error(`[Game] socket.id가 매치에 속하지 않음: ${socket.id}`);
          return;
        }
      }

      console.log(`[Game] playerId 결정: ${playerId}`);

      // 데이터베이스에서 매치 업데이트
      const { data: updatedMatch, error: updateError } = await supabaseAdmin
        .from('matches')
        .update(updateField)
        .eq('id', data.matchId)
        .select()
        .single();

      if (updateError) {
        console.error(`[Game] 매치 업데이트 오류:`, updateError);
        return;
      }

      console.log(`[Game] 매치 업데이트 성공:`, updatedMatch);

      // 두 플레이어가 모두 완료했는지 확인
      if (updatedMatch.player1_finished && updatedMatch.player2_finished) {
        console.log(`[Game] ===== 두 플레이어 모두 완료! both-finished 이벤트 전송 =====`);
        
        // 상태를 finished로 업데이트
        await supabaseAdmin
          .from('matches')
          .update({ status: 'finished' })
          .eq('id', data.matchId);

        // activeMatches에서 매치 정보 가져오기
        const activeMatch = activeMatches.get(data.matchId);
        if (activeMatch) {
          const currentPlayerProgress = playerId === 'player1' 
            ? activeMatch.player1Progress 
            : activeMatch.player2Progress;
          const opponentProgress = playerId === 'player1' 
            ? activeMatch.player2Progress 
            : activeMatch.player1Progress;

          // 양쪽 클라이언트에 both-finished 이벤트 전송
          socket.emit('both-finished', {
            matchId: data.matchId,
            myProgress: currentPlayerProgress,
            opponentProgress: opponentProgress,
          });

          const opponent = playerId === 'player1' 
            ? activeMatch.player2 
            : activeMatch.player1;
          
          io.to(opponent.socketId).emit('both-finished', {
            matchId: data.matchId,
            myProgress: opponentProgress,
            opponentProgress: currentPlayerProgress,
          });
        } else {
          // activeMatches에 없으면 모든 클라이언트에게 전송
          io.to(data.matchId).emit('both-finished', {
            matchId: data.matchId,
          });
        }
      }
    } catch (error) {
      console.error(`[Game] player-finished 처리 오류:`, error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // 매칭 큐에서 제거
    const queueIndex = matchQueue.findIndex(u => u.socketId === socket.id);
    if (queueIndex !== -1) {
      matchQueue.splice(queueIndex, 1);
      console.log(`User ${socket.id} removed from match queue`);
    }

    // 활성 매칭에서 제거하고 상대방에게 알림
    for (const [matchId, match] of activeMatches.entries()) {
      if (match.player1.socketId === socket.id || match.player2.socketId === socket.id) {
        const opponent = match.player1.socketId === socket.id ? match.player2 : match.player1;
        io.to(opponent.socketId).emit('opponent-disconnected', { matchId });
        activeMatches.delete(matchId);
        break;
      }
    }
  });

  // 매칭 요청
  socket.on('request-match', async (userData: { userId: string; nickname: string; rating: number; profileImage?: string }) => {
    console.log(`[Match] 매칭 요청: ${userData.nickname} (${userData.rating})`);
    
    const user: MatchQueueUser = {
      socketId: socket.id,
      userId: userData.userId,
      nickname: userData.nickname,
      rating: userData.rating,
      profileImage: userData.profileImage,
    };

    // 이미 큐에 있는지 확인
    const existingIndex = matchQueue.findIndex(u => u.userId === user.userId || u.socketId === socket.id);
    if (existingIndex !== -1) {
      console.log(`[Match] 이미 큐에 있음: ${user.nickname}`);
      return;
    }

    // 매칭 시도
    const opponent = findMatch(user);
    
    if (opponent) {
      // 매칭 성공!
      console.log(`[Match] 매칭 성공: ${user.nickname} vs ${opponent.nickname}`);
      
      // 큐에서 제거
      const opponentIndex = matchQueue.findIndex(u => u.socketId === opponent.socketId);
      if (opponentIndex !== -1) {
        matchQueue.splice(opponentIndex, 1);
      }

      // 랜덤 문제 10개 가져오기
      const questions = await getRandomQuizQuestions(10, undefined);
      
      const matchId = `match_${Date.now()}_${user.userId}_${opponent.userId}`;
      const startTime = Date.now();

      // 매칭 정보 저장 (진행 상황 추적 포함)
      activeMatches.set(matchId, {
        player1: user,
        player2: opponent,
        questions,
        startTime,
        player1Progress: { progress: 0, correctCount: 0, finishTime: null, finished: false },
        player2Progress: { progress: 0, correctCount: 0, finishTime: null, finished: false },
      });

      // 데이터베이스에 매치 생성
      if (supabaseAdmin) {
        try {
          const { error: dbError } = await supabaseAdmin
            .from('matches')
            .insert({
              id: matchId,
              player1_id: user.userId,
              player2_id: opponent.userId,
              player1_finished: false,
              player2_finished: false,
              status: 'playing',
              questions: questions,
              start_time: startTime,
            });
          
          if (dbError) {
            console.error(`[Match] 데이터베이스 매치 생성 오류:`, dbError);
          } else {
            console.log(`[Match] 데이터베이스에 매치 생성: ${matchId}`);
          }
        } catch (error) {
          console.error(`[Match] 데이터베이스 매치 생성 예외:`, error);
        }
      }

      // 두 사용자에게 매칭 성공 알림
      socket.emit('match-found', {
        matchId,
        opponent: {
          id: opponent.userId,
          nickname: opponent.nickname,
          rating: opponent.rating,
          profile_image: opponent.profileImage,
        },
        questions,
        startTime,
      });

      io.to(opponent.socketId).emit('match-found', {
        matchId,
        opponent: {
          id: user.userId,
          nickname: user.nickname,
          rating: user.rating,
          profile_image: user.profileImage,
        },
        questions,
        startTime,
      });
    } else {
      // 매칭 실패 - 큐에 추가
      matchQueue.push(user);
      console.log(`[Match] 큐에 추가: ${user.nickname} (큐 크기: ${matchQueue.length})`);
      socket.emit('match-queued', { queueSize: matchQueue.length });
    }
  });

  // 매칭 취소
  socket.on('cancel-match', () => {
    const queueIndex = matchQueue.findIndex(u => u.socketId === socket.id);
    if (queueIndex !== -1) {
      matchQueue.splice(queueIndex, 1);
      console.log(`[Match] 매칭 취소: ${socket.id}`);
      socket.emit('match-cancelled');
    }
  });

  // 게임 진행 상황 업데이트
  socket.on('game-progress', (data: { matchId: string; progress: number; correctCount?: number }) => {
    const match = activeMatches.get(data.matchId);
    if (!match) {
      console.log(`[Game] game-progress: 매치를 찾을 수 없음 (matchId: ${data.matchId})`);
      return;
    }

    const isPlayer1 = match.player1.socketId === socket.id;
    const currentPlayerProgress = isPlayer1 ? match.player1Progress : match.player2Progress;
    const opponent = isPlayer1 ? match.player2 : match.player1;

    console.log(`[Game] game-progress 수신: ${isPlayer1 ? 'Player1' : 'Player2'} progress=${data.progress}, correctCount=${data.correctCount}`);

    // 진행 상황 업데이트
    currentPlayerProgress.progress = data.progress;
    if (data.correctCount !== undefined) {
      currentPlayerProgress.correctCount = data.correctCount;
    }

    // 상대방에게 진행 상황 전송
    console.log(`[Game] opponent-progress 전송: ${opponent.socketId}에게 progress=${data.progress} 전송`);
    io.to(opponent.socketId).emit('opponent-progress', {
      progress: data.progress,
      correctCount: data.correctCount,
    });
  });

  // 기권 처리
  socket.on('surrender', (data: { matchId: string }) => {
    const match = activeMatches.get(data.matchId);
    if (!match) return;

    const opponent = match.player1.socketId === socket.id ? match.player2 : match.player1;
    
    // 상대방에게 기권 알림
    io.to(opponent.socketId).emit('opponent-surrendered');
    
    console.log(`[Match] User ${socket.id} surrendered, opponent: ${opponent.socketId}`);
  });

  // 게임 종료
  socket.on('game-finished', (data: { 
    matchId: string; 
    result: 'win' | 'lose' | 'draw' | 'pending';
    timeElapsed: number; 
    progress: number;
    correctCount?: number;
    finishTime?: number;
  }) => {
    console.log(`[Game] ===== game-finished 이벤트 수신 =====`);
    console.log(`[Game] matchId: ${data.matchId}, progress: ${data.progress}, result: ${data.result}`);
    const match = activeMatches.get(data.matchId);
    if (!match) {
      console.log(`[Game] game-finished: 매치를 찾을 수 없음 (matchId: ${data.matchId})`);
      console.log(`[Game] 현재 활성 매치 수: ${activeMatches.size}`);
      return;
    }
    console.log(`[Game] game-finished: 매치 찾음, Player1: ${match.player1.socketId}, Player2: ${match.player2.socketId}`);

    const isPlayer1 = match.player1.socketId === socket.id;
    const currentPlayerProgress = isPlayer1 ? match.player1Progress : match.player2Progress;
    const opponentProgress = isPlayer1 ? match.player2Progress : match.player1Progress;
    const opponent = isPlayer1 ? match.player2 : match.player1;

    // 현재 플레이어의 진행 상황 업데이트
    currentPlayerProgress.progress = data.progress;
    if (data.correctCount !== undefined) {
      currentPlayerProgress.correctCount = data.correctCount;
    }
    if (data.finishTime !== undefined) {
      currentPlayerProgress.finishTime = data.finishTime;
    }
    
    // 플레이어가 10문제를 다 풀었는지 확인
    if (data.progress >= 10) {
      currentPlayerProgress.finished = true;
      console.log(`[Game] ${isPlayer1 ? 'Player1' : 'Player2'} finished all questions (matchId: ${data.matchId})`);
    }

    // 상대방에게 게임 종료 알림
    // result가 'pending'이면 상대방에게도 'pending'으로 전달 (결과 비교는 클라이언트에서)
    io.to(opponent.socketId).emit('opponent-finished', {
      result: data.result === 'pending' ? 'pending' : 
              data.result === 'win' ? 'lose' : 
              data.result === 'lose' ? 'win' : 'draw',
      timeElapsed: data.timeElapsed,
      progress: data.progress,
      correctCount: data.correctCount,
      finishTime: data.finishTime,
    });

    // 두 플레이어가 모두 끝났는지 확인
    console.log(`[Game] game-finished: Player1 finished=${match.player1Progress.finished}, Player2 finished=${match.player2Progress.finished}`);
    if (match.player1Progress.finished && match.player2Progress.finished) {
      console.log(`[Game] ===== Both players finished! Sending both-finished event (matchId: ${data.matchId}) =====`);
      
      // 현재 플레이어의 진행 상황과 상대방의 진행 상황을 구분해서 전송
      const currentPlayerProgress = isPlayer1 ? match.player1Progress : match.player2Progress;
      const opponentPlayerProgress = isPlayer1 ? match.player2Progress : match.player1Progress;
      
      console.log(`[Game] Player1: progress=${match.player1Progress.progress}, correctCount=${match.player1Progress.correctCount}, finishTime=${match.player1Progress.finishTime}`);
      console.log(`[Game] Player2: progress=${match.player2Progress.progress}, correctCount=${match.player2Progress.correctCount}, finishTime=${match.player2Progress.finishTime}`);
      
      // 현재 플레이어에게 전송
      console.log(`[Game] both-finished 전송: ${socket.id}에게 전송`);
      socket.emit('both-finished', {
        matchId: data.matchId,
        myProgress: currentPlayerProgress,
        opponentProgress: opponentPlayerProgress,
      });
      
      // 상대방에게 전송 (역으로)
      console.log(`[Game] both-finished 전송: ${opponent.socketId}에게 전송`);
      io.to(opponent.socketId).emit('both-finished', {
        matchId: data.matchId,
        myProgress: opponentPlayerProgress,
        opponentProgress: currentPlayerProgress,
      });
    } else {
      console.log(`[Game] 아직 둘 다 끝나지 않음. Player1: ${match.player1Progress.finished}, Player2: ${match.player2Progress.finished}`);
    }

    // result가 'pending'이 아닐 때만 매칭 정보 삭제
    if (data.result !== 'pending') {
      setTimeout(() => {
        activeMatches.delete(data.matchId);
      }, 60000); // 1분 후 삭제
    }
  });

  // 퀴즈 방 참여
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // 퀴즈 방 나가기
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// 모든 네트워크 인터페이스에서 접근 가능하도록 0.0.0.0으로 바인딩
// 모바일 기기에서도 접근 가능하도록 설정
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 모바일 기기 접속 주소: http://192.168.219.102:${PORT}`);
});

