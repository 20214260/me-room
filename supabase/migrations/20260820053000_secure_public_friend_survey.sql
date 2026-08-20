-- =========================================================
-- 공개 친구 설문 보안 강화
--
-- 기존에는 anon 사용자가 friend_surveys 전체를 SELECT할 수 있고
-- survey UUID를 알면 friend_responses에 직접 INSERT할 수 있었다.
-- 이제 공개 조회는 token 기반 RPC만 허용하고,
-- 응답 INSERT는 submit-survey Edge Function(service role)에서 처리한다.
-- =========================================================

drop policy if exists "누구나 token으로 survey 조회" on public.friend_surveys;
drop policy if exists "누구나 응답 제출 가능" on public.friend_responses;

create or replace function public.get_public_friend_survey(
  p_token text
)
returns table (
  id uuid,
  token text,
  status text,
  response_count integer,
  min_responses integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    fs.id,
    fs.token,
    fs.status,
    fs.response_count,
    fs.min_responses
  from public.friend_surveys fs
  where fs.token = p_token
    and fs.status = 'active'
  limit 1;
$$;

revoke all on function public.get_public_friend_survey(text) from public;
grant execute on function public.get_public_friend_survey(text) to anon, authenticated;
