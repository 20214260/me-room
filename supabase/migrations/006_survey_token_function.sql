-- 랜덤 token 생성 함수 (8자리 영숫자)
create or replace function generate_survey_token()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  result text := '';
  i int;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- friend_surveys.token 컬럼 기본값으로 연결
alter table friend_surveys
alter column token set default generate_survey_token();
