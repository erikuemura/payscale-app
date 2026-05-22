"use client";
import React, { useState } from "react";
import Topbar from "@/components/Topbar";
import { CheckCircle, AlertTriangle, XCircle, Search, Download, ArrowLeftRight } from "lucide-react";

type RecStatus = "ok" | "divergencia" | "sem_liquidacao";

interface Transacao {
  id: string; data: string; descricao: string;
  adquirente: "PagSeguro" | "Mercado Pago"; tipo: string;
  valorBruto: number; tarifa: number; valorLiquido: number;
  status: RecStatus; observacao?: string;
}

const transacoes: Transacao[] = [
  { id: "TXN-001", data: "22/05", descricao: "Venda #8821 — Loja Online",    adquirente: "PagSeguro",    tipo: "Crédito 1x",  valorBruto: 1200,  tarifa: 30.00,  valorLiquido: 1170.00,  status: "ok" },
  { id: "TXN-002", data: "22/05", descricao: "Venda #8822 — Marketplace",    adquirente: "Mercado Pago", tipo: "Crédito 6x",  valorBruto: 3450,  tarifa: 110.40, valorLiquido: 3339.60,  status: "divergencia",    observacao: "Tarifa cobrada: R$ 138,00 (+R$ 27,60 acima do contratado)" },
  { id: "TXN-003", data: "21/05", descricao: "Venda #8810 — App Mobile",     adquirente: "PagSeguro",    tipo: "Débito",      valorBruto: 890,   tarifa: 10.68,  valorLiquido: 879.32,   status: "ok" },
  { id: "TXN-004", data: "21/05", descricao: "Venda #8805 — Loja Online",    adquirente: "Mercado Pago", tipo: "Crédito 12x", valorBruto: 2800,  tarifa: 106.40, valorLiquido: 2693.60,  status: "sem_liquidacao", observacao: "Venda não liquidada após 3 dias úteis" },
  { id: "TXN-005", data: "20/05", descricao: "Venda #8799 — Marketplace",    adquirente: "PagSeguro",    tipo: "Crédito 2x",  valorBruto: 650,   tarifa: 19.50,  valorLiquido: 630.50,   status: "divergencia",    observacao: "Tarifa cobrada: R$ 25,35 (+R$ 5,85 acima do contratado)" },
  { id: "TXN-006", data: "20/05", descricao: "Venda #8798 — App Mobile",     adquirente: "Mercado Pago", tipo: "Débito",      valorBruto: 320,   tarifa: 3.84,   valorLiquido: 316.16,   status: "ok" },
  { id: "TXN-007", data: "19/05", descricao: "Venda #8791 — Loja Online",    adquirente: "PagSeguro",    tipo: "Crédito 1x",  valorBruto: 1580,  tarifa: 39.50,  valorLiquido: 1540.50,  status: "ok" },
  { id: "TXN-008", data: "19/05", descricao: "Venda #8788 — Marketplace",    adquirente: "Mercado Pago", tipo: "Crédito 6x",  valorBruto: 4200,  tarifa: 159.60, valorLiquido: 4040.40,  status: "sem_liquidacao", observacao: "Aguardando confirmação do adquirente" },
];

