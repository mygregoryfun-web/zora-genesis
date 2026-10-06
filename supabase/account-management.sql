begin;
-- Minimal denial record remains after deletion to prevent another free trial.
create table if not exists public.studio_account_restrictions (
  email text primary key, status text not null check(status in ('blocked','deleted')),
  updated_at timestamptz not null default now()
);
alter table public.studio_account_restrictions enable row level security;
-- Keep financial history when deleting an account; remove its account association.
alter table public.studio_payments alter column email drop not null;
alter table public.studio_payments drop constraint if exists studio_payments_email_fkey;
alter table public.studio_payments add constraint studio_payments_email_fkey
  foreign key(email) references public.studio_users(email) on delete set null;

create or replace function public.studio_manage_account(p_email text,p_operation text,p_actor text,p_protected text)
returns void language plpgsql security definer set search_path=public as $$
declare target_role text;
begin
  if p_email=p_actor or p_email=p_protected then raise exception 'Protected admin account'; end if;
  select role into target_role from studio_users where email=p_email for update;
  if not found then raise exception 'User not found'; end if;
  if target_role='owner' then raise exception 'Protected admin account'; end if;
  if p_operation='unblock' then
    delete from studio_account_restrictions where email=p_email and status='blocked';
  elsif p_operation in ('block','delete') then
    insert into studio_account_restrictions(email,status) values(p_email,case when p_operation='delete' then 'deleted' else 'blocked' end)
      on conflict(email) do update set status=excluded.status,updated_at=now();
    if p_operation='delete' then
      if exists(select 1 from studio_video_jobs where email=p_email and status in ('reserved','processing')) then
        raise exception 'Wait for pending video jobs before deleting this account';
      end if;
      delete from studio_users where email=p_email;
    end if;
  else raise exception 'Invalid operation'; end if;
end;
$$;
revoke all on function public.studio_manage_account(text,text,text,text) from public,anon,authenticated;
grant execute on function public.studio_manage_account(text,text,text,text) to service_role;
commit;
