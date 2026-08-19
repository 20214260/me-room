-- 친구 응답이 추가될 때 response_count만 계속 증가시킨다.
-- 3명은 MIRROR 최초 해금 기준일 뿐, 설문은 닫지 않는다.

create or replace function public.increment_friend_survey_response_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.friend_surveys
  set response_count = response_count + 1
  where id = new.survey_id;

  return new;
end;
$$;

-- 이전 로직 때문에 이미 closed 된 설문을 다시 열어준다.
update public.friend_surveys
set status = 'active'
where status = 'closed';