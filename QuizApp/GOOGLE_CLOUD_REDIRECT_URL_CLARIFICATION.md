# Google Cloud Console Redirect URL 설정 안내

## 중요: Google Cloud Console에는 앱 스킴을 추가할 수 없습니다!

Google Cloud Console의 OAuth 2.0 설정은 **웹 URL만** 허용합니다. 앱 스킴(`com.anonymous.QuizApp://`)은 추가할 수 없습니다.

## 올바른 설정 방법

### Google Cloud Console 설정

**Authorized redirect URIs**에는 다음만 추가하세요:

```
https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback
```

**앱 스킴은 추가하지 마세요!**

### Supabase Dashboard 설정

**Redirect URLs**에는 다음을 추가하세요:

```
https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback
com.anonymous.QuizApp://auth/callback
```

## 작동 방식

1. 사용자가 구글 로그인 클릭
2. 브라우저에서 구글 로그인 진행
3. 구글 → **Supabase 콜백 URL**로 리다이렉트 (Google Cloud Console 설정)
4. Supabase가 세션 생성
5. Supabase가 **앱 스킴**으로 리다이렉트 (Supabase Dashboard 설정)
6. 앱으로 돌아옴

## 요약

- ✅ **Google Cloud Console**: Supabase 콜백 URL만 추가
- ✅ **Supabase Dashboard**: Supabase 콜백 URL + 앱 스킴 추가
- ❌ **Google Cloud Console에 앱 스킴 추가 불가**

