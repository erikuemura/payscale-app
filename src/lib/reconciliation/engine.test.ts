import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, reconcile, exportResults, MAX_BYTES, MAX_ROWS } from './engine.ts';
const csv = (rows: string) => 'id;data;valor;referencia\n' + rows;
const entry = (id: string, cents: number, reference = 'lote1', date = '2026-11-04') => ({ id, cents, reference, date });
test('CSV BOM/CRLF, quoted separators and escaped quotes; exact cents', () => {
  const rows = parseCsv('\uFEFFid;data;valor;referencia\r\n"a;1";2024-02-29;"10,05";"lote""1"\r\n');
  assert.deepEqual(rows, [entry('a;1', 1005, 'lote"1', '2024-02-29')]);
});
test('reject invalid dates, amounts, headers, malformed quotes and repeated IDs', () => {
  for (const row of ['a;2025-02-29;10;x','a;2026-13-01;10;x','a;2026-11-04;-1;x','a;2026-11-04;0;x','a;2026-11-04;1.234,50;x','a;2026-11-04;1.001;x','a;2026-11-04;NaN;x','a;2026-11-04;1;','a;2026-11-04;1;"x','a;2026-11-04;1;"x"z','a;2026-11-04;1;x;extra']) assert.throws(() => parseCsv(csv(row)));
  assert.throws(() => parseCsv(csv('a;2026-11-04;1;x\na;2026-11-04;2;y')), /duplicado/);
  assert.throws(() => parseCsv('id,data,valor,referencia\na,2026-11-04,1,x'), /cabeçalho/);
  assert.throws(() => parseCsv(csv('')), /não contém/);
});
test('file and row limits', () => {
  assert.throws(() => parseCsv('x'.repeat(MAX_BYTES + 1)), /1 MB/);
  assert.throws(() => parseCsv(csv(Array.from({length:MAX_ROWS+1}, (_,i)=>`${i};2026-11-04;1;x`).join('\n'))), /Limite/);
});
test('group only explicit same date/reference; exact many to one and difference', () => {
  const expected = [entry('a',10000),entry('b',5000)];
  assert.equal(reconcile(expected,[entry('c',15000)])[0].status,'exact');
  const result = reconcile(expected,[entry('c',14500)])[0];
  assert.equal(result.status,'difference'); assert.equal(result.difference,-500);
});
test('duplicate candidate credits never auto-match; preserve evidence', () => {
  const result = reconcile([entry('a',100)],[entry('b',100),entry('c',100)]);
  assert.equal(result.length,1); assert.equal(result[0].status,'ambiguous'); assert.deepEqual(result[0].creditIds,['b','c']);
});
test('equal values alone or different dates do not match', () => {
  assert.deepEqual(reconcile([entry('a',100)],[entry('b',100,'other')]).map(r=>r.status),['missing','unassigned']);
  assert.deepEqual(reconcile([entry('a',100)],[entry('b',100,'lote1','2026-11-05')]).map(r=>r.status),['missing','unassigned']);
});
test('each input occurs once across evidence; totals conserved', () => {
  const r = [entry('r1',10),entry('r2',20),entry('r3',30,'x')];
  const c = [entry('c1',30),entry('c2',12,'z')];
  const results = reconcile(r,c);
  assert.equal(results.reduce((n,x)=>n+x.expected,0),60);
  assert.equal(results.reduce((n,x)=>n+x.received,0),42);
  assert.deepEqual(results.flatMap(x=>x.receivableIds).sort(),r.map(x=>x.id));
  assert.deepEqual(results.flatMap(x=>x.creditIds).sort(),c.map(x=>x.id));
});
test('export neutralizes spreadsheet formulas and preserves amounts', () => {
  const out = exportResults(reconcile([entry('r1',105,'=HYPERLINK("x")')],[entry('c1',100,'=HYPERLINK("x")')]));
  assert.ok(out.includes("'=HYPERLINK")); assert.ok(out.includes('"1,05"')); assert.ok(out.includes('"\'-0,05"'));
});
