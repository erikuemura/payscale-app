import FeeAudit from '@/app/auditar-taxas/FeeAudit';
import Topbar from '@/components/Topbar';
export default function Page() { return <><Topbar title="Conferir taxas" subtitle="Compare condições contratuais com cobranças por venda" /><FeeAudit embedded /></>; }