const statusMap: Record<RecStatus, { label: string; icon: React.ReactNode; badgeCls: string; bg: string; borderColor: string }> = {
  ok:             { label: "Conciliada",     icon: <CheckCircle size={13}/>,  badgeCls: "badge-green", bg: "rgba(0,204,136,0.05)",  borderColor: "rgba(0,204,136,0.15)" },
  divergencia:    { label: "Divergência",    icon: <AlertTriangle size={13}/>, badgeCls: "badge-amber", bg: "rgba(255,170,0,0.05)",  borderColor: "rgba(255,170,0,0.15)" },
  sem_liquidacao: { label: "Sem liquidação", icon: <XCircle size={13}/>,      badgeCls: "badge-red",   bg: "rgba(255,59,92,0.05)",  borderColor: "rgba(255,59,92,0.15)" },
};

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ConciliacaoPage() {
  const [filterStatus, setFilterStatus] = useState<RecStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = transacoes.filter(t => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchSearch = t.descricao.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    ok:             transacoes.filter(t => t.status === "ok").length,
    divergencia:    transacoes.filter(t => t.status === "divergencia").length,
    sem_liquidacao: transacoes.filter(t => t.status === "sem_liquidacao").length,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Conciliação" subtitle="Cruzamento de vendas vs. liquidações dos adquirentes" />

      <main className="flex-1 p-4 lg:p-8 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total",            value: String(transacoes.length), icon: <ArrowLeftRight size={18}/>, color: "var(--blue)",  bg: "var(--blue-dim)" },
            { label: "Conciliadas",      value: String(counts.ok),         icon: <CheckCircle size={18}/>,   color: "var(--green)", bg: "var(--green-dim)" },
            { label: "Divergências",     value: String(counts.divergencia), icon: <AlertTriangle size={18}/>,color: "var(--amber)", bg: "var(--amber-dim)" },
            { label: "Sem liquidação",   value: String(counts.sem_liquidacao), icon: <XCircle size={18}/>,  color: "var(--red)",   bg: "var(--red-dim)" },
          ].map(k => (
            <div key={k.label} className="card p-4">
              <div className="icon-box mb-3" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
              <div className="text-2xl font-bold tabular-nums" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px" }}>
            <Search size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por ID ou descrição..."
              className="bg-transparent outline-none text-xs flex-1 min-w-0"
              style={{ color: "var(--text)" }} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "ok", "divergencia", "sem_liquidacao"] as const).map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: filterStatus === f ? "var(--blue-dim)" : "var(--surface-2)",
                  color: filterStatus === f ? "var(--blue)" : "var(--text-2)",
                  border: filterStatus === f ? "1px solid rgba(68,136,255,0.3)" : "1px solid var(--border)",
                }}>
                {f === "all" ? "Todos" : statusMap[f].label}
                {f !== "all" && <span className="ml-1.5 opacity-60">{counts[f]}</span>}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all hover:opacity-80 sm:ml-auto"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
            <Download size={13} /> Exportar CSV
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                  {["ID", "Data", "Descrição", "Adquirente", "Tipo", "Valor Bruto", "Tarifa", "Líquido", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap" style={{ color: "var(--muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const sc = statusMap[t.status];
                  return (
                    <React.Fragment key={t.id}>
                      <tr style={{ borderBottom: t.observacao ? "none" : "1px solid var(--border)" }}
                        className="hover:bg-[var(--surface-2)] transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold" style={{ color: "var(--blue)" }}>{t.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted)" }}>{t.data}</td>
                        <td className="px-4 py-3 max-w-[200px] truncate" style={{ color: "var(--text)" }}>{t.descricao}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${t.adquirente === "PagSeguro" ? "badge-amber" : "badge-blue"}`}>
                            {t.adquirente}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-2)" }}>{t.tipo}</td>
                        <td className="px-4 py-3 font-medium tabular-nums whitespace-nowrap" style={{ color: "var(--text)" }}>{brl(t.valorBruto)}</td>
                        <td className="px-4 py-3 font-medium tabular-nums whitespace-nowrap" style={{ color: "var(--red)" }}>−{brl(t.tarifa)}</td>
                        <td className="px-4 py-3 font-semibold tabular-nums whitespace-nowrap" style={{ color: "var(--green)" }}>{brl(t.valorLiquido)}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${sc.badgeCls} whitespace-nowrap`}>{sc.icon}{sc.label}</span>
                        </td>
                      </tr>
                      {t.observacao && (
                        <tr key={`obs-${t.id}`} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td colSpan={9} className="px-4 pb-3">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                              style={{ background: sc.bg, border: `1px solid ${sc.borderColor}`, color: t.status === "divergencia" ? "var(--amber)" : "var(--red)" }}>
                              <AlertTriangle size={11} className="shrink-0" /> {t.observacao}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
