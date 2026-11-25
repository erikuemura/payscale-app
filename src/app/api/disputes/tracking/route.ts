import {body,failure,json,sameOrigin,session} from '@/lib/launch/http';
import {tracking,uuid} from '@/lib/launch/contracts';
const enabled=()=>process.env.DISPUTE_WORKSPACE_ENABLED==='true';
export async function GET(r:Request){try{const c=await session(enabled());if(c.error)return c.error;const id=new URL(r.url).searchParams.get('caseId');if(!uuid(id))return json({error:'Caso inválido.'},400);const {data,error}=await c.db.from('dispute_tracking').select('*').eq('case_id',id).eq('owner_id',c.user.id).maybeSingle();return error?failure('tracking_read'):json({tracking:data});}catch{return failure('tracking_read');}}
async function save(r:Request,update:boolean){if(!sameOrigin(r))return json({error:'Origem não permitida.'},403);try{const c=await session(enabled());if(c.error)return c.error;let value;try{value=tracking(await body(r));}catch(e){return json({error:e instanceof Error?e.message:'Envio inválido.'},400);}
 const query=update?c.db.from('dispute_tracking').update({...value,revision:value.revision+1}).eq('case_id',value.case_id).eq('owner_id',c.user.id).eq('revision',value.revision):c.db.from('dispute_tracking').insert({...value,owner_id:c.user.id});
 if(!update&&value.revision!==1)return json({error:'Revisão inicial inválida.'},400);
 const {data,error}=await query.select('*').maybeSingle();if(error?.code==='23505'||(!error&&!data))return json({error:'O acompanhamento foi alterado. Recarregue antes de salvar.'},409);return error?failure('tracking_save'):json({tracking:data});}catch{return failure('tracking_save');}}
export const POST=(r:Request)=>save(r,false);export const PATCH=(r:Request)=>save(r,true);
