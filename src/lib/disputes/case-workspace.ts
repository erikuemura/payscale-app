import type { Passport } from './passport.ts';
export function casePassport(input: { reference: string; provider: string; reason: string; amount: number }): Passport {
  return { reference: input.reference, provider: input.provider, reason: input.reason === '—' ? '' : input.reason, disputed: Number.isFinite(input.amount) && input.amount > 0 ? input.amount.toFixed(2) : '', total: '', modality: 'physical', owner: '', externalDeadline: '', internalDeadline: '', existingRefund: false, existingDispute: false, contradictions: '', evidence: { agreement: { available: false, source: '' }, fulfillment: { available: false, source: '' }, payment: { available: false, source: '' } } };
}
export function caseStatus(status: string): 'aberto'|'contestado'|'ganho'|'perdido'|'desconhecido' {
  return ['aberto','contestado','ganho','perdido'].includes(status) ? status as 'aberto'|'contestado'|'ganho'|'perdido' : 'desconhecido';
}
export function deadlineLabel(days: number | null): string {
  return days !== null && Number.isFinite(days) && days > 0 ? `${days} dias registrados — confirmar prazo atual` : 'Prazo não confirmado';
}
export const casePriority = { aberto:0, contestado:1, desconhecido:2, ganho:3, perdido:3 };
