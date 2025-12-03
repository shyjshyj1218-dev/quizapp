# Supabase Google OAuth 설정 옵션

## 권장 설정

Supabase Dashboard > Authentication > Providers > Google에서 다음 옵션을 활성화하세요:

### ✅ Skip nonce checks (활성화 권장)

**설명:**
- ID 토큰의 nonce 검사를 건너뜁니다
- 보안상 약간 덜 안전하지만, 모바일 앱에서는 필요할 수 있습니다
- iOS에서 특히 유용합니다

**활성화 이유:**
- 모바일 앱에서 OAuth 플로우 시 nonce 검사 문제가 발생할 수 있습니다
- Expo/React Native 앱에서 OAuth를 사용할 때 nonce 접근이 제한될 수 있습니다

### ✅ Allow users without an email (활성화 권장)

**설명:**
- 이메일 주소가 없는 사용자도 인증을 허용합니다
- 일부 OAuth 제공자가 이메일을 반환하지 않을 수 있습니다

**활성화 이유:**
- 일부 구글 계정은 이메일을 제공하지 않을 수 있습니다
- 사용자 경험을 위해 이메일이 없어도 로그인할 수 있게 합니다

## 설정 방법

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Authentication > Providers > Google** 이동

3. **옵션 활성화:**
   - ✅ **Skip nonce checks** 체크
   - ✅ **Allow users without an email** 체크

4. **Save** 클릭

## 참고

- 이 옵션들은 보안에 약간의 영향을 줄 수 있지만, 모바일 앱에서는 일반적으로 필요합니다
- 대부분의 모바일 앱에서 이 설정을 사용합니다

