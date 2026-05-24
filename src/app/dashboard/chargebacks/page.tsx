"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { AlertTriangle, Clock, CheckCircle, XCircle, FileText, ShieldAlert,
  ChevronLeft, ChevronRight, Search, X, Copy, ExternalLink, Download } from "lucide-react";
import { useToast } from "@/context/ToastContext";

const PAGE_SIZE = 4;

type CBStatus = "aberto" | "contestado" | "ganho" | "perdido";
interface CB {
  id: string; data: string; cliente: string; adquirente: "PagSeguro"|"Mercado Pago";
  motivo: string; valor: number; prazo: number; status: CBStatus;
  descricao?: string;
}

const cbs: CB[] = [
  { id:"CB-001", data:"20/05/2026", cliente:"Carlos M. Santos",  adquirente:"Mercado Pago", motivo:"Não reconhece a compra", valor:450,  prazo:3, status:"aberto",     descricao:"Cliente alega não reconhecer a transação realizada em 18/05/2026. Compra de R$ 450,00 via crédito 1x." },
  { id:"CB-002", data:"18/05/2026", cliente:"Ana Paula Lima",    adquirente:"PagSeguro",    motivo:"Produto não entregue",  valor:1200, prazo:5, status:"contestado",  descricao:"Cliente afirma que o produto adquirido em 15/05/2026 nunca foi entregue. Compra de R$ 1.200,00 parcelada em 3x." },
  { id:"CB-003", data:"15/05/2026", cliente:"João R. Costa",     adquirente:"Mercado Pago", motivo:"Cobrança duplicada",    valor:380,  prazo:0, status:"ganho",        descricao:"Contestação aceita pelo adquirente. Comprovante de entrega validado com sucesso." },
  { id:"CB-004", data:"12/05/2026", cliente:"Maria F. Oliveira", adquirente:"PagSeguro",    motivo:"Não reconhece a compra",valor:890,  prazo:0, status:"perdido",      descricao:"Chargeback não contestado dentro do prazo. Valor debitado da conta em 28/05/2026." },
  { id:"CB-005", data:"10/05/2026", cliente:"Lucas T. Ferreira", adquirente:"Mercado Pago", motivo:"Produto com defeito",   valor:320,  prazo:8, status:"aberto",       descricao:"Cliente relata que o produto chegou com defeito e solicitou estorno via adquirente." },
];

const smap: Record<CBStatus,{label:string;cls:string;icon:React.ReactNode}> = {
  aberto:     {label:"Aberto",     cls:"badge-amber",icon:<Clock size={11}/>},
  contestado: {label:"Contestado", cls:"badge-blue", icon:<FileText size={11}/>},
  ganho:      {label:"Ganho",      cls:"badge-green",icon:<CheckCircle size={11}/>},
  perdido:    {label:"Perdido",    cls:"badge-red",  icon:<XCircle size={11}/>},
};
const brl = (v:number)=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

