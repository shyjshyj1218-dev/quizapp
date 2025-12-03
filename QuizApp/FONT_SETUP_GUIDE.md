# 커스텀 폰트 설정 가이드

## 1. 폰트 파일 준비
Font Squirrel에서 다운받은 폰트 파일(.ttf 또는 .otf)을 다음 위치에 넣어주세요:
```
QuizApp/assets/fonts/
```

## 2. 폰트 파일 이름 확인
다운받은 폰트 파일의 정확한 이름을 확인하세요. 예:
- `MyCustomFont-Regular.ttf`
- `MyCustomFont-Bold.ttf`
- `CustomFont.ttf`

## 3. Auth.tsx 파일 수정

### 3-1. useFonts 훅에 폰트 추가
`Auth.tsx` 파일의 `useFonts` 부분을 찾아서 실제 폰트 파일 이름으로 수정하세요:

```typescript
const [fontsLoaded] = useFonts({
  'MyCustomFont': require('../../assets/fonts/MyCustomFont-Regular.ttf'),
  // 다른 폰트 스타일이 있다면 추가
  // 'MyCustomFont-Bold': require('../../assets/fonts/MyCustomFont-Bold.ttf'),
});
```

### 3-2. fontFamily 적용
`styles.appName`에서 주석을 제거하고 실제 폰트 이름을 입력하세요:

```typescript
appName: {
  fontSize: 28,
  fontWeight: 'bold',
  color: colors.primary,
  marginBottom: 8,
  fontFamily: 'MyCustomFont', // 실제 폰트 이름으로 변경
},
```

## 4. 폰트 로드 확인
폰트가 로드되기 전에는 기본 폰트가 표시됩니다. 폰트가 로드되면 자동으로 적용됩니다.

## 5. 앱 재시작
폰트 파일을 추가한 후에는 앱을 완전히 재시작해야 합니다:
```bash
# Expo 서버 중지 후 다시 시작
npx expo start --clear
```

## 주의사항
- 폰트 파일 이름은 대소문자를 구분합니다
- 폰트 파일 경로가 정확한지 확인하세요
- 폰트가 로드되지 않으면 기본 시스템 폰트가 사용됩니다

