import HistoryClient from './HistoryClient';
export default function Page() {
  if (process.env.RECONCILIATION_HISTORY_ENABLED !== 'true') return <section className="p-8"><h1 className="text-2xl font-semibold">Histórico de conciliações</h1><p className="mt-4">Em preparação. O salvamento será habilitado após a validação do ambiente de testes.</p><a className="inline-block mt-6 underline" href="/dashboard/importacoes">Continuar com a análise temporária</a></section>;
  return <HistoryClient/>;
}