/* ── Modal de Detalhes ── */
function DetalhesModal({ cb, onClose }: { cb: CB; onClose: () => void }) {
  const { toast } = useToast();
  const s = smap[cb.status];
  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => toast(`${label} copiado!`));
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Detalhes do chargeback" className="card w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} style={{ color: "var(--muted)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Detalhes do Chargeback</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={15} style={{ color: "var(--muted)" }} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {/* ID + status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold" style={{ color: "var(--blue)" }}>{cb.id}</span>
              <button onClick={() => copy(cb.id, "ID")} aria-label="Copiar ID" className="hover:opacity-60 transition-opacity">
                <Copy size={12} style={{ color: "var(--muted)" }} />
              </button>
            </div>
            <span className={`badge ${s.cls}`}>{s.icon}{s.label}</span>
          </div>

          {/* Grid de campos */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Cliente",     value: cb.cliente    },
              { label: "Adquirente",  value: cb.adquirente },
              { label: "Data",        value: cb.data       },
              { label: "Valor",       value: brl(cb.valor) },
              { label: "Motivo",      value: cb.motivo     },
              ...(cb.status === "aberto" ? [{ label: "Prazo",
                value: `${cb.prazo} dia${cb.prazo !== 1 ? "s" : ""} restante${cb.prazo !== 1 ? "s" : ""}` }] : []),
            ].map(f => (
              <div key={f.label} className="p-3 rounded-lg" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--muted)" }}>{f.label.toUpperCase()}</p>
                <p className="text-xs font-medium" style={{ color: "var(--text)" }}>{f.value}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div>
            <p className="text-[10px] font-semibold mb-3 uppercase tracking-widest" style={{ color: "var(--muted)" }}>Linha do tempo</p>
            <div className="space-y-0">
              {[
                { step: "Recebido",   done: true,  active: false },
                { step: "Em análise", done: ["contestado","ganho","perdido"].includes(cb.status), active: cb.status === "aberto" },
                { step: "Contestado", done: ["ganho","perdido"].includes(cb.status),              active: cb.status === "contestado" },
                { step: "Resultado",  done: ["ganho","perdido"].includes(cb.status),              active: false,
                  label: cb.status === "ganho" ? "Ganho ✓" : cb.status === "perdido" ? "Perdido ✗" : "Resultado" },
              ].map((t, i, arr) => (
                <div key={t.step} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: t.done ? "var(--green)" : t.active ? "var(--blue)" : "var(--border)",
                        border: t.active ? "2px solid var(--blue)" : "none",
                      }}>
                      {t.done && <div className="w-2 h-2 rounded-full bg-white" />}
                      {t.active && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                    </div>
                    {i < arr.length - 1 && (
                      <div className="w-0.5 h-5 mt-0.5"
                        style={{ background: t.done ? "var(--green)" : "var(--border)" }} />
                    )}
                  </div>
                  <p className="text-xs pb-4 font-medium" style={{
                    color: t.done ? "var(--green)" : t.active ? "var(--blue)" : "var(--muted)",
                    marginTop: 2,
                  }}>
                    {t.label ?? t.step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {cb.descricao && (
            <div className="p-3 rounded-lg text-xs leading-relaxed"
              style={{ background: "var(--blue-dim)", border: "1px solid rgba(37,99,235,0.15)", color: "var(--text-2)" }}>
              {cb.descricao}
            </div>
          )}
        </div>
        <div className="px-5 py-4 flex gap-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>Fechar</button>
          <a href={`https://${cb.adquirente === "PagSeguro" ? "pagseguro" : "mercadopago"}.com.br`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
            style={{ background: "var(--blue)", color: "#fff" }}>
            <ExternalLink size={13} /> Ver no {cb.adquirente}
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Modal de Contestar ── */
function ContestarModal({ cb, onClose }: { cb: CB; onClose: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState<1|2>(1);
  const [docs, setDocs] = useState<string[]>([]);

  const checklist = [
    { id: "nf",      label: "Nota fiscal ou comprovante de venda" },
    { id: "entrega", label: "Comprovante de entrega (rastreio, assinatura)" },
    { id: "email",   label: "E-mails ou mensagens trocadas com o cliente" },
    { id: "contrato",label: "Contrato ou termo de serviço aceito pelo cliente" },
  ];

  function toggle(id: string) {
    setDocs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  }

  function handleSubmit() {
    toast(`Contestação de ${cb.id} enviada! Prazo de resposta: 10 dias úteis.`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Contestar chargeback" className="card w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} style={{ color: "var(--red)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Contestar Chargeback</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={15} style={{ color: "var(--muted)" }} />
          </button>
        </div>

        {step === 1 ? (
          <div className="px-5 py-4 space-y-4">
            <div className="p-3 rounded-lg text-xs"
              style={{ background: "var(--amber-dim)", border: "1px solid rgba(217,119,6,0.25)", color: "var(--amber)" }}>
              <strong>{cb.id}</strong> — {cb.motivo} · {brl(cb.valor)} · {cb.prazo} {cb.prazo !== 1 ? "dias" : "dia"} restante{cb.prazo !== 1 ? "s" : ""}
            </div>
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: "var(--text)" }}>
                Selecione os documentos que você possui para contestação:
              </p>
              <div className="space-y-2">
                {checklist.map(item => (
                  <label key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                    style={{
                      background: docs.includes(item.id) ? "var(--blue-dim)" : "var(--surface-2)",
                      border:     `1px solid ${docs.includes(item.id) ? "rgba(37,99,235,0.3)" : "var(--border)"}`,
                    }}>
                    <input type="checkbox" checked={docs.includes(item.id)} onChange={() => toggle(item.id)}
                      className="w-4 h-4 accent-blue-600" />
                    <span className="text-xs" style={{ color: "var(--text)" }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>Cancelar</button>
              <button onClick={() => setStep(2)} disabled={docs.length === 0}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40"
                style={{ background: "var(--blue)", color: "#fff" }}>Continuar</button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-4">
            <div className="p-4 rounded-xl text-xs space-y-2"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <p className="font-semibold mb-3" style={{ color: "var(--text)" }}>Próximos passos:</p>
              {[
                `Acesse o painel de ${cb.adquirente} e localize o chargeback ${cb.id}.`,
                "Faça o upload dos documentos selecionados na etapa anterior.",
                "Preencha o formulário de contestação com os dados da venda.",
                `Aguarde a resposta do adquirente (prazo padrão: 10 dias úteis).`,
              ].map((s, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={{ background: "var(--blue)", color: "#fff" }}>{i+1}</span>
                  <p style={{ color: "var(--text-2)" }}>{s}</p>
                </div>
              ))}
            </div>
            <div className="text-xs p-3 rounded-lg"
              style={{ background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.25)", color: "var(--red)" }}>
              Você possui <strong>{docs.length}</strong> documento{docs.length !== 1 ? "s" : ""} selecionado{docs.length !== 1 ? "s" : ""}. Reúna todos antes de iniciar.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>Voltar</button>
              <button onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: "var(--blue)", color: "#fff" }}>Registrar contestação</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── CSV export ── */
function exportChargebacksCSV(rows: CB[]) {
  const header = ["ID","Data","Cliente","Adquirente","Motivo","Valor (R$)","Prazo (dias)","Status"];
  const statusLabel: Record<CBStatus,string> = { aberto:"Aberto", contestado:"Contestado", ganho:"Ganho", perdido:"Perdido" };
  const lines = rows.map(r => [
    r.id, r.data, r.cliente, r.adquirente, r.motivo,
    r.valor.toFixed(2).replace(".",","), r.prazo, statusLabel[r.status],
  ].join(";"));
  const csv = [header.join(";"), ...lines].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "chargebacks.csv"; a.click();
  URL.revokeObjectURL(url);
}

/* ── Página principal ── */
export default function ChargebacksPage() {
  const { toast } = useToast();
  const [filter,   setFilter]    = useState<CBStatus|"all">("all");
  const [search,   setSearch]    = useState("");
  const [page,     setPage]      = useState(1);
  const [sortKey,  setSortKey]   = useState<keyof CB | null>("data");
  const [sortDir,  setSortDir]   = useState<"asc"|"desc">("desc");
  const [detalhes, setDetalhes]  = useState<CB|null>(null);
  const [contestar,setContestar] = useState<CB|null>(null);
  const searchRef   = useRef<HTMLInputElement>(null);
  const filteredRef = useRef<CB[]>([]);

  // ⌘F / / focuses search; ⌘E exports
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (detalhes || contestar) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "f") { e.preventDefault(); searchRef.current?.focus(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "e") { e.preventDefault(); exportChargebacksCSV(filteredRef.current); toast("Chargebacks exportados!"); }
      if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
        e.preventDefault(); searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detalhes, contestar, toast]);

  function handleSort(key: keyof CB) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }

  const filtered = useMemo(() => {
    const base = cbs.filter(c => {
      const matchFilter = filter === "all" || c.status === filter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        c.cliente.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.motivo.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
    if (!sortKey) return base;
    return [...base].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), "pt-BR");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filter, search, sortKey, sortDir]);

  filteredRef.current = filtered; // keep ref in sync for keyboard handler
  const totalPages = Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const safePage   = Math.min(page,totalPages);
  const paginated  = filtered.slice((safePage-1)*PAGE_SIZE, safePage*PAGE_SIZE);

  const abertos  = cbs.filter(c=>c.status==="aberto");
  const risk     = abertos.reduce((s,c)=>s+c.valor,0);
  const done     = cbs.filter(c=>["ganho","perdido"].includes(c.status));
  const taxa     = done.length?Math.round(cbs.filter(c=>c.status==="ganho").length/done.length*100):0;
  const urgentes = abertos.filter(c=>c.prazo<=3);

  return (
    <div className="flex flex-col min-h-screen">
      <title>Chargebacks | PayScale Intelligence</title>
      <Topbar title="Chargebacks" subtitle="Gestão de disputas e contestações" />
      <main className="flex-1 p-5 lg:p-8 space-y-5" style={{background:"var(--bg)"}}>

        {/* KPIs — clicáveis para filtrar */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {label:"Abertos",        value:String(abertos.length),color:"var(--amber)", filterVal: "aberto"     as CBStatus|"all"},
            {label:"Valor em Risco", value:brl(risk),            color:"var(--red)",   filterVal: "aberto"     as CBStatus|"all"},
            {label:"Taxa de Sucesso",value:`${taxa}%`,           color:"var(--green)", filterVal: "ganho"      as CBStatus|"all"},
            {label:"Total no Mês",   value:String(cbs.length),   color:"var(--text)",  filterVal: "all"        as CBStatus|"all"},
          ].map(k=>{
            const isActive = filter === k.filterVal;
            return (
              <button key={k.label} onClick={() => { setFilter(k.filterVal); setPage(1); }}
                className="card p-5 text-left transition-all hover:opacity-80"
                style={{ outline: isActive ? `2px solid ${k.color}` : "none", outlineOffset: 2 }}>
                <p className="text-xs font-medium mb-3" style={{color:"var(--muted)"}}>{k.label}</p>
                <p className="text-2xl font-bold tabular-nums" style={{color:k.color}}>{k.value}</p>
                {isActive && <p className="text-[10px] mt-1 font-medium" style={{color:k.color}}>Filtro ativo →</p>}
              </button>
            );
          })}
        </div>

        {/* Urgent */}
        {urgentes.length>0&&(
          <div className="flex items-start gap-3 p-4 rounded-xl"
            style={{background:"var(--red-dim)",border:"1px solid rgba(220,38,38,0.25)"}}>
            <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{color:"var(--red)"}}/>
            <div>
              <p className="text-sm font-semibold" style={{color:"var(--red)"}}>Prazo crítico — ação necessária</p>
              <p className="text-xs mt-0.5" style={{color:"var(--red)"}}>
                {urgentes.map(c=>`${c.id} (${c.prazo} dia${c.prazo!==1?"s":""} restante${c.prazo!==1?"s":""})`).join(" · ")}
              </p>
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="space-y-3">
          {/* Search + Export row */}
          <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px" }}>
            <Search size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <input ref={searchRef} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por cliente, ID ou motivo... (/ ou ⌘F)"
              aria-label="Buscar chargebacks"
              className="bg-transparent outline-none text-xs flex-1"
              style={{ color: "var(--text)" }} />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }} aria-label="Limpar busca" className="hover:opacity-60 transition-opacity">
                <X size={13} style={{ color: "var(--muted)" }} />
              </button>
            )}
          </div>
          <button
            onClick={() => { exportChargebacksCSV(filtered); toast("Chargebacks exportados!"); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all shrink-0"
            style={{ background: "var(--blue)", color: "#fff" }}>
            <Download size={13} /> CSV
          </button>
          </div>

          {/* Status filters + sort */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["all","aberto","contestado","ganho","perdido"] as const).map(f=>(
              <button key={f} onClick={()=>{setFilter(f);setPage(1);}}
                aria-pressed={filter === f}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background:filter===f?"var(--blue)":"var(--surface-2)",
                  color:filter===f?"#fff":"var(--text-2)",
                  border:"1px solid var(--border)",
                  boxShadow:filter===f?"none":"0 1px 2px rgba(0,0,0,0.04)",
                }}>
                {f==="all"?"Todos":smap[f].label}
                {f!=="all"&&<span className="ml-1.5 opacity-70">{cbs.filter(c=>c.status===f).length}</span>}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-xs" style={{ color: "var(--muted)" }}>Ordenar:</span>
              {([
                { label: "Data",   key: "data"   as keyof CB },
                { label: "Valor",  key: "valor"  as keyof CB },
                { label: "Prazo",  key: "prazo"  as keyof CB },
              ]).map(s => (
                <button key={s.key} onClick={() => handleSort(s.key)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: sortKey === s.key ? "var(--blue-dim)" : "var(--surface-2)",
                    color:      sortKey === s.key ? "var(--blue)"     : "var(--text-2)",
                    border:     "1px solid var(--border)",
                  }}>
                  {s.label}
                  {sortKey === s.key && (
                    <span style={{ fontSize: 10 }}>{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="card divide-y" style={{borderColor:"var(--border)"}}>
          {paginated.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "var(--surface-2)" }}>
                <ShieldAlert size={20} style={{ color: "var(--muted)" }} />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>Nenhum chargeback encontrado</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {search ? "Tente buscar com outros termos." : "Não há registros para o filtro selecionado."}
              </p>
              {(search || filter !== "all") && (
                <button onClick={() => { setSearch(""); setFilter("all"); setPage(1); }}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{ border: "1px solid var(--border)", color: "var(--blue)" }}>
                  Limpar filtros
                </button>
              )}
            </div>
          ) : paginated.map(cb=>{
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
                  <div className="flex gap-2">
                    {cb.status==="aberto"&&(
                      <button onClick={() => setContestar(cb)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                        style={{background:"var(--blue)",color:"#fff"}}>Contestar</button>
                    )}
                    <button onClick={() => setDetalhes(cb)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all"
                      style={{border:"1px solid var(--border)",color:"var(--text-2)"}}>Detalhes</button>
                  </div>
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
                aria-label="Página anterior"
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
                aria-label="Próxima página"
                className="p-1.5 rounded-lg border transition-all disabled:opacity-30"
                style={{borderColor:"var(--border)",color:"var(--text-2)"}}>
                <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {detalhes  && <DetalhesModal   cb={detalhes}   onClose={() => setDetalhes(null)}   />}
      {contestar && <ContestarModal  cb={contestar}  onClose={() => { setContestar(null); toast("Para finalizar, acesse o painel do adquirente.", "info"); }} />}
    </div>
  );
}
