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

export async function submitFriendResponse(
  surveyId: string,
  response: FriendResponse,
) {
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
    .select('id,user_id,token,status,response_count,min_responses,created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function getLatestFriendSurvey(userId: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('friend_surveys')
    .select('id,user_id,token,status,response_count,min_responses,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getActiveFriendSurvey(userId: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('friend_surveys')
    .select('id,user_id,token,status,response_count,min_responses,created_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getOrCreateFriendSurvey(userId: string) {
  // MVP에서는 기존 설문이 있으면 active/closed 여부와 관계없이 재사용합니다.
  // 3/3이 된 closed 설문을 버리고 새 0/3 설문을 만드는 것을 방지합니다.
  const existingSurvey = await getLatestFriendSurvey(userId);

  if (existingSurvey) {
    return existingSurvey;
  }

  return createFriendSurvey(userId);
}