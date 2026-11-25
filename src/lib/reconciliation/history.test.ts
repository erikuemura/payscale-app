import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prepareHistory, readHistoryInputs, validName, isUuid } from './history.ts';
const csv = (rows: string) => 'id;data;valor;referencia\n' + rows;
const r = csv('a;2026-11-04;10,05;l\nb;2026-11-04;20;l');
const c = csv('c;2026-11-04;30,05;l');
test('canonical hash ignores row order and decimal formatting',()=>{
 const first = prepareHistory(r,c), second = prepareHistory(csv('b;2026-11-04;20.00;l\na;2026-11-04;10.05;l'),c);
 assert.equal(first.fingerprint,second.fingerprint); assert.equal(first.results[0].expected,3005);
 assert.notEqual(first.fingerprint,prepareHistory(r,c.replace('30,05','30,06')).fingerprint);
});
test('stored inputs are revalidated and results recalculated',()=>{
 const original = prepareHistory(r,c), read = readHistoryInputs(original.inputs);
 assert.deepEqual(read,original);
 assert.throws(()=>readHistoryInputs({receivables:[{id:'a',date:'2026-02-30',reference:'x',cents:100}],credits:original.inputs.credits}));
 assert.throws(()=>readHistoryInputs({receivables:[{id:'a',date:'2026-11-04',reference:'x',cents:1.5}],credits:original.inputs.credits}));
 assert.throws(()=>prepareHistory({},c));
});
test('names and account identifiers are bounded',()=>{
 assert.equal(validName(' Loja A '),'Loja A'); assert.throws(()=>validName('x')); assert.throws(()=>validName('x\nxx')); assert.throws(()=>validName('x'.repeat(101)));
 assert.equal(isUuid('00000000-0000-4000-8000-000000000001'),true); assert.equal(isUuid('not-a-uuid'),false);
});
