import { FriendResponse } from '@/src/types/survey';

export const demoFriendResponses: FriendResponse[] = [
  {
    id: 'demo-1',
    answers: [
      { questionId: 'q1', trait: 'socialEnergy', value: 58, label: '친한 사람과 주로 이야기함' },
      { questionId: 'q2', trait: 'expression', value: 40, label: '가까운 사람에게만 표현함' },
      { questionId: 'q3', trait: 'initiative', value: 78, label: '해결 방법을 먼저 제안함' },
      { questionId: 'q4', trait: 'empathy', value: 88, label: '감정을 세심하게 알아차림' },
      { questionId: 'q5', trait: 'stability', value: 66, label: '대체로 침착함' },
      { questionId: 'q6', trait: 'execution', value: 74, label: '일단 시작하며 조정함' },
    ],
    comment: '생각보다 필요할 때 먼저 나서는 편이에요.',
  },
  {
    id: 'demo-2',
    answers: [
      { questionId: 'q1', trait: 'socialEnergy', value: 52, label: '친한 사람과 주로 이야기함' },
      { questionId: 'q2', trait: 'expression', value: 44, label: '가까운 사람에게만 표현함' },
      { questionId: 'q3', trait: 'initiative', value: 74, label: '해결 방법을 먼저 제안함' },
      { questionId: 'q4', trait: 'empathy', value: 90, label: '감정을 세심하게 알아차림' },
      { questionId: 'q5', trait: 'stability', value: 72, label: '대체로 침착함' },
      { questionId: 'q6', trait: 'execution', value: 70, label: '일단 시작하며 조정함' },
    ],
    comment: '주변 사람을 챙기는 모습이 강해요.',
  },
];
