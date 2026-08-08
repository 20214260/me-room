-- 사용자 프로필 (Supabase auth.users 확장)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  created_at timestamptz default now()
);
