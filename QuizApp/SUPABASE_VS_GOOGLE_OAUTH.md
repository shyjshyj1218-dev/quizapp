# Supabase OAuth vs 구글 OAuth 차이점

## Supabase OAuth (현재 사용 중)

### 정의
- Supabase가 제공하는 OAuth 래퍼/프록시 서비스
- 구글, 깃허브, 페이스북 등 여러 제공자를 지원
- Supabase가 중간에서 세션 관리 및 토큰 처리

### 작동 방식
1. 앱 → Supabase OAuth 엔드포인트 호출
2. Supabase → 구글 OAuth로 리다이렉트
3. 구글 → Supabase 콜백 URL로 리다이렉트
4. Supabase가 세션 생성 및 저장
5. Supabase → 앱 스킴으로 리다이렉트
6. 앱에서 Supabase 세션 확인

### 장점
- 세션 관리 자동화
- 여러 제공자 지원
- 사용자 데이터베이스 자동 관리
- 보안 처리 자동화

### 설정
- Google Cloud Console: Supabase 콜백 URL만 추가
- Supabase Dashboard: 앱 스킴 추가

## 구글 OAuth (직접 사용)

### 정의
- 구글에서 직접 제공하는 OAuth
- 구글 API를 직접 호출
- 직접 토큰 관리 필요

### 작동 방식
1. 앱 → 구글 OAuth 엔드포인트 직접 호출
2. 구글 → 앱 스킴으로 직접 리다이렉트
3. 앱에서 토큰 추출 및 관리

### 장점
- 더 많은 제어권
- Supabase 의존성 없음

### 단점
- 토큰 관리 직접 구현 필요
- 세션 관리 직접 구현 필요
- 보안 처리 직접 구현 필요

### 설정
- Google Cloud Console: 앱 스킴 직접 추가 (`com.anonymous.QuizApp://auth/callback`)

## 현재 프로젝트

**현재는 Supabase OAuth를 사용하고 있습니다.**

따라서:
- ✅ Google Cloud Console: Supabase 콜백 URL만 추가
- ✅ Supabase Dashboard: 앱 스킴 추가
- ❌ Google Cloud Console에 앱 스킴 추가 불가 (Supabase OAuth 사용 시)

## 요약

| 항목 | Supabase OAuth | 구글 OAuth 직접 |
|------|----------------|-----------------|
| 중간 서버 | Supabase | 없음 |
| 세션 관리 | 자동 | 수동 |
| Google Cloud Console 설정 | Supabase 콜백 URL | 앱 스킴 |
| Supabase Dashboard 설정 | 앱 스킴 | 불필요 |
| 구현 복잡도 | 낮음 | 높음 |

**현재 프로젝트는 Supabase OAuth를 사용하므로, Google Cloud Console에 앱 스킴을 추가할 필요가 없습니다!**

