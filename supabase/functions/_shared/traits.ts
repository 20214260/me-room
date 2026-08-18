import { TraitTag } from "./types.ts";

// 프론트 src/constants/traits.ts 와 100% 동일해야 합니다.
export const selfTags: TraitTag[] = [
  { id: "deep-thinker", label: "생각이 많다", delta: { stability: 38, execution: 42 } },
  { id: "responsible", label: "책임감이 강하다", delta: { initiative: 68, execution: 72 } },
  { id: "hide-feelings", label: "감정을 잘 숨긴다", delta: { expression: 28 } },
  { id: "people-energy", label: "사람들과 있으면 충전된다", delta: { socialEnergy: 78 } },
  { id: "alone-energy", label: "혼자 있어야 충전된다", delta: { socialEnergy: 30 } },
  { id: "go-first", label: "먼저 나서는 편이다", delta: { initiative: 78 } },
  { id: "observe-first", label: "먼저 상황을 보는 편이다", delta: { initiative: 38 } },
  { id: "empathy-first", label: "공감부터 하는 편이다", delta: { empathy: 82 } },
  { id: "solution-first", label: "해결책부터 찾는다", delta: { empathy: 45, execution: 70 } },
  { id: "steady", label: "쉽게 흔들리지 않는다", delta: { stability: 80 } },
  { id: "start-now", label: "일단 시작하는 편이다", delta: { execution: 82 } },
  { id: "plan-first", label: "계획을 세운 뒤 움직인다", delta: { execution: 55, stability: 67 } },
];

export const idealTags: TraitTag[] = [
  { id: "ideal-open", label: "감정을 솔직하게 표현하는 사람", delta: { expression: 86 } },
  { id: "ideal-bold", label: "먼저 행동하는 사람", delta: { initiative: 88, execution: 88 } },
  { id: "ideal-social", label: "사람들과 편하게 어울리는 사람", delta: { socialEnergy: 82 } },
  { id: "ideal-calm", label: "상황에 쉽게 흔들리지 않는 사람", delta: { stability: 88 } },
  { id: "ideal-warm", label: "상대의 감정을 잘 이해하는 사람", delta: { empathy: 90 } },
  { id: "ideal-steady", label: "꾸준히 실행하는 사람", delta: { execution: 92, stability: 78 } },
  { id: "ideal-independent", label: "타인의 시선을 덜 의식하는 사람", delta: { stability: 84, initiative: 78 } },
  { id: "ideal-balanced", label: "생각과 행동의 균형이 좋은 사람", delta: { execution: 76, stability: 76 } },
];
