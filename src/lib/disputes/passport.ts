import { decimalUnits } from '../payments/simulation.ts';
export const modalities = { physical: 'Produto físico', service: 'Serviço', digital: 'Produto digital', recurring: 'Recorrência', pos: 'Venda presencial (POS)' } as const;
export type Modality = keyof typeof modalities;
export const evidenceLabels = { agreement: 'Contratação', fulfillment: 'Entrega ou execução', payment: 'Pagamento' } as const;
export type EvidenceKey = keyof typeof evidenceLabels;
export type Evidence = { available: boolean; source: string };
export type Passport = { reference: string; provider: string; modality: Modality; reason: string; total: string; disputed: string; owner: string; externalDeadline: string; internalDeadline: string; existingRefund: boolean; existingDispute: boolean; contradictions: string; evidence: Record<EvidenceKey, Evidence> };
export const CHECKLIST_VERSION = 'payscale-editorial-1 / 2026-11-06';
export const fulfillmentHints: Record<Modality, string> = {
 physical: 'Rastreio, comprovante de entrega e itens efetivamente entregues. Identifique entregas parciais.',
 service: 'Ordem de serviço, marcos efetivamente prestados e aceite quando aplicável. Contrato assinado não comprova execução.',
 digital: 'Disponibilização, licença e registros pertinentes de acesso ou consumo. Acesso isolado não comprova satisfação ou ausência de fraude.',
 recurring: 'Serviço entregue no ciclo cobrado, autorização e eventual cancelamento daquele período.',
 pos: 'Comprovante da venda, entrega e informações de captura/autenticação fornecidas pelo adquirente. Venda presencial não elimina disputa.',
};
function checkedDate(value: string, label: string) {
 if (!value) return;
 const date = new Date(`${value}T00:00:00Z`);
 if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01' || value > '2100-12-31' || !Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== value) throw new Error(`${label}: informe uma data válida.`);
}
export function preparePassport(input: Passport) {
 for (const [label,value] of [['Referência',input.reference],['Provedor',input.provider],['Motivo',input.reason],['Responsável',input.owner]]) if (!value.trim() || value.length>500 || /[\x00-\x1f\x7f]/.test(value)) throw new Error(`${label}: preencha até 500 caracteres, sem quebras de linha.`);
 if (!Object.hasOwn(modalities,input.modality)) throw new Error('Modalidade inválida.');
 const total=decimalUnits(input.total,'Total da venda'), disputed=decimalUnits(input.disputed,'Valor contestado');
 if (!total || !disputed || disputed>total) throw new Error('Valor contestado deve ser positivo e não superar o total da venda.');
 checkedDate(input.externalDeadline,'Prazo do provedor'); checkedDate(input.internalDeadline,'Prazo interno');
 if (input.externalDeadline && input.internalDeadline && input.internalDeadline>input.externalDeadline) throw new Error('O prazo interno não pode ser posterior ao prazo do provedor.');
 if (input.contradictions.length>2000) throw new Error('Descreva as contradições em até 2000 caracteres.');
 const gaps:string[]=[];
 for (const key of Object.keys(evidenceLabels) as EvidenceKey[]) {
  const item=input.evidence[key];
  if (item.available && (!item.source.trim() || item.source.length>500 || /[\x00-\x1f\x7f]/.test(item.source))) throw new Error(`${evidenceLabels[key]}: indique a fonte original em até 500 caracteres, sem quebras de linha.`);
  if (!item.available) gaps.push(`${evidenceLabels[key]}: documento não informado; comprovação pendente.`);
 }
 const alerts:string[]=[];
 if (!input.externalDeadline) alerts.push('Confirmação urgente: prazo do provedor não informado. Consulte a notificação original; nenhum prazo foi estimado.');
 if (input.existingRefund || input.existingDispute) alerts.push('Há reembolso ou disputa anterior declarada. Revise com o provedor antes de solicitar nova devolução ou pagamento.');
 if (input.contradictions.trim()) alerts.push('Contradições declaradas: aguarda revisão humana antes de qualquer envio.');
 return { total,disputed,gaps,alerts };
}
export function passportText(input: Passport): string {
 const result=preparePassport(input);
 const brl=(cents:number)=>(cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 return ['PAYSCALE — RASCUNHO DE ORGANIZAÇÃO DE EVIDÊNCIAS','Não enviado. Não é protocolo, defesa validada ou comprovação de crédito.',`Checklist editorial: ${CHECKLIST_VERSION}. Não representa regras oficiais de qualquer provedor.`, '',`Caso/pedido: ${input.reference}`,`Provedor declarado: ${input.provider}`,`Modalidade: ${modalities[input.modality]}`,`Motivo informado: ${input.reason}`,`Responsável declarado: ${input.owner}`,`Venda total: ${brl(result.total)}`,`Exposição contestada: ${brl(result.disputed)}`,`Prazo externo declarado: ${input.externalDeadline || 'NÃO INFORMADO — CONFIRMAR'}`,`Prazo interno declarado: ${input.internalDeadline || 'Não informado'}`, '', 'FONTES DECLARADAS (originais não recebidos nem verificados)', ...Object.entries(evidenceLabels).map(([key,label])=>{ const evidence=input.evidence[key as EvidenceKey];return `${label}: ${evidence.available ? evidence.source : 'Não informada'}`;}), '', 'LACUNAS',...(result.gaps.length?result.gaps:['Nenhuma categoria sem referência. Isso não comprova suficiência, autenticidade ou validade das evidências.']), '', 'ALERTAS',...(result.alerts.length?result.alerts:['Nenhum alerta derivado dos campos preenchidos; documentos não analisados.']),`Reembolso anterior declarado: ${input.existingRefund?'Sim':'Não'}`,`Disputa anterior declarada: ${input.existingDispute?'Sim':'Não'}`,`Contradições declaradas: ${input.contradictions.trim() || 'Não informadas; não houve detecção automática.'}`, '', 'Preparação não altera situação financeira, não gera recuperação e não envia nada ao adquirente.'].join('\n');
}
