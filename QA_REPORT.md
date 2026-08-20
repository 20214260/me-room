# ME:ROOM 최종 사전 검증 보고서

검증일: 2026-08-20

## 통과한 검사

- `npm run typecheck` — TypeScript 오류 없음
- Supabase Edge Function 4개 파일 — TypeScript 문법 transpile 검사 통과
- `npm run export:web` — Expo Router web production export 성공
- production local server — `/` HTTP 200
- production local server — `/survey/example123` 직접 진입 HTTP 200
- `git diff --check` — whitespace 오류 없음
- 소스 secret scan — 실제 OpenAI secret / Supabase service-role secret 하드코딩 없음
- 기존 핵심 기능 보존 체크 — ROOM 비교/추가 MIRROR 설문/오늘의 한 조각/로그아웃, MIRROR 직접 응답, IDEAL 재생성, similarity 함수 모두 존재

## 실제 배포 계정이 있어야 검증 가능한 항목

아래는 소스 코드 문제가 아니라 계정/secret/원격 프로젝트 반영이 필요한 단계다.

1. Supabase Edge Functions 실제 배포
2. `OPENAI_API_KEY` secret 등록 후 실제 AI 응답 확인
3. 신규 DB migrations 실제 원격 Supabase 반영
4. EAS Hosting 실제 production URL 발급
5. production URL을 `EXPO_PUBLIC_APP_URL`에 넣은 네이티브 앱의 외부 친구 링크 확인

정확한 순서는 `DEPLOYMENT.md`를 따른다.

## 비차단 의존성 경고

오프라인 `expo install --check` 기준으로 현재 `react-native@0.81.4`에 대해 Expo가 `0.81.5`를 권장했다. 기존 프로젝트에서 이미 사용하던 버전이며 TypeScript 검사와 web export는 모두 통과했기 때문에 마감 직전 자동 업그레이드는 하지 않았다. 네이티브 EAS Build에서 실제 문제가 확인될 때만 Expo 권장 방식으로 patch 업데이트한다.
