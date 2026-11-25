import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcile } from './engine.ts';
import { createReviewTasks, updateReviewTask, exportReviewTasks } from './review.ts';
const entries=[{id:'r1',date:'2026-11-06',cents:10000,reference:'R'}];
const task=createReviewTasks(reconcile(entries,[]))[0];
const fields={status:'resolved' as const,priority:'high' as const,deadline:'2026-11-10',reason:'Data corrigida na origem'};
test('only non-exact results create tasks',()=>{
 assert.equal(createReviewTasks(reconcile(entries,[{...entries[0],id:'b1'}])).length,0);
 assert.equal(createReviewTasks(reconcile(entries,[])).length,1);
});
test('closure requires reason and preserves financial evidence without benefit',()=>{
 assert.throws(()=>updateReviewTask(task,{...fields,reason:''},'2026-11-06T12:00:00Z'));
 const changed=updateReviewTask(task,fields,'2026-11-06T12:00:00Z');
 assert.deepEqual(changed.evidence,task.evidence); assert.equal(task.history.length,0); assert.equal(changed.history.length,1);
 assert.equal(changed.history[0].before.status,'new'); assert.equal(changed.status,'resolved');
 assert.equal(JSON.parse(exportReviewTasks([changed])).mode,'temporary-browser');
});
test('invalid deadlines fail; reopening preserves history; repeated saves are idempotent',()=>{
 assert.throws(()=>updateReviewTask(task,{...fields,deadline:'2026-02-30'},'2026-11-06T12:00:00Z'));
 const closed=updateReviewTask(task,fields,'2026-11-06T12:00:00Z');
 assert.equal(updateReviewTask(closed,fields,'2026-11-06T13:00:00Z'),closed);
 const reopened=updateReviewTask(closed,{...fields,status:'analysis'},'2026-11-06T14:00:00Z');
 assert.equal(reopened.history.length,2); assert.equal(reopened.history[1].before.status,'resolved');
});
