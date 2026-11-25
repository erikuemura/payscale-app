import type { Metadata } from 'next';
import FeeAudit from './FeeAudit';
export const metadata: Metadata = { title: 'Conferência de taxas por venda', description: 'Compare condições contratuais e cobranças informadas, com custos separados e fontes para revisão.', alternates: { canonical: '/auditar-taxas' }, robots: { index: false, follow: false } };
export default function Page() { return <FeeAudit />; }
