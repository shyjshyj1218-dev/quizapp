import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Supabase 설정
// 환경 변수에서 가져오기
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// 연결 상태 확인
const isConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.error('⚠️ [Supabase] URL 또는 Anon Key가 설정되지 않았습니다.');
  console.error('[Supabase] 환경 변수를 설정해주세요:');
  console.error('  - EXPO_PUBLIC_SUPABASE_URL');
  console.error('  - EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.error('[Supabase] 또는 app.json의 extra 섹션에 설정:');
  console.error('  - extra.supabaseUrl');
  console.error('  - extra.supabaseAnonKey');
} else {
  console.log('✅ [Supabase] 클라이언트 초기화 완료');
  console.log(`[Supabase] URL: ${supabaseUrl.substring(0, 30)}...`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Supabase URL export (OAuth 리다이렉트에 필요)
export { supabaseUrl };

// 연결 상태 확인 함수
export async function checkSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured) {
    return {
      success: false,
      error: 'Supabase URL 또는 Anon Key가 설정되지 않았습니다.',
    };
  }

  try {
    // 간단한 쿼리로 연결 테스트
    const { error } = await supabase.from('quiz_questions').select('id').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return {
          success: false,
          error: 'quiz_questions 테이블이 존재하지 않습니다. 데이터베이스에 테이블을 생성해주세요.',
        };
      }
      return {
        success: false,
        error: error.message || '데이터베이스 연결 오류',
      };
    }
    
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || '연결 테스트 실패',
    };
  }
}

