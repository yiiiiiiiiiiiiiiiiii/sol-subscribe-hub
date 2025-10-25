-- Create subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  subscriber_address text not null,
  plan text not null check (plan in ('monthly', 'quarterly', 'yearly')),
  price numeric not null,
  auto_renewal boolean default false,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  transaction_hash text,
  start_date timestamp with time zone default now(),
  end_date timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- Allow users to view their own subscriptions
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (subscriber_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Allow anyone to insert subscriptions
create policy "subscriptions_insert_all"
  on public.subscriptions for insert
  with check (true);

-- Allow users to update their own subscriptions
create policy "subscriptions_update_own"
  on public.subscriptions for update
  using (subscriber_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create indexes
create index if not exists subscriptions_service_idx on public.subscriptions(service_id);
create index if not exists subscriptions_subscriber_idx on public.subscriptions(subscriber_address);
create index if not exists subscriptions_status_idx on public.subscriptions(status);
