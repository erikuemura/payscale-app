-- 006a: apply to development first. No changes to legacy financial tables.
begin;
create table public.reconciliation_companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  name text not null check (length(trim(name)) between 2 and 100),
  created_at timestamptz not null default now(),
  unique(id, owner_id)
);
create table public.reconciliation_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  owner_id uuid not null,
  name text not null check (length(trim(name)) between 2 and 100),
  currency text not null default 'BRL' check (currency = 'BRL'),
  created_at timestamptz not null default now(),
  foreign key(company_id, owner_id) references public.reconciliation_companies(id, owner_id),
  unique(id, company_id, owner_id),
  unique(company_id, name)
);
create table public.reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  account_id uuid not null,
  owner_id uuid not null,
  rule_version text not null check(rule_version = 'referencia-data-v1'),
  fingerprint text not null check(fingerprint ~ '^[a-f0-9]{64}$'),
  inputs jsonb not null check(jsonb_typeof(inputs) = 'object' and pg_column_size(inputs) <= 2100000),
  created_at timestamptz not null default now(),
  foreign key(account_id, company_id, owner_id) references public.reconciliation_accounts(id, company_id, owner_id),
  unique(account_id, rule_version, fingerprint)
);
create index reconciliation_companies_owner_idx on public.reconciliation_companies(owner_id);
create index reconciliation_accounts_owner_idx on public.reconciliation_accounts(owner_id, company_id);
create index reconciliation_runs_owner_idx on public.reconciliation_runs(owner_id, created_at desc);
create index reconciliation_runs_account_idx on public.reconciliation_runs(account_id, company_id, owner_id);
alter table public.reconciliation_companies enable row level security;
alter table public.reconciliation_accounts enable row level security;
alter table public.reconciliation_runs enable row level security;
revoke all on public.reconciliation_companies, public.reconciliation_accounts, public.reconciliation_runs from public, anon, authenticated;
grant select, insert on public.reconciliation_companies, public.reconciliation_accounts, public.reconciliation_runs to authenticated;
create policy companies_read on public.reconciliation_companies for select to authenticated using(owner_id = (select auth.uid()));
create policy companies_create on public.reconciliation_companies for insert to authenticated with check(owner_id = (select auth.uid()));
create policy accounts_read on public.reconciliation_accounts for select to authenticated using(owner_id = (select auth.uid()));
create policy accounts_create on public.reconciliation_accounts for insert to authenticated with check(owner_id = (select auth.uid()));
create policy runs_read on public.reconciliation_runs for select to authenticated using(owner_id = (select auth.uid()));
create policy runs_create on public.reconciliation_runs for insert to authenticated with check(owner_id = (select auth.uid()));
-- No update/delete privileges or policies: snapshots cannot be changed via the Data API.
commit;
