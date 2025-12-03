# Supabase 리다이렉트 URL 최종 설정 가이드

## 중요: Supabase OAuth 작동 방식

Supabase OAuth를 사용할 때는:
1. **`redirectTo`**: 항상 Supabase 콜백 URL 사용 (`https://...supabase.co/auth/v1/callback`)
2. **Supabase Dashboard**: 앱 스킴을 추가하여 Supabase가 자동으로 앱으로 리다이렉트하도록 설정
3. **Google Cloud Console**: Supabase 콜백 URL만 추가

## Supabase Dashboard 설정

1. Supabase Dashboard → Authentication → URL Configuration
2. **Redirect URLs**에 다음 추가:
   ```
   https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback
   com.anonymous.QuizApp://auth/callback
   exp://localhost:8081
   ```

## Google Cloud Console 설정

1. Google Cloud Console → APIs & Services → Credentials
2. OAuth 2.0 Client ID (Web application) 선택
3. **Authorized redirect URIs**에 다음만 추가:
   ```
   https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback
   ```

## 코드 동작 방식

1. 앱 → Supabase OAuth 요청 (`redirectTo: Supabase 콜백 URL`)
2. Supabase → Google OAuth로 리다이렉트
3. Google → Supabase 콜백 URL로 리다이렉트
4. Supabase가 세션 생성 후 → 앱 스킴으로 리다이렉트 (`com.anonymous.QuizApp://auth/callback`)
5. 앱이 리다이렉트 URL을 받아서 세션 확인

## 현재 코드 설정

- **Expo Go**: `exp://localhost:8081` 사용
- **프로덕션**: `com.anonymous.QuizApp://` 사용
- **Supabase `redirectTo`**: 항상 Supabase 콜백 URL 사용

