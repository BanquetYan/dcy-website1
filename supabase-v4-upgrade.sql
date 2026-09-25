-- 鼎程溢網站 V4：聯絡資訊後台
-- 請整段貼到 Supabase SQL Editor 執行一次

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  email text default '',
  line_url text default '',
  phone text default '',
  instagram_url text default '',
  facebook_url text default '',
  address text default '',
  show_email boolean default true,
  show_line boolean default true,
  show_phone boolean default true,
  show_instagram boolean default false,
  show_facebook boolean default false,
  show_address boolean default false,
  updated_at timestamptz default now()
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admin update site settings" on public.site_settings;
create policy "Admin update site settings"
on public.site_settings for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admin insert site settings" on public.site_settings;
create policy "Admin insert site settings"
on public.site_settings for insert
to authenticated
with check (true);
