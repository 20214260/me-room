# ME:ROOM

내가 생각하는 나, 남들이 생각하는 나, 내가 되고 싶은 나를 각각 AI 캐릭터로 만들고 하나의 공간에서 비교하는 모바일 앱

> **현재 구현 상태 (2026-08-20)**
> Supabase Auth/DB, SELF·IDEAL 저장, 친구 설문, 3명 MIRROR 입주 및 4명 이상 누적 갱신, 세 Persona 비교, 오늘의 한 조각 SELF 변화, 서버측 OpenAI 분석, 웹 친구 설문 배포 구조까지 연결되어 있습니다. 배포 절차는 `DEPLOYMENT.md`, 기능 보존 기준은 `IMPLEMENTATION_NOTES.md`를 확인하세요.

---

## 1. 프로젝트 개요

ME:ROOM에서는 한 사람의 모습을 세 가지로 나눈다.

### SELF — 내가 생각하는 나

사용자가 자신의 성격, 행동, 생각을 태그와 문장으로 입력하면 AI가 내용을 분석해 캐릭터를 생성한다.

예시 입력

- 생각이 많다
- 책임감이 강하다
- 감정을 잘 숨긴다
- 새로운 일을 좋아한다

예시 결과

> **고독한 관찰자**  
> 주변의 상황과 사람을 세심하게 관찰하지만 자신의 감정은 쉽게 드러내지 않는 사람

---

### MIRROR — 남들이 생각하는 나

사용자가 친구에게 링크를 공유한다.

친구는 앱을 설치하지 않고 웹에서 간단한 질문에 답한다.

예시 질문

- 이 사람은 모임에서 어떤 역할인가?
- 문제가 생기면 어떻게 행동하는가?
- 이 사람이 가장 잘 숨기는 감정은 무엇인가?
- 이 사람의 가장 큰 장점은 무엇인가?

친구 응답이 일정 수 이상 모이면 AI가 답변을 종합하여 MIRROR 캐릭터를 생성한다.

예시 결과

> **침묵의 수호자**  
> 본인은 조용한 사람이라고 생각하지만 주변에서는 필요할 때 먼저 행동하는 사람으로 인식하고 있음

---

### IDEAL — 내가 되고 싶은 나

사용자가 앞으로 되고 싶은 자신의 모습을 입력한다.

예시

- 남의 눈치를 덜 보는 사람
- 꾸준한 사람
- 먼저 행동하는 사람

AI가 내용을 분석하여 IDEAL 캐릭터를 생성한다.

예시 결과

> **행동하는 개척자**  
> 두려움보다 행동을 먼저 선택하고 새로운 경험을 적극적으로 받아들이는 사람

---

## 2. 핵심 사용 흐름

```text
앱 시작
↓
SELF 정보 입력
↓
SELF 캐릭터 생성
↓
IDEAL 정보 입력
↓
IDEAL 캐릭터 생성
↓
ROOM 입장
↓
친구 설문 링크 공유
↓
친구 설문 응답
↓
MIRROR 캐릭터 생성
↓
SELF / MIRROR / IDEAL 비교
```

이 흐름이 처음부터 끝까지 정상적으로 실행되는 것이 1차 개발 목표다.

---

## 3. ROOM

SELF, MIRROR, IDEAL 세 캐릭터를 하나의 2D 공간에 배치한다.

```text
┌──────────────────────────┐

 SELF       MIRROR       IDEAL

   👤          👤           👤

└──────────────────────────┘
```

실제 게임처럼 캐릭터가 자유롭게 이동하는 기능은 구현하지 않는다.

기본 구성

- 2D 방 배경
- 캐릭터 3명
- 캐릭터 위치 변화
- 간단한 등장 효과
- 캐릭터별 말풍선
- 일부 방 오브젝트

캐릭터의 성향이 비슷할수록 가까이 배치하고 차이가 클수록 멀리 배치한다.

예시

