// 인증 관련 서비스 함수
import { supabase, supabaseUrl } from './supabase';
import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';

export interface User {
  id: string;
  email?: string;
  nickname?: string;
  profile_image?: string;
  coins?: number;
  tickets?: number;
  rating?: number;
}

/**
 * 현재 로그인된 사용자 정보 가져오기 (users 테이블에서 coins, tickets 포함)
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('[authService] 사용자 정보 가져오기 오류:', error);
      return null;
    }
    
    if (!user) {
      return null;
    }

    // users 테이블에서 추가 정보 가져오기 (coins, tickets, rating 포함)
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('nickname, coins, tickets, profile_image, rating')
      .eq('id', user.id)
      .maybeSingle();

    if (userDataError && userDataError.code !== 'PGRST116') {
      console.warn('[authService] users 테이블 조회 오류 (무시 가능):', userDataError);
    }

    return {
      id: user.id,
      email: user.email,
      nickname: userData?.nickname || user.user_metadata?.nickname || user.email?.split('@')[0] || undefined,
      profile_image: userData?.profile_image || user.user_metadata?.profile_image,
      coins: userData?.coins ?? 0,
      tickets: userData?.tickets ?? 0,
      rating: userData?.rating ?? 1000, // 기본 레이팅 1000
    };
  } catch (error) {
    console.error('[authService] 사용자 정보 가져오기 예외:', error);
    return null;
  }
}

/**
 * 현재 세션 확인
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[authService] 세션 확인 오류:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('[authService] 세션 확인 예외:', error);
    return null;
  }
}

/**
 * 아이디/비밀번호로 로그인
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('[authService] 로그인 오류:', error);
      throw error;
    }
    
    return { success: true, user: data.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 회원가입 (닉네임 없이)
 */
