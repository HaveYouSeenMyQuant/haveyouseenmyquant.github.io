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

-- Added when js/sync.js started mirroring the local store (see site/js/store.js).
-- These are the pieces of player state that have no natural column above:
--   lessons      lessonId -> { crowns, completions, bestFirstTry, lastTs }
--   day_xp       'YYYY-MM-DD' -> xp earned that day (last 30 days only)
-- hearts is deliberately NOT written by the browser: hearts are per-lesson and
-- refill on every start, so there is nothing device-spanning to sync yet.
alter table public.profiles add column if not exists lessons     jsonb   not null default '{}'::jsonb;
alter table public.profiles add column if not exists day_xp      jsonb   not null default '{}'::jsonb;
alter table public.profiles add column if not exists best_streak integer not null default 0;
alter table public.profiles add column if not exists synced_at   timestamptz;

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

-- Deliberately NO delete policy.
--
-- paid_libs must NOT be writable by the browser: it is set server-side after
-- payment, and if a learner could write it the paywall would be one devtools
-- call away. Row Level Security alone does NOT do this — the "update own
-- profile" policy above is per-ROW, and Supabase's default grants hand the
-- `authenticated` role UPDATE on every COLUMN. Verified on 2026-07-31 by
-- PATCHing paid_libs with a real user token: it came back 200 and the row said
-- {'janestreet'}. The fix is column-level, and it is the only thing standing
-- between a signed-in browser and free paid libraries:
revoke update on public.profiles from anon, authenticated;
grant  update (id, email, xp, streak_days, last_active, hearts, hearts_at,
               daily_goal, lessons, day_xp, best_streak, synced_at)
  on public.profiles to authenticated;
