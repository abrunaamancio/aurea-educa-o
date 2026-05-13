-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Tables ──────────────────────────────────────────────────────────────────

-- Approved students (access control managed by professor)
create table if not exists approved_students (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  ciclo text not null,
  access_starts_at timestamptz not null,
  access_expires_at timestamptz not null generated always as (access_starts_at + interval '6 months') stored,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  created_at timestamptz not null default now(),
  first_login_at timestamptz
);

-- Portfolios
create table if not exists portfolios (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'published')),
  template_id text not null default 'minimal',
  domain text unique,
  vercel_domain_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Brandbook data
create table if not exists brandbook (
  id uuid primary key default uuid_generate_v4(),
  portfolio_id uuid not null references portfolios(id) on delete cascade unique,
  colors text[] not null default '{}',
  fonts text[] not null default '{}',
  logo_light_url text,
  logo_dark_url text,
  slogan text,
  voice_tone text,
  market_sector text,
  raw_files text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Hero section
create table if not exists hero_section (
  id uuid primary key default uuid_generate_v4(),
  portfolio_id uuid not null references portfolios(id) on delete cascade unique,
  photo_url text,
  photo_crop_data jsonb,
  background_url text,
  name text,
  surname text,
  cta_text text default 'Ver projetos',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- About section
create table if not exists about_section (
  id uuid primary key default uuid_generate_v4(),
  portfolio_id uuid not null references portfolios(id) on delete cascade unique,
  bio_text text,
  source text check (source in ('cv', 'brandbook', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Projects
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  portfolio_id uuid not null references portfolios(id) on delete cascade,
  title text not null,
  cover_image_url text,
  "order" integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cases section
create table if not exists cases_section (
  id uuid primary key default uuid_generate_v4(),
  portfolio_id uuid not null references portfolios(id) on delete cascade unique,
  active boolean not null default false,
  embed_type text check (embed_type in ('upload', 'link')),
  file_url text,
  embed_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Footer section
create table if not exists footer_section (
  id uuid primary key default uuid_generate_v4(),
  portfolio_id uuid not null references portfolios(id) on delete cascade unique,
  email text,
  whatsapp text,
  linkedin_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolios_updated_at on portfolios;
create trigger portfolios_updated_at before update on portfolios
  for each row execute function update_updated_at();

drop trigger if exists brandbook_updated_at on brandbook;
create trigger brandbook_updated_at before update on brandbook
  for each row execute function update_updated_at();

drop trigger if exists hero_updated_at on hero_section;
create trigger hero_updated_at before update on hero_section
  for each row execute function update_updated_at();

drop trigger if exists about_updated_at on about_section;
create trigger about_updated_at before update on about_section
  for each row execute function update_updated_at();

drop trigger if exists projects_updated_at on projects;
create trigger projects_updated_at before update on projects
  for each row execute function update_updated_at();

drop trigger if exists cases_updated_at on cases_section;
create trigger cases_updated_at before update on cases_section
  for each row execute function update_updated_at();

drop trigger if exists footer_updated_at on footer_section;
create trigger footer_updated_at before update on footer_section
  for each row execute function update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table approved_students enable row level security;
alter table portfolios enable row level security;
alter table brandbook enable row level security;
alter table hero_section enable row level security;
alter table about_section enable row level security;
alter table projects enable row level security;
alter table cases_section enable row level security;
alter table footer_section enable row level security;

-- approved_students: students can check their own record (used by middleware).
-- INSERT/UPDATE/DELETE go through the service role key which bypasses RLS.
drop policy if exists "Students can check own approval" on approved_students;
create policy "Students can check own approval"
  on approved_students for select
  using (auth.email() = email);

-- portfolios: owner access
drop policy if exists "Users own their portfolios" on portfolios;
create policy "Users own their portfolios"
  on portfolios for all
  using (auth.uid() = user_id);

drop policy if exists "Published portfolios are public" on portfolios;
create policy "Published portfolios are public"
  on portfolios for select
  using (status = 'published');

-- brandbook
drop policy if exists "Portfolio owners manage brandbook" on brandbook;
create policy "Portfolio owners manage brandbook"
  on brandbook for all
  using (portfolio_id in (select id from portfolios where user_id = auth.uid()));

drop policy if exists "Published brandbook is public" on brandbook;
create policy "Published brandbook is public"
  on brandbook for select
  using (portfolio_id in (select id from portfolios where status = 'published'));

-- hero_section
drop policy if exists "Portfolio owners manage hero" on hero_section;
create policy "Portfolio owners manage hero"
  on hero_section for all
  using (portfolio_id in (select id from portfolios where user_id = auth.uid()));

drop policy if exists "Published hero is public" on hero_section;
create policy "Published hero is public"
  on hero_section for select
  using (portfolio_id in (select id from portfolios where status = 'published'));

-- about_section
drop policy if exists "Portfolio owners manage about" on about_section;
create policy "Portfolio owners manage about"
  on about_section for all
  using (portfolio_id in (select id from portfolios where user_id = auth.uid()));

drop policy if exists "Published about is public" on about_section;
create policy "Published about is public"
  on about_section for select
  using (portfolio_id in (select id from portfolios where status = 'published'));

-- projects
drop policy if exists "Portfolio owners manage projects" on projects;
create policy "Portfolio owners manage projects"
  on projects for all
  using (portfolio_id in (select id from portfolios where user_id = auth.uid()));

drop policy if exists "Published projects are public" on projects;
create policy "Published projects are public"
  on projects for select
  using (portfolio_id in (select id from portfolios where status = 'published'));

-- cases_section
drop policy if exists "Portfolio owners manage cases" on cases_section;
create policy "Portfolio owners manage cases"
  on cases_section for all
  using (portfolio_id in (select id from portfolios where user_id = auth.uid()));

drop policy if exists "Published cases are public" on cases_section;
create policy "Published cases are public"
  on cases_section for select
  using (portfolio_id in (select id from portfolios where status = 'published'));

-- footer_section
drop policy if exists "Portfolio owners manage footer" on footer_section;
create policy "Portfolio owners manage footer"
  on footer_section for all
  using (portfolio_id in (select id from portfolios where user_id = auth.uid()));

drop policy if exists "Published footer is public" on footer_section;
create policy "Published footer is public"
  on footer_section for select
  using (portfolio_id in (select id from portfolios where status = 'published'));

-- ─── Storage ──────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users upload own assets" on storage.objects;
create policy "Authenticated users upload own assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Authenticated users update own assets" on storage.objects;
create policy "Authenticated users update own assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Authenticated users delete own assets" on storage.objects;
create policy "Authenticated users delete own assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Public assets are readable" on storage.objects;
create policy "Public assets are readable"
  on storage.objects for select
  using (bucket_id = 'portfolio-assets');
