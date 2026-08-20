import { supabase } from './supabase';
import { FriendResponse } from '@/src/types/survey';

type PublicSurvey = {
  id: string;
  token: string;
  status: string;
  response_count: number;
  min_responses: number;
};

export async function getSurveyByToken(token: string) {
  if (!supabase) return null;

  // Production path: token-based RPC exposes only the one active survey.
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_public_friend_survey', { p_token: token })
    .maybeSingle();

  if (!rpcError) return rpcData as PublicSurvey | null;

  // Compatibility fallback while the new migration is not pushed yet.
  const { data, error } = await supabase
    .from('friend_surveys')
    .select('id,token,status,response_count,min_responses')
    .eq('token', token)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw rpcError;
  return data as PublicSurvey | null;
}

export async function submitFriendResponse(
  token: string,
  response: FriendResponse,
) {
  if (!supabase) return null;

  const { data, error } = await supabase.functions.invoke('submit-survey', {
    body: {
      token,
      answers: response.answers,
      comment: response.comment ?? '',
    },
  });

  if (!error) return data;

  // Compatibility fallback for the current development DB before the
  // secure Edge Function / RLS migration is deployed.
  const survey = await getSurveyByToken(token);
  if (!survey?.id) throw error;

  const answers = {
    items: response.answers,
    comment: response.comment ?? '',
  };

  const { data: fallbackData, error: fallbackError } = await supabase
    .from('friend_responses')
    .insert({ survey_id: survey.id, answers })
    .select('id')
    .single();

  if (fallbackError) throw error;
  return fallbackData;
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
  // 3명은 최초 MIRROR 입주 기준일 뿐 설문의 종료 조건이 아니다.
  // 기존 설문을 계속 재사용해 4명, 5명 이후의 시선도 누적한다.
  const existingSurvey = await getLatestFriendSurvey(userId);

  if (existingSurvey) {
    return existingSurvey;
  }

  return createFriendSurvey(userId);
}
