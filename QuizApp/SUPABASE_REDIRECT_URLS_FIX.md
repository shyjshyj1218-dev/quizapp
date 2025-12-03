# Supabase Redirect URLs 수정 가이드

## 현재 문제점

1. ❌ 두 번째 URL이 잘못 합쳐져 있음
2. ❌ `exp://localhost:3000` 사용 중 (8081로 변경 필요)
3. ❌ `exp://localhost:8081`에 경로가 없음

## 올바른 설정

Supabase Dashboard → Authentication → URL Configuration → Redirect URLs에 다음 3개만 등록:

### 1. Supabase 콜백 URL
```
https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback
```

### 2. 앱 스킴 (프로덕션)
```
com.anonymous.QuizApp://auth/callback
```

### 3. Expo Go 개발 환경
```
exp://localhost:8081/--/auth/callback
```

## 수정 단계

1. **잘못된 두 번째 URL 삭제**
   - `https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callbackcom.anonymous.QuizApp://auth/callback` 삭제

2. **Supabase 콜백 URL 추가** (없으면)
   - `https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback` 추가

3. **`exp://localhost:3000` 삭제**

4. **`exp://localhost:8081` 수정**
   - 기존: `exp://localhost:8081`
   - 수정: `exp://localhost:8081/--/auth/callback`

5. **`com.anonymous.QuizApp://auth/callback` 확인** (이미 있으면 유지)

## 최종 결과

Redirect URLs에는 다음 3개만 있어야 합니다:

1. ✅ `https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback`
2. ✅ `com.anonymous.QuizApp://auth/callback`
3. ✅ `exp://localhost:8081/--/auth/callback`

## Site URL 설정

Site URL은:
```
com.anonymous.QuizApp://
```

