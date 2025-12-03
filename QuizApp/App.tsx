import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import Home from './src/screens/Home';
import Auth from './src/screens/Auth';
import Profile from './src/screens/Profile';
import QuizRoom from './src/screens/QuizRoom';
import DifficultySelection from './src/screens/DifficultySelection';
import ChallengeQuiz from './src/screens/ChallengeQuiz';
import Matching from './src/screens/Matching';
import RealtimeMatchGame from './src/screens/RealtimeMatchGame';
import Mission from './src/screens/Mission';
import Ranking from './src/screens/Ranking';
import Shop from './src/screens/Shop';
import QuizGame from './src/screens/QuizGame';
import EmailLogin from './src/screens/EmailLogin';
import GoogleLogin from './src/screens/GoogleLogin';
import NaverLogin from './src/screens/NaverLogin';
import NicknameSetup from './src/screens/NicknameSetup';
import { getSession, getUserNickname, getCurrentUser } from './src/utils/authService';
import { supabase } from './src/utils/supabase';
import { colors } from './src/utils/colors';

type Screen =
  | 'Auth'
  | 'Home'
  | 'Profile'
  | 'QuizRoom'
  | 'DifficultySelection'
  | 'ChallengeQuiz'
  | 'Matching'
  | 'RealtimeMatchGame'
  | 'Mission'
  | 'Ranking'
  | 'Shop'
  | 'QuizGame'
  | 'EmailLogin'
  | 'GoogleLogin'
  | 'NaverLogin'
  | 'NicknameSetup';

