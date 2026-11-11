-- 读易 · 账号数据表（在 Supabase 项目 itkjrodrzenefmxsyrnx 的 SQL Editor 里整段执行）
-- 一用户一行：收藏、已读、折叠框、图层、界面偏好全塞在 data 里，
-- 前端做并集合并，不需要为每种数据建一张表。

create table if not exists public.zy_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  ts         bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.zy_state enable row level security;

-- 旧策略先删后建，重复执行不会报错
drop policy if exists "zy_state select own" on public.zy_state;
drop policy if exists "zy_state insert own" on public.zy_state;
drop policy if exists "zy_state update own" on public.zy_state;
drop policy if exists "zy_state delete own" on public.zy_state;

create policy "zy_state select own" on public.zy_state
  for select using (auth.uid() = user_id);

create policy "zy_state insert own" on public.zy_state
  for insert with check (auth.uid() = user_id);

create policy "zy_state update own" on public.zy_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "zy_state delete own" on public.zy_state
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.zy_state to authenticated;
