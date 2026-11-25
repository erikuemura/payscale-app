"use client";
import { useEffect, useState } from 'react';
import { labels, money, type Result } from '@/lib/reconciliation/engine';
import { MAX_BYTES, parseCsv } from '@/lib/reconciliation/engine';
import styles from '@/components/reconciliation/workspace.module.css';
type Company = { id:string; name:string };
type Account = Company & { company_id:string };
type Run = { id:string; account_id:string; created_at:string; rule_version:string };
export default function HistoryClient() {
 const [companies,setCompanies]=useState<Company[]>([]), [accounts,setAccounts]=useState<Account[]>([]), [runs,setRuns]=useState<Run[]>([]);
 const [company,setCompany]=useState(''), [account,setAccount]=useState(''), [companyName,setCompanyName]=useState(''), [accountName,setAccountName]=useState('');
 const [files,setFiles]=useState<{receivables?:File;credits?:File}>({}), [confirmed,setConfirmed]=useState(false), [busy,setBusy]=useState(false), [message,setMessage]=useState(''), [results,setResults]=useState<Result[]|null>(null), [page,setPage]=useState(0), [hasNext,setHasNext]=useState(false);
 async function load(index:number, signal?:AbortSignal) {
  const res=await fetch(`/api/reconciliation/history?page=${index}`,{cache:'no-store',signal}); const data=await res.json();
  if(!res.ok) throw new Error(data.error);
  setCompanies(data.companies);setAccounts(data.accounts);setRuns(data.runs);setPage(index);setHasNext(data.hasNext);
 }
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/api/reconciliation/history?page=0',{cache:'no-store',signal:controller.signal})
   .then(async res=>{const data=await res.json();if(!res.ok)throw new Error(data.error);return data;})
   .then(data=>{if(!controller.signal.aborted){setCompanies(data.companies);setAccounts(data.accounts);setRuns(data.runs);setHasNext(data.hasNext);}})
   .catch(e=>{if(!controller.signal.aborted)setMessage(e.message);});
  return()=>controller.abort();
 },[]);
 async function action(body:Record<string,unknown>) {
  const res=await fetch('/api/reconciliation/history',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await res.json();if(!res.ok)throw new Error(data.error);return data;
 }
 async function run(task:()=>Promise<void>) {setBusy(true);setMessage('');try{await task();}catch(e){setMessage(e instanceof Error?e.message:'Não foi possível concluir.');}finally{setBusy(false);}}
 async function open(id:string) {
  setResults(null);const res=await fetch(`/api/reconciliation/history?id=${id}`,{cache:'no-store'});const data=await res.json();if(!res.ok)throw new Error(data.error);setResults(data.run.results);
 }
 async function save() {
  if(!files.receivables||!files.credits||!confirmed||!account)throw new Error('Selecione a conta, arquivos e confirme.');
  const read=async(file:File)=>{if(file.size>MAX_BYTES||!file.name.toLowerCase().endsWith('.csv'))throw new Error('Use CSV de até 1 MB.');const text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());parseCsv(text);return text;};
  const [receivablesCsv,creditsCsv]=await Promise.all([read(files.receivables),read(files.credits)]);
  const data=await action({action:'save',accountId:account,confirmed,receivablesCsv,creditsCsv});await load(0);await open(data.id);setMessage(data.reused?'Esta análise já estava salva; reabrimos o registro existente.':'Análise salva.');
 }
 return <div className={styles.workspace}><header className={styles.heading}><p>EMPRESAS E HISTÓRICO · BETA</p><h1>Suas análises, organizadas.</h1><p>Os arquivos enviados serão processados no servidor. Os registros normalizados ficam salvos na sua empresa; o CSV original não é armazenado.</p></header><p role="status">{message}</p>
 <fieldset disabled={busy} style={{border:0}}><div className={styles.imports}><section className={styles.card}><h2>Empresa</h2><label>Nome da empresa<input className="block border rounded p-2 my-3 w-full" value={companyName} maxLength={100} onChange={e=>setCompanyName(e.target.value)}/></label><button onClick={()=>void run(async()=>{const data=await action({action:'company',name:companyName});await load(0);setCompany(data.company.id);setAccount('');setCompanyName('');})}>Criar empresa</button><label className="block mt-5">Empresa selecionada<select className="block border rounded p-2 my-3 w-full" value={company} onChange={e=>{setCompany(e.target.value);setAccount('');setConfirmed(false);setResults(null);}}><option value="">Selecione</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></section>
 <section className={styles.card}><h2>Conta em BRL</h2><label>Apelido da conta<input className="block border rounded p-2 my-3 w-full" value={accountName} maxLength={100} onChange={e=>setAccountName(e.target.value)}/></label><button disabled={!company} onClick={()=>void run(async()=>{const data=await action({action:'account',companyId:company,name:accountName});await load(0);setAccount(data.account.id);setAccountName('');})}>Criar conta</button><label className="block mt-5">Conta selecionada<select className="block border rounded p-2 my-3 w-full" value={account} onChange={e=>{setAccount(e.target.value);setConfirmed(false);setResults(null);}}><option value="">Selecione</option>{accounts.filter(a=>a.company_id===company).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label></section></div>
 <section className={styles.format}><h2>Salvar conciliação</h2><p>Use os mesmos modelos da <a href="/dashboard/importacoes">análise temporária</a>. Revise as prévias antes de salvar.</p><label className={styles.file}>Recebíveis CSV<input type="file" accept=".csv" onChange={e=>{setFiles(v=>({...v,receivables:e.target.files?.[0]}));setConfirmed(false);setResults(null);}}/></label><label className={styles.file}>Créditos CSV<input type="file" accept=".csv" onChange={e=>{setFiles(v=>({...v,credits:e.target.files?.[0]}));setConfirmed(false);setResults(null);}}/></label><label><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> Confirmo que os arquivos pertencem à conta selecionada, são em BRL e autorizo salvar os registros desta análise.</label><div className={styles.toolbar}><button disabled={!confirmed||!account||!files.receivables||!files.credits} onClick={()=>void run(save)}>Salvar e conciliar</button></div></section>
 <section className={styles.card}><h2>Análises salvas</h2>{runs.length===0&&<p>Nenhuma análise nesta página.</p>}{runs.map(r=><div className={styles.toolbar} key={r.id}><span>{new Date(r.created_at).toLocaleString('pt-BR')} · {accounts.find(a=>a.id===r.account_id)?.name??'Conta'} · {r.rule_version}</span><button onClick={()=>void run(()=>open(r.id))}>Abrir análise</button></div>)}<div className={styles.toolbar}><button disabled={page===0} onClick={()=>void run(()=>load(page-1))}>Anterior</button><span>Página {page+1}</span><button disabled={!hasNext} onClick={()=>void run(()=>load(page+1))}>Próxima</button></div></section></fieldset>
 {results&&<section className={styles.results}><h2>Análise reaberta e recalculada</h2><div className={styles.tableScroll}><table><thead><tr><th>Situação</th><th>Esperado</th><th>Créditos</th><th>Diferença</th></tr></thead><tbody>{results.map((r,i)=><tr key={i}><td><strong>{labels[r.status]} · {r.reference}</strong><p>{r.date} · {r.reason}</p><p>Recebíveis: {r.receivableIds.join(', ')||'—'} · Créditos: {r.creditIds.join(', ')||'—'}</p></td><td>{money(r.expected)}</td><td>{money(r.received)}</td><td>{r.status==='ambiguous'?'Revisar':money(r.difference)}</td></tr>)}</tbody></table></div></section>}</div>;
}
