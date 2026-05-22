"use client";
import Topbar from "@/components/Topbar";
import { Download, FileText, TrendingUp, AlertTriangle, ShieldAlert, BarChart3, Mail } from "lucide-react";

const types = [
  {id:"conciliacao",title:"Relatório de Conciliação",     desc:"Transações, divergências e valores pendentes de liquidação.",           icon:<TrendingUp size={16}/>, color:"var(--blue)",  ultima:"22/05/2026",tipo:"Mensal"},
  {id:"mdr",        title:"Auditoria de Tarifas MDR",      desc:"Taxas contratadas vs. cobradas com impacto financeiro por modalidade.", icon:<AlertTriangle size={16}/>,color:"var(--amber)", ultima:"22/05/2026",tipo:"Mensal"},
  {id:"chargebacks",title:"Gestão de Chargebacks",         desc:"Disputas, taxas de sucesso em contestações e valores em risco.",        icon:<ShieldAlert size={16}/>, color:"var(--red)",   ultima:"21/05/2026",tipo:"Mensal"},
  {id:"saude",      title:"Saúde Financeira",              desc:"Volume, receita líquida, projeção e comparativo histórico.",            icon:<BarChart3 size={16}/>,   color:"var(--green)", ultima:"22/05/2026",tipo:"Semanal"},
];
const hist = [
  {name:"Conciliação — Abril 2026",         date:"01/05/2026",size:"142 KB"},
  {name:"Auditoria MDR — Abril 2026",       date:"01/05/2026",size:"89 KB"},
  {name:"Chargebacks — Abril 2026",         date:"01/05/2026",size:"67 KB"},
  {name:"Saúde Financeira — Semana 18",     date:"05/05/2026",size:"54 KB"},
  {name:"Conciliação — Março 2026",         date:"01/04/2026",size:"138 KB"},
  {name:"Auditoria MDR — Março 2026",       date:"01/04/2026",size:"92 KB"},
];

export default function RelatoriosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Relatórios" subtitle="Gere e exporte relatórios financeiros completos"/>
      <main className="flex-1 p-5 lg:p-8 space-y-6" style={{background:"var(--bg)"}}>

        {/* Generate */}
        <div>
          <p className="text-sm font-semibold mb-4" style={{color:"var(--text)"}}>Gerar Relatório</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {types.map(r=>(
              <div key={r.id} className="card overflow-hidden">
                <div className="flex items-start gap-3 px-5 py-4" style={{borderBottom:"1px solid var(--border)"}}>
                  <div className="icon-box shrink-0" style={{background:r.color+"18",color:r.color}}>{r.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{color:"var(--text)"}}>{r.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{color:"var(--text-2)"}}>{r.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <p className="text-xs" style={{color:"var(--muted)"}}>Último: {r.ultima}</p>
                  <span className="badge badge-blue">{r.tipo}</span>
                  <div className="flex gap-2 ml-auto">
                    <select className="input-base text-xs py-1.5 pl-2 pr-7" style={{width:"auto",color:"var(--text-2)"}}>
                      <option>Maio 2026</option><option>Abril 2026</option><option>Março 2026</option>
                    </select>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                      style={{background:"var(--blue)",color:"#fff"}}>
                      <Download size={12}/>Exportar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div>
          <p className="text-sm font-semibold mb-4" style={{color:"var(--text)"}}>Histórico</p>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{background:"var(--surface-2)",borderBottom:"1px solid var(--border)"}}>
                    {["Relatório","Gerado em","Tamanho",""].map(h=>(
                      <th key={h} className="px-5 py-3 text-left font-semibold" style={{color:"var(--muted)"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hist.map((r,i)=>(
                    <tr key={i} style={{borderTop:"1px solid var(--border)",background:i%2===0?"#fff":"var(--surface-2)"}}
                      className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2" style={{color:"var(--text)"}}>
                          <FileText size={13} style={{color:"var(--muted)",flexShrink:0}}/>{r.name}
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap" style={{color:"var(--muted)"}}>{r.date}</td>
                      <td className="px-5 py-3" style={{color:"var(--muted)"}}>{r.size}</td>
                      <td className="px-5 py-3">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-50 transition-all"
                          style={{border:"1px solid var(--border)",color:"var(--blue)"}}>
                          <Download size={12}/>Baixar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Auto email */}
        <div className="card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="icon-box" style={{background:"var(--blue-dim)",color:"var(--blue)"}}><Mail size={17}/></div>
              <div>
                <p className="text-sm font-semibold" style={{color:"var(--text)"}}>Envio Automático por E-mail</p>
                <p className="text-xs mt-0.5" style={{color:"var(--muted)"}}>Relatórios periódicos enviados automaticamente.</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all shrink-0"
              style={{background:"var(--blue)",color:"#fff"}}>Configurar</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {label:"Conciliação",   freq:"Todo dia 1",email:"financeiro@empresa.com.br",ok:true},
              {label:"Auditoria MDR", freq:"Quinzenal",  email:"financeiro@empresa.com.br",ok:true},
              {label:"Chargebacks",   freq:"Semanal",    email:"—",                         ok:false},
            ].map(s=>(
              <div key={s.label} className="p-4 rounded-xl" style={{background:"var(--surface-2)",border:"1px solid var(--border)"}}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold" style={{color:"var(--text)"}}>{s.label}</p>
                  <span className={`badge ${s.ok?"badge-green":"badge-muted"}`}>{s.ok?"Ativo":"Inativo"}</span>
                </div>
                <p className="text-[11px]" style={{color:"var(--muted)"}}>{s.freq}</p>
                <p className="text-[11px] truncate" style={{color:"var(--muted)"}}>{s.email}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