export async function signUpWithEmail(email: string, password: string) {
  try {
    // Supabase Auth에 회원가입
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('[authService] 회원가입 오류:', error);
      throw error;
    }

    // users 테이블에 사용자 정보 추가 (닉네임 없이)
    if (data.user) {
      try {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            nickname: null, // 닉네임은 나중에 설정
            coins: 0,
            tickets: 0,
            rating: 1000, // 신규 가입자는 레이팅 1000점으로 시작
          });

        if (insertError) {
          // 중복 키 오류는 무시 (이미 데이터가 있는 경우)
          if (insertError.code === '23505') {
            console.log('[authService] users 테이블에 이미 데이터가 있음');
          } else {
            console.error('[authService] users 테이블 삽입 오류:', insertError);
            console.error('[authService] 오류 코드:', insertError.code);
            console.error('[authService] 오류 메시지:', insertError.message);
            console.error('[authService] 오류 상세:', insertError.details);
          }
          // users 테이블 삽입 실패해도 회원가입은 성공으로 처리
        } else {
          console.log('[authService] users 테이블에 데이터 삽입 성공');
        }
      } catch (insertErr: any) {
        console.error('[authService] users 테이블 삽입 예외:', insertErr);
      }
    }
    
    return { success: true, user: data.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 로그아웃
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('[authService] 로그아웃 오류:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 구글 로그인
 * 
 * ⚠️ 중요: Expo Go에서는 구글 로그인이 제대로 작동하지 않을 수 있습니다.
 * 이는 Expo Go의 제한사항으로, 커스텀 URL 스킴이 제대로 처리되지 않기 때문입니다.
 * 
 * 실제 배포된 앱(standalone build)에서는 정상적으로 작동합니다.
 * 
 * 테스트 방법:
 * 1. EAS Build로 개발 빌드 생성 후 테스트
 * 2. 프로덕션 빌드 배포 후 테스트
 */
export async function signInWithGoogle() {
  try {
    // Supabase OAuth: redirectTo에는 앱 스킴 사용
    // Supabase가 자동으로 Supabase 콜백을 거쳐 앱 스킴으로 리다이렉트
    // 
    // ⚠️ Expo Go 제한사항:
    // - Expo Go에서는 커스텀 URL 스킴이 제대로 작동하지 않을 수 있습니다
    // - 실제 배포된 앱(standalone build)에서는 정상 작동합니다
    const appScheme = Constants.expoConfig?.scheme || 'com.anonymous.QuizApp';
    const redirectUrl = `${appScheme}://auth/callback`;
    
    // openAuthSessionAsync용 returnUrl (Expo Go 대응)
    // makeRedirectUri의 반환 타입이 string | string[] | undefined인데 타입 정의가 정확하지 않아 타입 단언 사용
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const makeRedirectUriResult = (AuthSession.makeRedirectUri as any)({
      scheme: appScheme,
      path: 'auth/callback',
    });
    const returnUrlValue: string | string[] | undefined = makeRedirectUriResult;
    let returnUrl: string;
    if (typeof returnUrlValue === 'string') {
      returnUrl = returnUrlValue;
    } else if (Array.isArray(returnUrlValue) && returnUrlValue.length > 0 && typeof returnUrlValue[0] === 'string') {
      returnUrl = returnUrlValue[0];
    } else {
      returnUrl = `${appScheme}://auth/callback`;
    }
    
    console.log('========================================');
    console.log('[authService] 구글 로그인 시작');
    console.log('[authService] Supabase redirectTo (앱 스킴):', redirectUrl);
    console.log('[authService] 브라우저 returnUrl:', returnUrl);
    console.log('========================================');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    console.log('========================================');
    console.log('[authService] Supabase OAuth 요청 결과');
    console.log('[authService] 에러:', error ? JSON.stringify(error, null, 2) : '없음');
    console.log('[authService] 데이터:', data ? JSON.stringify(data, null, 2) : '없음');
    console.log('[authService] OAuth URL:', data?.url || '없음');
    console.log('========================================');
    
    if (error) {
      console.error('[authService] 구글 로그인 오류:', error);
      console.error('[authService] 오류 상세:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }
    
    if (!data?.url) {
      console.error('[authService] OAuth URL이 없음');
      return { success: false, error: 'OAuth URL을 받을 수 없습니다.' };
    }

    // Expo WebBrowser를 사용하여 OAuth URL 열기
    const { openAuthSessionAsync } = await import('expo-web-browser');
    
    try {
      console.log('========================================');
      console.log('[authService] 브라우저 열기 시작');
      console.log('[authService] OAuth URL:', data.url);
      console.log('[authService] 브라우저 returnUrl:', returnUrl);
      console.log('========================================');
      
      // 브라우저 열기 (백그라운드에서 실행)
      console.log('[authService] 브라우저 열기...');
      
      // 브라우저를 백그라운드에서 열고, onAuthStateChange로 세션 변경 감지
      openAuthSessionAsync(data.url, returnUrl).catch((err) => {
        console.warn('[authService] 브라우저 열기 오류 (무시):', err);
      });
      
      // onAuthStateChange를 사용하여 세션 변경 감지
      console.log('[authService] 세션 변경 대기 중...');
      console.log('[authService] onAuthStateChange 리스너 등록 중...');
      
      return new Promise((resolve) => {
        let resolved = false;
        let subscription: any = null;
        
        // 타임아웃 설정 (30초)
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            if (subscription) subscription.unsubscribe();
            console.error('[authService] 세션 변경 타임아웃');
            resolve({ success: false, error: '로그인 시간이 초과되었습니다. 다시 시도해주세요.' });
          }
        }, 30000);
        
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          subscription = authSubscription;
          
          console.log('[authService] 인증 상태 변경:', event, session ? '세션 있음' : '세션 없음');
          
          if (event === 'SIGNED_IN' && session && !resolved) {
            resolved = true;
            clearTimeout(timeout);
            if (subscription) subscription.unsubscribe();
            
            console.log('[authService] 로그인 성공, 사용자:', session.user?.email || '없음');
            
            // users 테이블에 사용자 정보 추가
            if (session.user) {
              try {
                // 기존 사용자 확인 (레이팅 유지를 위해)
                const { data: existingUser } = await supabase
                  .from('users')
                  .select('rating')
                  .eq('id', session.user.id)
                  .maybeSingle();

                const { error: insertError } = await supabase
                  .from('users')
                  .upsert({
                    id: session.user.id,
                    email: session.user.email || '',
                    nickname: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
                    coins: 0,
                    tickets: 0,
                    rating: existingUser?.rating ?? 1000, // 기존 레이팅이 있으면 유지, 없으면 1000
                  }, {
                    onConflict: 'id',
                  });

                if (insertError) {
                  if (insertError.code && insertError.code !== '23505') {
                    console.warn('[authService] users 테이블 업데이트 오류 (무시 가능):', insertError.message || String(insertError));
                  }
                }
              } catch (insertErr) {
                console.warn('[authService] users 테이블 업데이트 예외 (무시 가능):', insertErr);
              }
            }
            
            resolve({ success: true, user: session.user });
          } else if (event === 'SIGNED_OUT' && !resolved) {
            // 로그아웃 이벤트는 무시 (로그인 중일 수 있음)
            console.log('[authService] 로그아웃 이벤트 (무시)');
          }
        });
      }) as Promise<{ success: boolean; error?: string; user?: any }>;
    } catch (browserError: any) {
      console.error('[authService] 브라우저 열기 예외 발생');
      console.error('[authService] 에러 메시지:', browserError.message);
      console.error('[authService] 에러 스택:', browserError.stack);
      return { success: false, error: browserError.message || '브라우저를 열 수 없습니다.' };
    }
  } catch (error: any) {
    console.error('[authService] 구글 로그인 예외:', error);
    return { success: false, error: error.message || '구글 로그인에 실패했습니다.' };
  }
}

