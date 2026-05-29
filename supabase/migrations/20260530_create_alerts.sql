-- Alerts table: persists dismissed/read state
create table if not exists alerts (
  id          uuid primary key default gen_random_uuid(),
  type        text not null, -- 'birthday' | 'renewal' | 'overdue' | 'signup' | 'system'
  ref_id      text,          -- member_id or lead_id
  title       text not null,
  body        text,
  due_date    date,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table alerts enable row level security;

create policy "auth users can manage alerts"
  on alerts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Index for fast unread count
create index if not exists alerts_is_read_idx on alerts (is_read);
create index if not exists alerts_type_idx    on alerts (type);
