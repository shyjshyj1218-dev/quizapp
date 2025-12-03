// Supabase 연결 테스트 함수
import { supabase } from './supabase';

export async function testSupabaseConnection() {
  console.log('🔍 Supabase 연결 테스트 시작...');
  
  try {
    // 간단한 쿼리 테스트
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase 연결 오류:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase 연결 성공!');
    console.log('📊 데이터:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Supabase 연결 실패:', error);
    return { success: false, error: error.message };
  }
}

