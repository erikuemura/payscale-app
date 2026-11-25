import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readBackup, writeBackup, BACKUP_LIMIT } from './backup.ts';
import type { Passport } from './passport.ts';
const sample: Passport = {reference:'CASO-1',provider:'Exemplo',modality:'service',reason:'',total:'',disputed:'200',owner:'',externalDeadline:'',internalDeadline:'',existingRefund:false,existingDispute:false,contradictions:'Revisar\noriginais',evidence:{agreement:{available:true,source:'Contrato página 2'},fulfillment:{available:false,source:''},payment:{available:false,source:''}}};
test('backup preserves incomplete work, evidence and partial exposure',()=>{assert.deepEqual(readBackup(writeBackup(sample)),sample);});
test('backup rejects future formats, extra fields, invalid booleans and modalities',()=>{
 const original=JSON.parse(writeBackup(sample));
 for(const alter of [(x:typeof original)=>x.version=2,(x:typeof original)=>x.passport.user_id='other',(x:typeof original)=>x.passport.existingRefund='false',(x:typeof original)=>x.passport.modality='unknown',(x:typeof original)=>x.passport.evidence.payment.source={}]) {const copy=structuredClone(original);alter(copy);assert.throws(()=>readBackup(JSON.stringify(copy)));}
});
test('backup bounds bytes and text; rejects invalid JSON and prototype keys',()=>{
 assert.throws(()=>readBackup(' '.repeat(BACKUP_LIMIT+1)));
 assert.throws(()=>readBackup('{bad'));
 assert.throws(()=>writeBackup({...sample,provider:'a'.repeat(501)}));
 assert.throws(()=>readBackup(writeBackup(sample).replace('"version": 1','"version": 1, "__proto__": {}')));
});
test('selected case cannot restore a different reference or provider',()=>{
 assert.deepEqual(readBackup(writeBackup(sample),sample),sample);
 assert.throws(()=>readBackup(writeBackup(sample),{reference:'CASO-2',provider:'Exemplo'}));
 assert.throws(()=>readBackup(writeBackup(sample),{reference:'CASO-1',provider:'Outro'}));
});
