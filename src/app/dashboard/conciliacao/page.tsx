"use client";
import React, { useState, useMemo, useCallback } from "react";
import Topbar from "@/components/Topbar";
import { CheckCircle, AlertTriangle, XCircle, Search, Download, ArrowLeftRight, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, Copy, Check, X as XIcon } from "lucide-react";

type RecStatus = "ok" | "divergencia" | "sem_liquidacao";

interface Transacao {
  id: string; data: string; dataISO: string; descricao: string;
  adquirente: "PagSeguro" | "Mercado Pago"; tipo: string;
  valorBruto: number; tarifa: number; valorLiquido: number;
  status: RecStatus; observacao?: string;
}

const transacoes: Transacao[] = [
  { id: "TXN-001", data: "22/05", dataISO: "2026-05-22", descricao: "Venda #8821 — Loja Online",    adquirente: "PagSeguro",    tipo: "Crédito 1x",  valorBruto: 1200,  tarifa: 30.00,  valorLiquido: 1170.00,  status: "ok" },
  { id: "TXN-002", data: "22/05", dataISO: "2026-05-22", descricao: "Venda #8822 — Marketplace",    adquirente: "Mercado Pago", tipo: "Crédito 6x",  valorBruto: 3450,  tarifa: 110.40, valorLiquido: 3339.60,  status: "divergencia",    observacao: "Tarifa cobrada: R$ 138,00 (+R$ 27,60 acima do contratado)" },
  { id: "TXN-003", data: "21/05", dataISO: "2026-05-21", descricao: "Venda #8810 — App Mobile",     adquirente: "PagSeguro",    tipo: "Débito",      valorBruto: 890,   tarifa: 10.68,  valorLiquido: 879.32,   status: "ok" },
  { id: "TXN-004", data: "21/05", dataISO: "2026-05-21", descricao: "Venda #8805 — Loja Online",    adquirente: "Mercado Pago", tipo: "Crédito 12x", valorBruto: 2800,  tarifa: 106.40, valorLiquido: 2693.60,  status: "sem_liquidacao", observacao: "Venda não liquidada após 3 dias úteis" },
  { id: "TXN-005", data: "20/05", dataISO: "2026-05-20", descricao: "Venda #8799 — Marketplace",    adquirente: "PagSeguro",    tipo: "Crédito 2x",  valorBruto: 650,   tarifa: 19.50,  valorLiquido: 630.50,   status: "divergencia",    observacao: "Tarifa cobrada: R$ 25,35 (+R$ 5,85 acima do contratado)" },
  { id: "TXN-006", data: "20/05", dataISO: "2026-05-20", descricao: "Venda #8798 — App Mobile",     adquirente: "Mercado Pago", tipo: "Débito",      valorBruto: 320,   tarifa: 3.84,   valorLiquido: 316.16,   status: "ok" },
  { id: "TXN-007", data: "19/05", dataISO: "2026-05-19", descricao: "Venda #8791 — Loja Online",    adquirente: "PagSeguro",    tipo: "Crédito 1x",  valorBruto: 1580,  tarifa: 39.50,  valorLiquido: 1540.50,  status: "ok" },
  { id: "TXN-008", data: "19/05", dataISO: "2026-05-19", descricao: "Venda #8788 — Marketplace",    adquirente: "Mercado Pago", tipo: "Crédito 6x",  valorBruto: 4200,  tarifa: 159.60, valorLiquido: 4040.40,  status: "sem_liquidacao", observacao: "Aguardando confirmação do adquirente" },
  { id: "TXN-009", data: "18/05", dataISO: "2026-05-18", descricao: "Venda #8775 — Loja Online",    adquirente: "PagSeguro",    tipo: "PIX",         valorBruto: 540,   tarifa: 5.35,   valorLiquido: 534.65,   status: "ok" },
  { id: "TXN-010", data: "18/05", dataISO: "2026-05-18", descricao: "Venda #8770 — App Mobile",     adquirente: "Mercado Pago", tipo: "Crédito 1x",  valorBruto: 980,   tarifa: 24.50,  valorLiquido: 955.50,   status: "ok" },
  { id: "TXN-011", data: "17/05", dataISO: "2026-05-17", descricao: "Venda #8762 — Marketplace",    adquirente: "PagSeguro",    tipo: "Crédito 3x",  valorBruto: 1200,  tarifa: 36.00,  valorLiquido: 1164.00,  status: "divergencia",    observacao: "Tarifa cobrada: R$ 44,40 (+R$ 8,40 acima do contratado)" },
  { id: "TXN-012", data: "17/05", dataISO: "2026-05-17", descricao: "Venda #8758 — Loja Online",    adquirente: "Mercado Pago", tipo: "Débito",      valorBruto: 460,   tarifa: 5.52,   valorLiquido: 454.48,   status: "ok" },
];

