-- ────────────────────────────────────────────────────────────
-- 커플 성경공부 웹앱 · Supabase 스키마
-- Supabase SQL 에디터에 그대로 붙여넣고 실행하세요
-- ────────────────────────────────────────────────────────────

-- 1. subscribers (auth.users 와 1:1 매핑)
create table public.subscribers (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  name        text not null default '',
  language    text not null default 'KO',
  start_date  date not null default current_date,
  send_day    text not null default 'monday',
  track       text not null default 'lover'
                check (track in ('lover', 'engaged', 'married')),
  status      text not null default 'active'
                check (status in ('active','paused','canceled')),
  created_at  timestamptz not null default now()
);
alter table public.subscribers enable row level security;
create policy "본인만 조회/수정" on public.subscribers
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2. couples
create table public.couples (
  id            uuid primary key default gen_random_uuid(),
  partner_a     uuid not null references public.subscribers(id),
  partner_b     uuid references public.subscribers(id),
  invite_token  text not null unique default substring(gen_random_uuid()::text, 1, 12),
  status        text not null default 'solo'
                  check (status in ('solo','paired')),
  created_at    timestamptz not null default now()
);
alter table public.couples enable row level security;
create policy "커플 구성원만 조회" on public.couples
  using (
    auth.uid() = partner_a or auth.uid() = partner_b
  );
-- 초대 토큰으로 공개 조회 허용 (합류용)
create policy "토큰으로 공개 조회" on public.couples
  for select using (true);

-- 3. progress
create table public.progress (
  id             uuid primary key default gen_random_uuid(),
  subscriber_id  uuid not null references public.subscribers(id) on delete cascade,
  week_no        int not null check (week_no between 1 and 16),
  completed_at   timestamptz not null default now(),
  unique (subscriber_id, week_no)
);
alter table public.progress enable row level security;
create policy "본인 진도 관리" on public.progress
  using (auth.uid() = subscriber_id)
  with check (auth.uid() = subscriber_id);
-- 파트너 진도 조회: 같은 couple에 속한 경우
create policy "파트너 진도 조회" on public.progress
  for select using (
    exists (
      select 1 from public.couples c
      where (c.partner_a = auth.uid() and c.partner_b = subscriber_id)
         or (c.partner_b = auth.uid() and c.partner_a = subscriber_id)
    )
  );

-- 4. content_weeks (읽기 전용, 서버에서만 접근)
create table public.content_weeks (
  week_no             int primary key check (week_no between 1 and 16),
  title               text not null,
  theme               text not null,
  verse_ref           text not null,
  verse_text          text not null,
  reading             text not null,
  personal_questions  jsonb not null default '[]',
  couple_questions    jsonb not null default '[]',
  application         text not null
);
alter table public.content_weeks enable row level security;
create policy "인증된 사용자 조회" on public.content_weeks
  for select using (auth.uid() is not null);

-- ────────────────────────────────────────────────────────────
-- 헬퍼: 신규 auth 유저 생성 시 subscribers 자동 생성 (옵션)
-- ────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  -- 이미 있으면 skip (subscribe API에서 직접 삽입하므로)
  insert into public.subscribers (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
