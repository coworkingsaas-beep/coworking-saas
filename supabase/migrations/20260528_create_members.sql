-- ============================================================
-- Coworking MS — Members table (Roadmap 3.1)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists public.members (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  phone                 text unique not null,
  email                 text,
  date_of_birth         date,
  joining_date          date not null default current_date,
  renewal_date          date,
  space_type            text check (space_type in ('Dedicated Desk','Manager Cabin','Two-Seater Cabin','Virtual Desk')),
  assigned_space        text,
  security_deposit      numeric default 0,
  rent_amount           numeric default 0,
  team_size             integer default 1,
  total_prints_used     integer default 0,
  total_prints_allowed  integer default 500,
  discounted_member     boolean default false,
  source                text,
  status                text not null default 'Active' check (status in ('Active','Inactive')),
  exit_reason           text,
  welcome_message_status text default 'Pending' check (welcome_message_status in ('Pending','Sent')),
  duplicate_entry_flag  boolean default false,
  company               text,
  notes                 text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Auto-update updated_at on every row update
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists members_updated_at on public.members;
create trigger members_updated_at
  before update on public.members
  for each row execute function public.update_updated_at();

-- Row-level security (open policy for now — restrict when auth is added)
alter table public.members enable row level security;

drop policy if exists "Allow all for now" on public.members;
create policy "Allow all for now"
  on public.members for all
  using (true) with check (true);

-- Indexes
create index if not exists members_status_idx on public.members(status);
create index if not exists members_phone_idx  on public.members(phone);
create index if not exists members_name_idx   on public.members using gin(to_tsvector('english', name));
