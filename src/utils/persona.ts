import { TraitTag } from '@/src/constants/traits';
import { Persona, PersonaScores, PersonaType } from '@/src/types/persona';

const emptyScores = (): PersonaScores => ({
  socialEnergy: 50,
  expression: 50,
  initiative: 50,
  empathy: 50,
  stability: 50,
  execution: 50,
});

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

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
      if (typeof value === 'number') buckets[key as keyof PersonaScores].push(value);
    });
  });

  (Object.keys(base) as (keyof PersonaScores)[]).forEach((key) => {
    if (buckets[key].length) {
      base[key] = clamp(buckets[key].reduce((a, b) => a + b, 0) / buckets[key].length);
    }
  });

  return base;
}

function titleFor(type: PersonaType, scores: PersonaScores) {
  const strongest = (Object.entries(scores) as [keyof PersonaScores, number][]).sort((a, b) => b[1] - a[1])[0][0];
  const titles: Record<PersonaType, Record<keyof PersonaScores, string>> = {
    SELF: {
      socialEnergy: '사람 사이를 읽는 연결자',
      expression: '감정을 언어로 만드는 표현가',
      initiative: '조용히 판을 움직이는 설계자',
      empathy: '마음을 먼저 읽는 관찰자',
      stability: '흔들림을 다루는 균형자',
      execution: '생각을 현실로 옮기는 실행가',
    },
    MIRROR: {
      socialEnergy: '사람을 모으는 분위기 메이커',
      expression: '마음을 숨기지 않는 솔직한 사람',
      initiative: '필요할 때 앞에 서는 수호자',
      empathy: '주변을 편하게 만드는 조력자',
      stability: '위기에서 중심을 잡는 사람',
      execution: '말보다 행동이 빠른 추진자',
    },
    IDEAL: {
      socialEnergy: '경계를 넘어가는 연결자',
      expression: '마음을 그대로 전하는 표현가',
      initiative: '두려움보다 먼저 걷는 개척자',
      empathy: '사람의 마음을 품는 안내자',
      stability: '자기 중심을 지키는 항해자',
      execution: '결심을 결과로 만드는 실천가',
    },
  };
  return titles[type][strongest];
}

export function createPersona(type: PersonaType, scores: PersonaScores, keywords: string[]): Persona {
  const title = titleFor(type, scores);
  const summaryMap: Record<PersonaType, string> = {
    SELF: '내가 스스로 인식하고 있는 성향을 바탕으로 만든 현재의 나입니다.',
    MIRROR: '친구들의 응답을 모아 타인의 시선에서 다시 구성한 나입니다.',
    IDEAL: '앞으로 더 가까워지고 싶은 모습과 가치관을 담은 미래의 나입니다.',
  };

  return {
    id: `${type.toLowerCase()}-${Date.now()}`,
    type,
    title,
    summary: summaryMap[type],
    keywords: keywords.slice(0, 4),
    scores,
  };
}

export function similarity(a: PersonaScores, b: PersonaScores) {
  const keys = Object.keys(a) as (keyof PersonaScores)[];
  const avgGap = keys.reduce((sum, key) => sum + Math.abs(a[key] - b[key]), 0) / keys.length;
  return clamp(100 - avgGap);
}

export function biggestGap(a: PersonaScores, b: PersonaScores) {
  const keys = Object.keys(a) as (keyof PersonaScores)[];
  return keys.sort((x, y) => Math.abs(a[y] - b[y]) - Math.abs(a[x] - b[x]))[0];
}
