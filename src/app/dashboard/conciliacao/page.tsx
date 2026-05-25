"use client";
import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Topbar from "@/components/Topbar";
import {
  CheckCircle, AlertTriangle, XCircle, Search, Download,
  ArrowLeftRight, ChevronLeft, ChevronRight, ChevronsUpDown,
  ChevronUp, ChevronDown, Copy, Check, X as XIcon, Loader2, Zap,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/lib/supabase/types";
import Link from "next/link";

/* ─── Tipos ────────────────────────────────────────────── */
type RecStatus = "ok" | "divergencia" | "sem_liquidacao";

interface Transacao {
  id: string;           // external_id
  dbId: string;         // uuid do DB
  data: string;         // "22/05"
  dataISO: string;      // "2026-05-22"
  descricao: string;
  adquirente: string;
  tipo: string;
  valorBruto: number;
  tarifa: number;
  valorLiquido: number;
  status: RecStatus;
  observacao?: string;
}

const PAGE_SIZE = 10;

const statusMap: Record<RecStatus, {
  label: string; icon: React.ReactNode; badgeCls: string;
  bg: string; borderColor: string;
}> = {
  ok:             { label: "Conciliada",     icon: <CheckCircle size={13}/>,   badgeCls: "badge-green", bg: "rgba(0,204,136,0.05)",  borderColor: "rgba(0,204,136,0.15)"  },
  divergencia:    { label: "Divergência",    icon: <AlertTriangle size={13}/>, badgeCls: "badge-amber", bg: "rgba(255,170,0,0.05)",  borderColor: "rgba(255,170,0,0.15)"  },
  sem_liquidacao: { label: "Sem liquidação", icon: <XCircle size={13}/>,       badgeCls: "badge-red",   bg: "rgba(255,59,92,0.05)",  borderColor: "rgba(255,59,92,0.15)"  },
};

const MODALITY_LABEL: Record<string, string> = {
  debito: "Débito", credito_1x: "Crédito 1x", credito_2x: "Crédito 2x",
  credito_3x: "Crédito 3x", credito_6x: "Crédito 6x", credito_12x: "Crédito 12x",
  pix: "PIX", boleto: "Boleto",
};

const PROVIDER_LABEL: Record<string, string> = {
  pagseguro: "PagSeguro", mercadopago: "Mercado Pago",
  stone: "Stone", cielo: "Cielo", rede: "Rede", getnet: "Getnet",
};

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ─── Converter DB → UI ─────────────────────────────────── */
function mapStatus(dbStatus: string): RecStatus {
  if (dbStatus === "settled")       return "ok";
  if (dbStatus === "divergent")     return "divergencia";
  if (dbStatus === "no_settlement") return "sem_liquidacao";
  return "ok"; // pending → ok por enquanto
}

function mapTransaction(t: Transaction): Transacao {
  const date = new Date(t.date + "T00:00:00");
  const dd   = String(date.getDate()).padStart(2, "0");
  const mm   = String(date.getMonth() + 1).padStart(2, "0");
  const fee  = t.mdr_charged != null
    ? (t.amount * t.mdr_charged) / 100
    : (t.amount - (t.net_amount ?? t.amount));

  return {
    id:          t.external_id,
    dbId:        t.id,
    data:        `${dd}/${mm}`,
    dataISO:     t.date,
    descricao:   (t.metadata as Record<string,string>)?.descricao ?? `Transação ${t.external_id}`,
    adquirente:  PROVIDER_LABEL[t.provider] ?? t.provider,
    tipo:        MODALITY_LABEL[t.modality ?? ""] ?? (t.modality ?? "—"),
    valorBruto:  Number(t.amount),
    tarifa:      Number(fee.toFixed(2)),
    valorLiquido: Number(t.net_amount ?? t.amount),
    status:      mapStatus(t.status),
    observacao:  (t.metadata as Record<string,string>)?.observacao ?? undefined,
  };
}

/* ─── Export CSV ────────────────────────────────────────── */
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
  const a    = document.createElement("a"); a.href = url; a.download = "conciliacao.csv"; a.click();
  URL.revokeObjectURL(url);
}

