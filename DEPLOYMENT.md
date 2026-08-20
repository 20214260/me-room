# ME:ROOM 배포 체크리스트

현재 프로젝트는 기존 SELF / MIRROR / IDEAL UI와 흐름을 유지하면서 다음 기능을 추가한 상태다.

- SELF 최초 생성: 서버측 OpenAI 분석 + 기존 점수 계산 fallback
- IDEAL 생성/재생성: 서버측 OpenAI 분석 + 기존 점수 계산 fallback
- MIRROR: 3명에서 최초 입주, 4명 이상도 계속 누적, 새 응답마다 재분석
- MIRROR 화면/ROOM 진입 시 최신 DB persona 재로딩
- 오늘의 한 조각: 실제 SELF 갱신, 하루 1회 입력당 각 지표 변화 최대 ±3
- 친구 설문: 브라우저 공개 링크 사용 가능
- 공개 설문 RLS 강화: token 기반 조회 + Edge Function 제출

## 1. 로컬 `.env`

`.env.example`을 복사해 `.env`를 만든다.

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
EXPO_PUBLIC_APP_URL=
```

웹으로 실행 중일 때는 현재 브라우저 origin을 자동 사용하므로 `EXPO_PUBLIC_APP_URL`이 없어도 설문 URL이 만들어진다.
네이티브 앱에서 친구에게 브라우저 설문 링크를 공유하려면 최종 EAS Hosting 주소를 `EXPO_PUBLIC_APP_URL`에 넣고 다시 빌드한다.

## 2. OpenAI secret 등록

OpenAI 키는 Expo 앱이나 `.env`의 `EXPO_PUBLIC_*`에 절대 넣지 않는다.
Supabase Edge Function secret으로만 등록한다.

```bash
npx supabase secrets set OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

선택적으로 모델을 바꿀 수 있다.

```bash
npx supabase secrets set OPENAI_MODEL=gpt-5-mini
```

## 3. Edge Functions 먼저 배포

```bash
npx supabase functions deploy analyze-persona
npx supabase functions deploy submit-survey --no-verify-jwt
```

`analyze-persona`는 로그인 JWT가 필요한 SELF / IDEAL / DAILY 분석용이다.
`submit-survey`는 친구가 로그인 없이 설문을 제출해야 하므로 JWT 검증을 끄되, 함수 내부에서 활성 survey token과 응답 구조를 검증한다.

보안 migration에서 익명 직접 INSERT 권한을 제거하므로, 운영 중인 프로젝트라면 **Edge Function을 먼저 배포한 뒤 DB migration을 반영**해야 친구 설문이 잠깐 끊기는 구간을 피할 수 있다.

## 4. Supabase DB migration 반영

```bash
npx supabase db push
```

신규 migration은 `daily_logs`와 공개 친구 설문 보안 RPC를 추가한다.

## 5. 정적 검사


```bash
npm run typecheck
```

## 6. 웹 export 확인

```bash
npm run export:web
```

로컬 production 확인:

```bash
npx expo serve
```

다음 흐름을 반드시 확인한다.

1. 새 계정 가입 / 로그인
2. SELF 생성
3. IDEAL 생성
4. ROOM 입장
5. 친구 설문 1~2명: MIRROR 잠금
6. 3번째 응답: MIRROR 입주
7. 4번째 이상 응답: 설문 계속 가능 + MIRROR 최신화
8. 오늘의 한 조각 저장 후 SELF 점수 소폭 변화
9. IDEAL 다시 만들기
10. 비교 화면 최신 점수 반영
11. 로그아웃 / 재로그인 후 데이터 유지

## 7. EAS Hosting

Expo 계정 로그인 후:

```bash
npx eas-cli@latest whoami
npx expo export --platform web
npx eas-cli@latest deploy
```

Production 배포 시:

```bash
npx eas-cli@latest deploy --prod
```

배포 URL이 확정된 후 네이티브 앱에서도 같은 브라우저 링크를 공유하려면 `.env`의 `EXPO_PUBLIC_APP_URL`에 production URL을 넣는다.

## 8. 선택: Android 설치용 APK 만들기

웹 배포 링크가 제출 기준이면 이 단계는 생략해도 된다. 실제 Android 기기에 설치할 APK도 필요하면 포함된 `eas.json`의 `preview` 프로필을 사용한다.

```bash
npx eas-cli@latest build -p android --profile preview
```

첫 EAS Build라면 Android package identifier와 프로젝트 연결을 한 번 물어볼 수 있다. 빌드가 끝나면 EAS가 설치 가능한 공유 URL을 제공한다.

## 9. 제출 직전

- `.env`가 Git에 올라가지 않았는지 확인
- `OPENAI_API_KEY`가 앱 코드에 없는지 확인
- `git status` 확인
- `npm run typecheck`
- 실제 다른 브라우저/폰에서 `/survey/<token>` 링크 확인
- 새 계정으로 SELF → IDEAL → MIRROR 3명 → 4명 추가 → DAILY → COMPARE 전체 흐름 확인
- 제출 후 `main` 수정 금지
