# 모바일 앱용 Google OAuth 설정

## 중요: 모바일 앱이어도 "웹 애플리케이션" 타입이 필요합니다!

Supabase OAuth는 웹 리다이렉트를 사용하므로, 모바일 앱이어도 **"웹 애플리케이션"** 타입의 OAuth 클라이언트를 생성해야 합니다.

## Google Cloud Console에서 설정

### 1. OAuth 2.0 Client ID 생성 (웹 애플리케이션)

1. Google Cloud Console 접속: https://console.cloud.google.com/apis/credentials
2. **+ CREATE CREDENTIALS** 클릭
3. **OAuth client ID** 선택
4. **Application type**에서 **"Web application"** 선택 ⚠️ (모바일이어도 웹 선택!)
5. **Name** 입력 (예: "QuizApp Web OAuth")
6. **Authorized redirect URIs**에 추가:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
   (your-project를 실제 Supabase 프로젝트 URL로 변경)
7. **CREATE** 클릭

### 2. Client ID와 Client Secret 확인

생성 후 표시되는:
- **Client ID**: Supabase의 "Client ID (for OAuth)"에 입력
- **Client secret**: Supabase의 "Client Secret (for OAuth)"에 입력

⚠️ **Client Secret은 한 번만 표시되므로 즉시 복사하세요!**

## 현재 상황

현재 가지고 계신 `client_secret_*.json` 파일은:
- **Type**: "installed" (데스크톱 앱용)
- **용도**: Supabase OAuth에는 사용할 수 없음

**새로 "Web application" 타입의 OAuth 클라이언트를 생성해야 합니다.**

## 요약

✅ **필요한 것**: "Web application" 타입의 OAuth 클라이언트
❌ **필요 없는 것**: "Android" 또는 "iOS" 타입 (Supabase OAuth 사용 시)
❌ **사용 불가**: "installed" 타입 (현재 가지고 계신 것)

## Supabase 설정

생성한 "Web application" 타입의 OAuth 클라이언트 정보를 Supabase에 입력:
- Client ID (for OAuth): 웹 애플리케이션의 Client ID
- Client Secret (for OAuth): 웹 애플리케이션의 Client Secret

