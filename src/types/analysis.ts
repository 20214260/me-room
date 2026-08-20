import { PersonaScores, PersonaType } from '@/src/types/persona';

export type PersonaAnalysis = {
  type: PersonaType;
  title: string;
  summary: string;
  keywords: string[];
  scores: PersonaScores;
};

export type DailyAnalysis = {
  title: string;
  summary: string;
  keywords: string[];
  deltas: PersonaScores;
  insight: string;
};
