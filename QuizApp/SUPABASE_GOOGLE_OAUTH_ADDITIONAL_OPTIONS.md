# Supabase Google OAuth 추가 옵션 설정

## 권장 설정

Supabase Dashboard > Authentication > Providers > Google에서 다음 옵션을 설정하세요:

### ✅ Allow new users to sign up (활성화 권장)

**설명:**
- 새 사용자가 구글 계정으로 가입할 수 있게 합니다
- 비활성화하면 기존 사용자만 로그인 가능합니다

**활성화 이유:**
- 구글 소셜 로그인을 처음 사용하는 사용자도 가입할 수 있어야 합니다
- 일반적으로 활성화하는 것이 좋습니다

### ⚠️ Allow manual linking (선택 사항)

**설명:**
- 수동으로 계정을 연결할 수 있게 합니다
- 같은 이메일로 여러 로그인 방법을 연결할 수 있습니다

**활성화 여부:**
- 필요하면 활성화 (일반적으로 비활성화해도 됨)
- 같은 이메일로 이메일/비밀번호와 구글 로그인을 연결하려면 활성화

### ❌ Allow anonymous sign-ins (비활성화 권장)

**설명:**
- 이메일 없이 익명으로 로그인할 수 있게 합니다

**비활성화 이유:**
- 구글 로그인은 이메일이 필요하므로 불필요합니다
- 보안상 비활성화하는 것이 좋습니다

### ❌ Confirm email (비활성화 권장)

**설명:**
- 사용자가 이메일을 확인해야 로그인할 수 있습니다

**비활성화 이유:**
- 구글 계정은 이미 이메일이 확인된 상태입니다
- 구글 로그인 시 이메일 확인이 불필요합니다
- 활성화하면 사용자 경험이 나빠질 수 있습니다

## 최종 권장 설정

✅ **Allow new users to sign up**: 활성화
❌ **Allow manual linking**: 비활성화 (필요시 활성화)
❌ **Allow anonymous sign-ins**: 비활성화
❌ **Confirm email**: 비활성화

## 설정 방법

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Authentication > Providers > Google** 이동

3. **옵션 설정:**
   - ✅ Allow new users to sign up 체크
   - ❌ Allow manual linking 체크 해제 (또는 필요시 체크)
   - ❌ Allow anonymous sign-ins 체크 해제
   - ❌ Confirm email 체크 해제

4. **Save** 클릭

