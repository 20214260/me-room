-- 친구 응답
create table friend_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references friend_surveys(id) on delete cascade not null,
  answers jsonb not null,
  created_at timestamptz default now()
);
