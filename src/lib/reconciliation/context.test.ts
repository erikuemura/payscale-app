import test from 'node:test';
import assert from 'node:assert/strict';
import { parseContextCsv, contextConflict, contextHeader } from './context.ts';
const row = '1;2026-11-06;100,00;REP;EMP-A;CONTA-A;Provedor;Ecommerce;BRL';
const parse = (rows = row) => parseContextCsv(contextHeader + '\n' + rows);
test('rejects mixed companies, accounts and currencies before returning entries', () => {
  for (const [from, to] of [['EMP-A','EMP-B'],['CONTA-A','CONTA-B'],['BRL','USD']]) assert.throws(() => parse(row + '\n' + row.replace(/^1;/,'2;').replace(from,to)));
});
test('requires full context and preserves exact monetary validation', () => {
  assert.throws(() => parse(row.replace(';Provedor;',';;')));
  assert.throws(() => parse(row.replace('100,00','-100,00')));
  assert.throws(() => parse(row.replace('2026-11-06','2026-02-30')));
  assert.equal(parse().entries[0].cents,10000);
});
test('blocks cross-source mismatches and mixed formats, allows bank/provider differences', () => {
  const a=parse().context;
  assert.ok(contextConflict(a,parse(row.replace('CONTA-A','CONTA-B')).context));
  assert.ok(contextConflict(a,undefined));
  assert.ok(contextConflict(undefined,a));
  assert.equal(contextConflict(a,parse(row.replace('Provedor','Banco')).context),null);
  assert.equal(contextConflict(undefined,undefined),null);
});
test('legacy parser remains compatible, quoted context supported', () => {
  assert.equal(parseContextCsv('id;data;valor;referencia\n1;2026-11-06;100;REP').context,undefined);
  assert.equal(parse(row.replace('EMP-A','"Loja; A"')).context?.company,'Loja; A');
});
