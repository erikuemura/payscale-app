'use client';

import { useState } from 'react';
import Link from 'next/link';
import { auditFees, auditText, brl, feeLabels, type AuditInput, type Fees } from '@/lib/payments/audit';
import styles from '../passaporte-venda/passport.module.css';
import auditStyles from './audit.module.css';

const blankFees = (): Fees => ({ mdr: '', fixed: '', installments: '', advance: '', other: '' });
const empty = (): AuditInput => ({ reference: '', saleDate: '', provider: '', channel: '', modality: '', installments: '', gross: '', version: '', contractSource: '', statementSource: '', validFrom: '', validTo: '', advanceIncluded: false, expected: blankFees(), actual: blankFees() });
const example = (): AuditInput => ({ reference: 'VENDA-FICTICIA-001', saleDate: '2026-11-09', provider: 'Provedor fictício', channel: 'E-commerce', modality: 'Crédito à vista', installments: '1', gross: '1000', version: 'Contrato fictício v1', contractSource: 'Exemplo — página 2, sem documento real', statementSource: 'Exemplo — linha 1, sem extrato real', validFrom: '2026-01-01', validTo: '2026-12-31', advanceIncluded: false, expected: { mdr: '3', fixed: '0', installments: '0', advance: '0', other: '0' }, actual: { mdr: '3,5', fixed: '0', installments: '0', advance: '0', other: '0' } });
type TextKey = Exclude<keyof AuditInput, 'expected' | 'actual' | 'advanceIncluded'>;
const fields: { key: TextKey; label: string; type?: string }[] = [
  { key: 'reference', label: 'Referência da venda' }, { key: 'saleDate', label: 'Data da venda', type: 'date' },
  { key: 'provider', label: 'Provedor' }, { key: 'channel', label: 'Canal' },
  { key: 'modality', label: 'Modalidade' }, { key: 'installments', label: 'Número de parcelas' },
  { key: 'gross', label: 'Valor bruto da venda (R$)' }, { key: 'version', label: 'Versão do contrato' },
  { key: 'validFrom', label: 'Início da vigência', type: 'date' }, { key: 'validTo', label: 'Fim da vigência', type: 'date' },
  { key: 'contractSource', label: 'Fonte do contrato (documento e página)' }, { key: 'statementSource', label: 'Fonte do extrato (documento e linha)' },
];

