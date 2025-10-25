-- Create services table
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  category text not null,
  publisher_address text not null,
  image_url text,
  features text[] not null default '{}',
  webhook_url text,
  webhook_events text[] default '{}',
  custom_fields jsonb default '[]'::jsonb,
  monthly_price numeric,
  quarterly_price numeric,
  yearly_price numeric,
  auto_renewal boolean default false,
  subscribers_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.services enable row level security;

-- Allow anyone to view services
create policy "services_select_all"
  on public.services for select
  using (true);

-- Allow anyone to insert services (in production, you might want to restrict this)
create policy "services_insert_all"
  on public.services for insert
  with check (true);

-- Allow publishers to update their own services
create policy "services_update_own"
  on public.services for update
  using (publisher_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Allow publishers to delete their own services
create policy "services_delete_own"
  on public.services for delete
  using (publisher_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create index for faster queries
create index if not exists services_category_idx on public.services(category);
create index if not exists services_publisher_idx on public.services(publisher_address);
create index if not exists services_created_at_idx on public.services(created_at desc);
