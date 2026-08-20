import {
  Persona,
  PersonaScores,
} from '@/src/types/persona';

import {
  createPersona,
} from '@/src/utils/persona';

const scoreKeys = [
  'socialEnergy',
  'expression',
  'initiative',
  'empathy',
  'stability',
  'execution',
] as const satisfies readonly (
  keyof PersonaScores
)[];

const clampScore = (
  value: number,
) =>
  Math.max(
    0,
    Math.min(
      100,
      Math.round(value),
    ),
  );

const clampDelta = (
  value: number,
) =>
  Math.max(
    -3,
    Math.min(
      3,
      Math.round(value),
    ),
  );

export function normalizeDailyDeltas(
  deltas:
    | Partial<PersonaScores>
    | null
    | undefined,
): PersonaScores {
  return scoreKeys.reduce(
    (result, key) => {
      result[key] = clampDelta(
        Number(
          deltas?.[key] ?? 0,
        ),
      );

      return result;
    },
    {} as PersonaScores,
  );
}

export function applyDailyDeltas(
  current: PersonaScores,
  rawDeltas:
    | Partial<PersonaScores>
    | null
    | undefined,
): {
  scores: PersonaScores;
  deltas: PersonaScores;
} {
  const deltas =
    normalizeDailyDeltas(
      rawDeltas,
    );

  const scores =
    scoreKeys.reduce(
      (result, key) => {
        result[key] =
          clampScore(
            current[key] +
              deltas[key],
          );

        return result;
      },
      {} as PersonaScores,
    );

  return {
    scores,
    deltas,
  };
}

export function fallbackDailyAnalysis(
  current: Persona,
  text: string,
) {
  const lower =
    text
      .toLowerCase()
      .trim();

  const deltas:
    Partial<PersonaScores> = {};

  const bump = (
    key: keyof PersonaScores,
    amount: number,
  ) => {
    deltas[key] =
      (deltas[key] ?? 0) +
      amount;
  };

  /*
   * 먼저 "하락 방향"의 명확한 행동을 찾는다.
   *
   * 단순히 기분이 안 좋았다거나
   * 힘들었다는 이유만으로 점수를 낮추지 않고,
   * 실제 행동이 드러난 경우에만 반영한다.
   */

  const socialEnergyDown =
    /사람.*피했|사람.*피하고|모임.*피했|모임.*빠졌|대화.*피했|대화.*부담|사람들.*지쳤|사람.*지쳤|혼자 있고 싶|어울리.*힘들|사람들과.*말.*안/.test(
      lower,
    );

  const expressionDown =
    /말하지 못|말을 못|표현하지 못|표현을 못|감정을 숨겼|감정.*숨겼|속으로만|거절하지 못|참기만|하고 싶은 말을 못/.test(
      lower,
    );

  const initiativeDown =
    /나서지 못|먼저.*못|의견.*말하지 못|의견.*못 말|결정.*미뤘|주저했|망설였|눈치만 봤|회피했|소심하게/.test(
      lower,
    );

  const empathyDown =
    /친구.*무시|상대.*무시|이야기.*무시|공감하지 못|공감을 못|배려하지 못|배려를 못|말을 듣지 않았/.test(
      lower,
    );

  const stabilityDown =
    /당황해서.*못|불안해서.*못|멘붕|감정적으로 반응|욱했|화를 참지 못|쉽게 흔들렸/.test(
      lower,
    );

  const executionDown =
    /미뤘|미루기만|계획만|시작하지 못|시작을 못|끝내지 못|완료하지 못|중간에 포기|포기했|중단했/.test(
      lower,
    );

  /*
   * 같은 지표에 명확한 하락 행동이 있으면
   * 단순 키워드 하나 때문에 동시에 +가 붙지 않도록
   * else-if 구조로 처리한다.
   */

  if (initiativeDown) {
    bump(
      'initiative',
      -2,
    );
  } else if (
    /먼저|제안|주도|도전|시도|결정했|나섰/.test(
      lower,
    )
  ) {
    bump(
      'initiative',
      2,
    );
  }

  if (executionDown) {
    bump(
      'execution',
      -2,
    );
  } else if (
    /시작했|실행|끝냈|완료|해냈|꾸준|마무리/.test(
      lower,
    )
  ) {
    bump(
      'execution',
      2,
    );
  }

  if (expressionDown) {
    bump(
      'expression',
      -2,
    );
  } else if (
    /솔직하게 말|솔직히 말|표현했|말했다|말했|거절했|감정을 표현|의견을 말했다/.test(
      lower,
    )
  ) {
    bump(
      'expression',
      2,
    );
  }

  if (empathyDown) {
    bump(
      'empathy',
      -1,
    );
  } else if (
    /들어줬|들어주|공감|위로|도와|배려|챙겨줬|챙겨주/.test(
      lower,
    )
  ) {
    bump(
      'empathy',
      2,
    );
  }

  if (stabilityDown) {
    bump(
      'stability',
      -2,
    );
  } else if (
    /침착|진정했|차분|버텼|마음을 정리|감정을 정리|평정/.test(
      lower,
    )
  ) {
    bump(
      'stability',
      2,
    );
  }

  if (socialEnergyDown) {
    bump(
      'socialEnergy',
      -1,
    );
  } else if (
    /친구들과 즐겁|사람들과 즐겁|모임에서 적극|대화를 많이|먼저 말을 걸|사람들과 어울|새로운 사람/.test(
      lower,
    )
  ) {
    bump(
      'socialEnergy',
      1,
    );
  }

  const {
    scores,
    deltas: normalized,
  } = applyDailyDeltas(
    current.scores,
    deltas,
  );

  const fallback =
    createPersona(
      'SELF',
      scores,
      current.keywords,
    );

  const changed =
    scoreKeys.filter(
      (key) =>
        normalized[key] !== 0,
    );

  const hasIncrease =
    changed.some(
      (key) =>
        normalized[key] > 0,
    );

  const hasDecrease =
    changed.some(
      (key) =>
        normalized[key] < 0,
    );

  let insight =
    '오늘의 기록은 SELF를 크게 바꾸기보다 현재 모습을 확인해주는 한 조각으로 남겼어요.';

  if (
    hasIncrease &&
    hasDecrease
  ) {
    insight =
      '오늘의 행동에서 서로 다른 방향의 변화가 함께 보여 SELF에 작게 반영했어요.';
  } else if (hasIncrease) {
    insight =
      '오늘의 행동에서 조금 더 강하게 드러난 성향을 SELF에 반영했어요.';
  } else if (hasDecrease) {
    insight =
      '오늘은 평소보다 덜 드러난 성향이 보여 SELF에 작게 반영했어요.';
  }

  return {
    title:
      fallback.title,

    summary:
      current.summary,

    keywords:
      current.keywords,

    deltas:
      normalized,

    insight,
  };
}