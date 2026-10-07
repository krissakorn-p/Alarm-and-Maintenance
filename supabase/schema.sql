create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, role text not null default 'technician' check (role in ('admin','technician')));
create table machines (
  id uuid primary key default gen_random_uuid(),
  machine_id text unique not null, name text not null, type text not null, location text not null,
  status text not null default 'Running' check (status in ('Running','Stop','Alarm','Maintenance')));
create table alarms (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references machines(id) on delete cascade,
  alarm_code text not null, description text not null, cause text,
  occurred_at timestamptz not null default now(),
  status text not null default 'Open' check (status in ('Open','In Progress','Closed')));
create table maintenance_records (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references machines(id) on delete cascade,
  alarm_id uuid references alarms(id) on delete set null,
  technician_id uuid references profiles(id),
  description text not null, performed_at date not null default current_date,
  status text not null default 'Planned' check (status in ('Planned','In Progress','Done')));

create or replace function is_admin() returns boolean language sql security definer stable as
$$ select exists(select 1 from profiles where id = auth.uid() and role = 'admin') $$;
create or replace function handle_new_user() returns trigger language plpgsql security definer as
$$ begin insert into profiles(id, full_name) values (new.id, new.raw_user_meta_data->>'full_name'); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

alter table profiles enable row level security;
alter table machines enable row level security;
alter table alarms enable row level security;
alter table maintenance_records enable row level security;
create policy p_sel on profiles for select to authenticated using (true);
create policy p_upd on profiles for update to authenticated using (is_admin());
create policy m_sel on machines for select to authenticated using (true);
create policy m_all on machines for all to authenticated using (is_admin()) with check (is_admin());
create policy a_sel on alarms for select to authenticated using (true);
create policy a_ins on alarms for insert to authenticated with check (is_admin());
create policy a_upd on alarms for update to authenticated using (true);
create policy r_sel on maintenance_records for select to authenticated using (true);
create policy r_ins on maintenance_records for insert to authenticated with check (true);
create policy r_upd on maintenance_records for update to authenticated using (true);
create policy r_del on maintenance_records for delete to authenticated using (is_admin());
-- ตั้ง Admin คนแรก: update profiles set role='admin' where id='<user uuid>';
