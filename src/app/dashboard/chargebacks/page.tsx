"use client";
import { useState } from "react";
import Topbar from "@/components/Topbar";
import { AlertTriangle, Clock, CheckCircle, XCircle, FileText, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 4;

type CBStatus = "aberto" | "contestado" | "ganho" | "perdido";
interface CB { id: string; data: string; cliente: string; adquirente: "PagSeguro"|"Mercado Pago"; motivo: string; valor: number; prazo: number; status: CBStatus; }

const cbs: CB[] = [
  { id:"CB-001", data:"20/05/2026", cliente:"Carlos M. Santos",  adquirente:"Mercado Pago", motivo:"Não reconhece a compra", valor:450,  prazo:3, status:"aberto"     },
  { id:"CB-002", data:"18/05/2026", cliente:"Ana Paula Lima",    adquirente:"PagSeguro",    motivo:"Produto não entregue",  valor:1200, prazo:5, status:"contestado"  },
  { id:"CB-003", data:"15/05/2026", cliente:"João R. Costa",     adquirente:"Mercado Pago", motivo:"Cobrança duplicada",    valor:380,  prazo:0, status:"ganho"        },
  { id:"CB-004", data:"12/05/2026", cliente:"Maria F. Oliveira", adquirente:"PagSeguro",    motivo:"Não reconhece a compra",valor:890,  prazo:0, status:"perdido"      },
  { id:"CB-005", data:"10/05/2026", cliente:"Lucas T. Ferreira", adquirente:"Mercado Pago", motivo:"Produto com defeito",   valor:320,  prazo:8, status:"aberto"       },
];

const smap: Record<CBStatus,{label:string;cls:string;icon:React.ReactNode}> = {
  aberto:     {label:"Aberto",     cls:"badge-amber",icon:<Clock size={11}/>},
  contestado: {label:"Contestado", cls:"badge-blue", icon:<FileText size={11}/>},
  ganho:      {label:"Ganho",      cls:"badge-green",icon:<CheckCircle size={11}/>},
  perdido:    {label:"Perdido",    cls:"badge-red",  icon:<XCircle size={11}/>},
};
const brl = (v:number)=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

export default function ChargebacksPage() {
  const [filter,setFilter] = useState<CBStatus|"all">("all");
  const [page,setPage] = useState(1);
  const filtered = cbs.filter(c=>filter==="all"||c.status===filter);
  const totalPages = Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const safePage = Math.min(page,totalPages);
  const paginated = filtered.slice((safePage-1)*PAGE_SIZE, safePage*PAGE_SIZE);
  const abertos = cbs.filter(c=>c.status==="aberto");
  const risk = abertos.reduce((s,c)=>s+c.valor,0);
  const done = cbs.filter(c=>["ganho","perdido"].includes(c.status));
  const taxa = done.length?Math.round(cbs.filter(c=>c.status==="ganho").length/done.length*100):0;
  const urgentes = abertos.filter(c=>c.prazo<=3);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Chargebacks" subtitle="Gestão de disputas e contestações" />
      <main className="flex-1 p-5 lg:p-8 space-y-5" style={{background:"var(--bg)"}}>

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {label:"Abertos",        value:String(abertos.length),color:"var(--amber)"},
            {label:"Valor em Risco", value:brl(risk),            color:"var(--red)"  },
            {label:"Taxa de Sucesso",value:`${taxa}%`,           color:"var(--green)"},
            {label:"Total no Mês",   value:String(cbs.length),   color:"var(--text)" },
          ].map(k=>(
            <div key={k.label} className="card p-5">
              <p className="text-xs font-medium mb-3" style={{color:"var(--muted)"}}>{k.label}</p>
              <p className="text-2xl font-bold tabular-nums" style={{color:k.color}}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Urgent */}
        {urgentes.length>0&&(
          <div className="flex items-start gap-3 p-4 rounded-xl"
            style={{background:"#fef2f2",border:"1px solid #fecaca"}}>
            <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{color:"var(--red)"}}/>
            <div>
              <p className="text-sm font-semibold" style={{color:"var(--red)"}}>Prazo crítico — ação necessária</p>
              <p className="text-xs mt-0.5" style={{color:"#b91c1c"}}>
                {urgentes.map(c=>`${c.id} (${c.prazo} dia${c.prazo!==1?"s":""} restante${c.prazo!==1?"s":""})`).join(" · ")}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["all","aberto","contestado","ganho","perdido"] as const).map(f=>(
            <button key={f} onClick={()=>{setFilter(f);setPage(1);}}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background:filter===f?"var(--blue)":"white",
                color:filter===f?"white":"var(--text-2)",
                border:"1px solid var(--border)",
                boxShadow:filter===f?"none":"0 1px 2px rgba(0,0,0,0.04)",
              }}>
              {f==="all"?"Todos":smap[f].label}
              {f!=="all"&&<span className="ml-1.5 opacity-70">{cbs.filter(c=>c.status===f).length}</span>}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="card divide-y" style={{borderColor:"var(--border)"}}>
          {paginated.map(cb=>{
            const s=smap[cb.status];
            return(
              <div key={cb.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{background:"var(--surface-2)",border:"1px solid var(--border)",color:"var(--text-2)"}}>
                  {cb.id.split("-")[1]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-semibold" style={{color:"var(--text)"}}>{cb.cliente}</span>
                    <span className={`badge ${cb.adquirente==="PagSeguro"?"badge-amber":"badge-blue"}`}>{cb.adquirente}</span>
                    <span className={`badge ${s.cls}`}>{s.icon}{s.label}</span>
                  </div>
                  <p className="text-xs" style={{color:"var(--text-2)"}}>{cb.motivo}</p>
                  <p className="text-[11px] mt-0.5" style={{color:"var(--muted)"}}>
                    {cb.data} · <span className="font-mono">{cb.id}</span>
                    {cb.status==="aberto"&&(
                      <span style={{color:cb.prazo<=3?"var(--red)":"var(--amber)",marginLeft:8}}>
                        <Clock size={10} className="inline mr-1"/>
                        {cb.prazo} dia{cb.prazo!==1?"s":""} para contestar
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums" style={{color:"var(--text)"}}>{brl(cb.valor)}</p>
                    <p className="text-[11px]" style={{color:"var(--muted)"}}>em disputa</p>
                  </div>
                  {(cb.status==="aberto"||cb.status==="contestado")&&(
                    <div className="flex gap-2">
                      {cb.status==="aberto"&&(
                        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                          style={{background:"var(--blue)",color:"#fff"}}>Contestar</button>
                      )}
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all"
                        style={{border:"1px solid var(--border)",color:"var(--text-2)"}}>Detalhes</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages>1&&(
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{color:"var(--muted)"}}>
              {filtered.length} resultado{filtered.length!==1?"s":""} · página {safePage} de {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={safePage===1}
                className="p-1.5 rounded-lg border transition-all disabled:opacity-30"
                style={{borderColor:"var(--border)",color:"var(--text-2)"}}>
                <ChevronLeft size={14}/>
              </button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
                <button key={n} onClick={()=>setPage(n)}
                  className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background:safePage===n?"var(--blue)":"transparent",
                    color:safePage===n?"#fff":"var(--text-2)",
                    border:safePage===n?"none":"1px solid var(--border)",
                  }}>{n}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={safePage===totalPages}
                className="p-1.5 rounded-lg border transition-all disabled:opacity-30"
                style={{borderColor:"var(--border)",color:"var(--text-2)"}}>
                <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
