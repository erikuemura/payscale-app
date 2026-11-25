import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reportPeriod } from './report-period.ts';
test('report buckets never combine different months or years', () => {
  assert.equal(reportPeriod('2026-01-07'), '2026-01 — faixa 1');
  assert.equal(reportPeriod('2026-01-08'), '2026-01 — faixa 2');
  assert.equal(reportPeriod('2026-01-31'), '2026-01 — faixa 5');
  assert.notEqual(reportPeriod('2026-01-07'), reportPeriod('2026-02-07'));
  assert.notEqual(reportPeriod('2026-01-07'), reportPeriod('2025-01-07'));
});
test('invalid report dates do not produce misleading buckets', () => {
  for (const date of ['', '2026-02-30', '2026-13-01']) assert.equal(reportPeriod(date), 'Data não reconhecida');
});
