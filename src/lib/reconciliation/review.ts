import type { Result } from './engine.ts';
export const reviewStates = { new: 'Novo', analysis: 'Em análise', waiting: 'Aguardando terceiro', resolved: 'Resolvido', discarded: 'Descartado' } as const;
export type ReviewState = keyof typeof reviewStates;
export type ReviewFields = { status: ReviewState; priority: 'low' | 'normal' | 'high'; deadline: string; reason: string };
export type ReviewTask = ReviewFields & { id: string; evidence: Result; history: { at: string; before: ReviewFields; after: ReviewFields }[] };
export function createReviewTasks(results: Result[]): ReviewTask[] {
  return results.filter(r => r.status !== 'exact').map((evidence, i) => ({ id: `pendencia-${i + 1}`, evidence, status: 'new', priority: 'normal', deadline: '', reason: '', history: [] }));
}
export function updateReviewTask(task: ReviewTask, fields: ReviewFields, at: string): ReviewTask {
  if (!Object.hasOwn(reviewStates, fields.status) || !['low','normal','high'].includes(fields.priority)) throw new Error('Situação ou prioridade inválida.');
  const reason = fields.reason.trim();
  if (reason.length > 500 || (['resolved','discarded'].includes(fields.status) && reason.length < 3)) throw new Error('Para encerrar, descreva a justificativa (3 a 500 caracteres).');
  if (fields.deadline) {
    const date = new Date(`${fields.deadline}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.deadline) || fields.deadline < '1900-01-01' || fields.deadline > '2100-12-31' || !Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== fields.deadline) throw new Error('Informe um prazo válido entre 1900 e 2100 ou deixe em branco.');
  }
  if (!Number.isFinite(Date.parse(at))) throw new Error('Horário inválido.');
  const before: ReviewFields = { status: task.status, priority: task.priority, deadline: task.deadline, reason: task.reason };
  const after = { ...fields, reason };
  if (JSON.stringify(before) === JSON.stringify(after)) return task;
  return { ...task, ...after, history: [...task.history, { at, before, after }] };
}
export function exportReviewTasks(tasks: ReviewTask[]): string {
  return JSON.stringify({ version: 1, mode: 'temporary-browser', notice: 'Acompanhamento operacional declarado pelo usuário. Encerramento não comprova recuperação financeira. Horários do navegador; não é trilha de auditoria autenticada.', tasks }, null, 2);
}
