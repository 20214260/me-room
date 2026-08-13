import { supabase } from './supabase';
import { Persona, PersonaType } from '@/src/types/persona';

export async function loadPersonas(userId: string): Promise<Persona[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('personas')
    .select('id,type,title,summary,keywords,scores')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []) as Persona[];
}

export async function savePersona(userId: string, persona: Persona) {
  if (!supabase) return persona;
  const payload = {
    user_id: userId,
    type: persona.type,
    title: persona.title,
    summary: persona.summary,
    keywords: persona.keywords,
    scores: persona.scores,
  };
  const { data, error } = await supabase
    .from('personas')
    .upsert(payload, { onConflict: 'user_id,type' })
    .select('id,type,title,summary,keywords,scores')
    .single();
  if (error) throw error;
  return data as Persona;
}

export async function loadPersona(userId: string, type: PersonaType) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('personas')
    .select('id,type,title,summary,keywords,scores')
    .eq('user_id', userId)
    .eq('type', type)
    .maybeSingle();
  if (error) throw error;
  return data as Persona | null;
}
