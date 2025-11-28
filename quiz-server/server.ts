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
  },
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

// Socket.io 연결
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

