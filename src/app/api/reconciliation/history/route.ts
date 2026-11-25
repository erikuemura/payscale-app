import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUuid, prepareHistory, readHistoryInputs, validName, RULE_VERSION } from '@/lib/reconciliation/history';
export const runtime = 'nodejs';
const response = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
async function context() {
  if (process.env.RECONCILIATION_HISTORY_ENABLED !== 'true') return { error: response({ error: 'Histórico ainda não ativado.' }, 503) };
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) return { error: response({ error: 'Entre na sua conta.' }, 401) };
  return { db, user };
}
export async function GET(request: NextRequest) {
  const ctx = await context(); if (ctx.error) return ctx.error;
  const { db, user } = ctx;
  const id = request.nextUrl.searchParams.get('id');
  if (id) {
    if (!isUuid(id)) return response({ error: 'Identificador inválido.' }, 400);
    const { data, error } = await db.from('reconciliation_runs').select('*').eq('id',id).eq('owner_id',user.id).maybeSingle();
    if (error) return response({ error: 'Não foi possível consultar a análise.' }, 500);
    if (!data) return response({ error: 'Análise não encontrada.' }, 404);
    try {
      const checked = readHistoryInputs(data.inputs);
      if (checked.fingerprint !== data.fingerprint || data.rule_version !== RULE_VERSION) throw new Error('invalid');
      return response({ run: { ...data, results: checked.results } });
    } catch { return response({ error: 'Esta análise não passou na verificação de integridade.' }, 409); }
  }
  const page = Number(request.nextUrl.searchParams.get('page') ?? '0');
  if (!Number.isInteger(page) || page < 0 || page > 10000) return response({ error: 'Página inválida.' },400);
  const [companies, accounts, runs] = await Promise.all([
    db.from('reconciliation_companies').select('id,name').eq('owner_id',user.id).order('created_at').limit(200),
    db.from('reconciliation_accounts').select('id,company_id,name,currency').eq('owner_id',user.id).order('created_at').limit(500),
    db.from('reconciliation_runs').select('id,company_id,account_id,rule_version,created_at').eq('owner_id',user.id).order('created_at',{ascending:false}).order('id').range(page*50,page*50+49),
  ]);
  if (companies.error || accounts.error || runs.error) return response({ error: 'Histórico indisponível. A configuração do banco precisa ser verificada.' },503);
  return response({ companies: companies.data, accounts: accounts.data, runs: runs.data, page, hasNext: runs.data.length === 50 });
}
async function boundedJson(request: NextRequest): Promise<Record<string, unknown>> {
  if (!request.body) throw new Error('Corpo vazio.');
  const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const next = await reader.read(); if (next.done) break; size += next.value.byteLength; if (size > 2_100_000) { await reader.cancel(); throw new Error('Envio excede 2,1 MB.'); } chunks.push(next.value); }
  } finally { reader.releaseLock(); }
  const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Requisição inválida.');
  return body;
}
export async function POST(request: NextRequest) {
  // Cookie-based mutations must originate from this application.
  if (request.headers.get('origin') !== request.nextUrl.origin) return response({ error: 'Origem não permitida.' },403);
  const ctx = await context(); if (ctx.error) return ctx.error;
  const { db, user } = ctx;
  let body: Record<string,unknown>;
  try { body = await boundedJson(request); } catch { return response({ error: 'Envio inválido ou maior que 2,1 MB.' },400); }
  if (body.action === 'company') {
    let name: string; try { name = validName(body.name); } catch { return response({error:'Nome deve ter entre 2 e 100 caracteres.'},400); }
    const { data, error } = await db.from('reconciliation_companies').insert({ owner_id:user.id,name }).select('id,name').single();
    return error ? response({error:'Não foi possível criar a empresa.'},400) : response({company:data},201);
  }
  if (body.action === 'account') {
    let name: string; try { name = validName(body.name); } catch { return response({error:'Nome deve ter entre 2 e 100 caracteres.'},400); }
    if (!isUuid(body.companyId)) return response({error:'Selecione uma empresa.'},400);
    const { data, error } = await db.from('reconciliation_accounts').insert({ owner_id:user.id,company_id:body.companyId,name,currency:'BRL' }).select('id,company_id,name,currency').single();
    return error ? response({error:'Não foi possível criar a conta. Verifique a empresa e se o nome já existe.'},400) : response({account:data},201);
  }
  if (body.action !== 'save' || !isUuid(body.accountId) || body.confirmed !== true) return response({error:'Selecione uma conta e confirme os arquivos.'},400);
  let prepared;
  try { prepared = prepareHistory(body.receivablesCsv,body.creditsCsv); } catch (e) { return response({error:e instanceof Error ? e.message : 'Arquivos inválidos.'},400); }
  const { data: account, error: accountError } = await db.from('reconciliation_accounts').select('id,company_id').eq('id',body.accountId).eq('owner_id',user.id).maybeSingle();
  if (accountError || !account) return response({error:'Conta não encontrada.'},404);
  const { data, error } = await db.from('reconciliation_runs').insert({ owner_id:user.id,account_id:account.id,company_id:account.company_id,rule_version:RULE_VERSION,fingerprint:prepared.fingerprint,inputs:prepared.inputs }).select('id').single();
  if (!error) return response({id:data.id,reused:false},201);
  if (error.code === '23505') {
    const { data: existing } = await db.from('reconciliation_runs').select('id,inputs').eq('account_id',account.id).eq('owner_id',user.id).eq('rule_version',RULE_VERSION).eq('fingerprint',prepared.fingerprint).maybeSingle();
    try { if (existing && readHistoryInputs(existing.inputs).fingerprint === prepared.fingerprint) return response({id:existing.id,reused:true}); } catch { /* Never trust inconsistent Data API records. */ }
    return response({error:'Registro existente inconsistente; contate o suporte.'},409);
  }
  return response({error:'Não foi possível salvar. Nenhum sucesso foi confirmado.'},500);
}