export default function FeeAudit({ embedded = false }: { embedded?: boolean }) {
  const [input, setInput] = useState<AuditInput>(empty);
  const [result, setResult] = useState<ReturnType<typeof auditFees> | null>(null);
  const [error, setError] = useState('');
  const [isExample, setIsExample] = useState(false);
  function update(patch: Partial<AuditInput>) { setInput(old => ({ ...old, ...patch })); setResult(null); setError(''); }
  function exportReport() {
    if (!result) return;
    const url = URL.createObjectURL(new Blob([auditText(input)], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'payscale-conferencia-taxas.txt';
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <main className={styles.page} style={embedded ? { padding: 20, minHeight: 0 } : undefined}>
    {!embedded && <nav><Link href="/">payscale.</Link><Link href="/dashboard/tarifas">Área de tarifas →</Link></nav>}
    {!embedded && <header><p>CONFERÊNCIA DE TAXAS · BETA</p><h1>O contrato diz uma coisa.<br /><span>A cobrança confere?</span></h1><p>Compare uma venda com as condições aplicáveis à sua data. Separe cada custo e leve as diferenças documentadas para revisão.</p></header>}
    <aside><strong>Conferência temporária, com dados informados por você.</strong><p>Os documentos não são recebidos ou verificados. Não há consulta ao provedor, contestação ou recuperação automática. Ao sair, os dados são perdidos; exporte o relatório para guardar a conferência. Evite dados pessoais de clientes.</p></aside>
    <div className={styles.toolbar}><button onClick={() => { update(example()); setIsExample(true); }}>Experimentar diferença de R$ 5</button><button onClick={() => { update(empty()); setIsExample(false); }}>Limpar conferência</button><Link href={embedded ? "/dashboard/simulador" : "/simular-pagamentos"}>Comparar cenários de pagamento →</Link></div>
    {isExample && <p role="status">Exemplo fictício editável, sem contrato ou extrato real.</p>}
    <form noValidate onSubmit={event => { event.preventDefault(); try { setResult(auditFees(input)); setError(''); } catch (err) { setResult(null); setError(err instanceof Error ? err.message : 'Revise os campos.'); } }}>
      <section><h2>01 · Venda e contrato aplicável</h2><p>Informe a versão que valia na data da venda. A vigência é inclusiva. Condições por volume, prazo ou parcela precisam ser conferidas no contrato antes do preenchimento.</p><div className={styles.grid}>
        {fields.map(field => <label key={field.key}>{field.label}<input type={field.type || 'text'} maxLength={500} min={field.type === 'date' ? '1900-01-01' : undefined} max={field.type === 'date' ? '2100-12-31' : undefined} inputMode={field.key === 'gross' ? 'decimal' : field.key === 'installments' ? 'numeric' : undefined} value={input[field.key]} onChange={event => update({ [field.key]: event.target.value })} /></label>)}
      </div></section>
      <section><h2>02 · Separe os custos da venda</h2><p>MDR em percentual sobre o bruto, com até quatro casas decimais. Os demais custos são totais em reais desta venda, com até duas casas. Preencha 0 quando confirmar ausência de cobrança; campo vazio significa informação faltante. A MDR é arredondada por venda, não por parcela.</p>
        <label className={styles.check}><input type="checkbox" checked={input.advanceIncluded} onChange={event => update({ advanceIncluded: event.target.checked })} /> A antecipação já está incluída na MDR informada</label>
        {input.advanceIncluded && <p className={styles.warning}>Informe 0 nas duas antecipações separadas. Confira se contrato e extrato usam a mesma composição; não some novamente um custo embutido.</p>}
        <div className={styles.grid}>{(['expected', 'actual'] as const).map(side => <fieldset className={auditStyles.fees} key={side}><legend>{side === 'expected' ? 'Condições contratadas' : 'Cobranças informadas'}</legend>{(['mdr', ...Object.keys(feeLabels)] as (keyof Fees)[]).map(key => <label key={key}>{key === 'mdr' ? 'MDR (%)' : `${feeLabels[key]} (R$)`}<input aria-label={`${key === 'mdr' ? 'MDR (%)' : `${feeLabels[key]} (R$)`} — ${side === 'expected' ? 'contratado' : 'cobrado'}`} inputMode="decimal" value={input[side][key]} onChange={event => update({ [side]: { ...input[side], [key]: event.target.value } })} /></label>)}</fieldset>)}</div>
      </section>
      {error && <p role="alert" className={styles.warning}>{error}</p>}<button type="submit" className={styles.primary}>Conferir taxas da venda</button>
    </form>
    {result && <section aria-label="Resultado da conferência" aria-live="polite"><h2>03 · {result.hasDifferences ? 'Diferenças para revisão' : 'Valores informados coincidem'}</h2><p>Diferença total: <strong>{brl(result.difference)}</strong> (cobrado menos contratado). {result.difference > 0 ? 'O custo informado é maior que o esperado.' : result.difference < 0 ? 'O custo informado é menor que o esperado; confira a composição.' : 'O total coincide; confira também cada componente abaixo.'}</p>
      <div className={auditStyles.tableWrap}><table className={auditStyles.table}><caption>Comparação dos custos desta venda</caption><thead><tr><th scope="col">Componente</th><th scope="col">Contratado</th><th scope="col">Cobrado</th><th scope="col">Diferença</th></tr></thead><tbody>{result.rows.map(row => <tr key={row.key}><th scope="row">{row.label}</th><td>{brl(row.expected)}</td><td>{brl(row.actual)}</td><td>{brl(row.difference)}{row.difference !== 0 && <span> · Revisar</span>}</td></tr>)}</tbody><tfoot><tr><th scope="row">Custo total</th><td>{brl(result.expected.total)}</td><td>{brl(result.actual.total)}</td><td>{brl(result.difference)}</td></tr></tfoot></table></div>
      <p>Líquido esperado: <strong>{brl(result.expected.net)}</strong>. Após os custos informados: <strong>{brl(result.actual.net)}</strong>. Estes cálculos não comprovam liquidação bancária.</p>
      <p className={styles.warning}>{result.hasDifferences ? 'Diferença suspeita, ainda não validada. Custos que se compensam no total não eliminam as divergências por componente.' : 'Coincidência não comprova a validade do contrato ou que todas as cobranças foram informadas.'} Nenhum valor foi registrado como recuperado.</p>
      <details><summary>Ler relatório com fontes e condições</summary><pre>{auditText(input)}</pre></details><button className={styles.primary} onClick={exportReport}>Exportar conferência TXT</button>
    </section>}
  </main>;
}
