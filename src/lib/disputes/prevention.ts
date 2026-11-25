import { modalities, fulfillmentHints, evidenceLabels, type Passport, type EvidenceKey } from './passport.ts';
export const questions = { descriptor: 'O nome na fatura é reconhecível pelo comprador?', support: 'O comprador encontra um canal de atendimento?', cancellation: 'Cancelamentos e reembolsos são acompanhados até a conclusão?', antifraud: 'O resultado da análise antifraude é registrado?', authentication: 'Há registro de autenticação 3DS desta venda online?' } as const;
export const concerns = { unknown: 'Ainda não identificado / prevenção', fraud: 'Não reconhecimento ou suspeita de fraude', delivery: 'Entrega ou execução', cancellation: 'Cancelamento ou reembolso', duplicate: 'Cobrança duplicada', other: 'Outro motivo' } as const;
export type Answer = 'unknown' | 'yes' | 'no';
export type Answers = Record<keyof typeof questions, Answer>;
export const emptyAnswers = (): Answers => ({ descriptor: 'unknown', support: 'unknown', cancellation: 'unknown', antifraud: 'unknown', authentication: 'unknown' });
export type Concern = keyof typeof concerns;
export type Action = { id: string; priority: 'Urgente' | 'Alta' | 'Normal'; task: string; reason: string; owner: string };
export function preventionPlan(passport: Passport, answers: Answers, concern: Concern) {
  if (!Object.hasOwn(modalities, passport.modality) || !Object.hasOwn(concerns, concern)) throw new Error('Contexto inválido.');
  if (Object.values(questions).length !== Object.keys(answers).length || Object.keys(questions).some(key => !['unknown','yes','no'].includes(answers[key as keyof Answers]))) throw new Error('Resposta inválida.');
  const actions: Action[] = [];
  const add = (id: string, priority: Action['priority'], task: string, reason: string) => actions.push({ id, priority, task, reason, owner: passport.owner.trim() || 'Responsável a definir' });
  if (passport.existingRefund || passport.existingDispute) add('duplicate','Urgente','Conferir reembolso e disputa existentes com o provedor antes de nova ação financeira.','Há ocorrência anterior declarada. Não executar uma segunda devolução sem revisão.');
  if (passport.contradictions.trim()) add('contradiction','Urgente','Revisar as contradições nos documentos originais antes de preparar qualquer defesa.',passport.contradictions);
  if (concern !== 'unknown' && !passport.externalDeadline) add('deadline','Urgente','Confirmar se há disputa aberta e obter o prazo na notificação original.','Motivo selecionado, mas prazo não informado; nenhuma data foi estimada.');
  for (const key of Object.keys(evidenceLabels) as EvidenceKey[]) {
    const item = passport.evidence[key];
    if (!item.available || !item.source.trim()) add(key,'Alta',key === 'fulfillment' ? fulfillmentHints[passport.modality] : key === 'agreement' ? 'Organizar pedido, oferta e condições aceitas, com referências aos originais.' : 'Localizar comprovante e identificador da transação no provedor.',`${evidenceLabels[key]}: referência ausente. Contratação, execução e pagamento precisam ser verificados separadamente.`);
  }
  const tasks: Record<keyof Answers,string> = { descriptor:'Conferir o descritor da fatura e a identificação do vendedor no recibo.',support:'Disponibilizar atendimento vinculado ao pedido e registrar as respostas.',cancellation:'Conferir cancelamentos e reconciliar reembolsos; interromper cobranças futuras indevidas.',antifraud:'Consultar o provedor sobre antifraude aplicável e registrar o resultado, sem presumir cobertura.',authentication:'Consultar o processador sobre autenticação e elegibilidade desta transação, incluindo exceções.' };
  for (const key of Object.keys(questions) as (keyof Answers)[]) {
    if (passport.modality === 'pos' && key === 'authentication') continue;
    if (answers[key] !== 'yes') add(key,answers[key] === 'no' ? 'Alta' : 'Normal',tasks[key],`${questions[key]} — ${answers[key] === 'no' ? 'Não, conforme declarado' : 'Não informado; verificar'}.`);
  }
  if (concern === 'delivery' && !actions.some(a=>a.id==='fulfillment')) add('delivery-review','Alta','Conferir se a prova corresponde aos itens ou marcos efetivamente entregues.','Uma referência informada não valida a execução nem resolve o desacordo comercial.');
  if (concern === 'duplicate' && !actions.some(a=>a.id==='duplicate')) add('processing','Alta','Comparar identificadores e valores das cobranças antes de decidir por estorno.','Suspeita de duplicidade declarada; não é confirmação de cobrança duplicada.');
  if (concern === 'cancellation') add('cancel-review','Alta','Revisar solicitação, aceite do cancelamento e situação do crédito no provedor.','Cancelamento solicitado não comprova que o reembolso foi concluído.');
  add('coverage','Normal','Confirmar por escrito com o parceiro o motivo, a modalidade e as condições de eventual cobertura.','Cobertura não verificada pela PayScale. Antifraude, autenticação e documentação não garantem reversão.');
  if (passport.modality === 'pos') add('pos','Normal','Conferir no adquirente os dados de captura e autenticação da venda presencial.','POS não elimina chargebacks; 3DS de checkout online não foi presumido para esta captura.');
  const rank = { Urgente:0, Alta:1, Normal:2 };
  return { actions: actions.sort((a,b)=>rank[a.priority]-rank[b.priority]), notice: '3DS não cobre todos os motivos de chargeback. Serviço não prestado ou produto não entregue não recebe garantia por estar autenticado. Uma reclamação legítima não é prova de fraude.', coverage: 'Não verificada pelo sistema' };
}
export function preventionText(passport: Passport, answers: Answers, concern: Concern) {
  const plan = preventionPlan(passport, answers, concern);
  return ['PAYSCALE — PLANO PREVENTIVO / EDITORIAL 1 · 09/11/2026', `Pedido: ${passport.reference || 'Não informado'} | Provedor: ${passport.provider || 'Não informado'}`,`Modalidade: ${modalities[passport.modality]} | Preocupação declarada: ${concerns[concern]}`, `Cobertura: ${plan.coverage}`, plan.notice,'FONTES DECLARADAS — originais não analisados',...Object.entries(evidenceLabels).map(([key,label])=>`${label}: ${passport.evidence[key as EvidenceKey].available ? passport.evidence[key as EvidenceKey].source || 'Referência ausente' : 'Não informada'}`), 'RESPOSTAS DECLARADAS',...Object.entries(questions).map(([key,label])=>`${label} ${passport.modality === 'pos' && key === 'authentication' ? 'Não aplicado ao diagnóstico presencial' : {unknown:'Não informado',yes:'Sim',no:'Não'}[answers[key as keyof Answers]]}`),'AÇÕES',...plan.actions.map(a=>`[${a.priority}] ${a.task}\nMotivo: ${a.reason}\nResponsável: ${a.owner}`),'Temporário. Nenhum envio, estorno, bloqueio, contratação ou crédito foi executado. Prioridades editoriais não representam pontuação de risco ou probabilidade de vitória.'].join('\n\n');
}
