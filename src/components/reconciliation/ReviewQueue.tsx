'use client';
import { useState } from 'react';
import { createReviewTasks, updateReviewTask, exportReviewTasks, reviewStates, type ReviewTask, type ReviewFields } from '@/lib/reconciliation/review';
import { labels, money, type Result } from '@/lib/reconciliation/engine';
import styles from './review.module.css';

function TaskForm({ task, onSave }: { task: ReviewTask; onSave: (task: ReviewTask) => void }) {
  const [fields, setFields] = useState<ReviewFields>({ status: task.status, priority: task.priority, deadline: task.deadline, reason: task.reason });
  const [message, setMessage] = useState('');
  const edit = (value: Partial<ReviewFields>) => { setFields(old => ({ ...old, ...value })); setMessage(''); };
  return <article className={styles.task}>
    <header><div><span>{labels[task.evidence.status]}</span><h3>{task.evidence.reference} · {task.evidence.date}</h3></div><strong>{reviewStates[task.status]}</strong></header>
    <p>{task.evidence.reason}</p><p>Esperado: {money(task.evidence.expected)} · Créditos: {money(task.evidence.received)}</p>
    <details><summary>Registros de origem</summary><p>Recebíveis: {task.evidence.receivableIds.join(', ') || 'Nenhum'}<br/>Créditos: {task.evidence.creditIds.join(', ') || 'Nenhum'}</p></details>
    <form aria-label={`Acompanhar ${task.evidence.reference}`} onSubmit={e => { e.preventDefault(); try { onSave(updateReviewTask(task, fields, new Date().toISOString())); setMessage('Acompanhamento atualizado somente nesta sessão.'); } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível atualizar.'); } }}>
      <div className={styles.fields}>
        <label>Situação<select value={fields.status} onChange={e => edit({ status: e.target.value as ReviewFields['status'] })}>{Object.entries(reviewStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Prioridade<select value={fields.priority} onChange={e => edit({ priority: e.target.value as ReviewFields['priority'] })}><option value="low">Baixa</option><option value="normal">Normal</option><option value="high">Alta</option></select></label>
        <label>Prazo de acompanhamento (opcional)<input type="date" min="1900-01-01" max="2100-12-31" value={fields.deadline} onChange={e => edit({ deadline: e.target.value })}/></label>
      </div>
      <label>Nota ou justificativa de encerramento<textarea maxLength={500} value={fields.reason} onChange={e => edit({ reason: e.target.value })} placeholder="Registre o que foi conferido e o motivo da decisão."/></label>
      <button type="submit">Atualizar acompanhamento</button><p role="status">{message}</p>
    </form>
    {task.history.length > 0 && <details><summary>Alterações nesta sessão ({task.history.length})</summary><ol>{task.history.map((h, i) => <li key={i}>{new Date(h.at).toLocaleString('pt-BR')} · {reviewStates[h.before.status]} → {reviewStates[h.after.status]}{h.after.reason ? ` · ${h.after.reason}` : ''}</li>)}</ol><p>Horário do navegador; registro temporário, sem identificação autenticada do responsável.</p></details>}
  </article>;
}
export default function ReviewQueue({ results }: { results: Result[] }) {
  const [tasks, setTasks] = useState(() => createReviewTasks(results));
  const [filter, setFilter] = useState('open');
  const open = tasks.filter(t => !['resolved','discarded'].includes(t.status)).length;
  const visible = tasks.filter(t => filter === 'all' || (filter === 'open' ? !['resolved','discarded'].includes(t.status) : ['resolved','discarded'].includes(t.status))).sort((a,b) => {
    const priority = { high: 0, normal: 1, low: 2 };
    return priority[a.priority]-priority[b.priority] || (a.deadline || '9999').localeCompare(b.deadline || '9999');
  });
  function download() {
    const url = URL.createObjectURL(new Blob([exportReviewTasks(tasks)], { type: 'application/json;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'payscale-acompanhamento.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className={styles.queue} aria-label="Fila de pendências"><header><p>04 · ACOMPANHAMENTO</p><h2>Da diferença à próxima ação.</h2><p>{open} pendência(s) aberta(s) · {tasks.length - open} encerrada(s).</p></header>
    <p>Organize a conferência por prioridade e prazo. Encerrar uma pendência não comprova dinheiro recuperado e não altera os valores conciliados.</p>
    <p className={styles.notice}>Modo temporário: ao limpar, trocar arquivos, refazer a conciliação ou sair da página, o acompanhamento é perdido. Exporte antes de sair. Nenhuma mensagem ou contestação é enviada.</p>
    <div className={styles.toolbar}><label>Mostrar<select value={filter} onChange={e => setFilter(e.target.value)}><option value="open">Abertas</option><option value="closed">Encerradas</option><option value="all">Todas</option></select></label><button onClick={download} disabled={!tasks.length}>Exportar acompanhamento (JSON)</button></div>
    <p>Ordem: maior prioridade, depois prazo mais próximo. O prazo é informado por você; não é um vencimento contratual verificado.</p>
    {!visible.length && <p role="status">Nenhuma pendência neste filtro.</p>}
    {visible.map(task => <TaskForm key={task.id} task={task} onSave={changed => setTasks(old => old.map(t => t.id === changed.id ? changed : t))}/>)}
  </section>;
}
