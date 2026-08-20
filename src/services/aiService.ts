import { supabase } from './supabase';
import { Persona, PersonaScores } from '@/src/types/persona';
import { DailyAnalysis, PersonaAnalysis } from '@/src/types/analysis';

export async function analyzeInitialPersona(args: {
  type: 'SELF' | 'IDEAL';
  tags: string[];
  text: string;
  baselineScores: PersonaScores;
}): Promise<PersonaAnalysis | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.functions.invoke('analyze-persona', {
    body: {
      mode: 'initial',
      ...args,
    },
  });

  if (error) throw error;
  if (!data?.analysis) return null;

  return data.analysis as PersonaAnalysis;
}

export async function analyzeDailyPiece(args: {
  currentPersona: Persona;
  text: string;
}): Promise<DailyAnalysis | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.functions.invoke('analyze-persona', {
    body: {
      mode: 'daily',
      ...args,
    },
  });

  if (error) throw error;
  if (!data?.analysis) return null;

  return data.analysis as DailyAnalysis;
}
