import { modalities, type Passport, type EvidenceKey } from './passport.ts';
export const BACKUP_LIMIT = 65536;
const keys = ['reference','provider','modality','reason','total','disputed','owner','externalDeadline','internalDeadline','existingRefund','existingDispute','contradictions','evidence'];
function record(value: unknown, expected: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Estrutura de arquivo inválida.');
  const obj = value as Record<string, unknown>;
  if (Object.keys(obj).length !== expected.length || expected.some(key => !Object.hasOwn(obj, key))) throw new Error('Campos incompatíveis com esta versão.');
  return obj;
}
function text(value: unknown, max = 500, multiline = false): string {
  if (typeof value !== 'string' || value.length > max || (multiline ? /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/ : /[\x00-\x1f\x7f]/).test(value)) throw new Error('Texto inválido ou acima do limite.');
  return value;
}
function flag(value: unknown): boolean { if (typeof value !== 'boolean') throw new Error('Marcação inválida.'); return value; }
export function readBackup(raw: string, expected?: Pick<Passport, 'reference' | 'provider'>): Passport {
  if (new TextEncoder().encode(raw).byteLength > BACKUP_LIMIT) throw new Error('Arquivo excede 64 KiB.');
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error('Selecione um arquivo JSON de preparação PayScale.'); }
  const envelope = record(parsed, ['format', 'version', 'passport']);
  if (envelope.format !== 'payscale-passport' || envelope.version !== 1) throw new Error('Formato ou versão não suportada.');
  const data = record(envelope.passport, keys);
  const modality = text(data.modality);
  if (!Object.hasOwn(modalities, modality)) throw new Error('Modalidade inválida.');
  const evidence = record(data.evidence, ['agreement','fulfillment','payment']);
  const readEvidence = (key: EvidenceKey) => { const item = record(evidence[key], ['available','source']); return { available: flag(item.available), source: text(item.source) }; };
  const result: Passport = { reference: text(data.reference), provider: text(data.provider), modality: modality as Passport['modality'], reason: text(data.reason), total: text(data.total, 30), disputed: text(data.disputed, 30), owner: text(data.owner), externalDeadline: text(data.externalDeadline, 10), internalDeadline: text(data.internalDeadline, 10), existingRefund: flag(data.existingRefund), existingDispute: flag(data.existingDispute), contradictions: text(data.contradictions, 2000, true), evidence: { agreement: readEvidence('agreement'), fulfillment: readEvidence('fulfillment'), payment: readEvidence('payment') } };
  if (expected && (result.reference !== expected.reference || result.provider !== expected.provider)) throw new Error('Este arquivo pertence a outra referência ou provedor. Abra a preparação preventiva independente para revisá-lo.');
  // Preserve incomplete work; business validation still runs when preparing the report.
  return result;
}
export function writeBackup(passport: Passport): string {
  const raw = JSON.stringify({ format: 'payscale-passport', version: 1, passport }, null, 2);
  readBackup(raw);
  return raw;
}
