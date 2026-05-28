-- ============================================================
-- Spaces inventory table
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists public.spaces (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,          -- e.g. D-01, C-01, MR-A
  label       text not null,                  -- display name
  type        text not null check (type in ('Desk','Cabin','Meeting Room')),
  capacity    integer default 1,              -- seats inside this unit
  is_active   boolean default true,
  created_at  timestamptz default now()
);

alter table public.spaces enable row level security;
drop policy if exists "Allow all for now" on public.spaces;
create policy "Allow all for now" on public.spaces for all using (true) with check (true);

-- Seed default 28 desks, 4 cabins, 2 meeting rooms
-- (only inserts if table is empty)
do $$
begin
  if (select count(*) from public.spaces) = 0 then
    -- Desks D-01 … D-28
    insert into public.spaces (code, label, type, capacity)
    select
      'D-' || lpad(n::text, 2, '0'),
      'Desk ' || lpad(n::text, 2, '0'),
      'Desk',
      1
    from generate_series(1, 28) as n;

    -- Cabins C-01 … C-04
    insert into public.spaces (code, label, type, capacity)
    select
      'C-' || lpad(n::text, 2, '0'),
      'Cabin ' || lpad(n::text, 2, '0'),
      'Cabin',
      1
    from generate_series(1, 4) as n;

    -- Meeting Rooms MR-A, MR-B
    insert into public.spaces (code, label, type, capacity) values
      ('MR-A', 'Meeting Room A', 'Meeting Room', 8),
      ('MR-B', 'Meeting Room B', 'Meeting Room', 6);
  end if;
end;
$$;