/**
 * 네이버 로그인 (Supabase는 네이버를 직접 지원하지 않으므로 커스텀 구현 필요)
 */
export async function signInWithNaver() {
  // 네이버는 Supabase에서 직접 지원하지 않으므로
  // 커스텀 OAuth 구현이 필요합니다
  return { success: false, error: '네이버 로그인은 준비 중입니다.' };
}

/**
 * 사용자 닉네임 확인 (users 테이블에서)
 */
export async function getUserNickname(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('[authService] 사용자가 로그인하지 않음');
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('nickname')
      .eq('id', user.id)
      .maybeSingle(); // .single() 대신 .maybeSingle() 사용 (데이터가 없어도 오류 발생 안 함)

    if (error) {
      // PGRST116은 데이터가 없다는 오류 (정상)
      if (error.code === 'PGRST116') {
        console.log('[authService] users 테이블에 데이터가 없음 (정상)');
        return null;
      }
      
      console.error('[authService] 닉네임 조회 오류:', error);
      return null;
    }

    return data?.nickname || null;
  } catch (error: any) {
    console.error('[authService] 닉네임 조회 예외:', error);
    return null;
  }
}

/**
 * 사용자 닉네임 설정
 */
export async function setUserNickname(nickname: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 닉네임 중복 체크
    const nicknameCheck = await checkNicknameAvailability(nickname);
    if (!nicknameCheck.available) {
      return { success: false, error: nicknameCheck.error || '이미 사용 중인 닉네임입니다.' };
    }

    // users 테이블에 닉네임 업데이트 (없으면 생성)
    // 먼저 기존 데이터 확인
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle(); // .single() 대신 .maybeSingle() 사용

    let error;
    if (existingUser) {
      // 기존 데이터가 있으면 업데이트
      const { error: updateError } = await supabase
        .from('users')
        .update({ nickname: nickname.trim() })
        .eq('id', user.id);
      error = updateError;
    } else {
      // 기존 데이터가 없으면 생성
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          nickname: nickname.trim(),
          coins: 0,
          tickets: 0,
          rating: 1000, // 신규 가입자는 레이팅 1000점으로 시작
        });
      error = insertError;
    }

    if (error) {
      console.error('[authService] 닉네임 설정 오류:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[authService] 닉네임 설정 예외:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 닉네임 중복 확인
 */
export async function checkNicknameAvailability(nickname: string): Promise<{ available: boolean; error?: string }> {
  try {
    if (!nickname || nickname.trim().length === 0) {
      return { available: false, error: '닉네임을 입력해주세요.' };
    }

    if (nickname.length < 2) {
      return { available: false, error: '닉네임은 2자 이상이어야 합니다.' };
    }

    // users 테이블에서 닉네임 중복 확인
    const { data, error } = await supabase
      .from('users')
      .select('nickname')
      .eq('nickname', nickname.trim())
      .limit(1);

    if (error) {
      // 테이블이 없거나 오류가 발생한 경우, auth.users의 user_metadata에서 확인 시도
      console.warn('[authService] users 테이블 조회 실패, user_metadata에서 확인 시도:', error);
      
      // user_metadata는 직접 조회가 어려우므로, 일단 사용 가능하다고 반환
      // 실제로는 별도의 users 테이블을 사용하는 것이 좋습니다
      return { available: true };
    }

    if (data && data.length > 0) {
      return { available: false, error: '이미 사용 중인 닉네임입니다.' };
    }

    return { available: true };
  } catch (error: any) {
    console.error('[authService] 닉네임 중복 체크 오류:', error);
    return { available: false, error: '닉네임 확인 중 오류가 발생했습니다.' };
  }
}