-- `id` is in that list because an upsert's ON CONFLICT DO UPDATE writes every
-- column in the payload, id included, and PostgREST always sends it. It is not a
-- hole: the policy's `with check (auth.uid() = id)` refuses any row whose id is
-- not yours, so the only id you can write is your own. Verified: upserting
-- someone else's id returns "new row violates row-level security policy".
-- The same for INSERT, because js/sync.js upserts the profile (a PATCH against a
-- row that does not exist writes nothing and still returns 2xx, which would lose
-- a player's XP in silence if the signup trigger ever failed). Without this, the
-- insert half of that upsert would be a way back in to paid_libs.
revoke insert on public.profiles from anon, authenticated;
grant  insert (id, email, xp, streak_days, last_active, hearts, hearts_at,
               daily_goal, lessons, day_xp, best_streak, synced_at)
  on public.profiles to authenticated;
-- Re-verified after applying: writing paid_libs returns 42501 by either verb,
-- and a normal xp/lessons/day_xp upsert still returns 204.

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

-- =========================================================================
-- MEMBERSHIP (Gumroad) — the server half of site/js/payments.js
-- =========================================================================
-- DEPLOY THIS. Everything below is new; paste the whole file into the Supabase
-- SQL editor and run it. It is idempotent, so re-running is safe. Then insert
-- the product id (one row, see gumroad_config) or every redemption is refused.
--
-- WHY ANY OF THIS EXISTS. The site is static on GitHub Pages: no server, no
-- webhook endpoint, nowhere to keep a secret. So the browser talks to Gumroad
-- directly for the things that need no credentials, and this file is the ONLY
-- thing allowed to decide whether somebody is a member.
--
-- A subscription is not a purchase. Verify once and cache for ever and you have
-- built "subscribe, cancel tomorrow, keep access until the heat death of the
-- universe". Gumroad's verify response has no paid-through date, so the end of
-- the period cannot be computed — it has to be OBSERVED by asking again and
-- watching for subscription_ended_at to appear. Hence: one timestamp,
-- membership_until, pushed forward by a short TTL on every healthy check, and a
-- re-check at most once a day. See the long comment at the top of
-- site/js/payments.js for the reasoning; the ladder below is the same one, and
-- the two must be changed together.
--
-- NOTE ON THE HTTP EXTENSION. The verify call is made from inside Postgres, so
-- the browser is never the thing that says "I paid". Supabase ships pgsql-http;
-- if this create fails on your plan, the alternative is an Edge Function doing
-- the same ladder with the secret key — the client contract (the two RPCs
-- below, same JSON in and out) does not change.
create extension if not exists http with schema extensions;

-- ------------------------------------------------------------- config
-- One row, one product. The Gumroad PRODUCT ID — from the licence-key block on
-- the product's Content tab, the base64-looking string ending in '==' — not the
-- permalink. The browser has its own copy of this id in js/payments.js and that
-- is fine (it is public), but the copy that DECIDES anything is this one: a
-- browser that lies about which product to check would otherwise be checking a
-- product it made up.
--
-- RLS on, no policies, no grants: the browser cannot read or write this table at
-- all. The security-definer functions below own it and bypass RLS.
create table if not exists public.gumroad_config (
  id             boolean primary key default true check (id),
  product_id     text not null,
  access_ttl     interval not null default '3 days',    -- one healthy check is trusted this long
  dunning_grace  interval not null default '7 days',    -- kept in after a failed charge
  recheck_every  interval not null default '1 day'      -- floor between Gumroad calls
);
alter table public.gumroad_config enable row level security;
revoke all on public.gumroad_config from anon, authenticated;

-- OWNER ACTION, once. The product id comes from the "License key" block on the
-- product's Content tab -- and that block is also what TURNS LICENCE KEYS ON.
-- Gumroad has no "generate a licence key per sale" checkbox any more (verified
-- against the live product on 2026-07-31; the option is not on the Product tab,
-- the Content tab, or anywhere in that page's JavaScript). Instead:
--
--     Product -> Content -> "Insert" menu -> "License key", then Save.
--
-- The block then displays the product id. It is a base64-looking string, not
-- the permalink ('otzuy') and not the numeric id on the public page. Then:
--
--   insert into public.gumroad_config (id, product_id)
--   values (true, 'PASTE_GUMROAD_PRODUCT_ID_HERE')
--   on conflict (id) do update set product_id = excluded.product_id;
--
-- Until that row exists redeem_license() answers not_configured and nobody can
-- become a member, which is the correct failure: refusing everyone is a bad day,
-- accidentally admitting everyone is a bad quarter.

-- --------------------------------------------------- membership on profiles
-- Supersedes paid_libs, which was per-library and is left in place only so an
-- older client does not error on a missing column. Nothing writes it any more.
--
--   membership_status      none | active | cancelled | past_due | ended
--                          | refunded | disputed. Narrative only — never the
--                          thing that grants access.
--   membership_until       THE grant. Access iff now() < membership_until.
--                          One field, so there is exactly one definition of
--                          "member" and no screen can invent a second.
--   membership_checked_at  when Gumroad last answered. Drives the daily limit.
--   gumroad_license_key    kept so the re-check needs nothing from the browser.
--                          Unique: one key, one account.
--   gumroad_subscription_id  for reconciling against a Gumroad export by hand.
alter table public.profiles add column if not exists membership_status      text not null default 'none';
alter table public.profiles add column if not exists membership_until       timestamptz;
alter table public.profiles add column if not exists membership_checked_at  timestamptz;
alter table public.profiles add column if not exists gumroad_license_key    text;
alter table public.profiles add column if not exists gumroad_subscription_id text;

create unique index if not exists profiles_license_key_idx
  on public.profiles (gumroad_license_key)
  where gumroad_license_key is not null;

-- THE PROTECTION, restated. The column grants above list exactly which columns
-- `authenticated` may write, so every column added here is unwritable by the
-- browser by construction — there is nothing to revoke because nothing was ever
-- granted. Do NOT "fix" a 42501 by adding a membership column to those grant
-- lists: that is the whole hole this design exists to close. Belt and braces,
-- and a failure that is loud if someone widens the grants later:
revoke update (membership_status, membership_until, membership_checked_at,
               gumroad_license_key, gumroad_subscription_id, paid_libs)
  on public.profiles from anon, authenticated;
revoke insert (membership_status, membership_until, membership_checked_at,
               gumroad_license_key, gumroad_subscription_id, paid_libs)
  on public.profiles from anon, authenticated;

-- ------------------------------------------------------- verify with Gumroad
-- One HTTP call, server-side, no credentials: the licence verify endpoint is
-- deliberately open (product_id + license_key, no access token). Returns the
-- parsed body, or null when Gumroad could not be reached — and the difference
-- between those two matters enormously downstream: a null is an outage and must
-- never revoke anybody.
--
-- urlencode is not decoration. Gumroad product ids are base64 and routinely
-- contain '+' and '=', and a raw '+' in a form body decodes as a space, which
-- would make a correct id look wrong.
create or replace function public.gumroad_verify(p_product_id text, p_license_key text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_status  integer;
  v_content text;
begin
  perform extensions.http_set_curlopt('CURLOPT_TIMEOUT', '8');

  select r.status, r.content into v_status, v_content
  from extensions.http_post(
    'https://api.gumroad.com/v2/licenses/verify',
    'product_id='   || extensions.urlencode(p_product_id) ||
    '&license_key=' || extensions.urlencode(p_license_key) ||
    -- never true: `uses` is a seat counter, and a membership that re-checks
    -- daily would burn through any seat limit inside a week.
    '&increment_uses_count=false',
    'application/x-www-form-urlencoded'
  ) as r;

  if v_status is null then
    return null;                       -- unreachable: an outage, not a verdict
  end if;
  if v_status = 404 then
    return jsonb_build_object('success', false);   -- a real "no such key"
  end if;
  if v_status <> 200 then
    return null;                       -- 5xx, rate limit: also not a verdict
  end if;
  return v_content::jsonb;
exception when others then
  return null;                         -- extension missing, DNS, timeout, bad json
end $$;

-- ------------------------------------------------------------- the ladder
-- Gumroad's field names, read off the live API docs on 2026-07-31 and not
-- guessed. All three subscription_* fields are documented "subscription product
-- only" and are null for a one-off:
--
--   refunded / chargebacked / disputed + dispute_won   money went back -> out
--   subscription_ended_at      it is genuinely over -> out, at that instant
--   subscription_failed_at     card declined. Gumroad RETRIES for days. Do not
--                              revoke on the first bounce: a billing hiccup
--                              turned into a lockout is how a hiccup becomes a
--                              cancellation. Keep them in for dunning_grace; if
--                              it truly fails Gumroad sets subscription_ended_at
--                              and the branch above revokes properly.
--   subscription_cancelled_at  they cancelled, but Gumroad has NOT ended it —
--                              they keep what they paid for. So: still in, on a
--                              short TTL, and the daily re-check catches
--                              subscription_ended_at within a day of it landing.
--                              That is "runs to the end of the paid period"
--                              without ever knowing the date.
--   otherwise                  active, on the same short TTL.
--
-- Order matters, top to bottom. Returns (status, until).
create or replace function public.gumroad_state(p_body jsonb, p_cfg public.gumroad_config)
returns table (status text, valid_until timestamptz)
language plpgsql
stable                      -- calls now(): stable, never immutable. An immutable
                            -- function may be constant-folded, which would freeze
                            -- every TTL to whenever the plan was first made.
as $$
declare
  p jsonb := coalesce(p_body -> 'purchase', '{}'::jsonb);
begin
  if coalesce((p ->> 'refunded')::boolean, false)
     or coalesce((p ->> 'chargebacked')::boolean, false)
     or (coalesce((p ->> 'disputed')::boolean, false)
         and not coalesce((p ->> 'dispute_won')::boolean, false)) then
    return query select
      case when coalesce((p ->> 'disputed')::boolean, false) then 'disputed' else 'refunded' end,
      now();                                   -- now() is not in the future: revoked
  elsif p ->> 'subscription_ended_at' is not null then
    return query select 'ended', (p ->> 'subscription_ended_at')::timestamptz;
  elsif p ->> 'subscription_failed_at' is not null then
    return query select 'past_due',
      (p ->> 'subscription_failed_at')::timestamptz + p_cfg.dunning_grace;
  elsif p ->> 'subscription_cancelled_at' is not null then
    return query select 'cancelled', now() + p_cfg.access_ttl;
  else
    return query select 'active', now() + p_cfg.access_ttl;
  end if;
end $$;

-- --------------------------------------------------------- redeem_license()
-- Called by the browser with the key the customer pasted. THE only way a
-- membership is ever granted.
--
-- Returns the same jsonb shape as verify_membership():
--   { ok, status, until, checked_at, code?, message? }
--
-- codes: not_configured | bad_format | unknown_key | other_account | network
create or replace function public.redeem_license(p_license_key text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid    uuid := auth.uid();
  v_key    text := upper(regexp_replace(coalesce(p_license_key, ''), '\s', '', 'g'));
  v_cfg    public.gumroad_config;
  v_body   jsonb;
  v_status text;
  v_until  timestamptz;
  v_owner  uuid;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'code', 'no_session', 'status', 'none');
  end if;

  -- Validated, not escaped-and-hoped. Anything outside this alphabet cannot
  -- reach the HTTP call at all.
  if v_key !~ '^[A-Za-z0-9-]{8,64}$' then
    return jsonb_build_object('ok', false, 'code', 'bad_format', 'status', 'none');
  end if;

  select * into v_cfg from public.gumroad_config where id;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_configured', 'status', 'none');
  end if;

  -- One key, one account. Without this, a key posted in a group chat is a free
  -- membership for everyone in it. The same account re-redeeming its own key is
  -- the RESTORE path and must always work.
  select id into v_owner from public.profiles
   where gumroad_license_key = v_key and id <> v_uid;
  if found then
    return jsonb_build_object('ok', false, 'code', 'other_account', 'status', 'none');
  end if;

  v_body := public.gumroad_verify(v_cfg.product_id, v_key);
  if v_body is null then
    -- Could not reach Gumroad. Say so; change nothing.
    return jsonb_build_object('ok', false, 'code', 'network', 'status', 'none');
  end if;
  if coalesce((v_body ->> 'success')::boolean, false) is not true then
    return jsonb_build_object('ok', false, 'code', 'unknown_key', 'status', 'none');
  end if;

  select s.status, s.valid_until into v_status, v_until
  from public.gumroad_state(v_body, v_cfg) s;

  -- The SELECT above and this UPDATE are not atomic together, so two accounts
  -- redeeming the same key at the same instant can both get past the check and
  -- one of them trips the unique index. Catching it turns a 500 into the same
  -- honest sentence the check would have given.
  begin
    update public.profiles set
      membership_status       = v_status,
      membership_until        = v_until,
      membership_checked_at   = now(),
      gumroad_license_key     = v_key,
      gumroad_subscription_id = v_body -> 'purchase' ->> 'subscription_id'
    where id = v_uid;
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'code', 'other_account', 'status', 'none');
  end;

  return jsonb_build_object(
    'ok',         v_until > now(),
    'status',     v_status,
    'until',      v_until,
    'checked_at', now(),
    'code',       case when v_until > now() then null else v_status end
  );
end $$;

-- ------------------------------------------------------ verify_membership()
-- The re-check. Called on sign-in and on boot; hits Gumroad at most once per
-- recheck_every and otherwise answers from the row.
--
-- The failure posture is the point. If Gumroad is unreachable we return the
-- CACHED grant untouched, so an outage can never look like a cancellation —
-- with a 3-day TTL and a daily check, Gumroad can be down for two days straight
-- and every paying member still gets in. A member who has genuinely lapsed
-- loses access at the next successful check, and in any case when their
-- membership_until runs out. Stale-but-recent is fine; permanent access after
-- cancellation is not.
create or replace function public.verify_membership()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid    uuid := auth.uid();
  v_p      public.profiles;
  v_cfg    public.gumroad_config;
  v_body   jsonb;
  v_status text;
  v_until  timestamptz;
  v_has_cfg boolean;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'code', 'no_session', 'status', 'none');
  end if;

  select * into v_p from public.profiles where id = v_uid;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'no_profile', 'status', 'none');
  end if;

  -- Nothing to re-check: they never redeemed a key here.
  if v_p.gumroad_license_key is null then
    return jsonb_build_object('ok', false, 'status', coalesce(v_p.membership_status, 'none'),
                              'until', v_p.membership_until, 'checked_at', v_p.membership_checked_at);
  end if;

  select * into v_cfg from public.gumroad_config where id;
  v_has_cfg := found;

  -- Inside the window: answer from the row, do not touch Gumroad. The client
  -- rate-limits too, but a limit only the client enforces is not one.
  if v_has_cfg and v_p.membership_checked_at is not null
     and v_p.membership_checked_at > now() - v_cfg.recheck_every then
    return jsonb_build_object('ok', v_p.membership_until > now(),
                              'status', v_p.membership_status,
                              'until', v_p.membership_until,
                              'checked_at', v_p.membership_checked_at,
                              'cached', true);
  end if;

  if not v_has_cfg then
    return jsonb_build_object('ok', v_p.membership_until > now(),
                              'status', v_p.membership_status,
                              'until', v_p.membership_until,
                              'checked_at', v_p.membership_checked_at);
  end if;

  v_body := public.gumroad_verify(v_cfg.product_id, v_p.gumroad_license_key);

  if v_body is null then
    -- OUTAGE. Hand back exactly what we had. No write, no revocation, and
    -- membership_checked_at is deliberately NOT moved, so the next page load
    -- tries again rather than waiting out the day.
    return jsonb_build_object('ok', v_p.membership_until > now(),
                              'status', v_p.membership_status,
                              'until', v_p.membership_until,
                              'checked_at', v_p.membership_checked_at,
                              'stale', true);
  end if;

  if coalesce((v_body ->> 'success')::boolean, false) is not true then
    -- The key stopped existing: product deleted, or the key was disabled in
    -- Gumroad. That IS a verdict, so honour it.
    v_status := 'ended';
    v_until  := now();
  else
    select s.status, s.valid_until into v_status, v_until
    from public.gumroad_state(v_body, v_cfg) s;
  end if;

  update public.profiles set
    membership_status     = v_status,
    membership_until      = v_until,
    membership_checked_at = now()
  where id = v_uid;

  return jsonb_build_object('ok', v_until > now(), 'status', v_status,
                            'until', v_until, 'checked_at', now());
