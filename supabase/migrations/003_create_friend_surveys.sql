-- 친구 설문 링크
create table friend_surveys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  token text unique not null,
  status text default 'active' check (status in ('active', 'closed')),
  response_count int default 0,
  min_responses int default 3,
  created_at timestamptz default now()
);
