-- 鼎程溢 DCY 官網 CMS V5 升級
-- 只需在 Supabase SQL Editor 執行一次。本檔不會重複新增 V3 的種子資料。

create table if not exists public.about_content (
  id integer primary key default 1 check (id=1),
  title text default '關於鼎程溢',
  summary text default '',
  content text default '',
  philosophy text default '',
  updated_at timestamptz default now()
);
insert into public.about_content(id,title,summary,content,philosophy)
values(1,'關於鼎程溢','專注於 3D 列印、產品打樣與設計開發服務。',
'從初期構想、3D 建模、材料與製程評估，到實際樣品製作，協助客戶快速將想法轉化為實體產品。',
'重視穩定品質、溝通效率與實際應用。')
on conflict(id) do nothing;

alter table public.services add column if not exists full_content text default '';
alter table public.services add column if not exists applications text default '';
alter table public.services add column if not exists image_url text default '';

alter table public.materials add column if not exists summary text default '';
alter table public.materials add column if not exists full_content text default '';
alter table public.materials add column if not exists features text default '';
alter table public.materials add column if not exists applications text default '';
alter table public.materials add column if not exists cautions text default '';
alter table public.materials add column if not exists strength integer default 3 check (strength between 1 and 5);
alter table public.materials add column if not exists toughness integer default 3 check (toughness between 1 and 5);
alter table public.materials add column if not exists heat_resistance integer default 3 check (heat_resistance between 1 and 5);
alter table public.materials add column if not exists surface_quality integer default 3 check (surface_quality between 1 and 5);
alter table public.materials add column if not exists image_url text default '';

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_name text default '',
  hide_client boolean default true,
  service_id uuid references public.services(id) on delete set null,
  material_id uuid references public.materials(id) on delete set null,
  summary text default '',
  content text default '',
  cover_url text default '',
  gallery_urls text[] default '{}',
  featured boolean default false,
  published boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.dm_files (
  id integer primary key default 1 check(id=1),
  title text default '鼎程溢公司服務 DM',
  file_url text default '',
  updated_at timestamptz default now()
);
insert into public.dm_files(id) values(1) on conflict(id) do nothing;

alter table public.about_content enable row level security;
alter table public.projects enable row level security;
alter table public.dm_files enable row level security;

drop policy if exists "Public read about" on public.about_content;
create policy "Public read about" on public.about_content for select to anon,authenticated using(true);
drop policy if exists "Authenticated update about" on public.about_content;
create policy "Authenticated update about" on public.about_content for update to authenticated using(true) with check(true);

drop policy if exists "Public read published projects" on public.projects;
create policy "Public read published projects" on public.projects for select to anon using(published=true);
drop policy if exists "Authenticated read projects" on public.projects;
create policy "Authenticated read projects" on public.projects for select to authenticated using(true);
drop policy if exists "Authenticated insert projects" on public.projects;
create policy "Authenticated insert projects" on public.projects for insert to authenticated with check(true);
drop policy if exists "Authenticated update projects" on public.projects;
create policy "Authenticated update projects" on public.projects for update to authenticated using(true) with check(true);
drop policy if exists "Authenticated delete projects" on public.projects;
create policy "Authenticated delete projects" on public.projects for delete to authenticated using(true);

drop policy if exists "Public read dm" on public.dm_files;
create policy "Public read dm" on public.dm_files for select to anon,authenticated using(true);
drop policy if exists "Authenticated update dm" on public.dm_files;
create policy "Authenticated update dm" on public.dm_files for update to authenticated using(true) with check(true);

insert into storage.buckets(id,name,public)
values('website-media','website-media',true)
on conflict(id) do update set public=true;

drop policy if exists "Public website media read" on storage.objects;
create policy "Public website media read" on storage.objects for select to public using(bucket_id='website-media');
drop policy if exists "Authenticated website media insert" on storage.objects;
create policy "Authenticated website media insert" on storage.objects for insert to authenticated with check(bucket_id='website-media');
drop policy if exists "Authenticated website media update" on storage.objects;
create policy "Authenticated website media update" on storage.objects for update to authenticated using(bucket_id='website-media') with check(bucket_id='website-media');
drop policy if exists "Authenticated website media delete" on storage.objects;
create policy "Authenticated website media delete" on storage.objects for delete to authenticated using(bucket_id='website-media');
