// 주의: 이 파일은 프론트의 src/types/persona.ts, src/constants/traits.ts와
// 항상 같은 내용을 유지해야 합니다. 프론트에서 태그나 점수 구조를 바꾸면
// 여기도 같이 수정하세요 (현재는 RN 프로젝트와 Deno 프로젝트가 분리돼 있어
// import 공유가 안 되므로 수동 동기화합니다).

export type PersonaType = "SELF" | "MIRROR" | "IDEAL";

export type PersonaScores = {
  socialEnergy: number;
  expression: number;
  initiative: number;
  empathy: number;
  stability: number;
  execution: number;
};

export type Persona = {
  id: string;
  type: PersonaType;
  title: string;
  summary: string;
  keywords: string[];
  scores: PersonaScores;
};

export type TraitTag = {
  id: string;
  label: string;
  delta: Partial<PersonaScores>;
};
