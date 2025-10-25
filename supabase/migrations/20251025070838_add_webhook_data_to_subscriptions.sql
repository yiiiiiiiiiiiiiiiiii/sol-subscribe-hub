-- Add webhook_data column to subscriptions table
alter table public.subscriptions add column if not exists webhook_data jsonb;