const PAGE_SIZE = 5;

const statusMap: Record<RecStatus, { label: string; icon: React.ReactNode; badgeCls: string; bg: string; borderColor: string }> = {
  ok:             { label: "Conciliada",     icon: <CheckCircle size={13}/>,   badgeCls: "badge-green", bg: "rgba(0,204,136,0.05)",  borderColor: "rgba(0,204,136,0.15)" },
  divergencia:    { label: "Divergência",    icon: <AlertTriangle size={13}/>, badgeCls: "badge-amber", bg: "rgba(255,170,0,0.05)",  borderColor: "rgba(255,170,0,0.15)" },
  sem_liquidacao: { label: "Sem liquidação", icon: <XCircle size={13}/>,       badgeCls: "badge-red",   bg: "rgba(255,59,92,0.05)",  borderColor: "rgba(255,59,92,0.15)" },
};

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function exportCSV(rows: Transacao[]) {
  const header = ["ID", "Data", "Descrição", "Adquirente", "Tipo", "Valor Bruto", "Tarifa", "Líquido", "Status", "Observação"];
  const lines  = rows.map(t => [
    t.id, t.data, `"${t.descricao}"`, t.adquirente, t.tipo,
    t.valorBruto.toFixed(2).replace(".", ","),
    t.tarifa.toFixed(2).replace(".", ","),
    t.valorLiquido.toFixed(2).replace(".", ","),
    statusMap[t.status].label,
    t.observacao ? `"${t.observacao}"` : "",
  ].join(";"));
  const csv  = [header.join(";"), ...lines].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "conciliacao.csv"; a.click();
  URL.revokeObjectURL(url);
}

