-- Admin users whitelist
create table if not exists public.admin_users (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  name       text,
  created_at timestamptz default now()
);

alter table public.admin_users enable row level security;
-- Allow anon to read (needed for client-side admin check)
create policy "Anon read admin_users" on public.admin_users for select using (true);

-- Seed: initial admin
insert into public.admin_users (email, name)
values ('vaibhavrajawatsingh@gmail.com', 'Vaibhav Rajawat')
on conflict (email) do nothing;
