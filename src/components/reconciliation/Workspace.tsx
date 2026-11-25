"use client";

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, FileSpreadsheet, Download, RotateCcw, ShieldCheck } from 'lucide-react';
import { parseCsv, reconcile, exportResults, labels, money, MAX_BYTES, type Entry, type Result } from '@/lib/reconciliation/engine';
import { sameEntries, observedPeriod, coverageMessage } from '@/lib/reconciliation/coverage';
import { parseContextCsv, contextConflict, type ImportContext } from '@/lib/reconciliation/context';
import ReviewQueue from './ReviewQueue';
import styles from './workspace.module.css';

type Kind = 'receivables' | 'credits';
type ImportState = { name: string; entries: Entry[]; error: string; loading: boolean; importedAt?: string; duplicate?: boolean; context?: ImportContext };
const empty = (): ImportState => ({ name: '', entries: [], error: '', loading: false });
const examples = {
  receivables: 'id;data;valor;referencia\nREC-001;2026-11-04;100,00;REPASSE-01\nREC-002;2026-11-04;50,00;REPASSE-01\nREC-003;2026-11-04;200,00;REPASSE-02\nREC-004;2026-11-05;80,00;REPASSE-03',
  credits: 'id;data;valor;referencia\nBANCO-001;2026-11-04;150,00;REPASSE-01\nBANCO-002;2026-11-04;195,00;REPASSE-02\nBANCO-003;2026-11-05;40,00;OUTRO-REPASSE',
};

