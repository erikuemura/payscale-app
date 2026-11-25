import {createClient} from '@/lib/supabase/server';
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function session(enabled=true){
 if(!enabled)return {error:json({error:'Recurso ainda não ativado. Seus campos continuam nesta página.'},503)};
 const db=await createClient();const {data:{user},error}=await db.auth.getUser();
 if(error||!user)return {error:json({error:'Entre novamente na sua conta.'},401)};
 return {db,user};
}
export const sameOrigin=(r:Request)=>r.headers.get('origin')===new URL(r.url).origin;
export async function body(r:Request,limit=65536){
 if(!r.headers.get('content-type')?.startsWith('application/json'))throw new Error('Envie JSON.');
 if(!r.body)throw new Error('Envio vazio.');const reader=r.body.getReader();let n=0;const parts:Uint8Array[]=[];
 try{for(;;){const v=await reader.read();if(v.done)break;n+=v.value.byteLength;if(n>limit){await reader.cancel();throw new Error('Envio acima do limite.');}parts.push(v.value);}}finally{reader.releaseLock();}
 return JSON.parse(Buffer.concat(parts).toString('utf8')) as unknown;
}
export function failure(area:string){const reference=crypto.randomUUID();console.error(JSON.stringify({event:'operation_failed',area,reference}));return json({error:'Não foi possível concluir. O trabalho local foi mantido.',reference},503);}
