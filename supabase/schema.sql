-- ─────────────────────────────────────────
-- PayScale Intelligence — Schema inicial
-- Execute no SQL Editor do Supabase
-- ─────────────────────────────────────────

-- ── 1. Perfis (estende auth.users) ─────
create table if not exists public.profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  full_name   text,
  company     text,
  plan        text        not null default 'trial',   -- trial | starter | growth | enterprise
  trial_ends  timestamptz not null default now() + interval '14 days',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger: cria perfil automaticamente ao criar usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, company)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'company'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. Integrações (credenciais de API por usuário) ─────
create table if not exists public.integrations (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references public.profiles (id) on delete cascade,
  provider      text        not null,  -- pagseguro | mercadopago | bling | totvs | stone | cielo
  status        text        not null default 'disconnected', -- connected | disconnected | error
  last_sync     timestamptz,
  -- Credenciais criptografadas (nunca exponha a anon key com estas colunas)
  access_token  text,
  refresh_token text,
  client_id     text,
  metadata      jsonb       not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, provider)
);

-- ── 3. Transações ─────
create table if not exists public.transactions (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.profiles (id) on delete cascade,
  integration_id  uuid        references public.integrations (id) on delete set null,
  provider        text        not null,
  external_id     text        not null,  -- ID da transação no adquirente
  date            date        not null,
  amount          numeric(12,2) not null,
  mdr_rate        numeric(6,4),          -- Taxa contratada (%)
  mdr_charged     numeric(6,4),          -- Taxa efetivamente cobrada (%)
  net_amount      numeric(12,2),
  modality        text,                  -- debito | credito_1x | credito_2x | pix | etc
  status          text        not null default 'pending', -- pending | settled | divergent | no_settlement
  customer_name   text,
  metadata        jsonb       not null default '{}',
  created_at      timestamptz not null default now(),
  unique (user_id, provider, external_id)
);

-- ── 4. Chargebacks ─────
create table if not exists public.chargebacks (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.profiles (id) on delete cascade,
  integration_id  uuid        references public.integrations (id) on delete set null,
  transaction_id  uuid        references public.transactions (id) on delete set null,
  provider        text        not null,
  external_id     text,
  customer_name   text,
  reason          text,
  amount          numeric(12,2) not null,
  deadline_days   int,
  status          text        not null default 'aberto', -- aberto | contestado | ganho | perdido
  opened_at       date,
  resolved_at     date,
  metadata        jsonb       not null default '{}',
  created_at      timestamptz not null default now()
);

-- ── 5. Alertas ─────
create table if not exists public.alerts (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles (id) on delete cascade,
  type        text        not null, -- mdr_deviation | no_settlement | chargeback_deadline | etc
  severity    text        not null default 'warning', -- info | warning | critical
  title       text        not null,
  description text,
  amount      numeric(12,2),
  resolved    boolean     not null default false,
  metadata    jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- Row Level Security — cada usuário vê só seus dados
-- ─────────────────────────────────────────

alter table public.profiles     enable row level security;
alter table public.integrations enable row level security;
alter table public.transactions enable row level security;
alter table public.chargebacks  enable row level security;
alter table public.alerts       enable row level security;

-- Profiles
create policy "Usuário vê seu próprio perfil"
  on public.profiles for all using (auth.uid() = id);

-- Integrations
create policy "Usuário gerencia suas integrações"
  on public.integrations for all using (auth.uid() = user_id);

-- Transactions
create policy "Usuário vê suas transações"
  on public.transactions for all using (auth.uid() = user_id);

-- Chargebacks
create policy "Usuário vê seus chargebacks"
  on public.chargebacks for all using (auth.uid() = user_id);

-- Alerts
create policy "Usuário vê seus alertas"
  on public.alerts for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- Índices para performance
-- ─────────────────────────────────────────
create index if not exists idx_transactions_user_date
  on public.transactions (user_id, date desc);

create index if not exists idx_chargebacks_user_status
  on public.chargebacks (user_id, status);

create index if not exists idx_alerts_user_resolved
  on public.alerts (user_id, resolved, created_at desc);
