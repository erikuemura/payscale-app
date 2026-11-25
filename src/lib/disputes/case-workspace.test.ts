import test from 'node:test';
import assert from 'node:assert/strict';
import { casePassport, caseStatus, deadlineLabel, casePriority } from './case-workspace.ts';
test('caso parcial preenche contestado sem inferir total, prazo ou provas',()=>{const p=casePassport({reference:'CB-1',provider:'Exemplo',reason:'Parcial',amount:200});assert.equal(p.disputed,'200.00');assert.equal(p.total,'');assert.equal(p.externalDeadline,'');assert.equal(p.evidence.fulfillment.available,false);assert.equal(p.owner,'');});
test('status desconhecido preserva incerteza; prioridades não presumem envio',()=>{assert.equal(caseStatus('recebido'),'desconhecido');assert.equal(caseStatus('contestado'),'contestado');assert.ok(casePriority.aberto < casePriority.ganho);});
test('dias registrados não viram contador atual nem expiração',()=>{for(const d of [null,0,-1,NaN])assert.equal(deadlineLabel(d),'Prazo não confirmado');assert.match(deadlineLabel(5),/confirmar prazo atual/);});
