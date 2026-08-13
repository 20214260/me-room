import { PersonaScores } from '@/src/types/persona';

type QuestionOption = { label: string; value: number };
export type SurveyQuestion = {
  id: string;
  prompt: string;
  trait: keyof PersonaScores;
  options: QuestionOption[];
};

export const surveyQuestions: SurveyQuestion[] = [
  {
    id: 'q1',
    prompt: '이 사람은 모임에서 보통 어떤 모습인가요?',
    trait: 'socialEnergy',
    options: [
      { label: '조용히 상황을 보는 편', value: 28 },
      { label: '친한 사람과 주로 이야기함', value: 48 },
      { label: '사람들과 자연스럽게 어울림', value: 72 },
      { label: '분위기를 적극적으로 이끎', value: 90 },
    ],
  },
  {
    id: 'q2',
    prompt: '감정을 다른 사람에게 얼마나 드러내는 편인가요?',
    trait: 'expression',
    options: [
      { label: '거의 드러내지 않음', value: 24 },
      { label: '가까운 사람에게만 표현함', value: 46 },
      { label: '필요할 때는 표현함', value: 68 },
      { label: '솔직하게 표현하는 편', value: 88 },
    ],
  },
  {
    id: 'q3',
    prompt: '문제가 생기면 이 사람은 어떻게 행동할 것 같나요?',
    trait: 'initiative',
    options: [
      { label: '상황을 조금 더 지켜봄', value: 30 },
      { label: '필요하면 의견을 냄', value: 52 },
      { label: '해결 방법을 먼저 제안함', value: 76 },
      { label: '바로 역할을 맡고 움직임', value: 92 },
    ],
  },
  {
    id: 'q4',
    prompt: '친구가 힘들다고 할 때 가장 가까운 모습은?',
    trait: 'empathy',
    options: [
      { label: '해결 방법을 먼저 알려줌', value: 42 },
      { label: '상황을 객관적으로 정리해줌', value: 55 },
      { label: '먼저 이야기를 충분히 들어줌', value: 78 },
      { label: '감정을 세심하게 알아차리고 공감함', value: 92 },
    ],
  },
  {
    id: 'q5',
    prompt: '예상치 못한 일이 생겼을 때 이 사람은?',
    trait: 'stability',
    options: [
      { label: '걱정이 크게 늘어나는 편', value: 30 },
      { label: '조금 흔들리지만 금방 정리함', value: 52 },
      { label: '대체로 침착하게 대응함', value: 76 },
      { label: '압박 속에서도 안정적인 편', value: 90 },
    ],
  },
  {
    id: 'q6',
    prompt: '해야 할 일이 생겼을 때 가장 가까운 모습은?',
    trait: 'execution',
    options: [
      { label: '충분히 생각한 뒤 시작함', value: 34 },
      { label: '계획을 세우고 움직임', value: 56 },
      { label: '일단 시작하며 조정함', value: 78 },
      { label: '결정하면 바로 실행함', value: 92 },
    ],
  },
];
