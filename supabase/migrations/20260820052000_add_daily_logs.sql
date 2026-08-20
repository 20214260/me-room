-- =========================================================
-- DAILY PIECE: 사용자의 하루 기록과 실제 SELF 변화량 저장
-- =========================================================

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) between 2 and 500),
  score_delta jsonb not null default '{}'::jsonb,
  insight text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists daily_logs_user_created_at_idx
on public.daily_logs (user_id, created_at desc);

alter table public.daily_logs enable row level security;

drop policy if exists "본인 daily log 조회" on public.daily_logs;
create policy "본인 daily log 조회"
on public.daily_logs for select
using (auth.uid() = user_id);

drop policy if exists "본인 daily log 생성" on public.daily_logs;
create policy "본인 daily log 생성"
on public.daily_logs for insert
with check (auth.uid() = user_id);
