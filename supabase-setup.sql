-- 鼎程溢網站：請整段貼到 Supabase SQL Editor 執行
create extension if not exists pgcrypto;

create table if not exists public.services (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 description text default '',
 sort_order integer default 0,
 active boolean default true,
 created_at timestamptz default now()
);
create table if not exists public.materials (
 id uuid primary key default gen_random_uuid(),
 category text not null,
 name text not null,
 sort_order integer default 0,
 active boolean default true,
 created_at timestamptz default now()
);

alter table public.services enable row level security;
alter table public.materials enable row level security;

drop policy if exists "Public read services" on public.services;
create policy "Public read services" on public.services for select to anon, authenticated using (active = true);
drop policy if exists "Public read materials" on public.materials;
create policy "Public read materials" on public.materials for select to anon, authenticated using (active = true);

drop policy if exists "Admin insert services" on public.services;
create policy "Admin insert services" on public.services for insert to authenticated with check (true);
drop policy if exists "Admin update services" on public.services;
create policy "Admin update services" on public.services for update to authenticated using (true) with check (true);
drop policy if exists "Admin delete services" on public.services;
create policy "Admin delete services" on public.services for delete to authenticated using (true);

drop policy if exists "Admin insert materials" on public.materials;
create policy "Admin insert materials" on public.materials for insert to authenticated with check (true);
drop policy if exists "Admin update materials" on public.materials;
create policy "Admin update materials" on public.materials for update to authenticated using (true) with check (true);
drop policy if exists "Admin delete materials" on public.materials;
create policy "Admin delete materials" on public.materials for delete to authenticated using (true);

insert into public.services(name,description,sort_order) values
('FDM 熱熔堆疊列印','適合功能件、治具、外觀模型、產品原型與中大型零件製作。',1),
('光固化樹脂列印','適合高細節模型、外觀件、精密打樣與需要細緻表面的產品。',2),
('SLS 尼龍列印','適合複雜結構、功能性零件與不易使用支撐製作的產品。',3),
('3D 建模／產品設計','依草圖、尺寸或產品需求進行建模、結構調整與設計優化。',4),
('逆向工程／掃描','針對既有實體零件進行數位化、尺寸重建與後續修改應用。',5),
('快速打樣／小量製作','協助產品開發驗證、試裝與小批量製作，縮短開發時間。',6);

insert into public.materials(category,name,sort_order) values
('FDM 線材','PLA / PLA+',1),('FDM 線材','PETG',2),('FDM 線材','ABS',3),('FDM 線材','TPU / TPE',4),('FDM 線材','PA 尼龍',5),('FDM 線材','PA-CF 碳纖尼龍',6),
('光固化樹脂','高精細樹脂',1),('光固化樹脂','工程韌性樹脂',2),('光固化樹脂','透明／半透明樹脂',3),
('SLS 粉末材料','尼龍 PA 系列',1);