```text
SELF ↔ MIRROR 일치도 높음
→ 두 캐릭터를 가까이 배치

SELF ↔ MIRROR 차이 큼
→ 두 캐릭터를 멀리 배치

SELF ↔ IDEAL 일치도 상승
→ 두 캐릭터의 거리 감소
```

---

## 4. 성향 분석 기준

성향 분석은 아래 6가지 지표를 사용한다.

| 지표 | 의미 |
|---|---|
| 관계 에너지 | 혼자 있는 것을 선호 ↔ 사람들과 어울리는 것을 선호 |
| 감정 표현 | 감정을 숨김 ↔ 감정을 표현함 |
| 주도성 | 상황을 지켜봄 ↔ 먼저 행동함 |
| 공감성 | 해결 중심 ↔ 감정 이해 중심 |
| 안정성 | 쉽게 흔들림 ↔ 침착함 |
| 실행력 | 생각 중심 ↔ 행동 중심 |

SELF, MIRROR, IDEAL은 각각 0~100의 점수를 가진다.

예시

```text
SELF

관계 에너지 42
감정 표현 31
주도성 58
공감성 84
안정성 47
실행력 55
```

이 점수를 이용해 아래 결과를 계산한다.

```text
SELF ↔ MIRROR 일치도
SELF ↔ IDEAL 일치도
MIRROR ↔ IDEAL 일치도
```

일치도 계산은 코드에서 처리하고 AI는 결과 해석과 설명을 담당한다.

---

## 5. 1차 개발 범위

### 반드시 구현

- 앱 기본 실행
- 화면 이동
- SELF 입력 화면
- SELF 결과 화면
- IDEAL 입력 화면
- IDEAL 결과 화면
- ROOM 화면
- 친구 설문 링크 생성
- 친구 설문 페이지
- 친구 응답 저장
- MIRROR 생성
- 세 캐릭터 비교
- ROOM에 세 캐릭터 표시

---

## 6. 추가 기능

1차 기능이 모두 연결된 이후 시간이 남으면 추가한다.

### 오늘의 한 조각

사용자가 하루에 자신의 행동이나 생각을 한 문장으로 기록한다.

예시

```text
오늘 회의에서 먼저 의견을 말했다.
```

분석 예시

```text
주도성 +2
실행력 +1
```

이를 이용해 SELF가 IDEAL에 얼마나 가까워지고 있는지 보여준다.

### 세 캐릭터 대화

최근 기록과 세 캐릭터의 성향을 기반으로 짧은 대화를 생성한다.

### ROOM 변화

사용자의 변화에 따라 아래 요소를 변경할 수 있다.

- 캐릭터 거리
- 캐릭터 표정
- 소품
- 방 오브젝트

---

## 7. 1차 개발에서 제외

- 3D 공간
- 캐릭터 자유 이동
- 실시간 멀티플레이
- 다른 사용자 방 방문
- 실시간 채팅
- 캐릭터 상점
- 게임 재화
- AI 캐릭터 무제한 대화
- 복잡한 SNS 기능
- 매일 새로운 AI 캐릭터 이미지 생성

---

## 8. 사용 기술

### Mobile

- React Native
- Expo
- TypeScript

### Backend / Database

- Supabase

### AI

- OpenAI API

### Design

- Figma

### Collaboration

- GitHub

---

## 9. 팀 구성

총 7명

| 역할 | 인원 | 담당 |
|---|---:|---|
| Team Lead | 1 | 일정, 기능 범위, GitHub 관리, 전체 연결 |
| Frontend A | 1 | 온보딩 / SELF / IDEAL |
| Frontend B | 1 | ROOM / MIRROR / Compare |
| Backend A | 1 | Supabase / DB / 친구 설문 |
| Backend B | 1 | OpenAI / AI 분석 / 점수 계산 |
| Design | 1 | Figma / UI / 캐릭터 / ROOM |
| QA & Support | 1 | 기능 테스트 / 데이터 / 개발 지원 |

