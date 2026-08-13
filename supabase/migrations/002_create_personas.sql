-- 페르소나 (SELF / MIRROR / IDEAL 공통 구조)
create table personas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('SELF', 'MIRROR', 'IDEAL')),
  title text not null,
  summary text not null,
  keywords text[] default '{}',
  scores jsonb not null,
  -- { socialEnergy, expression, initiative, empathy, stability, execution }
  created_at timestamptz default now(),
  unique (user_id, type)
);
