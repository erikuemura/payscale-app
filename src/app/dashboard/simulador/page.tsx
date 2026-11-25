import Simulator from '@/app/simular-pagamentos/Simulator';
import Topbar from '@/components/Topbar';
export default function Page() { return <><Topbar title="Simular pagamentos" subtitle="Compare Pix, parcelamento, margem e custo de antecipação" /><Simulator embedded /></>; }
