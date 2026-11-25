import test from 'node:test';
import assert from 'node:assert/strict';
import { sameEntries, observedPeriod, coverageMessage } from './coverage.ts';
const a = [{ id: '1', date: '2026-11-01', cents: 100, reference: 'A' }, { id: '2', date: '2026-11-04', cents: 200, reference: 'B' }];
test('reordered identical import is duplicate; changed values are not', () => {
  assert.equal(sameEntries(a, [...a].reverse()), true);
  assert.equal(sameEntries(a, [a[0], {...a[1], cents: 201}]), false);
  assert.equal(sameEntries([], []), false);
  assert.equal(a.length, 2);
});
test('period is observed range, never invented for empty sources', () => {
  assert.equal(observedPeriod([]), null);
  assert.equal(observedPeriod([...a].reverse()), '2026-11-01 a 2026-11-04');
});
test('coverage distinguishes missing input, unequal range and unproven completeness', () => {
  assert.match(coverageMessage(a, []), /não significa saldo zero/);
  assert.match(coverageMessage(a, [a[0]]), /períodos observados são diferentes/);
  assert.match(coverageMessage(a, a), /não comprova/);
});
