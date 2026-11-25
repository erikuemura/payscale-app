-- DEVELOPMENT ONLY. Requires two existing test Auth users, passed as psql vars:
-- psql "$DEV_DATABASE_URL" -v ON_ERROR_STOP=1 -v user_a=... -v user_b=... -f this_file
-- Migration must be applied first. Test records are rolled back.
\set ON_ERROR_STOP on
begin;
select set_config('test.user_a', :'user_a', true);
select set_config('test.user_b', :'user_b', true);
do $$ begin
 if current_setting('test.user_a') = current_setting('test.user_b') then raise exception 'Use two different users'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.user_a'), true);
insert into public.reconciliation_companies(id,owner_id,name) values('10000000-0000-4000-8000-000000000001',auth.uid(),'RLS test A');
insert into public.reconciliation_accounts(id,company_id,owner_id,name) values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',auth.uid(),'Account A');
select set_config('request.jwt.claim.sub', current_setting('test.user_b'), true);
insert into public.reconciliation_companies(id,owner_id,name) values('10000000-0000-4000-8000-000000000002',auth.uid(),'RLS test B');
insert into public.reconciliation_accounts(id,company_id,owner_id,name) values('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',auth.uid(),'Account B');
do $$ begin
 if exists(select 1 from public.reconciliation_companies where id='10000000-0000-4000-8000-000000000001') then raise exception 'RLS leak: company A'; end if;
 if exists(select 1 from public.reconciliation_accounts where id='20000000-0000-4000-8000-000000000001') then raise exception 'RLS leak: account A'; end if;
 begin
  insert into public.reconciliation_companies(owner_id,name) values(current_setting('test.user_a')::uuid,'Forged');
  raise exception 'RLS failed: forged owner';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.reconciliation_accounts(company_id,owner_id,name) values('10000000-0000-4000-8000-000000000001',auth.uid(),'Cross-company');
  raise exception 'FK failed: cross-company';
 exception when foreign_key_violation then null; end;
 begin
  update public.reconciliation_accounts set name='changed' where id='20000000-0000-4000-8000-000000000002';
  raise exception 'Unexpected UPDATE permission';
 exception when insufficient_privilege then null; end;
end $$;
insert into public.reconciliation_runs(id,company_id,account_id,owner_id,rule_version,fingerprint,inputs) values('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002',auth.uid(),'referencia-data-v1',repeat('b',64),'{"receivables":[],"credits":[]}');
do $$ begin
 begin
  insert into public.reconciliation_runs(company_id,account_id,owner_id,rule_version,fingerprint,inputs) values('10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002',auth.uid(),'referencia-data-v1',repeat('b',64),'{}');
  raise exception 'Unique constraint failed';
 exception when unique_violation then null; end;
 begin
  delete from public.reconciliation_runs where id='30000000-0000-4000-8000-000000000002';
  raise exception 'Unexpected DELETE permission';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub', current_setting('test.user_a'), true);
do $$ begin
 if exists(select 1 from public.reconciliation_runs where id='30000000-0000-4000-8000-000000000002') then raise exception 'RLS leak: run B'; end if;
 begin
  insert into public.reconciliation_runs(company_id,account_id,owner_id,rule_version,fingerprint,inputs) values('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002',auth.uid(),'referencia-data-v1',repeat('a',64),'{}');
  raise exception 'FK failed: foreign account';
 exception when foreign_key_violation then null; end;
end $$;
set local role anon;
do $$ begin
 begin
  perform 1 from public.reconciliation_runs;
  raise exception 'Anonymous SELECT allowed';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
