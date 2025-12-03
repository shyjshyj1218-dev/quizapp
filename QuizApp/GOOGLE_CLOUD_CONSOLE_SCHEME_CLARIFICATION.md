# Google Cloud Console과 app.json scheme 관계

## 중요: Supabase OAuth를 사용할 때는 다릅니다!

일반적인 OAuth 플로우와 Supabase OAuth 플로우는 다릅니다.

## 일반적인 OAuth 플로우 (Supabase 사용 안 함)

일반적으로는:
- Google Cloud Console에 앱 스킴 추가: `mycustomscheme://`
- app.json의 scheme과 일치

## Supabase OAuth 플로우 (현재 사용 중)

Supabase OAuth를 사용할 때는:

### Google Cloud Console
- **웹 URL만 허용**
- 앱 스킴 추가 불가
- 다음만 추가:
  ```
  https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback
  ```

### Supabase Dashboard
- **앱 스킴 추가 가능**
- 다음 추가:
  ```
  com.anonymous.QuizApp://auth/callback
  exp://localhost:3000
  ```

## 작동 방식

1. 사용자가 구글 로그인 클릭
2. 구글 → **Supabase 콜백 URL**로 리다이렉트 (Google Cloud Console 설정)
3. Supabase가 세션 생성
4. Supabase가 **앱 스킴**으로 리다이렉트 (Supabase Dashboard 설정)
5. 앱으로 돌아옴

## 요약

- ✅ **app.json**: `scheme: "com.anonymous.QuizApp"` (올바름)
- ✅ **Supabase Dashboard**: `com.anonymous.QuizApp://auth/callback` 추가 필요
- ✅ **Google Cloud Console**: Supabase 콜백 URL만 추가 (앱 스킴 추가 불가)

**Google Cloud Console에는 앱 스킴을 추가할 필요가 없습니다!**

