'use client';
import { useState } from 'react';
import { questions, concerns, emptyAnswers, preventionPlan, preventionText, type Answer, type Concern } from '@/lib/disputes/prevention';
import type { Passport } from '@/lib/disputes/passport';
import styles from './passport.module.css';
import printStyles from './prevention.module.css';
export default function Prevention({ passport }: { passport: Passport }) {
  const [answers,setAnswers] = useState(emptyAnswers);
  const [concern,setConcern] = useState<Concern>('unknown');
  const [snapshot,setSnapshot] = useState('');
  const current = JSON.stringify({passport,answers,concern});
  const plan = snapshot === current ? preventionPlan(passport,answers,concern) : null;
  return <section id="prevencao" aria-label="Diagnóstico preventivo">
    <h2>Plano preventivo contra chargebacks</h2><p>Use a modalidade, o responsável e as referências preenchidas acima, mesmo antes de existir uma disputa. Não é necessário informar valor contestado para gerar este plano. As respostas são declaradas e não são verificadas com o provedor.</p>
    <label>Principal preocupação<select value={concern} onChange={e=>{setConcern(e.target.value as Concern);setSnapshot('');}}>{Object.entries(concerns).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
    <div className={styles.grid}>{Object.entries(questions).filter(([key])=>passport.modality !== 'pos' || key !== 'authentication').map(([key,label])=><label key={key}>{label}<select value={answers[key as keyof typeof answers]} onChange={e=>{setAnswers({...answers,[key]:e.target.value as Answer});setSnapshot('');}}><option value="unknown">Não informado</option><option value="yes">Sim</option><option value="no">Não</option></select></label>)}</div>
    <p className={styles.warning}>Cobertura não verificada pelo sistema. 3DS e antifraude não garantem proteção contra todos os motivos de chargeback. Não há integração ativa com parceiros de proteção nesta ferramenta.</p>
    <button type="button" className={styles.primary} onClick={()=>setSnapshot(current)}>Gerar plano preventivo</button>
    {plan&&<div role="region" aria-label="Plano de ações preventivas" aria-live="polite"><h3>{plan.actions.length} ações para revisar</h3><p>{plan.notice}</p><p>Prioridades editoriais, sem pontuação de risco. Nenhum envio, reembolso ou bloqueio será realizado.</p>{plan.actions.map(action=><article key={action.id}><h3>{action.priority} · {action.task}</h3><p>{action.reason}</p><p><strong>Responsável:</strong> {action.owner}</p></article>)}<details><summary>Relatório para copiar ou imprimir</summary><label className={printStyles.copyReport}>Texto do plano preventivo<textarea readOnly rows={18} value={preventionText(passport,answers,concern)} onFocus={e=>e.target.select()}/></label><pre className={printStyles.printReport}>{preventionText(passport,answers,concern)}</pre><p>Selecione e copie o texto para guardar. Ao sair ou recarregar, os dados são perdidos.</p><button type="button" onClick={()=>window.print()}>Imprimir / salvar PDF pelo navegador</button></details></div>}
  </section>;
}
