import { createHash } from 'node:crypto';
import { parseCsv, reconcile, MAX_ROWS, type Entry } from './engine.ts';
export const RULE_VERSION = 'referencia-data-v1' as const;
export const isUuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export function validName(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length < 2 || value.trim().length > 100 || /[\x00-\x1f\x7f]/.test(value)) throw new Error('Informe um nome entre 2 e 100 caracteres.');
  return value.trim();
}
function canonical(entries: Entry[]): Entry[] { return [...entries].sort((a,b)=>a.id < b.id ? -1 : a.id > b.id ? 1 : 0).map(({id,date,cents,reference})=>({id,date,cents,reference})); }
export function prepareHistory(receivablesCsv: unknown, creditsCsv: unknown) {
  if (typeof receivablesCsv !== 'string' || typeof creditsCsv !== 'string') throw new Error('Envie os dois arquivos CSV.');
  const inputs = { receivables: canonical(parseCsv(receivablesCsv)), credits: canonical(parseCsv(creditsCsv)) };
  return { inputs, fingerprint: createHash('sha256').update(JSON.stringify({ rule: RULE_VERSION, inputs })).digest('hex'), results: reconcile(inputs.receivables, inputs.credits) };
}
/** Revalidate Data API records. Stored data never supplies trusted calculated totals. */
export function readHistoryInputs(value: unknown) {
  if (!value || typeof value !== 'object') throw new Error('Análise armazenada inválida.');
  const inputs = value as Record<string, unknown>;
  function asCsv(value: unknown): string {
    if (!Array.isArray(value) || !value.length || value.length > MAX_ROWS) throw new Error('Análise armazenada inválida.');
    const rows = value.map((entry: unknown) => {
      if (!entry || typeof entry !== 'object') throw new Error('Análise armazenada inválida.');
      const e = entry as Record<string, unknown>;
      if (typeof e.id !== 'string' || typeof e.date !== 'string' || typeof e.reference !== 'string' || !Number.isSafeInteger(e.cents) || Number(e.cents) <= 0 || Number(e.cents) > 10_000_000_000) throw new Error('Análise armazenada inválida.');
      return [e.id, e.date, (Number(e.cents) / 100).toFixed(2), e.reference].map(v => `"${v.replaceAll('"','""')}"`).join(';');
    });
    return 'id;data;valor;referencia\n' + rows.join('\n');
  }
  return prepareHistory(asCsv(inputs.receivables), asCsv(inputs.credits));
}
