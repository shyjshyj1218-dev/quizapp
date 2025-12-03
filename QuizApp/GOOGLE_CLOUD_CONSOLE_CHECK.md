# Google Cloud Console 설정 확인 결과

## ✅ 올바르게 설정된 항목

### Google Cloud Console
1. **승인된 JavaScript 원본**:
   - ✅ `https://zrmxmcffqzpdhwqsrnzt.supabase.co`
   - ✅ `http://localhost:3000`

2. **승인된 리디렉션 URI**:
   - ✅ `https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback`

### Supabase Dashboard
1. **Enable Sign in with Google**: ✅ ON
2. **Client IDs**: ✅ 설정됨
3. **Client Secret**: ✅ 설정됨
4. **Skip nonce checks**: ✅ ON (모바일 앱에 필요)
5. **Allow users without an email**: ✅ ON
6. **Callback URL**: ✅ `https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback`

## ⚠️ 확인 필요 사항

### Supabase Dashboard → Authentication → URL Configuration

**Redirect URLs**에 다음 3개가 모두 등록되어 있는지 확인하세요:

1. `https://zrmxmcffqzpdhwqsrnzt.supabase.co/auth/v1/callback`
2. `com.anonymous.QuizApp://auth/callback`
3. `exp://localhost:8081/--/auth/callback`

**Site URL**은:
```
com.anonymous.QuizApp://
```

## 중요 참고사항

- **Google Cloud Console**에는 웹 URL만 등록 가능합니다. 앱 스킴(`com.anonymous.QuizApp://`)은 등록할 수 없습니다.
- **Supabase Dashboard**에만 앱 스킴을 등록하면 됩니다.
- Supabase가 자동으로 Supabase 콜백 URL을 거쳐 앱 스킴으로 리다이렉트합니다.

