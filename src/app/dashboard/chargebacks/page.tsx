'use client';
import { useEffect, useMemo, useState } from 'react';
import Topbar from '@/components/Topbar';
import PassportWorkspace from '@/app/passaporte-venda/PassportWorkspace';
import { createClient } from '@/lib/supabase/client';
import type { Chargeback } from '@/lib/supabase/types';
import { casePassport, caseStatus, casePriority, deadlineLabel } from '@/lib/disputes/case-workspace';
import styles from './workspace.module.css';

const statusLabels = { aberto:'Aberto', contestado:'Registro interno de contestação', ganho:'Ganho registrado', perdido:'Perdido registrado', desconhecido:'Status não reconhecido' };
const providers:Record<string,string> = { pagseguro:'PagSeguro', mercadopago:'Mercado Pago', cielo:'Cielo', stone:'Stone' };
const brl=(n:number)=>Number.isFinite(Number(n))?Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'Valor não informado';
const reference=(c:Chargeback)=>c.external_id||c.id;
const provider=(c:Chargeback)=>providers[c.provider]||c.provider;
const opened=(c:Chargeback)=>{const d=(c.opened_at||c.created_at).slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(d)?d.split('-').reverse().join('/'):'Data não informada';};
function exportCases(rows:Chargeback[]) {
  const cell=(value:unknown)=>{let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
  const csv=[['Referência','Abertura','Provedor','Motivo','Valor contestado BRL','Dias registrados (confirmar prazo)','Status registrado'],...rows.map(c=>[reference(c),opened(c),provider(c),c.reason,Number(c.amount).toFixed(2),c.deadline_days,statusLabels[caseStatus(c.status)]])].map(row=>row.map(cell).join(';')).join('\n');
  const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='payscale-chargebacks.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function ChargebacksPage(){
  const [cases,setCases]=useState<Chargeback[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all');
  const [page,setPage]=useState(1);
  const [selected,setSelected]=useState<Chargeback|null>(null);
  const [closing,setClosing]=useState(false);
  const [reload,setReload]=useState(0);
  useEffect(()=>{
    let active=true;
    async function query(){
      const supabase=createClient();
      const {data:{user},error:authError}=await supabase.auth.getUser();
      if(authError||!user)throw new Error('Sua sessão não pôde ser confirmada. Entre novamente para consultar os casos.');
      const {data,error:queryError}=await supabase.from('chargebacks').select('*').eq('user_id',user.id).order('created_at',{ascending:false});
      if(queryError)throw new Error('Não foi possível carregar os chargebacks. Tente novamente.');
      return data??[];
    }
    query().then(data=>{if(active)setCases(data);}).catch(e=>{if(active){setError(e instanceof Error?e.message:'Falha ao consultar os casos.');setCases([]);}}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[reload]);
  const filtered=useMemo(()=>cases.filter(c=>(filter==='all'||caseStatus(c.status)===filter)&&[reference(c),provider(c),c.reason??'',c.customer_name??''].join(' ').toLowerCase().includes(search.trim().toLowerCase())).sort((a,b)=>casePriority[caseStatus(a.status)]-casePriority[caseStatus(b.status)]),[cases,search,filter]);
  const pending=cases.filter(c=>['aberto','contestado','desconhecido'].includes(caseStatus(c.status)));
  const pages=Math.max(1,Math.ceil(filtered.length/8));
  const currentPage=Math.min(page,pages);
  return <div className={styles.page}><Topbar title="Central de chargebacks" subtitle="Preparação de evidências e prevenção"/>
    <main className={styles.main}>
      {selected?<>
        <section className={styles.card} aria-label="Caso em preparação"><h1>Preparar caso {reference(selected)}</h1><p>{provider(selected)} · {selected.reason||'Motivo não informado'} · Valor contestado: <strong>{brl(selected.amount)}</strong></p><p>Referência, provedor, motivo e valor contestado vieram do registro da sua conta. Confira-os antes de preparar. Informe o total original da venda e selecione a modalidade.</p><p className={styles.notice}>Rascunho temporário: ao fechar, trocar de página ou recarregar, a preparação é perdida. Nenhum documento é enviado ou salvo automaticamente. O status do caso permanece inalterado.</p>
        <button type="button" onClick={()=>setClosing(true)}>Voltar à lista</button>
        {closing&&<div role="alert"><p>Voltar à lista descarta a preparação desta sessão. Copie ou exporte o relatório antes de sair.</p><div className={styles.actions}><button onClick={()=>{setSelected(null);setClosing(false);}}>Descartar preparação e voltar</button><button onClick={()=>setClosing(false)}>Continuar preparando</button></div></div>}
        </section>
        <PassportWorkspace key={selected.id} caseId={selected.id} embedded initial={casePassport({reference:reference(selected),provider:provider(selected),reason:selected.reason||'',amount:Number(selected.amount)})}/>
      </>:<>
        <section className={styles.card}><h1>Organize a resposta de cada caso</h1><p>Selecione uma disputa para preparar provas de contratação, entrega e pagamento e gerar um plano preventivo, sem sair do painel.</p><p className={styles.notice}>Esta central não envia contestações ao adquirente. Registros antigos de contestação não comprovam envio; confirme protocolo e prazo no provedor. Um caso ganho não comprova crédito recebido.</p></section>
        {loading?<p role="status">Carregando casos da sua conta…</p>:error?<section className={styles.card}><p role="alert">{error}</p><button onClick={()=>{setLoading(true);setError('');setReload(n=>n+1);}}>Tentar novamente</button></section>:<>
          <section className={styles.stats} aria-label="Resumo dos casos"><div className={styles.card}><strong>{pending.length}</strong><p>Casos pendentes de acompanhamento</p></div><div className={styles.card}><strong>{brl(pending.reduce((sum,c)=>sum+Number(c.amount||0),0))}</strong><p>Valor contestado nos casos pendentes</p></div><div className={styles.card}><strong>{pending.length}</strong><p>Prazos a confirmar na notificação original</p></div></section>
          <section className={styles.card} aria-label="Lista de chargebacks"><div className={styles.filters}><label>Buscar casos<input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Referência, cliente, provedor ou motivo"/></label><label>Status registrado<select value={filter} onChange={e=>{setFilter(e.target.value);setPage(1);}}><option value="all">Todos</option>{Object.entries(statusLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><button onClick={()=>exportCases(filtered)} disabled={!filtered.length}>Exportar lista CSV</button></div>
          <p>Casos abertos aparecem primeiro. Dias registrados não são uma contagem regressiva verificada.</p>
          {!filtered.length?<p>{cases.length?'Nenhum caso corresponde aos filtros.':'Nenhum caso registrado nesta conta. Não há sincronização automática de adquirentes ativa nesta central.'}</p>:filtered.slice((currentPage-1)*8,currentPage*8).map(c=><article className={styles.case} key={c.id}><div><h2>{reference(c)}</h2><p>{provider(c)} · {c.reason||'Motivo não informado'}</p><p><strong>{brl(c.amount)}</strong> · {statusLabels[caseStatus(c.status)]}</p><p>{deadlineLabel(c.deadline_days)}</p><details><summary>Ver dados do registro</summary><p>Cliente: {c.customer_name||'Não informado'} · Abertura: {opened(c)}</p><p>Status original: {c.status}</p>{typeof c.metadata?.descricao==='string'&&<p>{c.metadata.descricao}</p>}</details></div><button onClick={()=>setSelected(c)} aria-label={`Preparar caso ${reference(c)}`}>Preparar evidências e prevenção</button></article>)}
          {pages>1&&<div className={styles.actions}><button disabled={currentPage===1} onClick={()=>setPage(currentPage-1)}>Anterior</button><span>Página {currentPage} de {pages}</span><button disabled={currentPage===pages} onClick={()=>setPage(currentPage+1)}>Próxima</button></div>}
          </section>
        </>}
      </>}
    </main></div>;
}
