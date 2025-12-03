# 구글 OAuth 설정 가이드

## 1. Supabase에서 Google OAuth 설정

### Supabase Dashboard 설정
1. Supabase Dashboard 접속: https://supabase.com/dashboard
2. 프로젝트 선택
3. **Authentication** > **Providers** 메뉴로 이동
4. **Google** Provider 찾기
5. **Enable Google provider** 토글 활성화
6. Google Cloud Console에서 받은 정보 입력:
   - **Client ID (for OAuth)**: Google Cloud Console의 OAuth 2.0 Client ID
   - **Client Secret (for OAuth)**: Google Cloud Console의 OAuth 2.0 Client Secret
7. **Save** 클릭

### Redirect URLs 설정
Supabase에서 다음 Redirect URLs를 추가해야 합니다:
- `exp://localhost:8081` (개발용)
- `com.anonymous.QuizApp://` (앱 스킴)
- `https://your-project.supabase.co/auth/v1/callback` (Supabase 기본)

## 2. Google Cloud Console 설정

### Authorized redirect URIs 추가
Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client ID에서:

1. **Authorized redirect URIs**에 추가:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
   (your-project를 실제 Supabase 프로젝트 URL로 변경)

2. **Authorized JavaScript origins**에 추가:
   ```
   https://your-project.supabase.co
   ```

## 3. 앱 설정

### app.json에 스킴 추가
```json
{
  "expo": {
    "scheme": "com.anonymous.QuizApp"
  }
}
```

### 필요한 패키지 설치
```bash
cd QuizApp
npx expo install expo-web-browser expo-auth-session
```

## 4. 완료 체크리스트

- [ ] Google Cloud Console에서 SHA-1 입력 완료
- [ ] Google Cloud Console에서 OAuth 2.0 Client ID 생성
- [ ] Supabase에서 Google Provider 활성화
- [ ] Supabase에 Client ID와 Client Secret 입력
- [ ] Google Cloud Console에 Redirect URI 추가
- [ ] 앱에 필요한 패키지 설치
- [ ] app.json에 scheme 추가

