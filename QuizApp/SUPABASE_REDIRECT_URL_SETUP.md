# Supabase Redirect URL 설정 (수정)

## Supabase Dashboard 설정

Supabase는 일반 URL 형식만 허용하므로, Supabase 콜백 URL을 사용합니다.

### 설정 방법

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Project Settings > Authentication > URL Configuration** 이동

3. **Redirect URLs** 섹션 확인:
   - 기본적으로 다음 URL이 이미 설정되어 있어야 합니다:
     ```
     https://your-project.supabase.co/auth/v1/callback
     ```
   - (your-project를 실제 프로젝트 URL로 변경)

4. **Site URL** 확인:
   - 기본값: `https://your-project.supabase.co`
   - 변경하지 않아도 됩니다

5. **Save** 클릭 (변경사항이 있다면)

## Google Cloud Console 설정

Google Cloud Console에서도 Supabase 콜백 URL을 추가해야 합니다:

1. **Google Cloud Console** 접속
   - https://console.cloud.google.com/apis/credentials

2. **OAuth 2.0 Client ID** 클릭 (웹 애플리케이션 타입)

3. **Authorized redirect URIs**에 추가:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
   (your-project를 실제 Supabase 프로젝트 URL로 변경)

4. **Save** 클릭

## 작동 방식

1. 사용자가 구글 로그인 클릭
2. 브라우저에서 구글 로그인 진행
3. 구글 → Supabase 콜백 URL로 리다이렉트
4. Supabase가 세션 생성
5. 앱에서 세션 확인

## 참고

- 앱 스킴(`com.anonymous.QuizApp://`)은 Supabase Redirect URLs에 추가할 필요 없습니다
- Supabase 콜백 URL만 사용하면 됩니다