export default function Workspace({ embedded = false }: { embedded?: boolean }) {
  const [imports, setImports] = useState<Record<Kind, ImportState>>({ receivables: empty(), credits: empty() });
  const [results, setResults] = useState<Result[] | null>(null);
  const [analysisVersion, setAnalysisVersion] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [example, setExample] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const versions = useRef({ receivables: 0, credits: 0 });
  const update = (kind: Kind, value: ImportState) => setImports(old => ({ ...old, [kind]: value }));

  async function readFile(kind: Kind, file: File | undefined) {
    if (!file) return;
    const previous = imports[kind];
    const version = ++versions.current[kind];
    if (example) {
      const other: Kind = kind === 'receivables' ? 'credits' : 'receivables';
      versions.current[other]++; update(other, empty());
    }
    // Replacing any input starts a new analysis. Ignore older async reads.
    setResults(null); setConfirmed(false); setExample(false);
    update(kind, { ...empty(), name: file.name, loading: true });
    try {
      if (!file.name.toLowerCase().endsWith('.csv')) throw new Error('Selecione um arquivo CSV no formato do modelo.');
      if (file.size > MAX_BYTES) throw new Error('O arquivo excede 1 MB.');
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
      const { entries, context } = parseContextCsv(text);
      if (versions.current[kind] === version) update(kind, { name: file.name, entries, context, loading: false, error: '', importedAt: new Date().toLocaleString('pt-BR'), duplicate: sameEntries(previous.entries, entries) && JSON.stringify(previous.context) === JSON.stringify(context) });
    } catch (error) {
      if (versions.current[kind] === version) update(kind, { ...empty(), name: file.name, error: error instanceof TypeError ? 'Use um CSV com codificação UTF-8.' : error instanceof Error ? error.message : 'Não foi possível ler o arquivo.' });
    }
  }
  function reset() {
    versions.current.receivables++; versions.current.credits++;
    setImports({ receivables: empty(), credits: empty() }); setResults(null); setConfirmed(false); setExample(false); setInputKey(k => k + 1);
  }
  function loadExample() {
    versions.current.receivables++; versions.current.credits++;
    setImports({ receivables: { name: 'Recebíveis fictícios', entries: parseCsv(examples.receivables), loading: false, error: '' }, credits: { name: 'Créditos fictícios', entries: parseCsv(examples.credits), loading: false, error: '' } });
    setResults(null); setConfirmed(false); setExample(true); setInputKey(k => k + 1);
  }
  function download() {
    if (!results) return;
    const url = URL.createObjectURL(new Blob([exportResults(results)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'payscale-conciliacao.csv'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const conflict = imports.receivables.entries.length && imports.credits.entries.length ? contextConflict(imports.receivables.context, imports.credits.context) : null;
  const ready = !conflict && confirmed && imports.receivables.entries.length > 0 && imports.credits.entries.length > 0 && !imports.receivables.loading && !imports.credits.loading;
  return <div className={styles.workspace}>
    <div className={styles.top}><Link href={embedded ? '/dashboard' : '/'}><ArrowLeft size={16}/> {embedded ? 'Voltar ao painel' : 'payscale.'}</Link><span>CONCILIAÇÃO POR ARQUIVOS · BETA</span></div>
    <header className={styles.heading}><p>RECEBÍVEIS + EXTRATO</p><h1>Dois arquivos.<br/><span>Uma visão do seu repasse.</span></h1><p>Compare o líquido previsto com os créditos do banco. Cada resultado mostra os registros e a regra utilizados.</p></header>
    <div className={styles.notice}><ShieldCheck size={22}/><div><strong>Análise temporária, processada neste navegador.</strong><p>O conteúdo dos arquivos não é enviado ao servidor nem salvo. Ao recarregar ou sair desta página, a análise é perdida. Esta etapa usa regras verificáveis; ainda não utiliza IA.</p></div></div>
    <div className={styles.toolbar}><Link href="/simular-pagamentos">Simular custos de pagamento →</Link><button onClick={loadExample}>Experimentar com dados fictícios <ArrowRight size={16}/></button><button onClick={reset}><RotateCcw size={15}/> Limpar análise</button></div>
    {example && <p className={styles.example} role="status">Exemplo carregado: todos os registros abaixo são fictícios.</p>}
    <div className={styles.imports}>{(['receivables', 'credits'] as const).map((kind, index) => {
      const item = imports[kind];
      return <section className={styles.card} key={kind}><div className={styles.cardTitle}><span>0{index + 1}</span><FileSpreadsheet size={24}/></div><h2>{kind === 'receivables' ? 'Recebíveis previstos' : 'Créditos do extrato'}</h2><p>{kind === 'receivables' ? 'Valor líquido esperado e data prevista do repasse.' : 'Somente entradas de dinheiro, sem saldo ou débitos.'}</p><a className={styles.model} href={kind === 'receivables' ? '/modelos/recebiveis.csv' : '/modelos/extrato.csv'} download><Download size={14}/> Baixar modelo CSV simples</a> <a className={styles.model} href={kind === 'receivables' ? '/modelos/recebiveis-contexto.csv' : '/modelos/extrato-contexto.csv'} download><Download size={14}/> Modelo com empresa e conta</a>
        <label className={styles.file}>{kind === 'receivables' ? 'Selecionar recebíveis' : 'Selecionar extrato'}<input key={`${kind}-${inputKey}`} type="file" accept=".csv,text/csv" onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; void readFile(kind, file); }}/></label>
        <div aria-live="polite">{!item.loading && !item.error && item.entries.length === 0 && <p className={styles.hint}>Dados não recebidos para esta fonte.</p>}{item.duplicate && <p className={styles.example} role="status">Arquivo repetido: o conteúdo já estava nesta fonte. Os registros foram mantidos uma única vez; o saldo não foi somado novamente.</p>}{item.loading && <p>Lendo arquivo…</p>}{item.error && <p className={styles.error} role="alert">{item.error}</p>}{item.entries.length > 0 && <><p className={styles.importSummary}><strong>{item.entries.length} registros · {money(item.entries.reduce((sum, e) => sum + e.cents, 0))}</strong><br/>{item.name}<br/>Período observado: {observedPeriod(item.entries)}<br/>{item.importedAt ? `Lido neste navegador em ${item.importedAt}` : "Fonte: exemplo fictício fornecido pela PayScale"}</p><p className={styles.hint}>{item.context ? `Contexto declarado no arquivo — Empresa: ${item.context.company} · Conta: ${item.context.account} · Moeda: ${item.context.currency} · Provedores: ${item.context.providers.join(', ')} · Canais: ${item.context.channels.join(', ')}` : 'Formato simples: empresa e conta não identificadas no arquivo.'}</p><div className={styles.tableScroll} tabIndex={0} role="region" aria-label={`Prévia de ${kind === 'receivables' ? 'recebíveis' : 'créditos'}`}><table><caption>Prévia — até 10 primeiras linhas</caption><thead><tr><th>ID</th><th>Data</th><th>Valor</th><th>Referência</th></tr></thead><tbody>{item.entries.slice(0,10).map(e => <tr key={e.id}><td>{e.id}</td><td>{e.date}</td><td>{money(e.cents)}</td><td>{e.reference}</td></tr>)}</tbody></table></div></>}</div>
      </section>;
    })}</div>
    <details className={styles.format}><summary>Como preparar os arquivos e interpretar a conciliação</summary><p>CSV UTF-8, até 1 MB e 2.000 linhas, separado por ponto e vírgula. Cabeçalho: <code>id;data;valor;referencia</code>. Datas: AAAA-MM-DD. Valor positivo em reais, sem milhar, como 150,00. Não importe OFX, XLSX ou PDF nesta versão.</p><p>No modelo com contexto, acrescente <code>;empresa;conta;provedor;canal;moeda</code>. Use identificadores estáveis e idênticos de empresa e conta nas duas fontes; conta significa a conta de destino do repasse. Todos os campos são obrigatórios. Apenas BRL é aceito. Provedor e canal podem variar. A identificação é declarada por você, sem verificação externa.</p><p>A referência deve ser o mesmo identificador de repasse nas duas fontes. Recebíveis com a mesma referência e data são somados. Apenas um crédito com a mesma chave pode corresponder. Valores iguais sozinhos não bastam; diferenças de data permanecem pendentes. Vários créditos na mesma chave exigem revisão.</p><p>Correspondência exata significa igualdade nesses arquivos; não comprova a validade do contrato. Sem correspondência não significa atraso ou perda. Para múltiplas contas, faça uma análise separada por conta.</p></details>
    <div className={styles.notice} role="status"><ShieldCheck size={22}/><div><strong>Cobertura das fontes</strong><p>{coverageMessage(imports.receivables.entries, imports.credits.entries)}</p><p>O modelo com contexto bloqueia empresas ou contas diferentes e moedas fora de BRL. No modelo simples, essa identificação não existe: confira manualmente a origem. Use o mesmo formato nas duas fontes.</p></div></div>
    {conflict && <p className={styles.error} role="alert">{conflict}</p>}
    <div className={styles.run}><label><input type="checkbox" checked={confirmed} onChange={e => { setConfirmed(e.target.checked); setResults(null); }}/> Revisei as prévias: os dois arquivos são da mesma conta, em BRL, e usam referências de repasse compatíveis.</label><button className={styles.primary} disabled={!ready} onClick={() => { if (ready) { setAnalysisVersion(v => v + 1); setResults(reconcile(imports.receivables.entries, imports.credits.entries)); } }}>Conciliar arquivos <ArrowRight size={17}/></button></div>
    {results && <section className={styles.results} aria-label="Resultado da conciliação"><div className={styles.resultsHeading}><div><p>03 · RESULTADO</p><h2>O que encontramos nos arquivos</h2></div><button onClick={download}><Download size={16}/> Exportar resultado</button></div><p role="status">{results.filter(r => r.status === 'exact').length} grupo(s) com correspondência exata · {results.filter(r => r.status !== 'exact').length} item(ns) para revisão.</p><p className={styles.hint}>Diferença = créditos − valor esperado. Em casos ambíguos, os créditos listados são candidatos, não associações confirmadas.</p>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Tabela de resultados"><table><thead><tr><th>Situação / evidências</th><th>Esperado</th><th>Créditos</th><th>Diferença</th></tr></thead><tbody>{results.map((r,i) => <tr key={i}><td><span className={r.status === 'exact' ? styles.exact : styles.review}>{labels[r.status]}</span><strong>{r.reference} · {r.date}</strong><p>{r.reason}</p><details><summary>Ver IDs de origem</summary><p>Recebíveis: {r.receivableIds.join(', ') || '—'}<br/>Créditos: {r.creditIds.join(', ') || '—'}<br/>Regra: referencia-data-v1</p></details></td><td>{money(r.expected)}</td><td>{money(r.received)}</td><td>{r.status === 'ambiguous' ? 'Revisar candidatos' : money(r.difference)}</td></tr>)}</tbody></table></div>
    </section>}
    {results && <ReviewQueue key={analysisVersion} results={results}/>}
  </div>;
}
