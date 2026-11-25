import type { Metadata } from 'next';
import Simulator from './Simulator';
export const metadata: Metadata = { title: 'Simulador de custos de pagamentos', description: 'Compare cenários informados de Pix, cartão e parcelamento, com custos separados e margem restante.', alternates: { canonical: '/simular-pagamentos' }, robots: { index: false, follow: false } };
export default function Page() { return <Simulator/>; }