/* ── Detalhe Modal ─────────────────────────────────────── */
function DetalhesModal({ txn, onClose }: { txn: Transacao; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const sc = statusMap[txn.status];

  function copyId() {
    navigator.clipboard.writeText(txn.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Detalhes da Transação</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs font-bold" style={{ color: "var(--blue)" }}>{txn.id}</span>
              <button onClick={copyId}
                className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded transition-all"
                style={{ background: copied ? "var(--green-dim)" : "var(--surface-2)", color: copied ? "var(--green)" : "var(--muted)", border: "1px solid var(--border)" }}>
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? "Copiado!" : "Copiar ID"}
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: "var(--muted)" }}>
            <XIcon size={16} />
          </button>
        </div>

        {/* Status banner */}
        <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
          style={{ background: sc.bg, border: `1px solid ${sc.borderColor}`, color: txn.status === "ok" ? "var(--green)" : txn.status === "divergencia" ? "var(--amber)" : "var(--red)" }}>
          {sc.icon} {sc.label}
          {txn.observacao && <span className="ml-2 font-normal" style={{ color: "inherit", opacity: 0.85 }}>— {txn.observacao}</span>}
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-3">
          {[
            { label: "Descrição",    value: txn.descricao },
            { label: "Adquirente",  value: txn.adquirente },
            { label: "Tipo",        value: txn.tipo },
            { label: "Data",        value: txn.data },
            { label: "Valor Bruto", value: brl(txn.valorBruto) },
            { label: "Tarifa",      value: `−${brl(txn.tarifa)}` },
            { label: "Valor Líquido", value: brl(txn.valorLiquido) },
          ].map(f => (
            <div key={f.label} className="flex items-start justify-between gap-4">
              <span className="text-xs shrink-0" style={{ color: "var(--muted)", minWidth: 100 }}>{f.label}</span>
              <span className="text-xs font-medium text-right" style={{ color: "var(--text)" }}>{f.value}</span>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConciliacaoPage() {
  const [filterStatus, setFilterStatus] = useState<RecStatus | "all">("all");
  const [search,   setSearch]   = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [page,     setPage]     = useState(1);
  const [sortKey,  setSortKey]  = useState<keyof Transacao | null>(null);
  const [sortDir,  setSortDir]  = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Transacao | null>(null);
  const openModal  = useCallback((t: Transacao) => setSelected(t), []);
  const closeModal = useCallback(() => setSelected(null), []);

  function handleSort(key: keyof Transacao) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key); setSortDir("asc");
    }
    setPage(1);
  }

  function SortIcon({ col }: { col: keyof Transacao }) {
    if (sortKey !== col) return <ChevronsUpDown size={11} className="inline ml-1 opacity-30" />;
    return sortDir === "asc"
      ? <ChevronUp size={11} className="inline ml-1" style={{ color: "var(--blue)" }} />
      : <ChevronDown size={11} className="inline ml-1" style={{ color: "var(--blue)" }} />;
  }

  const filtered = useMemo(() => {
    const base = transacoes.filter(t => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchSearch = t.descricao.toLowerCase().includes(search.toLowerCase()) ||
                        t.id.toLowerCase().includes(search.toLowerCase());
      const matchFrom   = !dateFrom || t.dataISO >= dateFrom;
      const matchTo     = !dateTo   || t.dataISO <= dateTo;
      return matchStatus && matchSearch && matchFrom && matchTo;
    });
    if (!sortKey) return base;
    return [...base].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), "pt-BR");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filterStatus, search, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function applyFilter(f: RecStatus | "all") { setFilterStatus(f); setPage(1); }
  function applySearch(s: string)            { setSearch(s);       setPage(1); }
  function applyFrom(s: string)              { setDateFrom(s);     setPage(1); }
  function applyTo(s: string)               { setDateTo(s);       setPage(1); }

  const counts = {
    ok:             transacoes.filter(t => t.status === "ok").length,
    divergencia:    transacoes.filter(t => t.status === "divergencia").length,
    sem_liquidacao: transacoes.filter(t => t.status === "sem_liquidacao").length,
  };

  const totals = useMemo(() => ({
    bruto:   filtered.reduce((s, t) => s + t.valorBruto,   0),
    tarifa:  filtered.reduce((s, t) => s + t.tarifa,       0),
    liquido: filtered.reduce((s, t) => s + t.valorLiquido, 0),
  }), [filtered]);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Conciliação" subtitle="Cruzamento de vendas vs. liquidações dos adquirentes" />

      <main className="flex-1 p-4 lg:p-8 space-y-5">
        {/* KPIs — clicáveis para filtrar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total",          value: String(transacoes.length),    icon: <ArrowLeftRight size={18}/>, color: "var(--blue)",  bg: "var(--blue-dim)",  filterVal: "all"           as RecStatus|"all" },
            { label: "Conciliadas",    value: String(counts.ok),            icon: <CheckCircle size={18}/>,   color: "var(--green)", bg: "var(--green-dim)", filterVal: "ok"            as RecStatus|"all" },
            { label: "Divergências",   value: String(counts.divergencia),   icon: <AlertTriangle size={18}/>, color: "var(--amber)", bg: "var(--amber-dim)", filterVal: "divergencia"   as RecStatus|"all" },
            { label: "Sem liquidação", value: String(counts.sem_liquidacao),icon: <XCircle size={18}/>,       color: "var(--red)",   bg: "var(--red-dim)",   filterVal: "sem_liquidacao" as RecStatus|"all" },
          ].map(k => {
            const isActive = filterStatus === k.filterVal;
            return (
            <button key={k.label} onClick={() => applyFilter(k.filterVal)} className="card p-4 text-left transition-all hover:opacity-80"
              style={{ outline: isActive ? `2px solid ${k.color}` : "none", outlineOffset: 2 }}>
              <div className="icon-box mb-3" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
              <div className="text-2xl font-bold tabular-nums" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{k.label}</div>
            </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px" }}>
              <Search size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />
              <input value={search} onChange={e => applySearch(e.target.value)}
                placeholder="Buscar por ID ou descrição..."
                className="bg-transparent outline-none text-xs flex-1 min-w-0"
                style={{ color: "var(--text)" }} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input type="date" value={dateFrom} onChange={e => applyFrom(e.target.value)}
                className="input-base text-xs" style={{ width: 140, padding: "8px 10px" }} />
              <span className="text-xs" style={{ color: "var(--muted)" }}>até</span>
              <input type="date" value={dateTo} onChange={e => applyTo(e.target.value)}
                className="input-base text-xs" style={{ width: 140, padding: "8px 10px" }} />
              {(dateFrom || dateTo) && (
                <button onClick={() => { applyFrom(""); applyTo(""); }}
                  className="text-xs px-2 py-1.5 rounded-lg transition-all"
                  style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
                  Limpar
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "ok", "divergencia", "sem_liquidacao"] as const).map(f => (
              <button key={f} onClick={() => applyFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: filterStatus === f ? "var(--blue-dim)" : "var(--surface-2)",
                  color:      filterStatus === f ? "var(--blue)"     : "var(--text-2)",
                  border:     filterStatus === f ? "1px solid rgba(68,136,255,0.3)" : "1px solid var(--border)",
                }}>
                {f === "all" ? "Todos" : statusMap[f].label}
                {f !== "all" && <span className="ml-1.5 opacity-60">{counts[f]}</span>}
              </button>
            ))}
            <button onClick={() => exportCSV(filtered)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all hover:opacity-80 ml-auto"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
              <Download size={13} /> Exportar CSV
            </button>
          </div>
        </div>

        {/* Mobile card list — hidden on md+ */}
        <div className="md:hidden space-y-2">
          {paginated.length === 0 ? (
            <div className="card px-5 py-10 text-center text-xs" style={{ color: "var(--muted)" }}>
              Nenhuma transação encontrada.
            </div>
          ) : paginated.map(t => {
            const sc = statusMap[t.status];
            return (
              <button key={t.id} onClick={() => openModal(t)} className="card w-full p-4 text-left space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold" style={{ color: "var(--blue)" }}>{t.id}</span>
                  <span className={`badge ${sc.badgeCls} shrink-0`}>{sc.icon}{sc.label}</span>
                </div>
                <p className="text-xs" style={{ color: "var(--text)" }}>{t.descricao}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span style={{ color: "var(--muted)" }}>{t.data} · {t.tipo}</span>
                  <span className={`badge ${t.adquirente === "PagSeguro" ? "badge-amber" : "badge-blue"}`}>{t.adquirente}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--muted)" }}>Bruto: <span style={{ color: "var(--text)", fontWeight: 600 }}>{brl(t.valorBruto)}</span></span>
                  <span style={{ color: "var(--muted)" }}>Líquido: <span style={{ color: "var(--green)", fontWeight: 700 }}>{brl(t.valorLiquido)}</span></span>
                </div>
                {t.observacao && (
                  <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg text-xs"
                    style={{ background: sc.bg, border: `1px solid ${sc.borderColor}`, color: t.status === "divergencia" ? "var(--amber)" : "var(--red)" }}>
                    <AlertTriangle size={11} className="shrink-0 mt-0.5" /> {t.observacao}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Table — hidden on mobile */}
        <div className="card overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                  {([
                    { label: "ID",         key: "id"          },
                    { label: "Data",       key: "dataISO"     },
                    { label: "Descrição",  key: "descricao"   },
                    { label: "Adquirente", key: "adquirente"  },
                    { label: "Tipo",       key: "tipo"        },
                    { label: "Valor Bruto",key: "valorBruto"  },
                    { label: "Tarifa",     key: "tarifa"      },
                    { label: "Líquido",    key: "valorLiquido"},
                    { label: "Status",     key: "status"      },
                  ] as { label: string; key: keyof Transacao }[]).map(h => (
                    <th key={h.key}
                      onClick={() => handleSort(h.key)}
                      className="px-4 py-3 text-left font-semibold whitespace-nowrap cursor-pointer select-none hover:opacity-75 transition-opacity"
                      style={{ color: sortKey === h.key ? "var(--blue)" : "var(--muted)" }}>
                      {h.label}<SortIcon col={h.key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-xs" style={{ color: "var(--muted)" }}>
                      Nenhuma transação encontrada para os filtros aplicados.
                    </td>
                  </tr>
                ) : paginated.map(t => {
                  const sc = statusMap[t.status];
                  return (
                    <React.Fragment key={t.id}>
                      <tr onClick={() => openModal(t)}
                        style={{ borderBottom: t.observacao ? "none" : "1px solid var(--border)", cursor: "pointer" }}
                        className="hover:bg-[var(--surface-2)] transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold" style={{ color: "var(--blue)" }}>{t.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted)" }}>{t.data}</td>
                        <td className="px-4 py-3 max-w-[200px] truncate" style={{ color: "var(--text)" }}>{t.descricao}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${t.adquirente === "PagSeguro" ? "badge-amber" : "badge-blue"}`}>{t.adquirente}</span>
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
              {filtered.length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: "2px solid var(--border)", background: "var(--surface-2)" }}>
                    <td colSpan={5} className="px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--muted)" }}>
                      Total ({filtered.length} transações)
                    </td>
                    <td className="px-4 py-2.5 text-xs font-bold tabular-nums" style={{ color: "var(--text)" }}>{brl(totals.bruto)}</td>
                    <td className="px-4 py-2.5 text-xs font-bold tabular-nums" style={{ color: "var(--red)" }}>−{brl(totals.tarifa)}</td>
                    <td className="px-4 py-2.5 text-xs font-bold tabular-nums" style={{ color: "var(--green)" }}>{brl(totals.liquido)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

        </div>

        {/* Pagination — shared for both mobile and desktop */}
        <div className="card flex items-center justify-between px-4 py-3"
          style={{ background: "var(--surface-2)" }}>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {filtered.length === 0
              ? "0 registros"
              : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} de ${filtered.length}`}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
              className="p-1.5 rounded-lg transition-all disabled:opacity-30"
              style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: safePage === n ? "var(--blue)" : "transparent",
                  color:      safePage === n ? "#fff"        : "var(--text-2)",
                  border:     safePage === n ? "none"        : "1px solid var(--border)",
                }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              className="p-1.5 rounded-lg transition-all disabled:opacity-30"
              style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </main>

      {selected && <DetalhesModal txn={selected} onClose={closeModal} />}
    </div>
  );
}
