-- RLS 활성화
alter table profiles enable row level security;
alter table personas enable row level security;
alter table friend_surveys enable row level security;
alter table friend_responses enable row level security;

-- profiles: 본인만 조회/수정
create policy "본인 프로필 조회"
on profiles for select
using (auth.uid() = id);

create policy "본인 프로필 수정"
on profiles for update
using (auth.uid() = id);

-- personas: 본인 것만 CRUD
create policy "본인 persona 조회"
on personas for select
using (auth.uid() = user_id);

create policy "본인 persona 생성"
on personas for insert
with check (auth.uid() = user_id);

create policy "본인 persona 수정"
on personas for update
using (auth.uid() = user_id);

-- friend_surveys: 본인은 CRUD, 누구나 token으로 조회 가능
create policy "본인 survey 관리"
on friend_surveys for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "누구나 token으로 survey 조회"
on friend_surveys for select
using (true);

-- friend_responses: 익명 insert 허용, select는 설문 주인만
create policy "누구나 응답 제출 가능"
on friend_responses for insert
with check (true);

create policy "설문 주인만 응답 조회"
on friend_responses for select
using (
  exists (
    select 1 from friend_surveys
    where friend_surveys.id = friend_responses.survey_id
    and friend_surveys.user_id = auth.uid()
  )
);
