import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase URL 또는 Service Role Key가 설정되지 않았습니다.');
  console.warn('환경 변수를 확인해주세요: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
}

// 서버 사이드에서 사용하는 Supabase 클라이언트 (Service Role Key 사용)
// 환경 변수가 없어도 클라이언트는 생성하되, 사용 시 오류가 발생할 수 있음
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null as any; // 임시로 null 처리 (실제 사용 시 오류 발생)

