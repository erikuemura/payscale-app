"use client";
import { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/Topbar";
import {
  AlertTriangle, CheckCircle, Bell, Download, X as XIcon,
  FileText, Send, Loader2, Zap, BarChart2,
} from "lucide-react";
import { useToast }  from "@/context/ToastContext";
import { useTheme }  from "@/context/ThemeContext";
import { createClient } from "@/lib/supabase/client";
import type { Transaction, Alert } from "@/lib/supabase/types";
import Link from "next/link";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

/* ─── Tipos de MDR computados ──────────────────────────── */
interface MdrRow {
  m: string;     // label da modalidade
  key: string;   // ex: "credito_2x"
  c: number;     // MDR contratado (avg mdr_rate)
  r: number;     // MDR cobrado (avg mdr_charged)
  d: number;     // desvio (r - c)
  vol: number;   // volume total nessa modalidade
}

interface AlertaMDR {
  id: string;
  adquirente: string;
  modalidade: string;
  contratado: number;
  cobrado: number;
  desvio: number;
  impacto: number;
  desde: string;
}

interface RadarItem {
  m: string;
  PS?: number;
  MP?: number;
}

const MODALITY_LABEL: Record<string, string> = {
  debito: "Débito",       credito_1x: "Créd 1x",  credito_2x: "Créd 2x",
  credito_3x: "Créd 3x", credito_6x: "Créd 6x",  credito_12x: "Créd 12x",
  pix: "PIX",             boleto: "Boleto",
};

const PROVIDER_LABEL: Record<string, string> = {
  pagseguro: "PagSeguro", mercadopago: "Mercado Pago",
};

/* ─── Export CSV ─────────────────────────────────────────── */
function exportMDR(data: MdrRow[]) {
  const header = "Modalidade;MDR Contratado (%);MDR Cobrado (%);Desvio (%);Volume (R$);Status";
  const rows   = data.map(m => [
    m.m,
    m.c.toFixed(2).replace(".", ","),
    m.r.toFixed(2).replace(".", ","),
    m.d > 0 ? `+${m.d.toFixed(2).replace(".", ",")}` : "0,00",
    m.vol.toFixed(2).replace(".", ","),
    m.d === 0 ? "OK" : "Indevida",
  ].join(";"));
  const csv  = "﻿" + [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "auditoria_mdr.csv"; a.click();
  URL.revokeObjectURL(url);
}

/* ─── Modal de contestação ───────────────────────────────── */
function ContestarModal({ alerta, onClose, onSend }: {
  alerta: AlertaMDR; onClose: () => void; onSend: () => void;
}) {
  const [msg,  setMsg]  = useState("");
  const [step, setStep] = useState<"form" | "done">("form");

  function submit() {
    if (!msg.trim()) return;
    setStep("done");
    setTimeout(() => { onSend(); onClose(); }, 1800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Contestar cobrança indevida"
        className="card w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <FileText size={15} style={{ color: "var(--red)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Contestar Cobrança Indevida</p>
          </div>
          <button onClick={onClose} aria-label="Fechar"
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "var(--muted)" }}>
            <XIcon size={15} />
          </button>
        </div>

        {step === "done" ? (
          <div className="px-5 py-10 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--green-dim)" }}>
              <CheckCircle size={22} style={{ color: "var(--green)" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Contestação enviada!</p>
            <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
              O adquirente foi notificado e tem até 10 dias para responder.
            </p>
          </div>
        ) : (
          <>
            <div className="mx-5 mt-4 p-3 rounded-xl text-xs space-y-1.5"
              style={{ background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.2)" }}>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Adquirente</span>
                <span className="font-semibold" style={{ color: "var(--text)" }}>{alerta.adquirente}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Modalidade</span>
                <span className="font-semibold" style={{ color: "var(--text)" }}>{alerta.modalidade}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Contratado vs. Cobrado</span>
                <span className="font-semibold" style={{ color: "var(--red)" }}>
                  {alerta.contratado.toFixed(2)}% → {alerta.cobrado.toFixed(2)}% (+{alerta.desvio.toFixed(2)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Impacto estimado</span>
                <span className="font-bold" style={{ color: "var(--red)" }}>
                  −R$ {alerta.impacto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="px-5 mt-4">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
                Descrição da contestação
              </label>
              <textarea
                value={msg}
                onChange={e => setMsg(e.target.value)}
                rows={4}
                placeholder="Descreva o motivo da contestação e referencie o contrato ou aditivo que confirma a tarifa acordada..."
                className="input-base resize-none text-xs"
              />
            </div>

            <div className="flex gap-3 px-5 py-4">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
                Cancelar
              </button>
              <button onClick={submit} disabled={!msg.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: "var(--red)", color: "#fff" }}>
                <Send size={13} /> Enviar contestação
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────── */
function EmptyState({ onSeed, seeding }: { onSeed: () => void; seeding: boolean }) {
  return (
    <div className="card p-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
        <BarChart2 size={24} />
      </div>
      <p className="text-base font-semibold mb-2" style={{ color: "var(--text)" }}>
        Sem dados de MDR ainda
      </p>
      <p className="text-sm mb-6 max-w-xs" style={{ color: "var(--muted)" }}>
        Conecte um adquirente para auditar automaticamente as taxas MDR cobradas versus as contratadas.
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

/* ─── Página principal ───────────────────────────────────── */
export default function TarifasPage() {
  const { toast } = useToast();
  const { theme } = useTheme();

  const [mdrData,     setMdrData]     = useState<MdrRow[]>([]);
  const [radarData,   setRadarData]   = useState<RadarItem[]>([]);
  const [alertasMDR,  setAlertasMDR]  = useState<AlertaMDR[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [seeding,     setSeeding]     = useState(false);
  const [contesting,  setContesting]  = useState<AlertaMDR | null>(null);

  /* ── Métricas gerais ── */
  const [totalVolume,   setTotalVolume]   = useState(0);
  const [totalCharged,  setTotalCharged]  = useState(0);
  const [avgEffective,  setAvgEffective]  = useState(0);
  const [avgContracted, setAvgContracted] = useState(0);

  /* ── Carrega dados ── */
  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Busca todas as transações com MDR
    const { data: txns } = await supabase
      .from("transactions")
      .select("provider,modality,amount,mdr_rate,mdr_charged,net_amount,date")
      .eq("user_id", user.id)
      .not("mdr_charged", "is", null);

    const rows = (txns ?? []) as Transaction[];

    if (rows.length === 0) { setPageLoading(false); return; }

    /* ── Computa MDR por modalidade ── */
    const modalMap: Record<string, { rates: number[]; charged: number[]; vol: number }> = {};
    rows.forEach(t => {
      const key = t.modality ?? "outros";
      if (!modalMap[key]) modalMap[key] = { rates: [], charged: [], vol: 0 };
      if (t.mdr_rate)    modalMap[key].rates.push(Number(t.mdr_rate));
      if (t.mdr_charged) modalMap[key].charged.push(Number(t.mdr_charged));
      modalMap[key].vol += Number(t.amount);
    });

    const computed: MdrRow[] = Object.entries(modalMap).map(([key, v]) => {
      const avgRate    = v.rates.length    ? v.rates.reduce((a, b) => a + b) / v.rates.length       : 0;
      const avgCharged = v.charged.length ? v.charged.reduce((a, b) => a + b) / v.charged.length   : 0;
      const desvio     = Math.max(0, Number((avgCharged - avgRate).toFixed(4)));
      return {
        m:   MODALITY_LABEL[key] ?? key,
        key,
        c:   Number(avgRate.toFixed(2)),
        r:   Number(avgCharged.toFixed(2)),
        d:   Number(desvio.toFixed(2)),
        vol: v.vol,
      };
    }).sort((a, b) => a.key.localeCompare(b.key));

    setMdrData(computed);

    /* ── Radar por adquirente ── */
    const radarMap: Record<string, Record<string, number[]>> = {};
    rows.forEach(t => {
      const mod = MODALITY_LABEL[t.modality ?? ""] ?? (t.modality ?? "outros");
      if (!radarMap[mod]) radarMap[mod] = {};
      const prov = t.provider === "pagseguro" ? "PS" : t.provider === "mercadopago" ? "MP" : null;
      if (prov && t.mdr_charged) {
        if (!radarMap[mod][prov]) radarMap[mod][prov] = [];
        radarMap[mod][prov].push(Number(t.mdr_charged));
      }
    });
    const radarRows: RadarItem[] = Object.entries(radarMap).map(([m, provs]) => {
      const item: RadarItem = { m };
      if (provs.PS?.length) item.PS = Number((provs.PS.reduce((a,b)=>a+b)/provs.PS.length).toFixed(2));
      if (provs.MP?.length) item.MP = Number((provs.MP.reduce((a,b)=>a+b)/provs.MP.length).toFixed(2));
      return item;
    });
    setRadarData(radarRows);

    /* ── KPIs gerais ── */
    const vol  = rows.reduce((s, t) => s + Number(t.amount), 0);
    const fee  = rows.reduce((s, t) => s + Number(t.amount) * Number(t.mdr_charged ?? 0) / 100, 0);
    const avgE = rows.filter(t => t.mdr_charged).reduce((s, t) => s + Number(t.mdr_charged), 0) / rows.filter(t => t.mdr_charged).length;
    const avgC = rows.filter(t => t.mdr_rate).reduce((s, t) => s + Number(t.mdr_rate), 0) / rows.filter(t => t.mdr_rate).length;
    setTotalVolume(vol);
    setTotalCharged(fee);
    setAvgEffective(avgE);
    setAvgContracted(avgC);

    /* ── Alertas de MDR ── */
    const { data: alertRows } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "mdr_deviation")
      .eq("resolved", false)
      .order("created_at", { ascending: false });

    // Gera alertas dinamicamente das modalidades com desvio
    const dynamicAlerts: AlertaMDR[] = computed
      .filter(m => m.d > 0)
      .map((m, i) => {
        const dbAlert = (alertRows ?? []).find(a => (a.metadata as Record<string,string>)?.modalidade === m.key);
        const impacto = dbAlert?.amount ? Number(dbAlert.amount) : Math.round(m.vol * m.d / 100);
        return {
          id:         dbAlert?.id ?? `auto-${i}`,
          adquirente: "PagSeguro", // simplificado — se tiver provedor específico, usar
          modalidade: m.m,
          contratado: m.c,
          cobrado:    m.r,
          desvio:     m.d,
          impacto,
          desde:      dbAlert?.created_at?.slice(5, 10).split("-").reverse().join("/") ?? "—",
        };
      });
    setAlertasMDR(dynamicAlerts);

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

  const axisStyle = { fontSize: 10, fill: theme === "dark" ? "#64748b" : "#8896a8" };
  const grid      = { strokeDasharray: "3 3", stroke: theme === "dark" ? "#334155" : "#f1f5f9" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ttStyle   = { contentStyle: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }, formatter: (v: any) => [`${v}%`] };

  const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  /* ── Skeleton ── */
  if (pageLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <title>Tarifas & MDR | PayScale Intelligence</title>
        <Topbar title="Tarifas & MDR" subtitle="Taxas cobradas vs. contratadas" />
        <main className="flex-1 p-5 lg:p-8 space-y-5" style={{ background: "var(--bg)" }}>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="card p-5 animate-pulse h-24" />)}
          </div>
          <div className="card animate-pulse" style={{ height: 200 }} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card animate-pulse" style={{ height: 280 }} />
            <div className="card animate-pulse" style={{ height: 280 }} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <title>Tarifas & MDR | PayScale Intelligence</title>
      <Topbar title="Tarifas & MDR" subtitle="Taxas cobradas vs. contratadas" />

      <main className="flex-1 p-5 lg:p-8 space-y-5" style={{ background: "var(--bg)" }}>

        {/* Empty state */}
        {mdrData.length === 0 ? (
          <EmptyState onSeed={handleSeed} seeding={seeding} />
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                {
                  label: "MDR Total Cobrado",
                  value: brl(totalCharged),
                  sub:   `sobre ${brl(totalVolume)} em volume`,
                  color: "var(--text)",
                },
                {
                  label: "MDR Médio Efetivo",
                  value: `${avgEffective.toFixed(2)}%`,
                  sub:   `Contratado: ${avgContracted.toFixed(2)}%`,
                  color: avgEffective > avgContracted ? "var(--amber)" : "var(--text)",
                },
                {
                  label: "Cobranças Indevidas",
                  value: alertasMDR.length > 0
                    ? brl(alertasMDR.reduce((s, a) => s + a.impacto, 0))
                    : "R$ 0,00",
                  sub:   `${alertasMDR.length} modalidade${alertasMDR.length !== 1 ? "s" : ""} fora do contrato`,
                  color: alertasMDR.length > 0 ? "var(--red)" : "var(--green)",
                },
                {
                  label: "Modalidades OK",
                  value: `${mdrData.filter(m => m.d === 0).length}/${mdrData.length}`,
                  sub:   "dentro do contratado",
                  color: "var(--green)",
                },
              ].map(k => (
                <div key={k.label} className="card p-5">
                  <p className="text-xs font-medium mb-3" style={{ color: "var(--muted)" }}>{k.label}</p>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: k.color }}>{k.value}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Alertas */}
            {alertasMDR.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <Bell size={15} style={{ color: "var(--red)" }} />
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Alertas de Cobrança Indevida</p>
                  </div>
                  <span className="badge badge-red">{alertasMDR.length} ativo{alertasMDR.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {alertasMDR.map(a => (
                    <div key={a.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
                      <AlertTriangle size={16} className="shrink-0" style={{ color: "var(--red)" }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                          {a.adquirente} — {a.modalidade}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                          Contratado {a.contratado.toFixed(2)}% · Cobrado {a.cobrado.toFixed(2)}% · Desvio +{a.desvio.toFixed(2)}%
                          {a.desde !== "—" && ` · Desde ${a.desde}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold" style={{ color: "var(--red)" }}>
                          −{brl(a.impacto)}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--muted)" }}>impacto estimado</p>
                      </div>
                      <button onClick={() => setContesting(a)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-50 transition-all shrink-0"
                        style={{ border: "1px solid var(--border)", color: "var(--red)" }}>
                        Contestar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Bar chart */}
              <div className="card p-5">
                <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text)" }}>Contratado vs. Cobrado</p>
                <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>Desvios positivos indicam cobrança indevida</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={mdrData} barCategoryGap={10} margin={{ left: -12, right: 4 }}>
                    <CartesianGrid {...grid} vertical={false} />
                    <XAxis dataKey="m" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip {...ttStyle} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
                    <Bar dataKey="c" name="Contratado" fill="var(--blue)" radius={[3,3,0,0]} />
                    <Bar dataKey="r" name="Cobrado"    fill="var(--red)"  radius={[3,3,0,0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Radar chart */}
              {radarData.length > 0 ? (
                <div className="card p-5">
                  <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text)" }}>MDR por Adquirente</p>
                  <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>PagSeguro vs. Mercado Pago (MDR médio por modalidade)</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
                      <PolarAngleAxis dataKey="m" tick={{ fontSize: 10, fill: theme === "dark" ? "#64748b" : "#8896a8" }} />
                      <Radar name="PagSeguro"    dataKey="PS" stroke="#f59e0b"      fill="#f59e0b"      fillOpacity={0.15} strokeWidth={2} />
                      <Radar name="Mercado Pago" dataKey="MP" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.15} strokeWidth={2} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
                      <Tooltip {...ttStyle} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="card p-5 flex items-center justify-center">
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    Radar disponível com dados de múltiplos adquirentes.
                  </p>
                </div>
              )}
            </div>

            {/* Tabela de detalhamento */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Detalhamento por Modalidade</p>
                <button
                  onClick={() => { exportMDR(mdrData); toast("Auditoria MDR exportada!"); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                  style={{ background: "var(--blue)", color: "#fff" }}>
                  <Download size={12} /> Exportar CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" aria-label="Detalhamento de MDR por modalidade">
                  <thead>
                    <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                      {["Modalidade","Volume","MDR Contratado","MDR Cobrado","Desvio","Status"].map(h => (
                        <th key={h} scope="col" className="px-5 py-3 text-left font-semibold"
                          style={{ color: "var(--muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mdrData.map((m, i) => (
                      <tr key={m.key}
                        style={{ borderTop: "1px solid var(--border)", background: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)" }}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-medium" style={{ color: "var(--text)" }}>{m.m}</td>
                        <td className="px-5 py-3 tabular-nums" style={{ color: "var(--text-2)" }}>{brl(m.vol)}</td>
                        <td className="px-5 py-3 tabular-nums" style={{ color: "var(--text-2)" }}>{m.c.toFixed(2)}%</td>
                        <td className="px-5 py-3 font-semibold tabular-nums"
                          style={{ color: m.d > 0 ? "var(--red)" : "var(--text)" }}>
                          {m.r.toFixed(2)}%
                        </td>
                        <td className="px-5 py-3 tabular-nums"
                          style={{ color: m.d > 0 ? "var(--red)" : "var(--muted)" }}>
                          {m.d > 0 ? `+${m.d.toFixed(2)}%` : "—"}
                        </td>
                        <td className="px-5 py-3">
                          {m.d === 0
                            ? <span className="badge badge-green gap-1"><CheckCircle size={10}/> OK</span>
                            : <span className="badge badge-red gap-1"><AlertTriangle size={10}/> Indevida</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {contesting && (
        <ContestarModal
          alerta={contesting}
          onClose={() => setContesting(null)}
          onSend={() => toast("Contestação enviada ao adquirente!")}
        />
      )}
    </div>
  );
}
