import { PersonaScores, TraitTag } from "./types.ts";

const emptyScores = (): PersonaScores => ({
  socialEnergy: 50,
  expression: 50,
  initiative: 50,
  empathy: 50,
  stability: 50,
  execution: 50,
});

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// 프론트 utils/persona.ts의 scoresFromTags와 동일한 로직입니다.
// 점수 계산 소유권을 나중에 팀과 확정하면, 이 함수만 바꾸면 되도록
// 별도 파일로 분리해뒀습니다.
export function scoresFromTags(selected: TraitTag[]): PersonaScores {
  const base = emptyScores();
  const buckets: Record<keyof PersonaScores, number[]> = {
    socialEnergy: [],
    expression: [],
    initiative: [],
    empathy: [],
    stability: [],
    execution: [],
  };

  selected.forEach((tag) => {
    Object.entries(tag.delta).forEach(([key, value]) => {
      if (typeof value === "number") {
        buckets[key as keyof PersonaScores].push(value);
      }
    });
  });

  (Object.keys(base) as (keyof PersonaScores)[]).forEach((key) => {
    if (buckets[key].length) {
      base[key] = clamp(
        buckets[key].reduce((a, b) => a + b, 0) / buckets[key].length,
      );
    }
  });

  return base;
}
