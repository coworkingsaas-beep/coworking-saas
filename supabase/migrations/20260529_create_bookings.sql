-- Meeting room bookings table
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  booking_ref   text unique not null default ('BK-' || upper(substr(gen_random_uuid()::text, 1, 6))),
  title         text not null,
  member_id     uuid references public.members(id) on delete set null,
  member_name   text,                              -- denormalised for speed
  room          text not null default 'MR-A',
  date          date not null,
  start_time    time not null,
  end_time      time not null,
  attendees     integer default 1,
  status        text not null default 'Upcoming'
                  check (status in ('Upcoming','Ongoing','Completed','Cancelled')),
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.bookings enable row level security;
drop policy if exists "Allow all bookings" on public.bookings;
create policy "Allow all bookings" on public.bookings for all using (true) with check (true);

create index if not exists bookings_date_idx on public.bookings(date);
create index if not exists bookings_room_idx on public.bookings(room);
