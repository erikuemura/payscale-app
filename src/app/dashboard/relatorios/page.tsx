"use client";
import { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/Topbar";
import { Download, FileText, TrendingUp, AlertTriangle, ShieldAlert, BarChart3, Mail, X as XIcon, Plus, Trash2, Printer } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/lib/supabase/client";
import type { Transaction, Chargeback } from "@/lib/supabase/types";

const MODALITY_LABEL: Record<string, string> = {
  debito: "Débito", credito_1x: "Crédito 1x", credito_2x: "Crédito 2x",
  credito_3x: "Crédito 3x", credito_6x: "Crédito 6x", credito_12x: "Crédito 12x",
  pix: "PIX", boleto: "Boleto",
};
const PROVIDER_LABEL: Record<string, string> = {
  pagseguro: "PagSeguro", mercadopago: "Mercado Pago", stone: "Stone", cielo: "Cielo",
};
const STATUS_LABEL: Record<string, string> = {
  settled: "Conciliado", divergent: "Divergência", no_settlement: "Sem liquidação", pending: "Pendente",
};
const CB_STATUS_LABEL: Record<string, string> = {
  aberto: "Aberto", contestado: "Contestado", ganho: "Ganho", perdido: "Perdido",
};

const fmt2 = (n: number) => n.toFixed(2).replace(".", ",");
const bom  = "﻿";

/* ── Geradores de CSV reais ── */
function buildConciliacaoCSV(txns: Transaction[]): string {
  const header = "ID;Data;Descrição;Adquirente;Modalidade;Valor Bruto;Tarifa (R$);Líquido;Status;Observação";
  const rows = txns.map(t => {
    const fee = t.mdr_charged != null
      ? Number(t.amount) * Number(t.mdr_charged) / 100
      : Number(t.amount) - Number(t.net_amount ?? t.amount);
    return [
      t.external_id,
      t.date,
      `"${(t.metadata as Record<string,string>)?.descricao ?? t.external_id}"`,
      PROVIDER_LABEL[t.provider] ?? t.provider,
      MODALITY_LABEL[t.modality ?? ""] ?? (t.modality ?? "—"),
      fmt2(Number(t.amount)),
      fmt2(fee),
      fmt2(Number(t.net_amount ?? t.amount)),
      STATUS_LABEL[t.status] ?? t.status,
      `"${(t.metadata as Record<string,string>)?.observacao ?? ""}"`,
    ].join(";");
  });
  return bom + [header, ...rows].join("\n");
}

function buildMdrCSV(txns: Transaction[]): string {
  const map: Record<string, { rates: number[]; charged: number[]; vol: number }> = {};
  txns.forEach(t => {
    const key = t.modality ?? "outros";
    if (!map[key]) map[key] = { rates: [], charged: [], vol: 0 };
    if (t.mdr_rate)    map[key].rates.push(Number(t.mdr_rate));
    if (t.mdr_charged) map[key].charged.push(Number(t.mdr_charged));
    map[key].vol += Number(t.amount);
  });
  const header = "Modalidade;Volume (R$);MDR Contratado (%);MDR Cobrado (%);Desvio (%);Status";
  const rows = Object.entries(map).map(([key, v]) => {
    const avgC = v.rates.length    ? v.rates.reduce((a,b)=>a+b)/v.rates.length       : 0;
    const avgR = v.charged.length  ? v.charged.reduce((a,b)=>a+b)/v.charged.length   : 0;
    const dev  = Math.max(0, avgR - avgC);
    return [
      MODALITY_LABEL[key] ?? key,
      fmt2(v.vol),
      fmt2(avgC),
      fmt2(avgR),
      dev > 0 ? `+${fmt2(dev)}` : "0,00",
      dev === 0 ? "OK" : "Indevida",
    ].join(";");
  });
  return bom + [header, ...rows].join("\n");
}

function buildChargebacksCSV(cbs: Chargeback[]): string {
  const header = "ID;Data;Cliente;Adquirente;Motivo;Valor;Prazo (dias);Status";
  const rows = cbs.map(cb => [
    cb.external_id ?? cb.id.slice(0, 8),
    cb.opened_at ?? cb.created_at.slice(0, 10),
    `"${cb.customer_name ?? "—"}"`,
    PROVIDER_LABEL[cb.provider] ?? cb.provider,
    `"${cb.reason ?? "—"}"`,
    fmt2(Number(cb.amount)),
    cb.deadline_days ?? 0,
    CB_STATUS_LABEL[cb.status] ?? cb.status,
  ].join(";"));
  return bom + [header, ...rows].join("\n");
}

function triggerDownload(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

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

interface EmailConfig {
  label:    string;
  freq:     string;
  emails:   string[];
  active:   boolean;
}

const FREQ_OPTIONS = ["Diário", "Semanal", "Quinzenal", "Mensal"];

function EmailConfigModal({ onClose, onSave }: { onClose: () => void; onSave: (c: EmailConfig[]) => void }) {
  const [configs, setConfigs] = useState<EmailConfig[]>([
    { label: "Conciliação",    freq: "Mensal",    emails: ["financeiro@empresa.com.br"], active: true  },
    { label: "Auditoria MDR",  freq: "Quinzenal", emails: ["financeiro@empresa.com.br"], active: true  },
    { label: "Chargebacks",    freq: "Semanal",   emails: [],                            active: false },
  ]);
  const [newEmail, setNewEmail] = useState<Record<number, string>>({});

  function toggleActive(i: number) {
    setConfigs(c => c.map((item, idx) => idx === i ? { ...item, active: !item.active } : item));
  }
  function setFreq(i: number, freq: string) {
    setConfigs(c => c.map((item, idx) => idx === i ? { ...item, freq } : item));
  }
  function addEmail(i: number) {
    const e = (newEmail[i] ?? "").trim();
    if (!e || !e.includes("@")) return;
    setConfigs(c => c.map((item, idx) => idx === i ? { ...item, emails: [...item.emails, e] } : item));
    setNewEmail(prev => ({ ...prev, [i]: "" }));
  }
  function removeEmail(i: number, ei: number) {
    setConfigs(c => c.map((item, idx) => idx === i ? { ...item, emails: item.emails.filter((_, j) => j !== ei) } : item));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Configurar envio automático por e-mail" className="card w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <Mail size={15} style={{ color: "var(--blue)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Envio Automático por E-mail</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "var(--muted)" }}>
            <XIcon size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {configs.map((cfg, i) => (
            <div key={cfg.label} className="rounded-xl p-4 space-y-3"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              {/* Row 1: label + toggle */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{cfg.label}</p>
                <button onClick={() => toggleActive(i)}
                  role="switch" aria-checked={cfg.active}
                  aria-label={`${cfg.label} — envio automático`}
                  className="relative w-9 h-5 rounded-full transition-colors shrink-0"
                  style={{ background: cfg.active ? "var(--blue)" : "var(--border-2)" }}>
                  <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                    style={{ left: cfg.active ? "calc(100% - 18px)" : "2px" }} />
                </button>
              </div>

              {cfg.active && (
                <>
                  {/* Frequência */}
                  <div>
                    <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Frequência</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {FREQ_OPTIONS.map(f => (
                        <button key={f} onClick={() => setFreq(i, f)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                          style={{
                            background: cfg.freq === f ? "var(--blue-dim)" : "var(--surface)",
                            color:      cfg.freq === f ? "var(--blue)"     : "var(--text-2)",
                            border:     cfg.freq === f ? "1px solid rgba(37,99,235,0.3)" : "1px solid var(--border)",
                          }}>{f}</button>
                      ))}
                    </div>
                  </div>

                  {/* Destinatários */}
                  <div>
                    <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Destinatários</label>
                    <div className="space-y-1">
                      {cfg.emails.map((em, ei) => (
                        <div key={ei} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg"
                          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                          <span className="text-xs" style={{ color: "var(--text)" }}>{em}</span>
                          <button onClick={() => removeEmail(i, ei)} style={{ color: "var(--muted)" }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={newEmail[i] ?? ""}
                          onChange={e => setNewEmail(prev => ({ ...prev, [i]: e.target.value }))}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addEmail(i); } }}
                          placeholder="email@empresa.com"
                          className="input-base text-xs py-1.5 flex-1"
                        />
                        <button onClick={() => addEmail(i)}
                          className="px-2.5 rounded-lg text-xs font-medium transition-all"
                          style={{ background: "var(--blue-dim)", color: "var(--blue)", border: "1px solid rgba(37,99,235,0.2)" }}>
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>Cancelar</button>
          <button onClick={() => { onSave(configs); onClose(); }}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
            style={{ background: "var(--blue)", color: "#fff" }}>Salvar configuração</button>
        </div>
      </div>
    </div>
  );
}

export default function RelatoriosPage() {
  const { toast } = useToast();
  const [emailModal, setEmailModal] = useState(false);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [cbs,  setCbs]  = useState<Chargeback[]>([]);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [txRes, cbRes] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", user.id),
      supabase.from("chargebacks").select("*").eq("user_id", user.id),
    ]);
    setTxns((txRes.data ?? []) as Transaction[]);
    setCbs((cbRes.data ?? []) as Chargeback[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const now = new Date();
  const monthLabel = now.toLocaleString("pt-BR", { month: "long", year: "numeric" })
    .replace(/^\w/, c => c.toUpperCase());

  function handleExport(id: string, title: string) {
    let csv = "";
    const slug = `${id}_${now.getFullYear()}_${String(now.getMonth()+1).padStart(2,"0")}`;
    if (id === "conciliacao") csv = buildConciliacaoCSV(txns);
    else if (id === "mdr")    csv = buildMdrCSV(txns);
    else if (id === "chargebacks") csv = buildChargebacksCSV(cbs);
    else {
      // Saúde financeira — agrega por semana
      const header = "Semana;Volume Total;Receita Líquida;MDR Efetivo (%)";
      const weekMap: Record<number, { vol: number; net: number; fees: number; n: number }> = {};
      txns.forEach(t => {
        const wk = Math.ceil(new Date(t.date).getDate() / 7);
        if (!weekMap[wk]) weekMap[wk] = { vol: 0, net: 0, fees: 0, n: 0 };
        weekMap[wk].vol += Number(t.amount);
        weekMap[wk].net += Number(t.net_amount ?? t.amount);
        if (t.mdr_charged) { weekMap[wk].fees += Number(t.mdr_charged); weekMap[wk].n++; }
      });
      const rows = Object.entries(weekMap).map(([wk, v]) => [
        `Semana ${wk}`,
        fmt2(v.vol),
        fmt2(v.net),
        v.n > 0 ? fmt2(v.fees / v.n) : "0,00",
      ].join(";"));
      csv = bom + [header, ...rows].join("\n");
    }
    if (!csv) { toast("Sem dados para exportar. Conecte um adquirente primeiro.", "info"); return; }
    triggerDownload(csv, `${slug}.csv`);
    toast(`${title} exportado com sucesso!`);
  }

  const months = {
    conciliacao: monthLabel, mdr: monthLabel,
    chargebacks: monthLabel, saude: monthLabel,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <title>Relatórios | PayScale Intelligence</title>
      <Topbar title="Relatórios" subtitle="Gere e exporte relatórios financeiros completos"/>
      <main className="flex-1 p-5 lg:p-8 space-y-6" style={{background:"var(--bg)"}}>

        {/* Generate */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{color:"var(--text)"}}>Gerar Relatório</p>
            <button onClick={() => window.print()}
              className="no-print flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all"
              style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
              <Printer size={13}/> Imprimir página
            </button>
          </div>
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
                    <span className="text-xs px-2 py-1 rounded-lg"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                      {months[r.id as keyof typeof months]}
                    </span>
                    <button
                      onClick={() => handleExport(r.id, r.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
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
              <table className="w-full text-xs" aria-label="Histórico de relatórios">
                <thead>
                  <tr style={{background:"var(--surface-2)",borderBottom:"1px solid var(--border)"}}>
                    {["Relatório","Gerado em","Tamanho",""].map(h=>(
                      <th key={h} className="px-5 py-3 text-left font-semibold" style={{color:"var(--muted)"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hist.map((r,i)=>(
                    <tr key={i} style={{borderTop:"1px solid var(--border)",background:i%2===0?"var(--surface)":"var(--surface-2)"}}
                      className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2" style={{color:"var(--text)"}}>
                          <FileText size={13} style={{color:"var(--muted)",flexShrink:0}}/>{r.name}
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap" style={{color:"var(--muted)"}}>{r.date}</td>
                      <td className="px-5 py-3" style={{color:"var(--muted)"}}>{r.size}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => {
                            const id = r.name.toLowerCase().includes("concilia") ? "conciliacao"
                              : r.name.toLowerCase().includes("mdr") ? "mdr"
                              : r.name.toLowerCase().includes("chargeback") ? "chargebacks"
                              : "saude";
                            handleExport(id, r.name);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-50 transition-all"
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
            <button onClick={() => setEmailModal(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all shrink-0"
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

      {emailModal && (
        <EmailConfigModal
          onClose={() => setEmailModal(false)}
          onSave={() => { toast("Configuração de e-mail salva!", "success"); }}
        />
      )}
    </div>
  );
}
