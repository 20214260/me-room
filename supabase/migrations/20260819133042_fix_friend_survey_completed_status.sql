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
      when response_count + 1 >= min_responses then 'closed'
      else status
    end
  where id = new.survey_id;

  return new;
end;
$$;