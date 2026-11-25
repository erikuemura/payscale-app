import {test} from 'node:test';
import assert from 'node:assert/strict';
import {receiveContact, type ContactConfig} from './service.ts';
const config:ContactConfig={enabled:true,apiKey:'test-key',from:'Test <test@example.com>',challengeSecret:'test-secret',origin:'https://www.payscale.com.br'};
const fields={name:'Teste fictício',email:'person@example.com',company:'Empresa teste',message:'Desejo conferir as taxas da minha operação.',website:'',token:'fake-token',requestId:'12345678-1234-4234-8234-123456789012'};
const request=(body:unknown=fields,origin=config.origin)=>new Request(`${config.origin}/api/contact`,{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
const never:typeof fetch=async()=>{throw new Error('Should not call external service');};
test('contact is closed without configuration and rejects wrong origin',async()=>{
 assert.equal((await receiveContact(request(),{...config,enabled:false},never)).status,503);
 assert.equal((await receiveContact(request(),{...config,apiKey:undefined},never)).status,503);
 assert.equal((await receiveContact(request(fields,'https://other.example'),config,never)).status,403);
});
test('contact rejects oversize, malformed, injected recipient and honeypot',async()=>{
 for(const body of [{...fields,to:'other@example.com'},{...fields,email:'a@example.com\nBcc:x@example.com'},{...fields,website:'bot'},{...fields,name:[]},{...fields,message:'short'}]) assert.equal((await receiveContact(request(body),config,never)).status,400);
 assert.equal((await receiveContact(request({...fields,message:'x'.repeat(17000)}),config,never)).status,413);
});
test('challenge must validate expected hostname and action before sending',async()=>{
 for(const check of [{success:false},{success:true,hostname:'other.example',action:'contact'},{success:true,hostname:'www.payscale.com.br',action:'login'}]){let calls=0;const mock:typeof fetch=async()=>{calls++;return Response.json(check);};assert.equal((await receiveContact(request(),config,mock)).status,400);assert.equal(calls,1);}
});
test('accepted response requires provider receipt; recipient fixed and idempotency stable',async()=>{
 const keys:string[]=[];
 const mock:typeof fetch=async(url,options)=>{if(String(url).includes('siteverify'))return Response.json({success:true,hostname:'www.payscale.com.br',action:'contact'});const payload=JSON.parse(options?.body as string);assert.deepEqual(payload.to,['contato@payscale.com.br']);assert.equal(payload.reply_to,fields.email);assert.equal(payload.html,undefined);keys.push(new Headers(options?.headers).get('Idempotency-Key')!);return Response.json({id:'test-receipt'});};
 assert.equal((await receiveContact(request(),config,mock)).status,202);
 assert.equal((await receiveContact(request(),config,mock)).status,202);
 assert.equal(keys[0],keys[1]);
 await receiveContact(request({...fields,message:'Outra mensagem de teste diferente.'}),config,mock);assert.notEqual(keys[1],keys[2]);
});
test('provider rejection, missing receipt and transport timeout never claim success',async()=>{
 for(const response of [()=>new Response('',{status:429}),()=>Response.json({}),()=>{throw new Error('timeout');}]){const mock:typeof fetch=async(url)=>String(url).includes('siteverify')?Response.json({success:true,hostname:'www.payscale.com.br',action:'contact'}):response();assert.equal((await receiveContact(request(),config,mock)).status,502);}
});
