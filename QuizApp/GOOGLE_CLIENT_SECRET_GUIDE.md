# Google OAuth Client Secret 찾는 방법

## Client Secret 확인 방법

### 1. Google Cloud Console 접속
1. https://console.cloud.google.com/ 접속
2. 프로젝트 선택 (OAuth 2.0 Client ID를 만든 프로젝트)

### 2. Credentials 페이지로 이동
1. 왼쪽 메뉴에서 **APIs & Services** 클릭
2. **Credentials** 클릭

### 3. OAuth 2.0 Client ID 찾기
1. **OAuth 2.0 Client IDs** 섹션에서 생성한 클라이언트 찾기
2. 클라이언트 이름을 클릭하거나 연필 아이콘(편집) 클릭

### 4. Client Secret 확인
- **Client ID**: 이것이 Supabase의 "Client ID (for OAuth)"에 들어갑니다
- **Client secret**: 이것이 Supabase의 "Client Secret (for OAuth)"에 들어갑니다

### 5. Client Secret이 보이지 않는 경우
- Client Secret은 처음 생성할 때만 표시됩니다
- 만약 보이지 않는다면:
  1. **Reset secret** 버튼 클릭
  2. 새로운 Client Secret 생성
  3. **주의**: 기존 Secret은 무효화되므로 새로 생성한 Secret을 사용해야 합니다

## 입력 형식

Supabase의 "Client Secret (for OAuth)" 필드에:
- Google Cloud Console에서 보이는 **Client secret** 값을 그대로 복사해서 붙여넣기
- 공백이나 따옴표 없이 순수한 문자열만 입력

## 예시

Google Cloud Console에서:
```
Client ID: 123456789-abcdefghijklmnop.apps.googleusercontent.com
Client secret: GOCSPX-abcdefghijklmnopqrstuvwxyz
```

Supabase에 입력:
- Client ID (for OAuth): `123456789-abcdefghijklmnop.apps.googleusercontent.com`
- Client Secret (for OAuth): `GOCSPX-abcdefghijklmnopqrstuvwxyz`

## 주의사항

⚠️ **Client Secret은 절대 공개하지 마세요!**
- GitHub에 커밋하지 마세요
- 다른 사람과 공유하지 마세요
- Supabase Dashboard에만 입력하세요

