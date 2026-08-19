-- 친구 응답이 추가될 때 설문의 response_count를 자동 증가
create or replace function public.increment_friend_survey_response_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.friend_surveys
  set
    response_count = response_count + 1,
    status = case
      when response_count + 1 >= min_responses then 'completed'
      else status
    end
  where id = new.survey_id;

  return new;
end;
$$;

create trigger on_friend_response_created
after insert on public.friend_responses
for each row
execute function public.increment_friend_survey_response_count();