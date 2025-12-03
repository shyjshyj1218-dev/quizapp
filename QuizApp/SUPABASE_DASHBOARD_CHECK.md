# Supabase Dashboard 설정 확인 (중요!)

## 반드시 확인해야 할 설정

### 1. Supabase Dashboard → Authentication → URL Configuration

**Redirect URLs**에 다음이 모두 등록되어 있어야 합니다:

```
https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback
com.anonymous.QuizApp://auth/callback
exp://localhost:8081/--/auth/callback
```

**Site URL**은:
```
com.anonymous.QuizApp://
```

### 2. Google Cloud Console 설정

**Authorized redirect URIs**에 다음만:
```
https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback
```

## 현재 코드 동작

1. `makeRedirectUri`가 자동으로 올바른 URL 생성:
   - Expo Go: `exp://localhost:8081/--/auth/callback`
   - 프로덕션: `com.anonymous.QuizApp://auth/callback`

2. 이 URL이 Supabase `redirectTo`로 전달됨

3. Supabase가 이 URL로 리다이렉트하려고 시도

## 문제 해결

만약 "localhost에서 연결을 거부했다"는 오류가 계속 나면:

1. **Supabase Dashboard**에서 `exp://localhost:8081/--/auth/callback`이 등록되어 있는지 확인
2. **Supabase Dashboard**에서 `com.anonymous.QuizApp://auth/callback`이 등록되어 있는지 확인
3. 앱을 완전히 종료하고 다시 시작
4. Expo Go 앱에서 프로젝트를 다시 로드

