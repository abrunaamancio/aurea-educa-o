-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Approved students (access control managed by professor)
create table approved_students (
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
create table portfolios (
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
create table brandbook (
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
create table hero_section (
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
create table about_section (
  id uuid primary key default uuid_generate_v4(),
  portfolio_id uuid not null references portfolios(id) on delete cascade unique,
  bio_text text,
  source text check (source in ('cv', 'brandbook', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Projects
create table projects (
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
create table cases_section (
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
create table footer_section (
  id uuid primary key default uuid_generate_v4(),
  portfolio_id uuid not null references portfolios(id) on delete cascade unique,
  email text,
  whatsapp text,
  linkedin_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger portfolios_updated_at before update on portfolios
  for each row execute function update_updated_at();
create trigger brandbook_updated_at before update on brandbook
  for each row execute function update_updated_at();
create trigger hero_updated_at before update on hero_section
  for each row execute function update_updated_at();
create trigger about_updated_at before update on about_section
  for each row execute function update_updated_at();
create trigger projects_updated_at before update on projects
  for each row execute function update_updated_at();
create trigger cases_updated_at before update on cases_section
  for each row execute function update_updated_at();
create trigger footer_updated_at before update on footer_section
  for each row execute function update_updated_at();

-- RLS Policies
alter table approved_students enable row level security;
alter table portfolios enable row level security;
alter table brandbook enable row level security;
alter table hero_section enable row level security;
alter table about_section enable row level security;
alter table projects enable row level security;
alter table cases_section enable row level security;
alter table footer_section enable row level security;

-- Portfolios: owner access
create policy "Users own their portfolios"
  on portfolios for all
  using (auth.uid() = user_id);

-- Published portfolios are publicly readable (for multi-tenant rendering)
create policy "Published portfolios are public"
  on portfolios for select
  using (status = 'published');

-- Brandbook, hero, about, cases, footer: linked to portfolio owner
create policy "Portfolio owners manage brandbook"
  on brandbook for all
  using (portfolio_id in (select id from portfolios where user_id = auth.uid()));

create policy "Published brandbook is public"
  on brandbook for select
  using (portfolio_id in (select id from portfolios where status = 'published'));

create policy "Portfolio owners manage hero"
  on hero_section for all
  using (portfolio_id in (select id from portfolios where user_id = auth.uid()));

create policy "Published hero is public"
  on hero_section for select
  using (portfolio_id in (select id from portfolios where status = 'published'));

create policy "Portfolio owners manage about"
  on about_section for all
  using (portfolio_id in (select id from portfolios where user_id = auth.uid()));

create policy "Published about is public"
  on about_section for select
  using (portfolio_id in (select id from portfolios where status = 'published'));

create policy "Portfolio owners manage projects"
  on projects for all
  using (portfolio_id in (select id from portfolios where user_id = auth.uid()));

create policy "Published projects are public"
  on projects for select
  using (portfolio_id in (select id from portfolios where status = 'published'));

create policy "Portfolio owners manage cases"
  on cases_section for all
  using (portfolio_id in (select id from portfolios where user_id = auth.uid()));

create policy "Published cases are public"
  on cases_section for select
  using (portfolio_id in (select id from portfolios where status = 'published'));

create policy "Portfolio owners manage footer"
  on footer_section for all
  using (portfolio_id in (select id from portfolios where user_id = auth.uid()));

create policy "Published footer is public"
  on footer_section for select
  using (portfolio_id in (select id from portfolios where status = 'published'));

-- Admin role for professor (set via service role key)
create policy "Service role manages approved_students"
  on approved_students for all
  using (true)
  with check (true);
