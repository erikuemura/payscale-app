export type Scenario = { discount: string; mdr: string; fixed: string; advanceEnabled: boolean; advance: string; installments: string; days: string };
export type Assumptions = { price: string; margin: string; floor: string; minimumInstallment: string };
export function decimalUnits(value: string, name: string, max = 10_000_000_000): number {
  if (!/^\d{1,9}([.,]\d{1,2})?$/.test(value.trim())) throw new Error(`${name}: informe um valor não negativo, com até duas casas e sem milhar.`);
  const [whole, decimal = ''] = value.trim().replace(',', '.').split('.');
  const units = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
  if (units > max) throw new Error(`${name}: valor acima do limite.`);
  return units;
}
export function simulatePayment(base: Assumptions, scenario: Scenario) {
  const price = decimalUnits(base.price, 'Preço');
  if (!price) throw new Error('Preço deve ser maior que zero.');
  const margin = base.margin.trim() ? decimalUnits(base.margin, 'Margem') : null;
  if (margin !== null && margin > price) throw new Error('Margem antes do pagamento não pode superar o preço.');
  const floor = base.floor.trim() ? decimalUnits(base.floor, 'Piso de margem') : null;
  const minimum = base.minimumInstallment.trim() ? decimalUnits(base.minimumInstallment, 'Parcela mínima') : null;
  const discount = decimalUnits(scenario.discount, 'Desconto');
  if (discount >= price) throw new Error('Desconto deve ser menor que o preço.');
  const charged = price - discount;
  const rate = decimalUnits(scenario.mdr, 'Taxa percentual', 10000);
  const mdr = Math.round(charged * rate / 10000);
  const fixed = decimalUnits(scenario.fixed, 'Tarifa fixa');
  const advance = scenario.advanceEnabled ? decimalUnits(scenario.advance, 'Custo total de antecipação') : 0;
  const cost = mdr + fixed + advance;
  if (cost > charged) throw new Error('Custos superam o valor cobrado. Revise as condições.');
  if (!/^\d{1,2}$/.test(scenario.installments) || Number(scenario.installments) < 1 || Number(scenario.installments) > 24) throw new Error('Informe de 1 a 24 parcelas.');
  if (!/^\d{1,3}$/.test(scenario.days) || Number(scenario.days) > 730) throw new Error('Informe um prazo de recebimento de 0 a 730 dias.');
  const installments = Number(scenario.installments);
  const regular = Math.floor(charged / installments);
  if (regular < 1) throw new Error('Cada parcela deve ter pelo menos um centavo. Reduza o número de parcelas.');
  const last = charged - regular * (installments - 1);
  const remainingMargin = margin === null ? null : margin - discount - cost;
  return { price, charged, discount, mdr, fixed, advance, cost, net: charged - cost, remainingMargin, floor, belowFloor: remainingMargin !== null && floor !== null ? remainingMargin < floor : null, belowMinimum: minimum !== null ? regular < minimum : null, installments, regular, last, days: Number(scenario.days) };
}
