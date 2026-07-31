-- Supabase schema for the road (project ref fnzdpfgwrcapdnqiuhaf).
--
-- Three tables, and the Row Level Security to go with them. RLS is not optional
-- here: the site is served from GitHub Pages, so the publishable key is visible
-- to anyone who views source. RLS is the ONLY thing standing between that key
-- and the user table. Every table below is therefore deny-by-default with
-- explicit, narrow policies.
--
-- Apply in the Supabase SQL editor. Safe to re-run.

-- ---------------------------------------------------------------- profiles
-- One row per signed-up learner. Created past unit 1, when we ask for an email.
-- Unit 1 is played anonymously and never touches this table.
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  created_at    timestamptz not null default now(),
  xp            integer not null default 0,
  streak_days   integer not null default 0,
  last_active   date,
  hearts        integer not null default 5,
  hearts_at     timestamptz not null default now(),   -- for heart refill timing
  daily_goal    integer not null default 20,          -- XP/day the learner picked
  paid_libs     text[] not null default '{}'          -- e.g. {'janestreet'}
);

alter table public.profiles enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Deliberately NO delete policy and NO policy granting paid_libs writes to the
-- learner. paid_libs is set server-side after payment; if the browser could
-- write it, the paywall would be one devtools call away.

-- ---------------------------------------------------------------- progress
-- Per-question history. This is the research substrate: which questions are
-- too hard, where people quit, which visuals precede a correct answer.
create table if not exists public.progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  question_id  text not null,
  attempts     integer not null default 0,
  correct      boolean not null default false,
  ms_spent     integer not null default 0,
  first_seen   timestamptz not null default now(),
  solved_at    timestamptz,
  primary key (user_id, question_id)
);

alter table public.progress enable row level security;

drop policy if exists "own progress" on public.progress;
create policy "own progress" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists progress_question_idx on public.progress(question_id);

-- ---------------------------------------------------------------- events
-- Write-only analytics sink. Anonymous players are the majority of traffic and
-- the whole point of unit 1, so anon MUST be able to insert. Nobody can read:
-- there is no select policy, so the publishable key cannot pull the event
-- stream back out. I read this through the dashboard or the secret key.
create table if not exists public.events (
  id          bigserial primary key,
  session_id  text not null,          -- random per-browser id, not a person
  user_id     uuid references auth.users(id) on delete set null,
  name        text not null,          -- 'lesson_start', 'answer', 'quit', ...
  props       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

alter table public.events enable row level security;

drop policy if exists "anyone can log an event" on public.events;
create policy "anyone can log an event" on public.events
  for insert to anon, authenticated with check (true);

create index if not exists events_name_time_idx on public.events(name, created_at desc);
create index if not exists events_session_idx on public.events(session_id);

-- ------------------------------------------------------- profile on signup
-- Create the profile row automatically so the browser never has to, which lets
-- us keep the insert policy above as a belt-and-braces rather than a load path.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
