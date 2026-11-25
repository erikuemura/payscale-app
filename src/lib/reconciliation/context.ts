import { parseCsv, readCsvRows, type Entry } from './engine.ts';
export type ImportContext = { company: string; account: string; providers: string[]; channels: string[]; currency: 'BRL' };
export const contextHeader = 'id;data;valor;referencia;empresa;conta;provedor;canal;moeda';
export function parseContextCsv(text: string): { entries: Entry[]; context?: ImportContext } {
  const rows = readCsvRows(text);
  if (rows[0]?.fields.join(';') === 'id;data;valor;referencia') return { entries: parseCsv(text) };
  if (rows.shift()?.fields.join(';') !== contextHeader) throw new Error('Use o cabeçalho do modelo simples ou do modelo com contexto.');
  if (!rows.length) throw new Error('O arquivo não contém registros.');
  let context: ImportContext | undefined;
  for (const { fields: f, line } of rows) {
    if (f.length !== 9) throw new Error(`Linha ${line}: esperadas 9 colunas no modelo com contexto.`);
    const [company, account, provider, channel, currency] = f.slice(4);
    if (f.slice(4).some(v => !v || v.length > 120 || /[\x00-\x1f\x7f]/.test(v))) throw new Error(`Linha ${line}: preencha todo o contexto, até 120 caracteres por campo, sem controles.`);
    if (currency !== 'BRL') throw new Error(`Linha ${line}: somente BRL é aceito. Separe outras moedas antes de importar.`);
    if (context && (context.company !== company || context.account !== account)) throw new Error(`Linha ${line}: empresas ou contas diferentes no mesmo arquivo. Separe os registros antes de importar.`);
    context ??= { company, account, providers: [], channels: [], currency: 'BRL' };
    if (!context.providers.includes(provider)) context.providers.push(provider);
    if (!context.channels.includes(channel)) context.channels.push(channel);
  }
  // Preserve physical lines so the shared financial validator reports source locations.
  let canonical = 'id;data;valor;referencia';
  let currentLine = 1;
  for (const row of rows) {
    canonical += '\n'.repeat(row.line - currentLine) + row.fields.slice(0, 4).map(v => `"${v.replaceAll('"', '""')}"`).join(';');
    currentLine = row.line + row.fields.slice(0, 4).reduce((n, v) => n + (v.match(/\n/g)?.length ?? 0), 0);
  }
  return { entries: parseCsv(canonical), context };
}
export function contextConflict(a?: ImportContext, b?: ImportContext): string | null {
  if (!!a !== !!b) return 'Use o mesmo formato nas duas fontes: ambos com contexto ou ambos simples. Não é possível verificar um par misto.';
  if (a && b && (a.company !== b.company || a.account !== b.account || a.currency !== b.currency)) return 'Conciliação bloqueada: empresa, conta ou moeda diferem entre as fontes. Corrija os arquivos.';
  return null;
}
