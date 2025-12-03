// Supabase 연결 테스트 유틸리티
import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    // 간단한 연결 테스트
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116은 테이블이 없다는 오류 (정상)
      console.error('Supabase 연결 오류:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase 연결 성공!');
    return { success: true };
  } catch (error: any) {
    console.error('Supabase 연결 실패:', error);
    return { success: false, error: error.message };
  }
}