end $$;

-- ----------------------------------------------------------------- grants
-- Definer functions run as their owner, so EXECUTE is the whole access control
-- and it has to be narrow. anon gets nothing: you must be signed in to become a
-- member, because a membership with no account behind it cannot follow anyone to
-- a second device, which is the thing people email about.
revoke all on function public.gumroad_verify(text, text)   from public, anon, authenticated;
revoke all on function public.gumroad_state(jsonb, public.gumroad_config) from public, anon, authenticated;
revoke all on function public.redeem_license(text)         from public, anon, authenticated;
revoke all on function public.verify_membership()          from public, anon, authenticated;
grant execute on function public.redeem_license(text)      to authenticated;
grant execute on function public.verify_membership()       to authenticated;
-- gumroad_verify and gumroad_state stay callable only by the two above and by
-- the owner. They are the plumbing, and neither checks who is asking.

-- ---------------------------------------------------------------- waitlist
-- Early-access list for the vitals app (the second page's market-fit search,
-- see program.md 2026-08-16). Deliberately NOT tied to auth.users: this is a
-- cold email capture from a landing page, and asking someone to create an
-- account before they have seen the product is how you lose them.
--
-- RLS is insert-only for anonymous visitors and readable by nobody through the
-- publishable key. The list is read from the local machine with the secret key.
-- Anyone who views source can therefore ADD a row and can never read one, which
-- is exactly the exposure a public landing page should have.
create table if not exists public.waitlist (
  id            bigint generated always as identity primary key,
  email         text not null,
  created_at    timestamptz not null default now(),
  -- which reel/framing sent them, so market-fit search can attribute signups
  source        text,
  -- the free-text answer to "what would you want it to tell you?" -- the whole
  -- point of the exercise; the email is secondary to this
  wants         text,
  -- how often they say they would use it, from a fixed set
  cadence       text
);

create index if not exists waitlist_created_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

-- Insert only. No select policy at all, so the publishable key cannot read the
-- list back -- deny-by-default means the absence of a policy IS the denial.
drop policy if exists "anyone may join the waitlist" on public.waitlist;
create policy "anyone may join the waitlist"
  on public.waitlist for insert to anon, authenticated
  with check (
    email is not null
    and length(email) between 5 and 254
    and email like '%_@_%._%'
    and (wants is null or length(wants) <= 2000)
    and (source is null or length(source) <= 120)
    and (cadence is null or length(cadence) <= 40)
  );
