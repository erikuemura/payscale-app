-- 021 + 024. Staged only: test Auth/Data API/Storage with two development users before production.
-- No legacy record is changed. No service-role access is needed by application endpoints.
alter table public.chargebacks add constraint chargebacks_id_owner_unique unique(id,user_id);
create table public.dispute_preparations (
 id uuid primary key,
 owner_id uuid not null references auth.users(id),
 case_id uuid,
 name text not null check(char_length(name) between 2 and 100),
 payload jsonb not null check(coalesce(jsonb_typeof(payload)='object' and payload->>'format'='payscale-passport' and payload->>'version'='1' and jsonb_typeof(payload->'passport')='object' and octet_length(payload::text)<=65536,false)),
 revision integer not null default 1 check(revision>0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key(case_id,owner_id) references public.chargebacks(id,user_id)
);
create index dispute_preparations_owner_updated on public.dispute_preparations(owner_id,updated_at desc,id);
create table public.dispute_tracking (
 case_id uuid primary key,
 owner_id uuid not null references auth.users(id),
 responsible text not null check(char_length(responsible) between 2 and 100),
 deadline_at timestamptz not null check(deadline_at between '1900-01-01' and '2101-01-01'),
 deadline_source text not null check(char_length(deadline_source) between 2 and 500),
 revision integer not null default 1 check(revision>0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key(case_id,owner_id) references public.chargebacks(id,user_id)
);
create index dispute_tracking_owner_deadline on public.dispute_tracking(owner_id,deadline_at);
create table public.commercial_requests (
 id uuid primary key,
 owner_id uuid not null references auth.users(id),
 offer text not null check(offer in ('diagnostico','acompanhamento','chargebacks')),
 notes text not null check(char_length(notes) between 10 and 2000),
 status text not null default 'solicitado' check(status in ('solicitado','em_analise','proposta','encerrado')),
 created_at timestamptz not null default now()
);
create index commercial_requests_owner_created on public.commercial_requests(owner_id,created_at desc);
-- Invoker trigger enforces revision even when a caller bypasses the application via Data API.
create function public.guard_workspace_revision() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='INSERT' then
  if new.revision<>1 then raise exception 'Initial revision must be one' using errcode='23514'; end if;
  new.created_at:=now();
 else
  if new.owner_id<>old.owner_id or new.case_id is distinct from old.case_id or new.created_at<>old.created_at then raise exception 'Immutable ownership' using errcode='23514'; end if;
  if TG_TABLE_NAME='dispute_preparations' and (to_jsonb(new)->>'id')<>(to_jsonb(old)->>'id') then raise exception 'Immutable id' using errcode='23514'; end if;
  if new.revision<>old.revision+1 then raise exception 'Revision conflict' using errcode='40001'; end if;
 end if;
 new.updated_at:=now();return new;
end; $$;
revoke all on function public.guard_workspace_revision() from public,anon,authenticated;
create trigger preparations_revision before insert or update on public.dispute_preparations for each row execute function public.guard_workspace_revision();
create trigger tracking_revision before insert or update on public.dispute_tracking for each row execute function public.guard_workspace_revision();
alter table public.dispute_preparations enable row level security;
alter table public.dispute_tracking enable row level security;
alter table public.commercial_requests enable row level security;
revoke all on public.dispute_preparations,public.dispute_tracking,public.commercial_requests from anon,authenticated;
grant select,insert,update on public.dispute_preparations,public.dispute_tracking to authenticated;
grant select on public.commercial_requests to authenticated;
grant insert(id,owner_id,offer,notes) on public.commercial_requests to authenticated;
create policy preparations_read on public.dispute_preparations for select to authenticated using(owner_id=(select auth.uid()));
create policy preparations_insert on public.dispute_preparations for insert to authenticated with check(owner_id=(select auth.uid()));
create policy preparations_update on public.dispute_preparations for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy tracking_read on public.dispute_tracking for select to authenticated using(owner_id=(select auth.uid()));
create policy tracking_insert on public.dispute_tracking for insert to authenticated with check(owner_id=(select auth.uid()) and exists(select 1 from public.chargebacks c where c.id=dispute_tracking.case_id and c.user_id=(select auth.uid())));
create policy tracking_update on public.dispute_tracking for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy requests_read on public.commercial_requests for select to authenticated using(owner_id=(select auth.uid()));
create policy requests_insert on public.commercial_requests for insert to authenticated with check(owner_id=(select auth.uid()) and status='solicitado');
-- Private originals; no public URL, overwrite, move or delete in this release.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('dispute-evidence','dispute-evidence',false,4194304,array['application/pdf','image/png','image/jpeg']);
create policy evidence_read on storage.objects for select to authenticated using(
 bucket_id='dispute-evidence' and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.chargebacks c where c.id::text=(storage.foldername(name))[2] and c.user_id=(select auth.uid()))
);
create policy evidence_insert on storage.objects for insert to authenticated with check(
 bucket_id='dispute-evidence' and (storage.foldername(name))[1]=(select auth.uid())::text
 and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|png|jpg)$'
 and exists(select 1 from public.chargebacks c where c.id::text=(storage.foldername(name))[2] and c.user_id=(select auth.uid()))
);
