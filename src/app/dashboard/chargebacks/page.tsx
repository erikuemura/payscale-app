"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Topbar from "@/components/Topbar";
import {
  AlertTriangle, Clock, CheckCircle, XCircle, FileText, ShieldAlert,
  ChevronLeft, ChevronRight, Search, X, Copy, Download, Loader2, ShieldCheck, Zap,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/lib/supabase/client";
import type { Chargeback } from "@/lib/supabase/types";
import Link from "next/link";

const PAGE_SIZE = 8;

type CBStatus = "aberto" | "contestado" | "ganho" | "perdido";

interface CB {
  id: string;          // uuid
  externalId: string;
  data: string;        // "DD/MM/YYYY"
  dataISO: string;
  cliente: string;
  adquirente: string;
  motivo: string;
  valor: number;
  prazo: number;
  status: CBStatus;
  descricao?: string;
}

const PROVIDER_LABEL: Record<string, string> = {
  pagseguro: "PagSeguro", mercadopago: "Mercado Pago",
  stone: "Stone", cielo: "Cielo",
};

const smap: Record<CBStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  aberto:     { label: "Aberto",     cls: "badge-amber", icon: <Clock size={11}/> },
  contestado: { label: "Contestado", cls: "badge-blue",  icon: <FileText size={11}/> },
  ganho:      { label: "Ganho",      cls: "badge-green", icon: <CheckCircle size={11}/> },
  perdido:    { label: "Perdido",    cls: "badge-red",   icon: <XCircle size={11}/> },
};

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ─── Converter DB → UI ─────────────────────────────────── */
function mapCB(cb: Chargeback): CB {
  const dateStr = cb.opened_at ?? cb.created_at.slice(0, 10);
  const dt = new Date(dateStr + "T00:00:00");
  return {
    id:         cb.id,
    externalId: cb.external_id ?? cb.id.slice(0, 8).toUpperCase(),
    data:       dt.toLocaleDateString("pt-BR"),
    dataISO:    dateStr,
    cliente:    cb.customer_name ?? "Cliente desconhecido",
    adquirente: PROVIDER_LABEL[cb.provider] ?? cb.provider,
    motivo:     cb.reason ?? "—",
    valor:      Number(cb.amount),
    prazo:      cb.deadline_days ?? 0,
    status:     (cb.status as CBStatus) ?? "aberto",
    descricao:  (cb.metadata as Record<string, string>)?.descricao,
  };
}

