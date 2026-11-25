import type { Metadata } from 'next';
import Workspace from '@/components/reconciliation/Workspace';
export const metadata: Metadata = { title: 'Conciliação por arquivos', alternates: { canonical: '/conciliar' }, description: 'Compare recebíveis e créditos do extrato no navegador.', robots: { index: false, follow: false } };
export default function Page() { return <Workspace/>; }
