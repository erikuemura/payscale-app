// Isolated PostgreSQL checks. Auth and Storage schemas below are test doubles,
// not a substitute for real Supabase JWT/Data API/object-service integration.
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();let checks=0;
const A='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',B='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const CA='11111111-1111-4111-8111-111111111111',CB='22222222-2222-4222-8222-222222222222';
const D='33333333-3333-4333-8333-333333333333',D2='44444444-4444-4444-8444-444444444444';
async function rejects(sql,params,code){await assert.rejects(()=>db.query(sql,params),e=>e.code===code);checks++;}
async function identity(id){await db.exec('reset role; set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);}
try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create schema storage;
 create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth,storage to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text references storage.buckets(id),name text,unique(bucket_id,name));
 create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;
 alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to authenticated;
 `);
 await db.exec(await readFile(new URL('../supabase/schema.sql',import.meta.url),'utf8'));
 await db.exec('grant select,insert,update,delete on public.profiles,public.chargebacks,public.transactions,public.alerts,public.integrations to authenticated');
 await db.exec(await readFile(new URL('../supabase/migrations/20261104130656_reconciliation_history.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../supabase/migrations/20261120023437_launch_workspaces.sql',import.meta.url),'utf8'));
 await db.query('insert into auth.users(id) values($1),($2)',[A,B]);
 await db.query("insert into public.chargebacks(id,user_id,provider,amount) values($1,$2,'test',200),($3,$4,'test',300)",[CA,A,CB,B]);
 const payload={format:'payscale-passport',version:1,passport:{reference:'SYNTHETIC'}};
 await identity(A);
 await db.query('insert into dispute_preparations(id,owner_id,case_id,name,payload) values($1,$2,$3,$4,$5)',[D,A,CA,'Preparation A',JSON.stringify(payload)]);
 assert.equal((await db.query('select * from dispute_preparations')).rows.length,1);checks++;
 await rejects('insert into dispute_preparations(id,owner_id,name,payload) values($1,$2,$3,$4)',[D2,A,'Invalid','{}'],'23514');
 await identity(B);
 assert.equal((await db.query('select * from dispute_preparations where id=$1',[D])).rows.length,0);checks++;
 assert.equal((await db.query("update dispute_preparations set name='forged',revision=2 where id=$1 returning id",[D])).rows.length,0);checks++;
 await rejects('insert into dispute_preparations(id,owner_id,name,payload) values($1,$2,$3,$4)',[D2,A,'Forged owner',JSON.stringify(payload)],'42501');
 await rejects('insert into dispute_preparations(id,owner_id,case_id,name,payload) values($1,$2,$3,$4,$5)',[D2,B,CA,'Wrong case',JSON.stringify(payload)],'23503');
 await identity(A);
 await rejects('update dispute_preparations set owner_id=$1,revision=2 where id=$2',[B,D],'23514');
 await rejects("update dispute_preparations set name='No revision' where id=$1",[D],'40001');
 assert.equal((await db.query("update dispute_preparations set name='Updated',revision=2 where id=$1 and revision=1 returning id",[D])).rows.length,1);checks++;
 assert.equal((await db.query("update dispute_preparations set name='Stale',revision=2 where id=$1 and revision=1 returning id",[D])).rows.length,0);checks++;
 await rejects('insert into dispute_preparations(id,owner_id,name,payload) values($1,$2,$3,$4)',[D,A,'Duplicate',JSON.stringify(payload)],'23505');
 await rejects('delete from dispute_preparations where id=$1',[D],'42501');
 await db.query("insert into dispute_tracking(case_id,owner_id,responsible,deadline_at,deadline_source) values($1,$2,'Ana','2026-12-01T21:00:00Z','Synthetic notice')",[CA,A]);
 await identity(B);
 assert.equal((await db.query('select * from dispute_tracking')).rows.length,0);checks++;
 await rejects("insert into dispute_tracking(case_id,owner_id,responsible,deadline_at,deadline_source) values($1,$2,'Bob','2026-12-01T21:00:00Z','Synthetic notice')",[CA,B],'42501');
 await identity(A);
 await db.query("insert into storage.objects(bucket_id,name) values('dispute-evidence',$1)",[`${A}/${CA}/${D}.pdf`]);
 await identity(B);
 assert.equal((await db.query('select * from storage.objects')).rows.length,0);checks++;
 await rejects("insert into storage.objects(bucket_id,name) values('dispute-evidence',$1)",[`${B}/${CA}/${D2}.pdf`],'42501');
 await rejects("insert into storage.objects(bucket_id,name) values('dispute-evidence',$1)",[`${A}/${CA}/${D2}.pdf`],'42501');
 await identity(A);
 assert.equal((await db.query('select * from storage.objects')).rows.length,1);checks++;
 assert.equal((await db.query("update storage.objects set name='overwrite' returning id")).rows.length,0);checks++;
 await db.query("insert into commercial_requests(id,owner_id,offer,notes) values($1,$2,'diagnostico','Synthetic request')",[D,A]);
 await rejects("insert into commercial_requests(id,owner_id,offer,notes,status) values($1,$2,'diagnostico','Synthetic request','proposta')",[D2,A],'42501');
 await identity(B);assert.equal((await db.query('select * from commercial_requests')).rows.length,0);checks++;
 await db.exec('reset role;set role anon');await rejects('select * from dispute_preparations',[],'42501');
 await db.exec('reset role');
 // Exercise the older history policy suite against the same two isolated identities.
 let history=await readFile(new URL('../supabase/tests/reconciliation_history.sql',import.meta.url),'utf8');history=history.replace(/^\\set.*$/mg,'').replaceAll(":'user_a'",`'${A}'`).replaceAll(":'user_b'",`'${B}'`);await db.exec(history);checks++;
 // Restore a full snapshot into a distinct database, then verify values and RLS survive.
 const snapshot=await db.dumpDataDir();const restored=new PGlite({loadDataDir:snapshot});
 try{const rows=await restored.query('select name,revision from public.dispute_preparations');assert.equal(rows.rows[0].name,'Updated');assert.equal(rows.rows[0].revision,2);await restored.exec('set role authenticated');await restored.query("select set_config('request.jwt.claim.sub',$1,false)",[B]);assert.equal((await restored.query('select * from dispute_preparations')).rows.length,0);checks++;}finally{await restored.close();}
 console.log(`${checks} isolated PostgreSQL assertions passed, including snapshot restore. Real Supabase Auth/Storage integration remains required.`);
}finally{await db.close();}