역할은 진행 상황에 따라 조정한다.

---

## 10. Frontend 담당

### Frontend A

담당 화면

```text
Splash
Onboarding
SelfForm
SelfResult
IdealForm
IdealResult
```

담당 흐름

```text
앱 시작
↓
SELF 만들기
↓
IDEAL 만들기
```

### Frontend B

담당 화면

```text
Room
MirrorInvite
MirrorResult
Compare
DailyLog
```

담당 흐름

```text
ROOM
↓
친구 초대
↓
MIRROR
↓
세 캐릭터 비교
```

---

## 11. Backend 담당

### Backend A

담당 기능

- Supabase 프로젝트 설정
- 사용자 데이터 저장
- Persona 저장
- 친구 설문 링크 생성
- 친구 설문 저장
- 친구 응답 수 확인
- MIRROR 생성 조건 확인

### Backend B

담당 기능

- OpenAI API 연결
- SELF 분석
- IDEAL 분석
- MIRROR 분석
- 캐릭터 칭호 생성
- 캐릭터 설명 생성
- 6개 성향 점수 처리
- 세 Persona 일치도 계산

OpenAI API Key는 앱 코드나 GitHub Repository에 저장하지 않는다.

---

## 12. Design 담당

Figma를 기준으로 개발한다.

우선 제작 항목

```text
App Color
Typography
Button
Input
Card

SelfForm
SelfResult

IdealForm
IdealResult

Room

MirrorInvite
MirrorResult

Compare
```

캐릭터는 조립형 구조를 우선 사용한다.

예시

```text
표정
의상
소품
효과
```

캐릭터를 매번 AI 이미지로 새로 생성하지 않는다.

---

## 13. Frontend / Backend 동시 개발 (초기 개발 방식)

초기 단계에서는 Frontend가 Backend 기능 완성을 기다리지 않고 Mock Data를 이용해 화면을 먼저 개발했다. 현재 앱의 핵심 흐름은 Supabase 실제 데이터와 연결되어 있다.

예시

```ts
const mockSelf = {
  title: "고독한 관찰자",
  summary: "주변을 세심하게 관찰하지만 자신의 감정은 쉽게 드러내지 않습니다.",

  scores: {
    socialEnergy: 42,
    expression: 31,
    initiative: 58,
    empathy: 84,
    stability: 47,
    execution: 55
  }
};
```

Backend는 동일한 형식의 실제 데이터를 반환하도록 개발한다.

```text
Frontend
Mock Data 기반 화면 개발

Backend
DB / AI / 데이터 기능 개발

↓ 이후 연결

실제 데이터 기반 화면
```

---

## 14. 기본 데이터 구조

SELF / MIRROR / IDEAL은 동일한 데이터 구조를 사용한다.

```ts
type PersonaType = "SELF" | "MIRROR" | "IDEAL";

type PersonaScores = {
  socialEnergy: number;
  expression: number;
  initiative: number;
  empathy: number;
  stability: number;
  execution: number;
};

type Persona = {
  id: string;
  type: PersonaType;
  title: string;
  summary: string;
  keywords: string[];
  scores: PersonaScores;
};
```

Frontend와 Backend 모두 이 구조를 기준으로 작업한다.

---

## 15. 프로젝트 폴더 구조

```text
me-room/
│
├─ app/
│  ├─ onboarding/
│  │
│  ├─ self/
│  │  ├─ form.tsx
│  │  └─ result.tsx
│  │
│  ├─ ideal/
│  │  ├─ form.tsx
│  │  └─ result.tsx
│  │
│  ├─ room/
│  │
│  ├─ mirror/
│  │
│  ├─ compare/
│  │
│  └─ daily/
│
├─ src/
│  ├─ components/
│  │  └─ 공통 UI
│  │
│  ├─ services/
│  │  └─ Backend 연결
│  │
│  ├─ mocks/
│  │  └─ Frontend 임시 데이터
│  │
│  ├─ types/
│  │  └─ 데이터 구조
│  │
│  ├─ constants/
│  │  └─ 질문 / 태그 등 고정 데이터
│  │
│  └─ lib/
│     └─ Supabase 설정
│
├─ assets/
│  ├─ characters/
│  ├─ room/
│  └─ icons/
│
├─ supabase/
│  └─ 서버 기능
│
├─ docs/
│
├─ .gitignore
├─ package.json
└─ README.md
```

