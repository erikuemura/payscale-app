import {test} from 'node:test';import assert from 'node:assert/strict';import {aggregateFees} from './aggregate.ts';
const r=(amount:number,mdr_rate:number|null,mdr_charged:number|null)=>({provider:'exemplo',modality:'credito',amount,mdr_rate,mdr_charged});
test('rates weighted by gross, cents rounded per sale, zero retained',()=>{const a=aggregateFees([r(100,2,2),r(900,4,4),r(10,0,0)]);assert.equal(a.totals.charged,3800);assert.equal(a.totals.count,3);assert.equal(a.items[0].chargedRate,3800/101000*100);});
test('positive and negative deviations never cancel the review amounts',()=>{const a=aggregateFees([r(1000,3,3.5),r(1000,3,2.5),r(50,null,2),r(10,0,0),r(-10,1,1)]);assert.equal(a.totals.over,500);assert.equal(a.totals.under,500);assert.equal(a.excluded,2);assert.equal(a.totals.count,3);});
test('round half-up on each sale and empty input',()=>{assert.equal(aggregateFees([r(1,0,0.5),r(1,0,0.5)]).totals.charged,2);assert.equal(aggregateFees([]).totals.gross,0);});