/* ─── Export CSV ─────────────────────────────────────────── */
function exportCSV(rows: CB[]) {
  const header = ["ID", "Data", "Cliente", "Adquirente", "Motivo", "Valor", "Prazo (dias)", "Status"];
  const lines  = rows.map(cb => [
    cb.externalId, cb.data, `"${cb.cliente}"`, cb.adquirente,
    `"${cb.motivo}"`, brl(cb.valor), cb.prazo, smap[cb.status].label,
  ].join(";"));
  const csv  = ["﻿" + header.join(";"), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a"); a.href = url; a.download = "chargebacks.csv"; a.click();
  URL.revokeObjectURL(url);
}

/* ─── Modal de detalhes ─────────────────────────────────── */
function DetalhesModal({ cb, onClose, onContest }: {
  cb: CB; onClose: () => void; onContest: (cb: CB) => void;
}) {
  const { toast } = useToast();
  const s = smap[cb.status];

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => toast(`${label} copiado!`));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Detalhes do chargeback"
        className="card w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
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
              <span className="font-mono text-sm font-semibold" style={{ color: "var(--blue)" }}>{cb.externalId}</span>
              <button onClick={() => copy(cb.externalId, "ID")} aria-label="Copiar ID"
                className="hover:opacity-60 transition-opacity">
                <Copy size={12} style={{ color: "var(--muted)" }} />
              </button>
            </div>
            <span className={`badge ${s.cls}`}>{s.icon} {s.label}</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: "Data",       v: cb.data       },
              { l: "Cliente",    v: cb.cliente     },
              { l: "Adquirente", v: cb.adquirente  },
              { l: "Motivo",     v: cb.motivo      },
              { l: "Valor",      v: brl(cb.valor)  },
              { l: "Prazo",      v: cb.prazo > 0 ? `${cb.prazo} dias` : "Encerrado" },
            ].map(({ l, v }) => (
              <div key={l} className="p-3 rounded-xl"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <p className="text-[10px] mb-0.5" style={{ color: "var(--muted)" }}>{l}</p>
                <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{v}</p>
              </div>
            ))}
          </div>

          {/* Prazo urgente */}
          {cb.status === "aberto" && cb.prazo <= 3 && cb.prazo > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-xs"
              style={{ background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)" }}>
              <AlertTriangle size={13} />
              Apenas {cb.prazo} {cb.prazo === 1 ? "dia" : "dias"} para contestar!
            </div>
          )}

          {/* Descrição */}
          {cb.descricao && (
            <div className="p-3 rounded-xl text-xs leading-relaxed"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
              {cb.descricao}
            </div>
          )}

          {/* Ação */}
          {cb.status === "aberto" && (
            <button onClick={() => { onContest(cb); onClose(); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
              style={{ background: "var(--blue)", color: "#fff" }}>
              <ShieldCheck size={14} /> Contestar este chargeback
            </button>
          )}
        </div>
        <div className="px-5 pb-5">
          <button onClick={onClose}
            className="w-full py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal de contestação ──────────────────────────────── */
function ContestModal({ cb, onClose, onSubmit }: {
  cb: CB; onClose: () => void; onSubmit: (cbId: string, msg: string) => Promise<void>;
}) {
  const [msg,    setMsg]    = useState("");
  const [saving, setSaving] = useState(false);
  const [done,   setDone]   = useState(false);

  async function submit() {
    if (!msg.trim()) return;
    setSaving(true);
    await onSubmit(cb.id, msg);
    setSaving(false);
    setDone(true);
    setTimeout(onClose, 1800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Contestar chargeback"
        className="card w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} style={{ color: "var(--blue)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Contestar Chargeback</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="p-1.5 rounded-lg hover:bg-gray-100"
            style={{ color: "var(--muted)" }}>
            <X size={15} />
          </button>
        </div>

        {done ? (
          <div className="px-5 py-10 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "var(--green-dim)" }}>
              <CheckCircle size={22} style={{ color: "var(--green)" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Contestação enviada!</p>
            <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
              Sua contestação foi registrada. O adquirente irá analisar em até 10 dias úteis.
            </p>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-4">
            <div className="p-3 rounded-xl text-xs"
              style={{ background: "var(--blue-dim)", border: "1px solid var(--blue-mid)", color: "var(--blue)" }}>
              <p className="font-semibold mb-0.5">{cb.externalId} — {brl(cb.valor)}</p>
              <p>{cb.motivo} · {cb.adquirente}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
                Argumentação para contestação
              </label>
              <textarea
                className="input-base resize-none"
                style={{ minHeight: 100 }}
                placeholder="Descreva os comprovantes de entrega, evidências de autenticação, ou qualquer argumento que prove a legitimidade da transação…"
                value={msg}
                onChange={e => setMsg(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} disabled={saving}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
                Cancelar
              </button>
              <button onClick={submit} disabled={saving || !msg.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60"
                style={{ background: "var(--blue)", color: "#fff" }}>
                {saving ? <><Loader2 size={14} className="animate-spin" /> Enviando…</> : "Enviar contestação"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Empty state ───────────────────────────────────────── */
function EmptyState({ onSeed, seeding }: { onSeed: () => void; seeding: boolean }) {
  return (
    <div className="card p-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "var(--green-dim)", color: "var(--green)" }}>
        <ShieldCheck size={24} />
      </div>
      <p className="text-base font-semibold mb-2" style={{ color: "var(--text)" }}>
        Nenhum chargeback registrado
      </p>
      <p className="text-sm mb-6 max-w-xs" style={{ color: "var(--muted)" }}>
        Os chargebacks serão exibidos aqui automaticamente quando os adquirentes os reportarem.
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
export default function ChargebacksPage() {
  const { toast } = useToast();

  const [allCBs,      setAllCBs]      = useState<CB[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [seeding,     setSeeding]     = useState(false);

  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<CBStatus | "all">("all");
  const [page,     setPage]     = useState(1);
  const [detalhes, setDetalhes] = useState<CB | null>(null);
  const [contest,  setContest]  = useState<CB | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* ── Carrega chargebacks ── */
  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("chargebacks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setAllCBs((data ?? []).map(mapCB));
    setPageLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Seed ── */
  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (!res.ok) throw new Error();
      await load();
      toast("Dados de demonstração carregados!");
    } catch {
      toast("Erro ao carregar dados.", "error");
    }
    setSeeding(false);
  }

  /* ── Contestar ── */
  async function handleContest(cbId: string, msg: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("chargebacks")
      .update({
        status:   "contestado",
        metadata: { contestacao: msg, contestado_em: new Date().toISOString() },
      })
      .eq("id", cbId);

    if (error) {
      toast("Erro ao registrar contestação.", "error");
    } else {
      setAllCBs(prev => prev.map(cb =>
        cb.id === cbId ? { ...cb, status: "contestado" } : cb
      ));
      toast("Contestação registrada com sucesso!");
    }
  }

  /* ── Keyboard ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !["INPUT","TEXTAREA"].includes((e.target as Element).tagName)) {
        e.preventDefault(); searchRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault(); exportCSV(filtered);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ── Filtros ── */
  const filtered = useMemo(() => {
    let rows = [...allCBs];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(cb =>
        cb.externalId.toLowerCase().includes(q) ||
        cb.cliente.toLowerCase().includes(q) ||
        cb.motivo.toLowerCase().includes(q)
      );
    }
    if (filter !== "all") rows = rows.filter(cb => cb.status === filter);
    return rows;
  }, [allCBs, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── Summary ── */
  const abertos    = allCBs.filter(c => c.status === "aberto").length;
  const contestados = allCBs.filter(c => c.status === "contestado").length;
  const ganhos     = allCBs.filter(c => c.status === "ganho").length;
  const perdidos   = allCBs.filter(c => c.status === "perdido").length;
  const emRisco    = allCBs.filter(c => c.status === "aberto").reduce((s, c) => s + c.valor, 0);

  /* ── Skeleton ── */
  if (pageLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <title>Chargebacks | PayScale Intelligence</title>
        <Topbar title="Chargebacks" subtitle="Gestão de disputas e contestações" />
        <main className="flex-1 p-5 lg:p-8 space-y-5" style={{ background: "var(--bg)" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="card p-5 animate-pulse h-20" style={{ background: "var(--surface)" }} />)}
          </div>
          <div className="card animate-pulse" style={{ height: 300 }} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <title>Chargebacks | PayScale Intelligence</title>
      <Topbar title="Chargebacks" subtitle="Gestão de disputas e contestações" />

      <main className="flex-1 p-5 lg:p-8 space-y-5" style={{ background: "var(--bg)" }}>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Em aberto",    value: abertos,     color: "var(--amber)", filter: "aberto"     },
            { label: "Contestados",  value: contestados,  color: "var(--blue)",  filter: "contestado" },
            { label: "Ganhos",       value: ganhos,       color: "var(--green)", filter: "ganho"      },
            { label: "Perdidos",     value: perdidos,     color: "var(--red)",   filter: "perdido"    },
          ].map(s => (
            <button key={s.label} onClick={() => { setFilter(s.filter as CBStatus | "all"); setPage(1); }}
              className="card p-5 text-left hover:opacity-90 transition-all"
              style={{ outline: filter === s.filter ? `2px solid ${s.color}` : "none" }}>
              <p className="text-2xl font-bold tabular-nums mb-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</p>
            </button>
          ))}
        </div>

        {/* Em risco banner */}
        {emRisco > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)" }}>
            <AlertTriangle size={15} className="shrink-0" />
            <span><strong>{brl(emRisco)}</strong> em risco — {abertos} chargeback{abertos !== 1 ? "s" : ""} aguardando contestação.</span>
          </div>
        )}

        {/* Empty ou tabela */}
        {allCBs.length === 0 ? (
          <EmptyState onSeed={handleSeed} seeding={seeding} />
        ) : (
          <div className="card overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--muted)" }} />
                <input ref={searchRef}
                  aria-label="Buscar chargebacks"
                  className="input-base pl-9 pr-8 text-xs h-9"
                  placeholder="Buscar ID, cliente ou motivo…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
                {search && (
                  <button onClick={() => setSearch("")} aria-label="Limpar busca"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }}>
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-1">
                {(["all","aberto","contestado","ganho","perdido"] as const).map(f => (
                  <button key={f}
                    aria-pressed={filter === f}
                    onClick={() => { setFilter(f); setPage(1); }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: filter === f ? "var(--blue)" : "var(--surface-2)",
                      color:      filter === f ? "#fff"        : "var(--text-2)",
                      border:     "1px solid var(--border)",
                    }}>
                    {f === "all" ? "Todos" : smap[f].label}
                  </button>
                ))}
              </div>

              <button onClick={() => exportCSV(filtered)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all ml-auto shrink-0"
                style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
                <Download size={12} /> CSV
              </button>
            </div>

            {/* Tabela */}
            {paginated.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm" style={{ color: "var(--muted)" }}>Nenhum resultado encontrado.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {paginated.map(cb => {
                  const s = smap[cb.status];
                  return (
                    <div key={cb.id}
                      onClick={() => setDetalhes(cb)}
                      className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                      {/* Ícone status */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: cb.status === "aberto" ? "var(--amber-dim)" :
                                      cb.status === "ganho" ? "var(--green-dim)" :
                                      cb.status === "perdido" ? "var(--red-dim)" : "var(--blue-dim)",
                          color: cb.status === "aberto" ? "var(--amber)" :
                                 cb.status === "ganho" ? "var(--green)" :
                                 cb.status === "perdido" ? "var(--red)" : "var(--blue)",
                        }}>
                        {s.icon}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold" style={{ color: "var(--blue)" }}>
                            {cb.externalId}
                          </span>
                          <span className="text-[11px]" style={{ color: "var(--muted)" }}>·</span>
                          <span className="text-xs truncate" style={{ color: "var(--text)" }}>{cb.cliente}</span>
                        </div>
                        <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--muted)" }}>
                          {cb.adquirente} · {cb.motivo}
                        </p>
                      </div>

                      {/* Valor */}
                      <p className="text-sm font-bold tabular-nums shrink-0" style={{ color: "var(--text)" }}>
                        {brl(cb.valor)}
                      </p>

                      {/* Prazo */}
                      {cb.status === "aberto" && (
                        <div className="shrink-0 text-right">
                          {cb.prazo > 0 ? (
                            <p className="text-xs font-semibold tabular-nums"
                              style={{ color: cb.prazo <= 3 ? "var(--red)" : "var(--amber)" }}>
                              {cb.prazo}d
                            </p>
                          ) : (
                            <p className="text-xs" style={{ color: "var(--muted)" }}>Expirado</p>
                          )}
                          <p className="text-[10px]" style={{ color: "var(--muted)" }}>prazo</p>
                        </div>
                      )}

                      {/* Badge */}
                      <span className={`badge ${s.cls} gap-1 shrink-0`}>{s.icon}{s.label}</span>
                    </div>
                  );
                })}
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
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                    style={{ color: "var(--text-2)" }}>
                    <ChevronLeft size={15} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    aria-label="Próxima página"
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                    style={{ color: "var(--text-2)" }}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {detalhes && (
        <DetalhesModal cb={detalhes} onClose={() => setDetalhes(null)} onContest={cb => setContest(cb)} />
      )}
      {contest && (
        <ContestModal cb={contest} onClose={() => setContest(null)} onSubmit={handleContest} />
      )}
    </div>
  );
}