---

## 16. GitHub 작업 방식

`main` 브랜치는 현재 정상적으로 실행되는 프로젝트를 유지한다.

main에서 직접 개발하지 않는다.

작업 시작 전

```bash
git switch main
git pull origin main
```

새로운 기능을 시작할 때 작업용 브랜치를 생성한다.

```bash
git switch -c feat/self-form
```

브랜치는 사람별이 아니라 기능별로 만든다.

예시

```text
feat/self-form
feat/self-result
feat/ideal-form
feat/room-screen
feat/friend-survey
feat/mirror-result
feat/ai-persona
```

오류 수정

```text
fix/mirror-count
fix/login-error
```

디자인 관련

```text
design/room-assets
design/character-assets
```

---

## 17. 작업 완료 후

```bash
git add .
git commit -m "feat: SELF 입력 화면 구현"
git push -u origin feat/self-form
```

GitHub에서 Pull Request를 생성한다.

```text
작업 브랜치
↓
Pull Request
↓
Review
↓
main
```

Merge 이후 새로운 작업을 시작할 때는 다시 최신 main을 기준으로 새로운 브랜치를 생성한다.

---

## 18. Commit 규칙

새 기능

```text
feat: SELF 입력 화면 구현
```

오류 수정

```text
fix: MIRROR 응답 수 오류 수정
```

디자인

```text
design: ROOM 캐릭터 위치 수정
```

문서

```text
docs: README 역할 분담 수정
```

---

## 19. Repository 보안

GitHub Repository에는 아래 정보를 올리지 않는다.

```text
.env
OpenAI API Key
Supabase Service Role Key
DB 비밀번호
개인 계정 비밀번호
```

실제 환경변수 파일은 `.gitignore`에 포함한다.

Repository에는 실제 값이 없는 `.env.example`만 작성한다.

---

## 20. 작업 관리

GitHub Issue 하나를 하나의 작업 단위로 사용한다.

예시

```text
[FE] SELF 입력 화면
[FE] ROOM 화면

[BE] SELF AI 분석
[BE] 친구 설문 저장

[DESIGN] ROOM 화면 디자인
```

작업 상태

```text
Todo
↓
Doing
↓
Review
↓
Done
```

---

## 21. 개발 순서

### STEP 1. 프로젝트 기본 구조

```text
Expo 프로젝트 생성
폴더 구조 생성
화면 이동 설정
Supabase 프로젝트 생성
Figma 기본 디자인
```

### STEP 2. 각 파트 동시 개발

Frontend

```text
Mock Data 기반 화면 개발
```

Backend

```text
DB
AI
친구 설문
```

Design

```text
Figma
캐릭터
ROOM
UI Assets
```

### STEP 3. 기능 연결

```text
SELF Frontend
↕
SELF Backend

IDEAL Frontend
↕
IDEAL Backend

Friend Survey
↕
Supabase

MIRROR
↕
Friend Responses

Compare
↕
Persona Scores
```

각 기능을 하나씩 연결하고 테스트한다.

---

## 22. 1차 완료 기준

아래 흐름이 실제 모바일 기기에서 처음부터 끝까지 작동하면 1차 개발 완료로 본다.

```text
앱 실행
↓
SELF 생성
↓
IDEAL 생성
↓
ROOM
↓
친구 링크 생성
↓
친구 설문
↓
MIRROR 생성
↓
세 캐릭터 ROOM 등장
↓
세 캐릭터 비교 결과
```

위 흐름을 완성한 이후 추가 기능 개발을 진행한다.
