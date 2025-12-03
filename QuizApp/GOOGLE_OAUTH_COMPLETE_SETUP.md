# Google OAuth 완전 설정 가이드

## 현재 설정 확인

### app.json 설정
```json
{
  "expo": {
    "scheme": "com.anonymous.QuizApp"
  }
}
```
✅ **설정 완료**: `com.anonymous.QuizApp`

## 1. Google Cloud Console 설정

### 중요: Supabase OAuth를 사용할 때는 "웹 애플리케이션" 타입만 사용

Google Cloud Console > APIs & Services > Credentials:

1. **OAuth 2.0 Client ID** (웹 애플리케이션 타입) 확인/생성
2. **Authorized redirect URIs**에 다음만 추가:
   ```
   https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback
   ```
   ⚠️ **앱 스킴은 추가하지 마세요!** (Google Cloud Console은 웹 URL만 허용)

3. **Authorized JavaScript origins**에 추가:
   ```
   https://zrmxmcffqzpdhwqsrnzt.supabase.co
   ```

## 2. Supabase Dashboard 설정

### Authentication > Providers > Google

1. **Enable Google provider** 활성화
2. **Client ID (for OAuth)**: Google Cloud Console의 웹 애플리케이션 Client ID
3. **Client Secret (for OAuth)**: Google Cloud Console의 웹 애플리케이션 Client Secret
4. **옵션 설정**:
   - ✅ Allow new users to sign up
   - ✅ Skip nonce checks
   - ✅ Allow users without an email
   - ❌ Confirm email

### Project Settings > Authentication > URL Configuration

**Redirect URLs**에 다음 추가:
```
https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback
exp://localhost:3000
com.anonymous.QuizApp://auth/callback
```

## 3. 작동 방식

1. 사용자가 구글 로그인 클릭
2. 브라우저에서 구글 로그인 진행
3. 구글 → **Supabase 콜백 URL**로 리다이렉트 (Google Cloud Console 설정)
4. Supabase가 세션 생성
5. Supabase가 **앱 스킴**으로 리다이렉트 (Supabase Dashboard 설정)
6. 앱으로 돌아옴

## 4. 확인 사항

### app.json
- ✅ `scheme: "com.anonymous.QuizApp"` 설정됨

### Google Cloud Console
- ✅ 웹 애플리케이션 타입 OAuth 클라이언트 생성
- ✅ Supabase 콜백 URL 추가: `https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback`
- ❌ 앱 스킴 추가 불가 (Google Cloud Console은 웹 URL만 허용)

### Supabase Dashboard
- ✅ Google Provider 활성화
- ✅ Client ID와 Client Secret 입력
- ✅ Redirect URLs에 앱 스킴 추가: `com.anonymous.QuizApp://auth/callback`
- ✅ Redirect URLs에 Expo URL 추가: `exp://localhost:3000`

## 5. 문제 해결

### "로컬호스트에서 접속을 거부" 오류
- Supabase 콜백 페이지가 웹 페이지이므로 발생할 수 있음
- 브라우저를 닫으면 세션이 저장되어 있으므로 앱에서 확인 가능

### "something went wrong" 오류
- Expo Go가 해당 URL을 처리하지 못함
- `exp://localhost:3000` 사용 (경로 없이)

### 세션이 저장되지 않음
- Supabase Dashboard의 Redirect URLs 확인
- 앱 스킴이 정확히 입력되었는지 확인