/* ─── Modal de detalhes ─────────────────────────────────── */
function DetalhesModal({ txn, onClose }: { txn: Transacao; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const sc = statusMap[txn.status];

  function copyId() {
    navigator.clipboard.writeText(txn.id).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Detalhes da transação"
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Detalhes da Transação</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{txn.descricao}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar"
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "var(--muted)" }}>
            <XIcon size={15} />
          </button>
        </div>
        {/* Body */}
        <div className="p-5 space-y-4">
          {/* ID + status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold" style={{ color: "var(--blue)" }}>{txn.id}</span>
              <button onClick={copyId} aria-label="Copiar ID" className="hover:opacity-60 transition-opacity">
                {copied ? <Check size={12} style={{ color: "var(--green)" }} /> : <Copy size={12} style={{ color: "var(--muted)" }} />}
              </button>
            </div>
            <span className={`badge ${sc.badgeCls}`}>{sc.icon} {sc.label}</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: "Data",       v: txn.data       },
              { l: "Adquirente", v: txn.adquirente },
              { l: "Modalidade", v: txn.tipo        },
              { l: "Valor Bruto",v: brl(txn.valorBruto) },
              { l: "Tarifa MDR", v: brl(txn.tarifa) },
              { l: "Valor Líquido", v: brl(txn.valorLiquido) },
            ].map(({ l, v }) => (
              <div key={l} className="p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <p className="text-[10px] mb-0.5" style={{ color: "var(--muted)" }}>{l}</p>
                <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{v}</p>
              </div>
            ))}
          </div>

          {/* Observação */}
          {txn.observacao && (
            <div className="p-3 rounded-xl text-xs leading-relaxed"
              style={{ background: sc.bg, border: `1px solid ${sc.borderColor}`, color: "var(--text-2)" }}>
              {sc.icon} <span className="ml-1">{txn.observacao}</span>
            </div>
          )}
        </div>
        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Empty state ───────────────────────────────────────── */
function EmptyState({ onSeed, seeding }: { onSeed: () => void; seeding: boolean }) {
  return (
    <div className="card p-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
        <ArrowLeftRight size={24} />
      </div>
      <p className="text-base font-semibold mb-2" style={{ color: "var(--text)" }}>
        Nenhuma transação ainda
      </p>
      <p className="text-sm mb-6 max-w-xs" style={{ color: "var(--muted)" }}>
        Conecte um adquirente para começar a conciliação automática, ou carregue dados de demonstração.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/dashboard/integracoes"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
          style={{ background: "var(--blue)", color: "#fff" }}>
          Conectar adquirente
        </Link>
        <button onClick={onSeed} disabled={seeding}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-60"
          style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
          {seeding ? <><Loader2 size={14} className="animate-spin" /> Carregando…</> : <><Zap size={14} /> Dados de demonstração</>}
        </button>
      </div>
    </div>
  );
}

/* ─── Página principal ──────────────────────────────────── */
export default function ConciliacaoPage() {
  const { toast } = useToast();

  const [allTxns,     setAllTxns]     = useState<Transacao[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [seeding,     setSeeding]     = useState(false);

  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState<RecStatus | "all">("all");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");
  const [page,         setPage]         = useState(1);
  const [sortKey,      setSortKey]      = useState<keyof Transacao>("dataISO");
  const [sortDir,      setSortDir]      = useState<"asc" | "desc">("desc");
  const [detalhes,     setDetalhes]     = useState<Transacao | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* ── Carrega transações ── */
  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    setAllTxns((data ?? []).map(mapTransaction));
    setPageLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Seed demo data ── */
  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (!res.ok) throw new Error("Erro ao carregar dados");
      await load();
      toast("Dados de demonstração carregados!");
    } catch {
      toast("Erro ao carregar dados. Tente novamente.", "error");
    }
    setSeeding(false);
  }

  /* ── Filtros + sort ── */
  const filtered = useMemo(() => {
    let rows = [...allTxns];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.descricao.toLowerCase().includes(q) ||
        t.adquirente.toLowerCase().includes(q) ||
        t.tipo.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all") rows = rows.filter(t => t.status === filterStatus);
    if (dateFrom) rows = rows.filter(t => t.dataISO >= dateFrom);
    if (dateTo)   rows = rows.filter(t => t.dataISO <= dateTo);

    rows.sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [allTxns, search, filterStatus, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: keyof Transacao) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  }

  function SortIcon({ k }: { k: keyof Transacao }) {
    if (sortKey !== k) return <ChevronsUpDown size={12} style={{ color: "var(--border-2)" }} />;
    return sortDir === "asc" ? <ChevronUp size={12} style={{ color: "var(--blue)" }} /> : <ChevronDown size={12} style={{ color: "var(--blue)" }} />;
  }

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "/" && !["INPUT","TEXTAREA"].includes((e.target as Element).tagName)) {
        e.preventDefault(); searchRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "e") { e.preventDefault(); exportCSV(filtered); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered]);

  /* ── Summary ── */
  const total     = allTxns.length;
  const concil    = allTxns.filter(t => t.status === "ok").length;
  const diverg    = allTxns.filter(t => t.status === "divergencia").length;
  const semLiq    = allTxns.filter(t => t.status === "sem_liquidacao").length;

  /* ── Skeleton ── */
  if (pageLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <title>Conciliação | PayScale Intelligence</title>
        <Topbar title="Conciliação" subtitle="Visão de todas as transações e seu status" />
        <main className="flex-1 p-5 lg:p-8 space-y-4" style={{ background: "var(--bg)" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-3 w-20 rounded mb-3" style={{ background: "var(--border)" }} />
                <div className="h-6 w-14 rounded" style={{ background: "var(--border)" }} />
              </div>
            ))}
          </div>
          <div className="card p-5 animate-pulse" style={{ height: 300 }} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <title>Conciliação | PayScale Intelligence</title>
      <Topbar title="Conciliação" subtitle="Visão de todas as transações e seu status" />

      <main className="flex-1 p-5 lg:p-8 space-y-4" style={{ background: "var(--bg)" }}>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Processadas",     value: total,   icon: <ArrowLeftRight size={15}/>,  color: "var(--blue)",  filter: "all"          },
            { label: "Conciliadas",     value: concil,  icon: <CheckCircle size={15}/>,     color: "var(--green)", filter: "ok"           },
            { label: "Com Divergência", value: diverg,  icon: <AlertTriangle size={15}/>,   color: "var(--amber)", filter: "divergencia"  },
            { label: "Sem Liquidação",  value: semLiq,  icon: <XCircle size={15}/>,         color: "var(--red)",   filter: "sem_liquidacao" },
          ].map(item => (
            <button key={item.label}
              onClick={() => { setFilterStatus(item.filter as RecStatus | "all"); setPage(1); }}
              className="card p-5 text-left hover:opacity-90 transition-all"
              style={{ outline: filterStatus === item.filter ? `2px solid ${item.color}` : "none" }}>
              <div className="flex items-center gap-2 mb-2" style={{ color: item.color }}>
                {item.icon}
                <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>{item.label}</span>
              </div>
              <p className="text-xl font-bold tabular-nums" style={{ color: "var(--text)" }}>{item.value}</p>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {allTxns.length === 0 ? (
          <EmptyState onSeed={handleSeed} seeding={seeding} />
        ) : (
          <div className="card overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3"
              style={{ borderBottom: "1px solid var(--border)" }}>

              {/* Search */}
              <div className="relative flex-1 w-full sm:max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--muted)" }} />
                <input ref={searchRef}
                  aria-label="Buscar transações"
                  className="input-base pl-9 pr-8 text-xs h-9"
                  placeholder="Buscar ID, descrição…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
                {search && (
                  <button onClick={() => setSearch("")} aria-label="Limpar busca"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }}>
                    <XIcon size={13} />
                  </button>
                )}
              </div>

              {/* Date filters */}
              <div className="flex items-center gap-2">
                <input type="date" aria-label="Data inicial" className="input-base text-xs h-9"
                  style={{ width: 140 }} value={dateFrom}
                  onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
                <span className="text-xs" style={{ color: "var(--muted)" }}>–</span>
                <input type="date" aria-label="Data final" className="input-base text-xs h-9"
                  style={{ width: 140 }} value={dateTo}
                  onChange={e => { setDateTo(e.target.value); setPage(1); }} />
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-1 ml-auto">
                {(["all","ok","divergencia","sem_liquidacao"] as const).map(f => (
                  <button key={f}
                    aria-pressed={filterStatus === f}
                    onClick={() => { setFilterStatus(f); setPage(1); }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: filterStatus === f ? "var(--blue)" : "var(--surface-2)",
                      color:      filterStatus === f ? "#fff"         : "var(--text-2)",
                      border:     "1px solid var(--border)",
                    }}>
                    {f === "all" ? "Todos" : statusMap[f].label}
                  </button>
                ))}
              </div>

              <button onClick={() => exportCSV(filtered)} title="Exportar CSV (⌘E)"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all shrink-0"
                style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
                <Download size={12} /> CSV
              </button>
            </div>

            {/* Table */}
            {paginated.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm" style={{ color: "var(--muted)" }}>Nenhum resultado encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs" aria-label="Transações conciliadas">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                      {[
                        { label: "ID",          key: "id"          },
                        { label: "Data",        key: "dataISO"     },
                        { label: "Descrição",   key: "descricao"   },
                        { label: "Adquirente",  key: "adquirente"  },
                        { label: "Tipo",        key: "tipo"        },
                        { label: "Bruto",       key: "valorBruto"  },
                        { label: "Tarifa",      key: "tarifa"      },
                        { label: "Líquido",     key: "valorLiquido"},
                        { label: "Status",      key: "status"      },
                      ].map(h => (
                        <th key={h.key} scope="col"
                          onClick={() => toggleSort(h.key as keyof Transacao)}
                          aria-sort={sortKey === h.key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                          className="px-4 py-2.5 text-left font-semibold cursor-pointer select-none hover:opacity-80"
                          style={{ color: "var(--text-2)", whiteSpace: "nowrap" }}>
                          <span className="flex items-center gap-1">
                            {h.label} <SortIcon k={h.key as keyof Transacao} />
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((t, i) => {
                      const sc = statusMap[t.status];
                      return (
                        <tr key={t.dbId}
                          onClick={() => setDetalhes(t)}
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                          style={{ borderBottom: i < paginated.length - 1 ? "1px solid var(--border)" : "none" }}>
                          <td className="px-4 py-3 font-mono font-medium" style={{ color: "var(--blue)" }}>{t.id}</td>
                          <td className="px-4 py-3 tabular-nums" style={{ color: "var(--text-2)" }}>{t.data}</td>
                          <td className="px-4 py-3 max-w-[200px] truncate" style={{ color: "var(--text)" }}>{t.descricao}</td>
                          <td className="px-4 py-3" style={{ color: "var(--text-2)" }}>{t.adquirente}</td>
                          <td className="px-4 py-3" style={{ color: "var(--text-2)" }}>{t.tipo}</td>
                          <td className="px-4 py-3 tabular-nums font-medium" style={{ color: "var(--text)" }}>{brl(t.valorBruto)}</td>
                          <td className="px-4 py-3 tabular-nums" style={{ color: "var(--red)" }}>{brl(t.tarifa)}</td>
                          <td className="px-4 py-3 tabular-nums font-semibold" style={{ color: "var(--green)" }}>{brl(t.valorLiquido)}</td>
                          <td className="px-4 py-3">
                            <span className={`badge ${sc.badgeCls} gap-1`}>{sc.icon}{sc.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} · página {page} de {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    aria-label="Página anterior"
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-all"
                    style={{ color: "var(--text-2)" }}>
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: page === p ? "var(--blue)" : "transparent",
                          color: page === p ? "#fff" : "var(--text-2)",
                        }}>
                        {p}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    aria-label="Próxima página"
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-all"
                    style={{ color: "var(--text-2)" }}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {detalhes && <DetalhesModal txn={detalhes} onClose={() => setDetalhes(null)} />}
    </div>
  );
}
