-- Run once in the Supabase SQL editor before enabling paid video generation.
create table if not exists public.studio_video_jobs (
  id uuid primary key, email text not null, task_id text unique,
  cost integer not null check (cost >= 0), status text not null default 'reserved',
  created_at timestamptz not null default now()
);
alter table public.studio_video_jobs enable row level security;

create or replace function public.studio_video_transaction(
  p_email text, p_action text, p_id uuid, p_cost integer default 0,
  p_task_id text default null, p_owner boolean default false
) returns void language plpgsql security definer set search_path = public as $$
declare job public.studio_video_jobs;
begin
  if p_action = 'reserve' then
    if p_cost not in (25,50) then raise exception 'Invalid video cost'; end if;
    if not p_owner then
      update studio_users set credits = credits - p_cost, total_spent = total_spent + p_cost, updated_at = now()
        where email = p_email and credits >= p_cost;
      if not found then raise exception 'Insufficient credits'; end if;
    end if;
    insert into studio_video_jobs(id,email,cost) values(p_id,p_email,case when p_owner then 0 else p_cost end);
    return;
  end if;
  select * into job from studio_video_jobs where id=p_id and email=p_email for update;
  if not found then raise exception 'Unknown video job'; end if;
  if p_action='bind' and job.status='reserved' then
    update studio_video_jobs set task_id=p_task_id,status='processing' where id=p_id;
  elsif p_action='refund' and job.status in ('reserved','processing') then
    update studio_users set credits=credits+job.cost,total_spent=greatest(0,total_spent-job.cost),updated_at=now() where email=p_email;
    update studio_video_jobs set status='refunded' where id=p_id;
  elsif p_action='complete' and job.status='processing' then
    update studio_video_jobs set status='complete' where id=p_id;
  end if;
end;
$$;
revoke all on function public.studio_video_transaction(text,text,uuid,integer,text,boolean) from public, anon, authenticated;
grant execute on function public.studio_video_transaction(text,text,uuid,integer,text,boolean) to service_role;
