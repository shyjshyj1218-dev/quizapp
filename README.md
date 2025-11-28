# 퀴즈 앱 프로젝트

## 프로젝트 구조

```
quizapp/
├── QuizApp/          # React Native Expo 앱
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   └── utils/
│   │       ├── supabase.ts  # Supabase 클라이언트
│   │       └── colors.ts
│   └── .env          # 환경 변수 (생성 필요)
│
└── quiz-server/      # Node.js 백엔드 서버
    ├── prisma/
    │   └── schema.prisma  # Prisma 스키마
    ├── src/
    │   └── lib/
    │       ├── prisma.ts   # Prisma 클라이언트
    │       └── supabase.ts # Supabase Admin 클라이언트
    └── .env          # 환경 변수 (생성 필요)
```

## 설정 방법

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. 프로젝트 설정에서 다음 정보 확인:
   - Project URL
   - Anon Key
   - Service Role Key
   - Database URL (Settings > Database > Connection string)

### 2. React Native 앱 환경 변수 설정

`QuizApp/.env` 파일 생성:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. 백엔드 서버 환경 변수 설정

`quiz-server/.env` 파일 생성:

```env
# Supabase 설정
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Prisma Database URL (Supabase PostgreSQL)
# Supabase Dashboard > Settings > Database > Connection string > URI
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.your-project.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# 서버 포트
PORT=3001
```

### 4. Prisma 마이그레이션 실행

```bash
cd quiz-server

# Prisma Client 생성
npm run prisma:generate

# 데이터베이스에 스키마 적용
npm run prisma:push

# 또는 마이그레이션 사용 (권장)
npm run prisma:migrate
```

### 5. Prisma Studio 실행 (선택사항)

데이터베이스 데이터를 시각적으로 확인:

```bash
cd quiz-server
npm run prisma:studio
```

## 사용 방법

### React Native 앱 실행

```bash
cd QuizApp
npm start
```

### 백엔드 서버 실행

```bash
cd quiz-server
npm run dev
```

## 데이터베이스 스키마

Prisma 스키마에는 다음 모델들이 포함되어 있습니다:

- **User**: 사용자 정보
- **Quiz**: 퀴즈 정보
- **Question**: 문제 정보
- **QuizRoom**: 퀴즈방 정보
- **QuizRoomPlayer**: 퀴즈방 플레이어
- **QuizResult**: 퀴즈 결과
- **Mission**: 미션 정보
- **UserMission**: 사용자 미션 진행 상황
- **Ranking**: 랭킹 정보
- **ShopItem**: 상점 아이템

## 참고 사항

- Supabase는 PostgreSQL 데이터베이스를 제공합니다
- Prisma는 Supabase PostgreSQL과 직접 연결됩니다
- React Native 앱은 Supabase Client를 통해 인증 및 데이터 접근
- 백엔드 서버는 Prisma를 통해 데이터베이스 관리 및 복잡한 로직 처리

