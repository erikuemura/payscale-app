'use client';
import {useState,useEffect} from 'react';
import SavedPreparations from '@/components/disputes/SavedPreparations';
import CaseOperations from '@/components/disputes/CaseOperations';
import {BACKUP_LIMIT,readBackup,writeBackup} from '@/lib/disputes/backup';
import Link from 'next/link';
import Prevention from './Prevention';
import {modalities,evidenceLabels,fulfillmentHints,CHECKLIST_VERSION,preparePassport,passportText,type Passport,type Modality,type EvidenceKey} from '@/lib/disputes/passport';
import styles from './passport.module.css';
const emptyEvidence=()=>({agreement:{available:false,source:''},fulfillment:{available:false,source:''},payment:{available:false,source:''}});
const empty=():Passport=>({reference:'',provider:'',modality:'physical',reason:'',total:'',disputed:'',owner:'',externalDeadline:'',internalDeadline:'',existingRefund:false,existingDispute:false,contradictions:'',evidence:emptyEvidence()});
export default function PassportWorkspace({initial,embedded=false,caseId}:{initial?:Passport;embedded?:boolean;caseId?:string}){
 const [accountEnabled,setAccountEnabled]=useState(false);
 useEffect(()=>{if(!embedded)return;let active=true;fetch('/api/workspace/capabilities').then(r=>r.json()).then(d=>{if(active)setAccountEnabled(d.disputes===true);}).catch(()=>{});return()=>{active=false;};},[embedded]);
 const Root=embedded?"div":"main";
 const [modalityConfirmed,setModalityConfirmed]=useState(!embedded);
 const [reset,setReset]=useState(0);
 const [input,setInput]=useState<Passport>(()=>initial??empty());
 const [draft,setDraft]=useState('');
 const [error,setError]=useState('');
 const [example,setExample]=useState(false);
 const [pendingBackup,setPendingBackup]=useState<Passport|null>(null);
 const [backupMessage,setBackupMessage]=useState('');
 const [backupError,setBackupError]=useState('');
 const [readingBackup,setReadingBackup]=useState(false);
 function saveBackup(){
  setBackupError('');setBackupMessage('');
  try{
   if(!modalityConfirmed)throw new Error('Selecione a modalidade antes de guardar a preparação.');
   const raw=writeBackup(input);readBackup(raw,initial);
   const url=URL.createObjectURL(new Blob([raw],{type:'application/json;charset=utf-8'}));
   const anchor=document.createElement('a');anchor.href=url;anchor.download='payscale-preparacao.json';document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   setBackupMessage('Download solicitado. Confira o arquivo na pasta de downloads. Ele não foi salvo na sua conta.');
  }catch(err){setBackupError(err instanceof Error?err.message:'Não foi possível preparar o arquivo.');}
 }
 async function openBackup(file:File){
  setReadingBackup(true);setPendingBackup(null);setBackupMessage('');setBackupError('');
  try{if(file.size>BACKUP_LIMIT)throw new Error('Arquivo excede 64 KiB.');const restored=readBackup(await file.text(),initial);setPendingBackup(restored);}
  catch(err){setBackupError(err instanceof Error?err.message:'Não foi possível ler o arquivo.');}
  finally{setReadingBackup(false);}
 }
 function restoreBackup(){
  if(!pendingBackup)return;
  setInput(pendingBackup);setPendingBackup(null);setModalityConfirmed(true);setDraft('');setError('');setExample(false);setReset(n=>n+1);
  setBackupMessage('Preparação restaurada para revisão. Gere novamente o rascunho e o plano preventivo; nenhuma evidência foi validada.');
 }
 const update=(patch:Partial<Passport>)=>{setInput(old=>({...old,...patch}));setDraft('');setError('');};
 const evidence=(key:EvidenceKey,patch:Partial<Passport['evidence'][EvidenceKey]>)=>update({evidence:{...input.evidence,[key]:{...input.evidence[key],...patch}}});
 function download(){if(!draft)return;const url=URL.createObjectURL(new Blob([draft],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='payscale-rascunho-evidencias.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 const result=draft?preparePassport(input):null;
 return <Root className={styles.page} style={embedded?{padding:"20px",minHeight:0,borderRadius:16}:undefined}>
 {!embedded&&<nav><Link href="/">payscale.</Link><Link href="/dashboard/chargebacks">Área de chargebacks →</Link></nav>}
 {!embedded&&<header><p>PASSAPORTE DA VENDA · BETA</p><h1>Antes da defesa,<br/><span>organize as evidências.</span></h1><p>Separe o que foi contratado, o que foi entregue e como foi pago. Identifique lacunas antes de revisar a resposta ao provedor.</p></header>}
 <aside><strong>{accountEnabled?"Preparação com salvamento explícito.":"Rascunho temporário no navegador."}</strong><p>{accountEnabled?"Somente os campos salvos por você são enviados à sua conta. Nada é enviado ao adquirente.":"Nada é enviado ao servidor ou ao adquirente."} {accountEnabled&&caseId?"Documentos podem ser guardados separadamente na seção do caso; não são analisados.":"Os documentos originais não são recebidos, armazenados nem analisados."} Ao sair ou recarregar, os campos são perdidos se você não baixar a preparação editável. Use apenas referências aos documentos; evite dados sensíveis de clientes.</p><p>Checklist editorial PayScale, versão {CHECKLIST_VERSION}. Confirme as exigências, o horário limite e o fuso na notificação do seu provedor.</p></aside>
 {!embedded&&<div className={styles.toolbar}><a href="#prevencao">Fazer diagnóstico preventivo ↓</a><button onClick={()=>{setInput({...empty(),reference:'PEDIDO-FICTICIO-001',provider:'Provedor exemplo',modality:'service',reason:'Serviço não prestado — exemplo fictício',total:'1000',disputed:'200',owner:'Responsável fictício',evidence:{...emptyEvidence(),agreement:{available:true,source:'Contrato fictício — referência ilustrativa, sem arquivo'}}});setDraft('');setError('');setExample(true);setReset(n=>n+1);}}>Experimentar exemplo de serviço</button><button onClick={()=>{setInput(empty());setDraft('');setError('');setExample(false);setReset(n=>n+1);}}>Limpar rascunho</button></div>}
 {example&&<p role="status">Exemplo fictício editável. Nenhum contrato ou comprovante real foi fornecido.</p>}
 <section aria-label="Guardar e retomar preparação">
 <h2>Guarde o trabalho para continuar depois</h2>
 <p>O arquivo guarda os campos e as referências do checklist, inclusive incompletos. Não inclui documentos originais, respostas do diagnóstico ou relatórios gerados. Não há salvamento automático na conta.</p>
 <p>O arquivo não é criptografado. Guarde-o em local seguro e evite incluir dados pessoais de clientes.</p>
 <div className={styles.toolbar}><button type="button" onClick={saveBackup}>Baixar preparação editável</button><label>Reabrir preparação (.json, até 64 KiB)<input type="file" accept=".json,application/json" disabled={readingBackup} onChange={event=>{const file=event.target.files?.[0];event.target.value='';if(file)void openBackup(file);}}/></label></div>
 {readingBackup&&<p role="status">Lendo arquivo…</p>}
 {backupError&&<p role="alert">{backupError} A preparação atual foi mantida.</p>}
 {backupMessage&&<p role="status">{backupMessage}</p>}
 {pendingBackup&&<div role="region" aria-label="Confirmar restauração"><h3>Revisar antes de substituir</h3><p>Referência: {pendingBackup.reference||'Não informada'} · Provedor: {pendingBackup.provider||'Não informado'} · Modalidade: {modalities[pendingBackup.modality]}</p><p>Restaurar substitui os campos atuais e limpa o relatório e o plano preventivo desta página. Baixe a preparação atual antes, se quiser preservá-la.</p><div className={styles.toolbar}><button type="button" onClick={restoreBackup}>Substituir campos pelo arquivo</button><button type="button" onClick={()=>setPendingBackup(null)}>Cancelar restauração</button></div></div>}
 </section>
 {accountEnabled&&<SavedPreparations input={input} caseId={caseId} initial={initial} onRestore={p=>{setInput(p);setModalityConfirmed(true);setDraft('');setError('');setExample(false);setReset(n=>n+1);}}/>}
 {accountEnabled&&caseId&&<CaseOperations caseId={caseId}/>}
 <form onSubmit={e=>{e.preventDefault();try{if(!modalityConfirmed)throw new Error('Selecione a modalidade da venda.');setDraft(passportText(input));setError('');}catch(err){setDraft('');setError(err instanceof Error?err.message:'Revise os campos.');}}}>
 <section><h2>01 · Identifique a disputa</h2><div className={styles.grid}>
 <label>Referência do caso ou pedido<input value={input.reference} maxLength={500} onChange={e=>update({reference:e.target.value})}/></label>
 <label>Provedor informado<input value={input.provider} maxLength={500} onChange={e=>update({provider:e.target.value})}/></label>
 <label>Modalidade<select value={modalityConfirmed?input.modality:""} onChange={e=>{setModalityConfirmed(true);update({modality:e.target.value as Modality,evidence:emptyEvidence()});}}>{!modalityConfirmed&&<option value="" disabled>Selecione a modalidade</option>}{Object.entries(modalities).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
 <label>Responsável pela revisão<input value={input.owner} maxLength={500} onChange={e=>update({owner:e.target.value})}/></label>
 <label>Valor total da venda (R$)<input inputMode="decimal" value={input.total} onChange={e=>update({total:e.target.value})}/></label>
 <label>Valor contestado (R$)<input inputMode="decimal" value={input.disputed} onChange={e=>update({disputed:e.target.value})}/></label>
 <label>Prazo do provedor (opcional)<input type="date" min="1900-01-01" max="2100-12-31" value={input.externalDeadline} onChange={e=>update({externalDeadline:e.target.value})}/></label>
 <label>Prazo interno (opcional)<input type="date" min="1900-01-01" max="2100-12-31" value={input.internalDeadline} onChange={e=>update({internalDeadline:e.target.value})}/></label>
 </div><label>Motivo conforme a notificação<input value={input.reason} maxLength={500} onChange={e=>update({reason:e.target.value})}/></label>
 {!input.externalDeadline&&<p className={styles.warning}>Confirmação urgente: falta o prazo do provedor. Não vamos estimar uma data.</p>}
 </section>
 <section><h2>02 · Confira cada tipo de evidência</h2><p>Informar uma referência não valida o documento. Contratação, execução e pagamento precisam ser conferidos separadamente. Trocar a modalidade limpa este checklist.</p>
 {(Object.keys(evidenceLabels) as EvidenceKey[]).map(key=><article key={key}><h3>{evidenceLabels[key]}</h3><p>{key==='agreement'?'Pedido, escopo, oferta e condições aceitas, incluindo cancelamento quando aplicável.':key==='fulfillment'?fulfillmentHints[input.modality]:'Comprovante de pagamento e identificador da transação. Pagamento não comprova entrega.'}</p><label className={styles.check}><input type="checkbox" checked={input.evidence[key].available} onChange={e=>evidence(key,{available:e.target.checked,source:e.target.checked?input.evidence[key].source:''})}/> Tenho uma fonte para {evidenceLabels[key].toLowerCase()}</label>{input.evidence[key].available?<label>Referência da fonte de {evidenceLabels[key].toLowerCase()}<input maxLength={500} value={input.evidence[key].source} placeholder="Nome do documento, data e página ou identificador" onChange={e=>evidence(key,{source:e.target.value})}/></label>:<p className={styles.warning}>Documento não informado. A comprovação desta categoria continua pendente.</p>}</article>)}
 </section>
 <section><h2>03 · Revise conflitos e duplicidades</h2><label className={styles.check}><input type="checkbox" checked={input.existingRefund} onChange={e=>update({existingRefund:e.target.checked})}/> Já existe reembolso registrado para este pedido</label><label className={styles.check}><input type="checkbox" checked={input.existingDispute} onChange={e=>update({existingDispute:e.target.checked})}/> Já existe outra disputa para este pedido</label><label>Contradições que você identificou (opcional)<textarea maxLength={2000} value={input.contradictions} onChange={e=>update({contradictions:e.target.value})} placeholder="Exemplo: o rastreio diz entregue, mas o comprovante indica outro endereço."/></label><p>Não há detecção automática de contradições nesta versão. Revise os originais.</p></section>
 {error&&<p role="alert" className={styles.warning}>{error}</p>}<button className={styles.primary} type="submit">Preparar rascunho para revisão</button>
 </form>
 {result&&<section aria-label="Revisão do rascunho"><h2>04 · Rascunho preparado, ainda não enviado</h2><p>Exposição contestada: <strong>{(result.disputed/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong>. Nenhum crédito ou valor recuperado foi registrado.</p>{[...result.alerts,...result.gaps].map(message=><p className={styles.warning} key={message}>{message}</p>)}<details><summary>Ler conteúdo completo</summary><pre>{draft}</pre></details><button className={styles.primary} onClick={download}>Exportar rascunho TXT</button><p>A exportação não gera protocolo e não confirma recebimento pelo provedor. Confira as regras aplicáveis antes de decidir contestar, aceitar ou buscar uma solução comercial.</p></section>}
 {modalityConfirmed?<Prevention key={`${reset}-${input.modality}`} passport={input}/>:<p role="status">Selecione a modalidade para abrir o diagnóstico preventivo.</p>}
 </Root>;
}
