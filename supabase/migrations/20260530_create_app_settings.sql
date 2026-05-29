create table if not exists app_settings (
  key   text primary key,
  value text not null
);

-- seed defaults
insert into app_settings (key, value) values
  ('currency',             'INR'),
  ('monthly_due_day',      '5'),
  ('default_seat_rent',    '4500'),
  ('default_cabin_rent',   '14000'),
  ('deposit_multiplier',   '2'),
  ('grace_period_days',    '3'),
  ('auto_flag_overdue',    'true'),
  ('late_fee',             '0'),
  ('accept_cash',          'true'),
  ('accept_upi',           'true'),
  ('accept_bank_transfer', 'true'),
  ('upi_id',               'cospace@okaxis')
on conflict (key) do nothing;

-- RLS: only authenticated users (admins) can read/write
alter table app_settings enable row level security;

create policy "admins can read settings"
  on app_settings for select
  using (auth.role() = 'authenticated');

create policy "admins can upsert settings"
  on app_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
