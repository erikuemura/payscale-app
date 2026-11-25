import {body,failure,json,sameOrigin,session} from '@/lib/launch/http';
import {preparation,uuid} from '@/lib/launch/contracts';
import {readBackup,writeBackup} from '@/lib/disputes/backup';
export const runtime='nodejs';
const enabled=()=>process.env.DISPUTE_WORKSPACE_ENABLED==='true';
export async function GET(r:Request){
 try{const c=await session(enabled());if(c.error)return c.error;const url=new URL(r.url);const id=url.searchParams.get('id');
 if(id){if(!uuid(id))return json({error:'Identificador inválido.'},400);const {data,error}=await c.db.from('dispute_preparations').select('*').eq('id',id).eq('owner_id',c.user.id).maybeSingle();if(error)return failure('preparations_read');if(!data)return json({error:'Preparação não encontrada.'},404);try{readBackup(JSON.stringify(data.payload));}catch{return json({error:'Preparação inconsistente. Contate o suporte.'},409);}return json({draft:data});}
 const page=Number(url.searchParams.get('page')??0);const caseId=url.searchParams.get('caseId');if(!Number.isInteger(page)||page<0||page>10000||(caseId&&!uuid(caseId)))return json({error:'Filtro inválido.'},400);
 let query=c.db.from('dispute_preparations').select('id,name,case_id,revision,updated_at').eq('owner_id',c.user.id);if(caseId)query=query.eq('case_id',caseId);
 const {data,error}=await query.order('updated_at',{ascending:false}).order('id').range(page*25,page*25+25);return error?failure('preparations_list'):json({drafts:data.slice(0,25),hasNext:data.length>25,page});
 }catch{return failure('preparations_get');}
}
async function save(r:Request,update:boolean){
 if(!sameOrigin(r))return json({error:'Origem não permitida.'},403);
 try{const c=await session(enabled());if(c.error)return c.error;let value;try{value=preparation(await body(r));}catch(e){return json({error:e instanceof Error?e.message:'Envio inválido.'},400);}
 if(update){const {data,error}=await c.db.from('dispute_preparations').update({name:value.name,payload:value.payload,revision:value.revision+1}).eq('id',value.id).eq('owner_id',c.user.id).eq('revision',value.revision).select('id,revision,updated_at').maybeSingle();if(error)return failure('preparations_update');return data?json({draft:data}):json({error:'Esta preparação mudou ou não está disponível. Reabra a versão da conta antes de salvar; seus campos locais foram mantidos.'},409);}
 if(value.revision!==1)return json({error:'Nova preparação deve começar na revisão 1.'},400);
 const {data,error}=await c.db.from('dispute_preparations').insert({...value,owner_id:c.user.id}).select('id,revision,updated_at').single();if(!error)return json({draft:data},201);
 if(error.code==='23505'){const {data:existing}=await c.db.from('dispute_preparations').select('*').eq('id',value.id).eq('owner_id',c.user.id).maybeSingle();if(existing&&existing.name===value.name&&existing.case_id===value.case_id&&writeBackup(readBackup(JSON.stringify(existing.payload)))===writeBackup(readBackup(JSON.stringify(value.payload))))return json({draft:{id:existing.id,revision:existing.revision,updated_at:existing.updated_at},reused:true});return json({error:'Identificador já utilizado para outra versão. Reabra o registro antes de continuar.'},409);}
 return failure('preparations_create');
 }catch{return failure('preparations_save');}
}
export const POST=(r:Request)=>save(r,false);
export const PATCH=(r:Request)=>save(r,true);
