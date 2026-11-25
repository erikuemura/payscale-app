import {test} from 'node:test';
import assert from 'node:assert/strict';
import {safeDestination} from './redirect.ts';
test('auth accepts only internal dashboard or password recovery destinations',()=>{
 for(const path of ['https://evil.invalid','//evil.invalid','javascript:alert(1)','/\\evil.invalid','/%2f%2fevil.invalid','/dashboard/../../evil','/dashboard-other','/dashboard\n','/dashboard/%2e%2e']) assert.equal(safeDestination(path),'/dashboard');
 assert.equal(safeDestination('/dashboard/chargebacks?page=2'),'/dashboard/chargebacks?page=2');
 assert.equal(safeDestination('/auth/reset-password'),'/auth/reset-password');
});
