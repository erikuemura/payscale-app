import { decimalUnits } from './simulation.ts';

export const feeLabels = { fixed: 'Tarifa fixa', installments: 'Parcelamento', advance: 'Antecipação', other: 'Outros encargos' } as const;
export type FeeKey = keyof typeof feeLabels;
export type Fees = { mdr: string } & Record<FeeKey, string>;
export type AuditInput = {
  reference: string; saleDate: string; provider: string; channel: string; modality: string; installments: string;
  gross: string; version: string; contractSource: string; statementSource: string; validFrom: string; validTo: string;
  advanceIncluded: boolean; expected: Fees; actual: Fees;
};
export const brl = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
function date(value: string, label: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01' || value > '2100-12-31' || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new Error(`${label}: informe uma data válida.`);
}
function rate(value: string, label: string) {
  if (!/^\d{1,3}([.,]\d{1,4})?$/.test(value.trim())) throw new Error(`${label}: informe de 0 a 100%, com até quatro casas decimais.`);
  const [whole, fraction = ''] = value.trim().replace(',', '.').split('.');
  const units = Number(whole) * 10000 + Number(fraction.padEnd(4, '0'));
  if (units > 1000000) throw new Error(`${label}: a taxa não pode superar 100%.`);
  return units;
}
export function auditFees(input: AuditInput) {
  for (const [label, value] of Object.entries({ Referência: input.reference, Provedor: input.provider, Canal: input.channel, Modalidade: input.modality, Versão: input.version, 'Fonte do contrato': input.contractSource, 'Fonte do extrato': input.statementSource })) {
    if (!value.trim() || value.length > 500 || /[\x00-\x1f\x7f]/.test(value)) throw new Error(`${label}: preencha até 500 caracteres, sem quebras de linha.`);
  }
  date(input.saleDate, 'Data da venda'); date(input.validFrom, 'Início da vigência'); date(input.validTo, 'Fim da vigência');
  if (input.validFrom > input.validTo) throw new Error('O fim da vigência deve ser igual ou posterior ao início.');
  if (input.saleDate < input.validFrom || input.saleDate > input.validTo) throw new Error('Venda fora da vigência informada. Use a versão contratual aplicável à data da venda.');
  if (!/^\d{1,2}$/.test(input.installments) || Number(input.installments) < 1 || Number(input.installments) > 24) throw new Error('Informe de 1 a 24 parcelas.');
  const gross = decimalUnits(input.gross, 'Valor bruto', 1000000000);
  if (!gross) throw new Error('Valor bruto deve ser maior que zero.');
  const calculate = (fees: Fees, label: string) => {
    // BigInt avoids precision loss at the allowed monetary/rate limits. Round half up once per sale.
    const mdr = Number((BigInt(gross) * BigInt(rate(fees.mdr, `MDR ${label}`)) + BigInt(500000)) / BigInt(1000000));
    const fixed = decimalUnits(fees.fixed, `Tarifa fixa ${label}`);
    const installments = decimalUnits(fees.installments, `Parcelamento ${label}`);
    const advance = decimalUnits(fees.advance, `Antecipação ${label}`);
    const other = decimalUnits(fees.other, `Outros encargos ${label}`);
    if (input.advanceIncluded && advance !== 0) throw new Error('Antecipação incluída na MDR: informe zero no custo separado para evitar dupla contagem.');
    const total = mdr + fixed + installments + advance + other;
    if (total > gross) throw new Error(`Custos ${label} superam o valor bruto. Revise os dados.`);
    return { mdr, fixed, installments, advance, other, total, net: gross - total };
  };
  const expected = calculate(input.expected, 'contratados');
  const actual = calculate(input.actual, 'cobrados');
  const rows = (['mdr', ...Object.keys(feeLabels)] as (keyof Fees)[]).map(key => ({ key, label: key === 'mdr' ? 'MDR sobre o valor bruto' : feeLabels[key], expected: expected[key], actual: actual[key], difference: actual[key] - expected[key] }));
  return { gross, expected, actual, difference: actual.total - expected.total, hasDifferences: rows.some(row => row.difference !== 0), rows };
}
export function auditText(input: AuditInput) {
  const result = auditFees(input);
  return ['PAYSCALE — CONFERÊNCIA DE TAXAS DECLARADAS', 'Diferenças para revisão. Nenhuma contestação enviada ou recuperação confirmada.',
    `Venda: ${input.reference} | Data: ${input.saleDate} | Bruto: ${brl(result.gross)}`,
    `Provedor: ${input.provider} | Canal: ${input.channel} | Modalidade: ${input.modality} | Parcelas: ${input.installments}`,
    `Contrato: ${input.version} | Vigência: ${input.validFrom} a ${input.validTo}`,
    `Fonte contratual: ${input.contractSource}`, `Fonte do extrato: ${input.statementSource}`,
    'Fontes declaradas; documentos não recebidos nem verificados.',
    `MDR contratada: ${input.expected.mdr}% | MDR cobrada: ${input.actual.mdr}%`,
    `Antecipação incluída na MDR: ${input.advanceIncluded ? 'Sim; sem custo separado' : 'Não'}`,
    'MDR aplicada sobre o bruto, arredondada por venda a centavos. Demais custos são totais em reais para esta venda.',
    ...result.rows.map(row => `${row.label}: contratado ${brl(row.expected)} | cobrado ${brl(row.actual)} | diferença ${brl(row.difference)}`),
    `Custo total: contratado ${brl(result.expected.total)} | cobrado ${brl(result.actual.total)}`,
    `Líquido calculado: esperado ${brl(result.expected.net)} | após custos informados ${brl(result.actual.net)}. Não comprova liquidação bancária.`,
    `Diferença total (cobrado menos contratado): ${brl(result.difference)}`,
    result.hasDifferences ? 'Há componentes divergentes a revisar, inclusive quando o total se compensa.' : 'Os valores informados coincidem; isso não comprova correção do contrato ou completude das cobranças.',
    'Snapshot da conferência. Não é histórico persistente nem confirmação de economia.'].join('\n');
}
