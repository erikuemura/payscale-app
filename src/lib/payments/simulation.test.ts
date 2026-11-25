import test from 'node:test';
import assert from 'node:assert/strict';
import { simulatePayment, type Scenario } from './simulation.ts';
const base={price:'1000',margin:'300',floor:'250',minimumInstallment:'50'};
const scenario:Scenario={discount:'0',mdr:'1',fixed:'0',advanceEnabled:false,advance:'0',installments:'1',days:'0'};
test('PRD example: card260, Pix290, discounted Pix270.20',()=>{
 assert.equal(simulatePayment(base,{...scenario,mdr:'4'}).remainingMargin,26000);
 assert.equal(simulatePayment(base,scenario).remainingMargin,29000);
 const pix=simulatePayment(base,{...scenario,discount:'20'});
 assert.equal(pix.remainingMargin,27020); assert.equal(pix.mdr,980); assert.equal(pix.net,97020);
});
test('unknown margin stays unknown; floor and installment violations explicit',()=>{
 assert.equal(simulatePayment({...base,margin:''},scenario).remainingMargin,null);
 assert.equal(simulatePayment({...base,margin:''},scenario).belowFloor,null);
 assert.equal(simulatePayment(base,{...scenario,mdr:'10'}).belowFloor,true);
 assert.equal(simulatePayment(base,{...scenario,installments:'24'}).belowMinimum,true);
});
test('advance separate; lower MDR can cost more; disabled advance ignored',()=>{
 const low=simulatePayment(base,{...scenario,advanceEnabled:true,advance:'50'});
 const high=simulatePayment(base,{...scenario,mdr:'4',advance:'50'});
 assert.equal(low.cost,6000);assert.equal(high.cost,4000);assert.ok(low.net<high.net);
});
test('cent distribution conserves amount; strict inputs reject invalid values',()=>{
 const r=simulatePayment({...base,price:'100',margin:''},{...scenario,installments:'3'});
 assert.equal(r.regular*2+r.last,10000);assert.equal(r.last,3334);
 for(const bad of ['', '-1','1.234','1,000.00','Infinity']) assert.throws(()=>simulatePayment({...base,price:bad},scenario));
 assert.throws(()=>simulatePayment(base,{...scenario,discount:'1000'}));
 assert.throws(()=>simulatePayment(base,{...scenario,mdr:'101'}));
 assert.throws(()=>simulatePayment(base,{...scenario,installments:'0'}));
 assert.throws(()=>simulatePayment(base,{...scenario,fixed:'1001'}));
 assert.throws(()=>simulatePayment({...base,price:'0,01',margin:''},{...scenario,installments:'3'}));
});
