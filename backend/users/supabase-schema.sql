create table if not exists public.users (
  email text primary key,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  trial_ends_at timestamptz not null,
  subscription_status text not null check (subscription_status in ('inactive', 'active')) default 'inactive',
  stripe_customer_id text unique,
  stripe_subscription_id text
);

create index if not exists users_stripe_customer_id_idx on public.users (stripe_customer_id);
create index if not exists users_subscription_status_idx on public.users (subscription_status);
