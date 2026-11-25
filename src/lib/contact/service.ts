import { createHash } from 'node:crypto';
export type ContactConfig = { enabled: boolean; apiKey?: string; from?: string; challengeSecret?: string; origin: string };
const json = (data: unknown, status: number) => Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const error = (message: string, status: number) => json({error:message},status);
export async function receiveContact(request: Request, config: ContactConfig, transport: typeof fetch = fetch): Promise<Response> {
 if(request.headers.get('origin')!==config.origin)return error('Origem não permitida.',403);
 if(!config.enabled||!config.apiKey||!config.from||!config.challengeSecret)return error('Use contato@payscale.com.br para falar com nossa equipe.',503);
 if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')return error('Formato inválido.',415);
 let body: Record<string,unknown>;
 try {
  if(!request.body)throw new Error();const reader=request.body.getReader();const chunks:Uint8Array[]=[];let size=0;
  try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>16384){await reader.cancel();return error('Mensagem acima do limite.',413);}chunks.push(part.value);}}finally{reader.releaseLock();}
  body=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!body||typeof body!=='object'||Array.isArray(body))throw new Error();
 }catch{return error('Mensagem inválida.',400);}
 const allowed=['name','email','company','message','token','website','requestId'];
 if(Object.keys(body).some(k=>!allowed.includes(k)))return error('Campos inválidos.',400);
 const clean=(key:string,max:number,min=0)=>typeof body[key]==='string'&&(body[key] as string).trim().length>=min&&(body[key] as string).length<=max&&!/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(body[key] as string);
 if(!clean('name',100,2)||!clean('email',254,3)||!clean('company',150)||!clean('message',3000,10)||!clean('token',2048,1)||typeof body.website!=='string'||body.website!==''||!clean('requestId',36,36))return error('Revise os campos e a verificação de segurança.',400);
 const email=(body.email as string).trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^[-0-9a-f]{36}$/i.test(body.requestId as string))return error('E-mail ou identificador inválido.',400);
 try {
  const verified=await transport('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:config.challengeSecret,response:body.token}),signal:AbortSignal.timeout(8000)});
  if(!verified.ok)return error('Verificação indisponível. Tente novamente.',503);
  const check=await verified.json();
  if(check.success!==true||check.hostname!==new URL(config.origin).hostname||check.action!=='contact')return error('Verificação inválida ou expirada.',400);
  const content={name:(body.name as string).trim(),email,company:(body.company as string).trim(),message:(body.message as string).trim()};
  const hash=createHash('sha256').update(JSON.stringify(content)).digest('hex');
  const sent=await transport('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${config.apiKey}`,'Content-Type':'application/json','Idempotency-Key':`contact/${body.requestId}/${hash}`},body:JSON.stringify({from:config.from,to:['contato@payscale.com.br'],reply_to:email,subject:'Novo contato comercial — PayScale',text:`Nome: ${content.name}\nEmpresa: ${content.company}\nE-mail: ${email}\n\n${content.message}`}),signal:AbortSignal.timeout(10000)});
  if(!sent.ok)return error('Não foi possível confirmar o envio. Use contato@payscale.com.br.',502);
  const receipt=await sent.json();if(typeof receipt.id!=='string'||!receipt.id)return error('Envio não confirmado.',502);
  return json({status:'accepted',message:'Solicitação aceita pelo serviço de envio. A entrega na caixa ainda não foi confirmada.'},202);
 }catch{return error('Não foi possível confirmar o envio. Tente novamente ou use nosso e-mail.',502);}
}