type Tab = 'home' | 'mission' | 'challenge' | 'ranking' | 'shop';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Auth');
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [screenParams, setScreenParams] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasNickname, setHasNickname] = useState(false);
  const [userNickname, setUserNickname] = useState<string>('사용자');
  const [userCoins, setUserCoins] = useState<number>(0);
  const [userTickets, setUserTickets] = useState<number>(0);

  useEffect(() => {
    // 네비게이션 바 표시
    NavigationBar.setVisibilityAsync('visible');
    
    // 로그인 상태 확인
    checkAuthStatus();

    // Supabase 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[App] 인증 상태 변경:', event, session ? '로그인됨' : '로그아웃됨');
      
      if (session) {
        setIsAuthenticated(true);
        // 닉네임 확인
        const nickname = await getUserNickname();
        setHasNickname(!!nickname);
        
        // 사용자 정보 가져오기 (닉네임, coins, tickets 포함)
        const currentUser = await getCurrentUser();
        if (currentUser) {
          // 닉네임 설정
          if (nickname) {
            setUserNickname(nickname);
          } else if (currentUser.email) {
            const tempNickname = currentUser.email.split('@')[0];
            setUserNickname(tempNickname);
          }
          
          // coins와 tickets 설정
          setUserCoins(currentUser.coins ?? 0);
          setUserTickets(currentUser.tickets ?? 0);
        }
        
        // 함수형 업데이트를 사용하여 최신 currentScreen 값 확인
        setCurrentScreen((prevScreen) => {
          if (prevScreen === 'Auth' || prevScreen === 'EmailLogin' || prevScreen === 'GoogleLogin' || prevScreen === 'NaverLogin') {
            // 닉네임이 없어도 Home으로 이동 (임시 닉네임 표시)
            return 'Home';
          }
          return prevScreen;
        });
      } else {
        setIsAuthenticated(false);
        setHasNickname(false);
        setUserNickname('사용자');
        setUserCoins(0);
        setUserTickets(0);
        setCurrentScreen((prevScreen) => {
          if (prevScreen !== 'Auth' && prevScreen !== 'EmailLogin' && prevScreen !== 'GoogleLogin' && prevScreen !== 'NaverLogin') {
            return 'Auth';
          }
          return prevScreen;
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const session = await getSession();
      if (session) {
        setIsAuthenticated(true);
        // 닉네임 확인
        const nickname = await getUserNickname();
        setHasNickname(!!nickname);
        
        // 사용자 정보 가져오기 (닉네임, coins, tickets 포함)
        const currentUser = await getCurrentUser();
        if (currentUser) {
          // 닉네임 설정
          if (nickname) {
            setUserNickname(nickname);
          } else if (currentUser.email) {
            const tempNickname = currentUser.email.split('@')[0];
            setUserNickname(tempNickname);
          }
          
          // coins와 tickets 설정
          setUserCoins(currentUser.coins ?? 0);
          setUserTickets(currentUser.tickets ?? 0);
        }
        
        // 닉네임이 없어도 Home으로 이동 (임시 닉네임 표시)
        setCurrentScreen('Home');
      } else {
        setIsAuthenticated(false);
        setHasNickname(false);
        setUserNickname('사용자');
        setUserCoins(0);
        setUserTickets(0);
        setCurrentScreen('Auth');
      }
    } catch (error) {
      console.error('인증 상태 확인 오류:', error);
      setIsAuthenticated(false);
      setHasNickname(false);
      setUserNickname('사용자');
      setUserCoins(0);
      setUserTickets(0);
      setCurrentScreen('Auth');
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = async (screen: Screen | string, params?: any) => {
    // 로그인 화면으로 이동하는 경우
    if (screen === 'Auth' || screen === 'EmailLogin' || screen === 'GoogleLogin' || screen === 'NaverLogin') {
      setScreenParams(params || {});
      setCurrentScreen(screen as Screen);
      return;
    }

    // 로그인하지 않은 상태에서 다른 화면 접근 시도 시
    // 세션을 다시 확인 (onAuthStateChange가 아직 트리거되지 않았을 수 있음)
    if (!isAuthenticated && screen !== 'Auth') {
      const session = await getSession();
      if (session) {
        // 세션이 있으면 인증 상태 업데이트
        setIsAuthenticated(true);
        const nickname = await getUserNickname();
        setHasNickname(!!nickname);
        
        // Home으로 이동하려는 경우
        if (screen === 'Home') {
          // 닉네임이 없어도 Home으로 이동 (임시 닉네임 표시)
          if (!nickname) {
            const currentUser = await getCurrentUser();
            if (currentUser?.email) {
              const tempNickname = currentUser.email.split('@')[0];
              setUserNickname(tempNickname);
            }
          } else {
            setUserNickname(nickname);
          }
          setCurrentScreen('Home');
          return;
        }
      } else {
        setCurrentScreen('Auth');
        return;
      }
    }

    // Home으로 이동할 때마다 사용자 정보 업데이트 (닉네임, coins, tickets)
    if (screen === 'Home' && isAuthenticated) {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const nickname = await getUserNickname();
        if (nickname) {
          setUserNickname(nickname);
          setHasNickname(true);
        } else if (currentUser.email) {
          const tempNickname = currentUser.email.split('@')[0];
          setUserNickname(tempNickname);
        }
        
        // coins와 tickets 업데이트
        setUserCoins(currentUser.coins ?? 0);
        setUserTickets(currentUser.tickets ?? 0);
      }
    }

    // 닉네임 설정 완료 후 Home으로 이동하는 경우
    if (screen === 'Home' && currentScreen === 'NicknameSetup') {
      setHasNickname(true);
    }

    // 로그인은 했지만 닉네임이 없는 경우 (임시 닉네임 사용)
    if (isAuthenticated && !hasNickname && screen !== 'Home') {
      // 닉네임 다시 확인
      const nickname = await getUserNickname();
      if (!nickname) {
        // 이메일 앞부분을 임시 닉네임으로 사용
        const currentUser = await getCurrentUser();
        if (currentUser?.email) {
          const tempNickname = currentUser.email.split('@')[0];
          setUserNickname(tempNickname);
        }
      } else {
        setUserNickname(nickname);
        setHasNickname(true);
      }
    }

    setScreenParams(params || {});
    setCurrentScreen(screen as Screen);
  };

  // 로그인 성공 후 호출
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentScreen('Home');
  };

  const handleTabChange = (tab: Tab) => {
    setCurrentTab(tab);
    if (tab === 'home') setCurrentScreen('Home');
    else if (tab === 'mission') setCurrentScreen('Mission');
    else if (tab === 'challenge') setCurrentScreen('ChallengeQuiz');
    else if (tab === 'ranking') setCurrentScreen('Ranking');
    else if (tab === 'shop') setCurrentScreen('Shop');
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Auth':
        return <Auth navigate={navigate} />;
      case 'EmailLogin':
        return <EmailLogin navigate={navigate} />;
      case 'GoogleLogin':
        return <GoogleLogin navigate={navigate} />;
      case 'NaverLogin':
        return <NaverLogin navigate={navigate} />;
      case 'NicknameSetup':
        return <NicknameSetup navigate={navigate} />;
      case 'Home':
        return (
          <Home
            navigate={navigate}
            currentTab={currentTab}
            onTabChange={handleTabChange}
            userNickname={userNickname}
            userCoins={userCoins}
            userTickets={userTickets}
          />
        );
      case 'Profile':
        return <Profile navigate={navigate} />;
      case 'DifficultySelection':
        return (
          <DifficultySelection
            navigate={navigate}
            currentTab={currentTab}
            onTabChange={handleTabChange}
          />
        );
      case 'QuizRoom':
        return (
          <QuizRoom
            navigate={navigate}
            difficulty={screenParams?.difficulty}
          />
        );
      case 'ChallengeQuiz':
        return (
          <ChallengeQuiz
            navigate={navigate}
            currentTab={currentTab}
            onTabChange={handleTabChange}
          />
        );
      case 'Matching':
        return <Matching navigate={navigate} />;
      case 'RealtimeMatchGame':
        return (
          <RealtimeMatchGame
            navigate={navigate}
            opponent={screenParams?.opponent}
            matchId={screenParams?.matchId}
            questions={screenParams?.questions}
            startTime={screenParams?.startTime}
          />
        );
      case 'Mission':
        return (
          <Mission
            navigate={navigate}
            currentTab={currentTab}
            onTabChange={handleTabChange}
          />
        );
      case 'Ranking':
        return (
          <Ranking
            navigate={navigate}
            currentTab={currentTab}
            onTabChange={handleTabChange}
          />
        );
      case 'Shop':
        return (
          <Shop
            navigate={navigate}
            currentTab={currentTab}
            onTabChange={handleTabChange}
          />
        );
      case 'QuizGame':
        return <QuizGame navigate={navigate} />;
      default:
        // 로그인하지 않은 경우 Auth 화면으로
        if (!isAuthenticated) {
          return <Auth navigate={navigate} />;
        }
        return <Home navigate={navigate} currentTab={currentTab} onTabChange={handleTabChange} />;
    }
  };

  return (
    <SafeAreaProvider>
      {renderScreen()}
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
