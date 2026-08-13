export type PersonaType = 'SELF' | 'MIRROR' | 'IDEAL';

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

export const scoreLabels: Record<keyof PersonaScores, string> = {
  socialEnergy: '관계 에너지',
  expression: '감정 표현',
  initiative: '주도성',
  empathy: '공감성',
  stability: '안정성',
  execution: '실행력',
};
