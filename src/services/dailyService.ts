import { supabase } from './supabase';
import { PersonaScores } from '@/src/types/persona';

export async function saveDailyLog(args: {
  userId: string;
  text: string;
  scoreDelta: PersonaScores;
  insight: string;
}) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('daily_logs')
    .insert({
      user_id: args.userId,
      content: args.text,
      score_delta: args.scoreDelta,
      insight: args.insight,
    })
    .select('id,content,score_delta,insight,created_at')
    .single();

  if (error) throw error;
  return data;
}
