import type { Entry } from './engine.ts';

export function sameEntries(a: Entry[], b: Entry[]): boolean {
  const canonical = (entries: Entry[]) => JSON.stringify(entries.map(e => [e.id, e.date, e.cents, e.reference]).sort((x, y) => String(x[0]) < String(y[0]) ? -1 : String(x[0]) > String(y[0]) ? 1 : 0));
  return a.length > 0 && a.length === b.length && canonical(a) === canonical(b);
}
export function observedPeriod(entries: Entry[]): string | null {
  if (!entries.length) return null;
  const dates = entries.map(e => e.date).sort();
  return `${dates[0]} a ${dates[dates.length - 1]}`;
}
export function coverageMessage(a: Entry[], b: Entry[]): string {
  if (!a.length || !b.length) return 'Cobertura ainda não avaliada: faltam dados válidos de uma ou ambas as fontes. Isso não significa saldo zero ou ausência de divergências.';
  if (observedPeriod(a) !== observedPeriod(b)) return 'Os períodos observados são diferentes. A cobertura pode estar incompleta; revise os arquivos antes de interpretar registros sem correspondência.';
  return 'Os arquivos têm o mesmo intervalo observado. Isso não comprova que todas as vendas e todos os créditos do período foram incluídos.';
}
