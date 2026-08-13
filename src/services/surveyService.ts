import { supabase } from './supabase';
import { FriendResponse } from '@/src/types/survey';

export async function getSurveyByToken(token: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('friend_surveys')
    .select('id,user_id,token,status,response_count,min_responses')
    .eq('token', token)
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function submitFriendResponse(surveyId: string, response: FriendResponse) {
  if (!supabase) return null;
  const answers = {
    items: response.answers,
    comment: response.comment ?? '',
  };
  const { data, error } = await supabase
    .from('friend_responses')
    .insert({ survey_id: surveyId, answers })
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

export async function createFriendSurvey(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('friend_surveys')
    .insert({ user_id: userId })
    .select('id,token,status,response_count,min_responses')
    .single();
  if (error) throw error;
  return data;
}
