export const MAX_BYTES = 1_000_000;
export const MAX_ROWS = 2_000;
export type Entry = { id: string; date: string; cents: number; reference: string };
export type Result = { status: 'exact' | 'difference' | 'ambiguous' | 'missing' | 'unassigned'; date: string; reference: string; receivableIds: string[]; creditIds: string[]; expected: number; received: number; difference: number; reason: string };
export const labels: Record<Result['status'], string> = { exact: 'Correspondência exata', difference: 'Revisar valor', ambiguous: 'Ambíguo', missing: 'Recebível sem correspondência', unassigned: 'Crédito sem correspondência' };
export const money = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function fail(line: number, message: string): never { throw new Error(`Linha ${line}: ${message}`); }

/** Strict semicolon CSV; preserve physical line numbers for validation errors. */
export function readCsvRows(text: string): { fields: string[]; line: number }[] {
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw new Error('O arquivo excede 1 MB.');
  const input = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const rows: { fields: string[]; line: number }[] = [];
  let fields: string[] = [], cell = '', quoted = false, closed = false, line = 1, start = 1;
  const finishCell = () => { fields.push(cell.trim()); cell = ''; closed = false; };
  const finishRow = () => {
    finishCell();
    if (fields.some(Boolean)) rows.push({ fields, line: start });
    fields = []; start = line + 1;
    if (rows.length > MAX_ROWS + 1) throw new Error(`Limite de ${MAX_ROWS} registros por arquivo.`);
  };
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quoted) {
      if (c === '"') {
        if (input[i + 1] === '"') { cell += '"'; i++; } else { quoted = false; closed = true; }
      } else { cell += c; if (c === '\n') line++; }
    } else if (c === ';') finishCell();
    else if (c === '\n') { finishRow(); line++; }
    else if (c === '"' && cell === '' && !closed) quoted = true;
    else if (closed || c === '"') fail(line, 'aspas ou conteúdo após aspas inválidos.');
    else cell += c;
  }
  if (quoted) fail(start, 'campo entre aspas não foi fechado.');
  if (cell || fields.length || closed) finishRow();
  return rows;
}

export function parseCsv(text: string): Entry[] {
  const rows = readCsvRows(text);
  const header = rows.shift();
  if (!header || header.fields.join(';') !== 'id;data;valor;referencia') throw new Error('Use o cabeçalho id;data;valor;referencia e separador ponto e vírgula.');
  if (!rows.length) throw new Error('O arquivo não contém registros.');
  const ids = new Set<string>();
  return rows.map(({ fields: f, line: n }) => {
    if (f.length !== 4) fail(n, 'esperadas 4 colunas.');
    const [id, date, amount, reference] = f;
    if (!id || !reference || id.length > 120 || reference.length > 120 || /[\x00-\x1f\x7f]/.test(id + reference)) fail(n, 'ID e referência devem ter entre 1 e 120 caracteres, sem quebras de linha ou controles.');
    if (ids.has(id)) fail(n, `ID duplicado: ${id}.`);
    ids.add(id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < '1900-01-01' || date > '2100-12-31') fail(n, 'data deve estar entre 1900 e 2100 no formato AAAA-MM-DD.');
    const parsed = new Date(`${date}T00:00:00Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) fail(n, 'data inexistente.');
    if (!/^\d{1,9}([.,]\d{1,2})?$/.test(amount)) fail(n, 'valor positivo, até 2 casas decimais e sem separador de milhar.');
    const [whole, decimal = ''] = amount.replace(',', '.').split('.');
    const cents = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
    if (cents <= 0 || cents > 10_000_000_000) fail(n, 'valor deve ser maior que zero e no máximo R$ 100 milhões.');
    return { id, date, cents, reference };
  });
}

const key = (entry: Entry) => JSON.stringify([entry.reference, entry.date]);
function group(entries: Entry[]) {
  const groups = new Map<string, Entry[]>();
  for (const entry of entries) { const k = key(entry); groups.set(k, [...(groups.get(k) ?? []), entry]); }
  return groups;
}

export function reconcile(receivables: Entry[], credits: Entry[]): Result[] {
  const expectedGroups = group(receivables), creditGroups = group(credits);
  const results: Result[] = [];
  for (const [k, entries] of expectedGroups) {
    const matches = creditGroups.get(k) ?? [];
    const expected = entries.reduce((sum, e) => sum + e.cents, 0);
    const received = matches.reduce((sum, e) => sum + e.cents, 0);
    const status = matches.length > 1 ? 'ambiguous' : matches.length === 0 ? 'missing' : expected === received ? 'exact' : 'difference';
    const reason = status === 'ambiguous' ? 'Mais de um crédito com a mesma referência e data. Nenhuma associação confirmada.' : status === 'missing' ? 'Não há crédito com a mesma referência e data neste arquivo.' : `Referência e data idênticas; ${entries.length} recebível(is) e 1 crédito. ${status === 'difference' ? 'Valor recebido diferente do esperado; revisar documentos.' : 'Valores iguais em centavos.'}`;
    results.push({ status, date: entries[0].date, reference: entries[0].reference, receivableIds: entries.map(e => e.id), creditIds: matches.map(e => e.id), expected, received, difference: received - expected, reason });
    creditGroups.delete(k);
  }
  for (const entries of creditGroups.values()) for (const entry of entries) results.push({ status: 'unassigned', date: entry.date, reference: entry.reference, receivableIds: [], creditIds: [entry.id], expected: 0, received: entry.cents, difference: entry.cents, reason: 'Não há recebível com a mesma referência e data neste arquivo.' });
  return results;
}

function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r\n]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}
const decimal = (cents: number) => `${cents < 0 ? '-' : ''}${Math.floor(Math.abs(cents) / 100)},${String(Math.abs(cents) % 100).padStart(2, '0')}`;
export function exportResults(results: Result[]): string {
  const rows = results.map(r => [labels[r.status], r.date, r.reference, JSON.stringify(r.receivableIds), JSON.stringify(r.creditIds), decimal(r.expected), decimal(r.received), decimal(r.difference), r.reason, 'referencia-data-v1']);
  return '\uFEFF' + [['status', 'data', 'referencia', 'ids_recebiveis', 'ids_creditos', 'esperado_brl', 'creditos_brl', 'diferenca_brl', 'explicacao', 'regra'], ...rows].map(row => row.map(csvCell).join(';')).join('\r\n');
}
