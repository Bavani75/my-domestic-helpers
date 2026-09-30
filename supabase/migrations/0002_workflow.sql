begin;
-- Repair only the original incomplete seed; weekly duties need an actual day.
update public.duty_schedules set day_of_week = trim(to_char(timezone('Asia/Kuala_Lumpur', now()), 'Day'))
where id = 'b4444444-4444-4444-4444-444444444444' and day_of_week is null;

create table if not exists public.audit_logs (
 id uuid primary key default gen_random_uuid(),
 action text not null, actor text not null default 'demo-user',
 target_type text not null, target_id uuid not null,
 risk_level text not null default 'manual', approved_by text,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
create policy audit_read on public.audit_logs for select using (true);
revoke insert, update, delete on public.audit_logs from anon, authenticated;
grant select on public.audit_logs to anon, authenticated;
create or replace function public.record_household_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
 insert into public.audit_logs(action,target_type,target_id,details)
 values (lower(TG_OP), TG_TABLE_NAME, coalesce(new.id,old.id),
 jsonb_build_object('before',case when TG_OP <> 'INSERT' then to_jsonb(old) else null end,
 'after',case when TG_OP <> 'DELETE' then to_jsonb(new) else null end));
 return coalesce(new,old);
end; $$;
create trigger audit_helpers after insert or update or delete on public.helpers for each row execute function public.record_household_change();
create trigger audit_schedules after insert or update or delete on public.duty_schedules for each row execute function public.record_household_change();
create trigger audit_logs_changes after insert or update or delete on public.duty_logs for each row execute function public.record_household_change();
create trigger audit_maintenance after insert or update or delete on public.maintenance_requests for each row execute function public.record_household_change();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('duty-photos','duty-photos',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
-- Demo access only. Replace alongside table RLS in the later lock-down sprint.
create policy duty_photo_insert on storage.objects for insert to anon,authenticated with check(bucket_id='duty-photos');
create policy duty_photo_read on storage.objects for select to anon,authenticated using(bucket_id='duty-photos');
commit;
