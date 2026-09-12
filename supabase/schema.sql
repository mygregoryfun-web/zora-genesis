create table if not exists public.studio_users (
  email text primary key,
  role text not null default 'user',
  credits integer not null default 0,
  total_spent integer not null default 0,
  login_count integer not null default 0,
  last_login_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_drafts (
  id uuid primary key default gen_random_uuid(),
  email text not null references public.studio_users(email) on delete cascade,
  topic text not null default '',
  title text not null default '',
  text text not null default '',
  draft jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_drafts_email_updated_idx
  on public.studio_drafts(email, updated_at desc);

create table if not exists public.studio_payments (
  tx_hash text primary key,
  email text not null references public.studio_users(email) on delete cascade,
  product_id text not null,
  amount_usdc numeric not null,
  credits integer not null,
  from_address text not null,
  to_address text not null,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

create index if not exists studio_payments_email_created_idx
  on public.studio_payments(email, created_at desc);

alter table public.studio_users enable row level security;
alter table public.studio_drafts enable row level security;
alter table public.studio_payments enable row level security;
