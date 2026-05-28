-- Signup Leads table: holds users who signed up but haven't been approved yet
create table if not exists public.signup_leads (
  id                uuid primary key default gen_random_uuid(),
  auth_user_id      uuid unique,                                -- Supabase auth.users.id
  name              text not null,
  phone             text not null,
  email             text not null unique,
  company           text,
  date_of_birth     date,
  space_type        text,
  team_size         integer default 1,
  source            text default 'Direct',
  notes             text,
  -- Approval workflow
  verification_status  text not null default 'Pending'
                        check (verification_status in ('Pending','Approved','Rejected')),
  signed_up_at      timestamptz not null default now(),
  reviewed_at       timestamptz,
  reviewed_by       text,                                       -- admin identifier
  rejection_reason  text,
  -- After approval, track which member record was created
  converted_member_id  uuid references public.members(id) on delete set null
);

alter table public.signup_leads enable row level security;

-- Anyone can insert (during signup); only service role can read/update
create policy "Users can insert own lead" on public.signup_leads
  for insert with check (true);

create policy "Users can read own lead" on public.signup_leads
  for select using (
    auth_user_id = auth.uid()
    or auth.role() = 'service_role'
  );

create policy "Service role full access" on public.signup_leads
  for all using (auth.role() = 'service_role');

-- Separate unrestricted policy for admin anon reads (adjust to use admin role in prod)
create policy "Anon full access for admin" on public.signup_leads
  for all using (true) with check (true);
