import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components';
import { colors } from '../utils/colors';
import { getRandomQuizQuestions } from '../utils/quizService';
import { checkSupabaseConnection } from '../utils/supabase';
import { QuizQuestion } from '../types/database';

type NavigateFunction = (screen: string, params?: any) => void;

interface QuizRoomProps {
  navigate: NavigateFunction;
  difficulty?: string;
}

const difficultyNames: { [key: string]: string } = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '상급',
  expert: '최상급',
};

export default function QuizRoom({
  navigate,
  difficulty = 'beginner',
}: QuizRoomProps) {
  const insets = useSafeAreaInsets();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [difficulty]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setErrorMessage(null);
      
      console.log(`[QuizRoom] 난이도 "${difficulty}"로 문제 로딩 시작...`);
      
      // 먼저 Supabase 연결 상태 확인
      const connectionCheck = await checkSupabaseConnection();
      if (!connectionCheck.success) {
        setQuestions([]);
        setErrorMessage(connectionCheck.error || 'Supabase 연결에 실패했습니다.');
        return;
      }
      
      // 난이도에 맞는 문제 10개를 Supabase에서 불러오기
      const loadedQuestions = await getRandomQuizQuestions(10, difficulty);
      
      console.log(`[QuizRoom] 로드된 문제 개수: ${loadedQuestions.length}`);
      
      if (loadedQuestions.length > 0) {
        setQuestions(loadedQuestions);
        setErrorMessage(null);
      } else {
        setQuestions([]);
        setErrorMessage(`난이도 "${difficultyNames[difficulty] || difficulty}"에 해당하는 문제가 데이터베이스에 없습니다.`);
      }
    } catch (error: any) {
      console.error('[QuizRoom] 문제 로딩 오류:', error);
      setQuestions([]);
      
      // 더 자세한 에러 메시지 생성
      if (error?.message) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          setErrorMessage('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
        } else if (error.message.includes('JWT') || error.message.includes('auth')) {
          setErrorMessage('인증 오류가 발생했습니다. Supabase 설정을 확인해주세요.');
        } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
          setErrorMessage('데이터베이스 테이블이 존재하지 않습니다. quiz_questions 테이블을 생성해주세요.');
        } else if (error.code === 'PGRST116') {
          setErrorMessage('quiz_questions 테이블이 존재하지 않습니다. 데이터베이스에 테이블을 생성해주세요.');
        } else {
          setErrorMessage(`데이터베이스 오류: ${error.message}`);
        }
      } else {
        setErrorMessage('문제를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // 모든 문제를 다 풀었을 때
      navigate('Home');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header onProfilePress={() => navigate('Profile')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>문제를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (!loading && questions.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header onProfilePress={() => navigate('Profile')} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>문제를 불러올 수 없습니다</Text>
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : (
            <Text style={styles.errorText}>
              해당 난이도({difficultyNames[difficulty] || difficulty})의 문제가 없거나 데이터베이스 연결에 문제가 있습니다.
            </Text>
          )}
          <Text style={styles.errorSubText}>
            다음을 확인해주세요:{'\n'}
            • Supabase 연결 설정 (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY){'\n'}
            • quiz_questions 테이블이 존재하는지{'\n'}
            • 해당 난이도의 문제가 데이터베이스에 있는지
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadQuestions}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.retryButton, styles.backButton]}
            onPress={() => navigate('DifficultySelection')}
          >
            <Text style={styles.retryButtonText}>난이도 선택으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const isCorrect = selectedAnswer === currentQuestion.answer;
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header onProfilePress={() => navigate('Profile')} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 문제 번호 및 진행도 */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            문제 {currentQuestionIndex + 1} / {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* 상단: 문제 영역 */}
        <View style={styles.questionContainer}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyBadgeText}>
              {difficultyNames[difficulty] || '초급'}
            </Text>
          </View>
          <Text style={styles.questionText}>
            {currentQuestion.question}
          </Text>
        </View>

        {/* 하단: 정답 항목 영역 */}
        <View style={styles.answersContainer}>
          <Text style={styles.answersTitle}>정답을 선택하세요</Text>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectAnswer = option === currentQuestion.answer;
            const showCorrect = showResult && isCorrectAnswer;
            const showIncorrect = showResult && isSelected && !isCorrectAnswer;

            return (
            <TouchableOpacity
                key={index}
                style={[
                  styles.answerButton,
                  isSelected && styles.answerButtonSelected,
                  showCorrect && styles.answerButtonCorrect,
                  showIncorrect && styles.answerButtonIncorrect,
                ]}
                onPress={() => !showResult && handleAnswerSelect(option)}
                activeOpacity={0.7}
                disabled={showResult}
              >
                <Text
                  style={[
                    styles.answerButtonText,
                    isSelected && styles.answerButtonTextSelected,
                    showCorrect && styles.answerButtonTextCorrect,
                    showIncorrect && styles.answerButtonTextIncorrect,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
              </View>

        {/* 결과 표시 및 다음 버튼 */}
        {showResult && (
          <View style={styles.resultContainer}>
            <Text style={[styles.resultText, isCorrect && styles.resultTextCorrect]}>
              {isCorrect ? '✅ 정답입니다!' : '❌ 틀렸습니다'}
            </Text>
            {!isCorrect && (
              <Text style={styles.correctAnswerText}>
                정답: {currentQuestion.answer}
                </Text>
            )}
              <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextQuestion}
                activeOpacity={0.7}
              >
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < questions.length - 1 ? '다음 문제' : '완료'}
              </Text>
            </TouchableOpacity>
        </View>
        )}
      </ScrollView>
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
    paddingBottom: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorSubText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 12,
    backgroundColor: colors.text.secondary,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.white,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.white,
  },
  questionContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    minHeight: 200,
    justifyContent: 'center',
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  difficultyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.white,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 28,
  },
  answersContainer: {
    paddingHorizontal: 16,
  },
  answersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  answerButton: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  answerButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  answerButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
  },
  answerButtonTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  answerButtonCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#10B981' + '20',
  },
  answerButtonIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444' + '20',
  },
  answerButtonTextCorrect: {
    color: '#10B981',
    fontWeight: '600',
  },
  answerButtonTextIncorrect: {
    color: '#EF4444',
    fontWeight: '600',
  },
  resultContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
  },
  resultText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#EF4444',
  },
  resultTextCorrect: {
    color: '#10B981',
  },
  correctAnswerText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.white,
  },
});

