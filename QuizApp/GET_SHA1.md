# SHA-1 인증서 지문 확인 방법

## 방법 1: Debug Keystore에서 확인 (개발용)

### 기본 명령어
```bash
cd /Users/admin/Desktop/quizapp/QuizApp
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### 간단한 버전 (SHA-1만)
```bash
cd /Users/admin/Desktop/quizapp/QuizApp
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

### 더 간단한 버전 (SHA-1 값만 추출)
```bash
cd /Users/admin/Desktop/quizapp/QuizApp
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep -A 1 "SHA1:" | tail -1 | awk '{print $3}'
```

## 방법 2: EAS Credentials에서 확인 (프로덕션용)

### EAS credentials 확인
```bash
cd /Users/admin/Desktop/quizapp/QuizApp
eas credentials
```

### Android credentials 확인
```bash
eas credentials -p android
```

### Keystore 정보 확인
```bash
eas credentials -p android --type keystore
```

## 방법 3: Gradle을 통한 확인

```bash
cd /Users/admin/Desktop/quizapp/QuizApp/android
./gradlew signingReport
```

## 방법 4: Java가 설치되어 있지 않은 경우

### Java 설치 확인
```bash
java -version
```

### Java가 없으면 Homebrew로 설치
```bash
brew install openjdk@17
```

### 또는 Java 경로 설정
```bash
export JAVA_HOME=$(/usr/libexec/java_home)
```

## 일반적인 오류 해결

### 오류 1: "keytool: command not found"
```bash
# Java가 설치되어 있는지 확인
which java
which keytool

# Java 경로 설정
export PATH="/usr/libexec/java_home/bin:$PATH"
```

### 오류 2: "Keystore was tampered with, or password was incorrect"
- 기본 비밀번호는 `android`입니다
- 만약 변경했다면 올바른 비밀번호를 사용하세요

### 오류 3: "No such file or directory"
- 현재 디렉토리 확인
- keystore 파일 경로 확인

## 추천 방법

개발 중이라면 **방법 1**을 사용하세요.
프로덕션 빌드를 준비 중이라면 **방법 2 (EAS)**를 사용하세요.

