import PassportWorkspace from '@/app/passaporte-venda/PassportWorkspace';
import Topbar from '@/components/Topbar';
export default function Page() { return <><Topbar title="Prevenir chargebacks" subtitle="Organize evidências e prepare um plano de ações por modalidade" /><main className="p-5"><PassportWorkspace embedded /></main></>; }
