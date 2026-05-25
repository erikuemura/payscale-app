"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { useTheme } from "@/context/ThemeContext";
import { createClient } from "@/lib/supabase/client";
import type { Transaction, Chargeback, Alert, Integration } from "@/lib/supabase/types";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Plug, ArrowRight, Zap,
  ShieldCheck, Clock,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import CountUp from "@/components/CountUp";

/* ── Tipos ────────────────────────────────────────────── */
interface UserInfo {
  name: string | null;
  email: string | null;
  trialEnds: Date | null;
}

interface DashboardData {
  totalVolume:    number;
  totalFees:      number;
  savings:        number;
  openChargebacks: number;
  cbAmount:       number;
  totalTx:        number;
  settledTx:      number;
  divergentTx:    number;
  noSettlementTx: number;
  volumeChart:    { dia: string; [provider: string]: string | number }[];
  mdrChart:       { name: string; contratado: number; cobrado: number }[];
  alerts:         Alert[];
  integrations:   Integration[];
}

const PROVIDERS = [
  { id: "pagseguro",   label: "PagSeguro",    initials: "PS", color: "#f59e0b" },
  { id: "mercadopago", label: "Mercado Pago", initials: "MP", color: "#2563eb" },
  { id: "stone",       label: "Stone",        initials: "ST", color: "#059669" },
  { id: "cielo",       label: "Cielo",        initials: "CI", color: "#7c3aed" },
  { id: "rede",        label: "Rede",         initials: "RE", color: "#dc2626" },
  { id: "getnet",      label: "Getnet",       initials: "GN", color: "#0891b2" },
];

const PROVIDER_LABEL: Record<string, string> = {
  pagseguro: "PagSeguro", mercadopago: "Mercado Pago",
  stone: "Stone", cielo: "Cielo",
};

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ════════════════════════════════════════════════════════
   ONBOARDING (sem integrações)
════════════════════════════════════════════════════════ */
function OnboardingState({ user }: { user: UserInfo }) {
  const firstName = user.name?.split(" ")[0] ?? "por aí";
  const daysLeft  = user.trialEnds
    ? Math.max(0, Math.ceil((user.trialEnds.getTime() - Date.now()) / 86_400_000))
    : 14;

  return (
    <div className="flex flex-col min-h-screen">
      <title>Começar | PayScale Intelligence</title>
      <Topbar title="Visão Geral" />
      <main className="flex-1 p-5 lg:p-8" style={{ background: "var(--bg)" }}>

        {daysLeft > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium mb-6 w-fit"
            style={{ background: "var(--blue-dim)", border: "1px solid rgba(37,99,235,0.15)", color: "var(--blue)" }}>
            <Clock size={13} />
            Período gratuito · {daysLeft} {daysLeft === 1 ? "dia restante" : "dias restantes"}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
            Olá, {firstName}! 👋
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Sua conta está pronta. Conecte seu adquirente para começar a conciliação automática.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {[
            { num: "1", done: true,  title: "Criar sua conta",      desc: "Conta criada com sucesso.",                                 icon: <CheckCircle size={16}/>, color: "var(--green)", href: null },
            { num: "2", done: false, title: "Conectar adquirente",  desc: "Integre PagSeguro, Mercado Pago, Stone e outros.",          icon: <Plug size={16}/>,        color: "var(--blue)",  href: "/dashboard/integracoes" },
            { num: "3", done: false, title: "Ver seu painel",       desc: "Conciliação, MDR e alertas em tempo real.",                 icon: <Zap size={16}/>,         color: "var(--amber)", href: null },
          ].map(step => {
            const inner = (
              <>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: step.done ? "var(--green-dim)" : "var(--blue-dim)",
                    color: step.done ? "var(--green)" : step.color,
                  }}>
                  {step.done ? <CheckCircle size={16}/> : step.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text)" }}>{step.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{step.desc}</p>
                  {step.href && <p className="text-xs font-semibold mt-1" style={{ color: "var(--blue)" }}>Começar agora →</p>}
                </div>
              </>
            );
            return step.href
              ? <Link key={step.num} href={step.href} className="card p-5 flex items-start gap-4 hover:opacity-90 transition-all">{inner}</Link>
              : <div key={step.num} className="card p-5 flex items-start gap-4">{inner}</div>;
          })}
        </div>

        {/* Providers */}
        <div className="card">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Escolha seu adquirente</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Conecte em menos de 2 minutos</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px" style={{ background: "var(--border)" }}>
            {PROVIDERS.map(p => (
              <a key={p.id} href="/dashboard/integracoes"
                className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                style={{ background: "var(--sidebar)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{ background: p.color + "18", color: p.color }}>{p.initials}</div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{p.label}</p>
                  <p className="text-[11px]" style={{ color: "var(--muted)" }}>Conectar →</p>
                </div>
              </a>
            ))}
          </div>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
              <ShieldCheck size={13} style={{ color: "var(--green)" }} />
              Conexão segura · suas credenciais são criptografadas
            </div>
            <a href="/dashboard/integracoes"
              className="flex items-center gap-1.5 text-xs font-semibold hover:underline" style={{ color: "var(--blue)" }}>
              Ver todas as integrações <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TOOLTIP CUSTOMIZADO
════════════════════════════════════════════════════════ */
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-3 text-xs shadow-lg" style={{ minWidth: 160 }}>
      <p className="font-medium mb-2" style={{ color: "var(--muted)" }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4 mt-1">
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ color: "var(--text)" }}>
            R$ {p.value >= 1000
              ? `${(p.value / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })}k`
              : p.value.toLocaleString("pt-BR")}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   DASHBOARD REAL
════════════════════════════════════════════════════════ */
function DashboardContent({ data }: { data: DashboardData }) {
  const { theme } = useTheme();
  const chartAxisStyle = { fontSize: 11, fill: theme === "dark" ? "#64748b" : "#8896a8" };
  const chartGrid      = { strokeDasharray: "3 3", stroke: theme === "dark" ? "#334155" : "#f1f5f9" };
  const tooltipStyle   = {
    contentStyle: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, color: "var(--text)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatter: (v: any) => [`${v}%`],
  };

  const connectedIntgs = data.integrations.filter(i => i.status === "connected");
  const subtitle = connectedIntgs.length > 0
    ? `${connectedIntgs.map(i => PROVIDER_LABEL[i.provider] ?? i.provider).join(" + ")} · ${connectedIntgs.length} integraç${connectedIntgs.length === 1 ? "ão ativa" : "ões ativas"}`
    : "Painel de dados financeiros";

  const kpis = [
    {
      label: "Volume Total",
      value: brl(data.totalVolume),
      sub:   connectedIntgs.map(i => PROVIDER_LABEL[i.provider] ?? i.provider).join(" + ") || "Todas as integrações",
      trend: data.totalVolume > 0 ? "+12%" : "—",
      up: true,
    },
    {
      label: "Tarifas Pagas (MDR)",
      value: brl(data.totalFees),
      sub:   "sobre todo o volume",
      trend: data.totalFees > 0 ? "−2%" : "—",
      up: false,
    },
    {
      label: "Cobranças Indevidas",
      value: brl(data.savings),
      sub:   "MDR acima do contratado",
      trend: data.savings > 0 ? "Detectado" : "—",
      up: data.savings === 0,
    },
    {
      label: "Chargebacks Abertos",
      value: String(data.openChargebacks),
      sub:   data.cbAmount > 0 ? `${brl(data.cbAmount)} em risco` : "Nenhum em aberto",
      trend: data.openChargebacks > 0 ? `${data.openChargebacks}` : "0",
      up: data.openChargebacks === 0,
    },
  ];

  const hasVolumeChart = data.volumeChart.length > 0;
  const hasMdrChart    = data.mdrChart.length > 0;

  // Descobre quais providers aparecem no chart
  const volumeProviders = hasVolumeChart
    ? Object.keys(data.volumeChart[0]).filter(k => k !== "dia")
    : [];

  const PROVIDER_COLORS: Record<string, string> = {
    PagSeguro:    "var(--blue)",
    "Mercado Pago": "#10b981",
    Stone:        "#8b5cf6",
    Cielo:        "#f59e0b",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <title>Visão Geral | PayScale Intelligence</title>
      <Topbar title="Visão Geral" subtitle={subtitle} />
      <main className="flex-1 p-5 lg:p-8 space-y-5" style={{ background: "var(--bg)" }}>

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="card p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>{k.label}</p>
                {k.trend !== "—" && (
                  <span className="badge shrink-0"
                    style={{ background: k.up ? "var(--green-dim)" : "var(--red-dim)", color: k.up ? "var(--green)" : "var(--red)" }}>
                    {k.up ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}{k.trend}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text)" }}>
                <CountUp value={k.value} />
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        {(hasVolumeChart || hasMdrChart) && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Volume */}
            {hasVolumeChart && (
              <div className="card p-5 xl:col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Volume de Vendas</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Últimos 30 dias por adquirente</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {volumeProviders.map(p => (
                      <span key={p} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
                        <span className="w-2 h-2 rounded-sm inline-block" style={{ background: PROVIDER_COLORS[p] ?? "#888" }} />
                        {p}
                      </span>
                    ))}
                    <Link href="/dashboard/relatorios" className="text-xs font-medium hover:underline shrink-0" style={{ color: "var(--blue)" }}>
                      Ver relatório →
                    </Link>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.volumeChart} margin={{ left: -10, right: 4, top: 4 }}>
                    <defs>
                      {volumeProviders.map((p, i) => (
                        <linearGradient key={p} id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={PROVIDER_COLORS[p] ?? "#888"} stopOpacity={0.15} />
                          <stop offset="100%" stopColor={PROVIDER_COLORS[p] ?? "#888"} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid {...chartGrid} vertical={false} />
                    <XAxis dataKey="dia" tick={chartAxisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                    <Tooltip content={<ChartTooltip />} />
                    {volumeProviders.map((p, i) => (
                      <Area key={p} type="monotone" dataKey={p} name={p}
                        stroke={PROVIDER_COLORS[p] ?? "#888"} strokeWidth={2}
                        fill={`url(#g${i})`} dot={false} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* MDR */}
            {hasMdrChart && (
              <div className={`card p-5 ${!hasVolumeChart ? "xl:col-span-3" : ""}`}>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>MDR: Contratado vs Cobrado</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Desvios sinalizados em vermelho</p>
                  </div>
                  <Link href="/dashboard/tarifas" className="text-xs font-medium hover:underline shrink-0" style={{ color: "var(--blue)" }}>
                    Ver tarifas →
                  </Link>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.mdrChart} barCategoryGap={10} margin={{ left: -12, right: 4 }}>
                    <CartesianGrid {...chartGrid} vertical={false} />
                    <XAxis dataKey="name" tick={chartAxisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="contratado" name="Contratado" fill="var(--blue)" radius={[3,3,0,0]} />
                    <Bar dataKey="cobrado"    name="Cobrado"    fill="var(--red)"  radius={[3,3,0,0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Alertas + Integrações */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Alertas */}
          <div className="card xl:col-span-2">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Alertas Recentes</p>
              <div className="flex items-center gap-3">
                {data.alerts.length > 0 && (
                  <span className="badge badge-red">{data.alerts.length} ativo{data.alerts.length !== 1 ? "s" : ""}</span>
                )}
                <Link href="/dashboard/tarifas" className="text-xs font-medium hover:underline" style={{ color: "var(--blue)" }}>
                  Ver tudo →
                </Link>
              </div>
            </div>

            {data.alerts.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle size={24} className="mx-auto mb-2" style={{ color: "var(--green)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>Nenhum alerta ativo</p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Tudo certo por aqui!</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {data.alerts.slice(0, 5).map(a => {
                  const href = (a.metadata as Record<string,string>)?.href ?? "/dashboard";
                  return (
                    <Link key={a.id} href={href}
                      className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                      style={{ display: "flex" }}>
                      <AlertTriangle size={14} className="mt-0.5 shrink-0"
                        style={{ color: a.severity === "critical" ? "var(--red)" : "var(--amber)" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs" style={{ color: "var(--text)" }}>{a.title}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>
                          {new Date(a.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {a.amount != null && (
                        <span className="text-xs font-semibold tabular-nums shrink-0"
                          style={{ color: a.severity === "critical" ? "var(--red)" : "var(--amber)" }}>
                          −{brl(Number(a.amount))}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Integrações */}
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Integrações</p>
              <Link href="/dashboard/integracoes" className="text-xs font-medium hover:underline" style={{ color: "var(--blue)" }}>
                Ver tudo →
              </Link>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {data.integrations.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <p className="text-xs" style={{ color: "var(--muted)" }}>Nenhuma integração conectada.</p>
                  <Link href="/dashboard/integracoes"
                    className="text-xs font-semibold hover:underline mt-2 inline-block" style={{ color: "var(--blue)" }}>
                    Conectar agora →
                  </Link>
                </div>
              ) : (
                data.integrations.slice(0, 4).map(intg => {
                  const cfg = PROVIDERS.find(p => p.id === intg.provider);
                  const name = cfg?.label ?? PROVIDER_LABEL[intg.provider] ?? intg.provider;
                  const color = cfg?.color ?? "var(--blue)";
                  const initials = cfg?.initials ?? name.slice(0, 2).toUpperCase();
                  const diff = intg.last_sync
                    ? Math.round((Date.now() - new Date(intg.last_sync).getTime()) / 60_000)
                    : null;
                  const lastSync = diff == null ? "Nunca" : diff < 60 ? `${diff} min` : `${Math.round(diff/60)}h`;
                  return (
                    <Link key={intg.id} href="/dashboard/integracoes"
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                      style={{ display: "flex" }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ background: color + "18", color }}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color: "var(--text)" }}>{name}</p>
                        <p className="text-[11px] truncate" style={{ color: "var(--muted)" }}>
                          {intg.status === "connected" ? `Última sync: ${lastSync}` : "Não conectado"}
                        </p>
                      </div>
                      <span className="badge"
                        style={{
                          background: intg.status === "connected" ? "var(--green-dim)" : "var(--border)",
                          color:      intg.status === "connected" ? "var(--green)"     : "var(--muted)",
                        }}>
                        {intg.status === "connected" ? "Online" : "Off"}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
            <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
              <Link href="/dashboard/integracoes" className="text-xs font-medium hover:underline" style={{ color: "var(--blue)" }}>
                Gerenciar integrações →
              </Link>
            </div>
          </div>
        </div>

        {/* Conciliação Summary */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Conciliação — Últimos 30 dias</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {data.totalTx} transaç{data.totalTx !== 1 ? "ões" : "ão"} processada{data.totalTx !== 1 ? "s" : ""}
              </p>
            </div>
            <Link href="/dashboard/conciliacao" className="text-xs font-medium hover:underline" style={{ color: "var(--blue)" }}>
              Ver tudo →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0" style={{ borderColor: "var(--border)" }}>
            {[
              { label: "Processadas",     value: data.totalTx,       icon: <TrendingUp size={15}/>,   color: "var(--blue)",  href: "/dashboard/conciliacao" },
              { label: "Conciliadas",     value: data.settledTx,     icon: <CheckCircle size={15}/>,  color: "var(--green)", href: "/dashboard/conciliacao" },
              { label: "Com Divergência", value: data.divergentTx,   icon: <AlertTriangle size={15}/>,color: "var(--amber)", href: "/dashboard/conciliacao" },
              { label: "Sem Liquidação",  value: data.noSettlementTx,icon: <TrendingDown size={15}/>, color: "var(--red)",   href: "/dashboard/conciliacao" },
            ].map(item => (
              <Link key={item.label} href={item.href} className="px-5 py-4 hover:bg-gray-50 transition-colors" style={{ display: "block" }}>
                <div className="flex items-center gap-2 mb-2" style={{ color: item.color }}>
                  {item.icon}
                  <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>{item.label}</span>
                </div>
                <p className="text-xl font-bold tabular-nums" style={{ color: "var(--text)" }}>{item.value}</p>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   LOADING SKELETON
════════════════════════════════════════════════════════ */
function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Visão Geral" />
      <main className="flex-1 p-5 lg:p-8 space-y-5" style={{ background: "var(--bg)" }}>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-3 w-24 rounded mb-4" style={{ background: "var(--border)" }} />
              <div className="h-7 w-32 rounded mb-2" style={{ background: "var(--border)" }} />
              <div className="h-2 w-20 rounded" style={{ background: "var(--border)" }} />
            </div>
          ))}
        </div>
        <div className="card p-5 animate-pulse" style={{ height: 280 }}>
          <div className="h-3 w-32 rounded mb-2" style={{ background: "var(--border)" }} />
        </div>
      </main>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   FUNÇÕES DE COMPUTAÇÃO
════════════════════════════════════════════════════════ */
function computeDashboard(
  txns: Transaction[],
  cbs:  Chargeback[],
  alts: Alert[],
  intgs: Integration[],
): DashboardData {
  const MODALITY_SHORT: Record<string, string> = {
    debito: "Déb", credito_1x: "Créd 1x", credito_2x: "Créd 2x",
    credito_3x: "Créd 3x", credito_6x: "Créd 6x", credito_12x: "Créd 12x",
    pix: "PIX",
  };

  /* Volume total e fees */
  const totalVolume = txns.reduce((s, t) => s + Number(t.amount), 0);
  const totalFees   = txns.reduce((s, t) =>
    s + Number(t.amount) * Number(t.mdr_charged ?? 0) / 100, 0);

  /* Cobranças indevidas (divergências MDR) */
  const savings = txns.reduce((s, t) => {
    if (!t.mdr_rate || !t.mdr_charged) return s;
    const dev = Number(t.mdr_charged) - Number(t.mdr_rate);
    return dev > 0 ? s + Number(t.amount) * dev / 100 : s;
  }, 0);

  /* Chargebacks em aberto */
  const openCBs    = cbs.filter(c => c.status === "aberto");
  const cbAmount   = openCBs.reduce((s, c) => s + Number(c.amount), 0);

  /* Conciliação summary */
  const totalTx       = txns.length;
  const settledTx     = txns.filter(t => t.status === "settled").length;
  const divergentTx   = txns.filter(t => t.status === "divergent").length;
  const noSettlementTx = txns.filter(t => t.status === "no_settlement").length;

  /* Volume chart — agrega por dia por provider */
  const dateMap: Record<string, Record<string, number>> = {};
  txns.forEach(t => {
    const day = t.date; // "2026-05-22"
    if (!dateMap[day]) dateMap[day] = {};
    const prov = PROVIDER_LABEL[t.provider] ?? t.provider;
    dateMap[day][prov] = (dateMap[day][prov] ?? 0) + Number(t.amount);
  });
  const volumeChart = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, provs]) => {
      const d = new Date(date + "T00:00:00");
      const dia = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
      return { dia, ...provs };
    });

  /* MDR chart — agrega por modalidade */
  const mdrMap: Record<string, { rates: number[]; charged: number[] }> = {};
  txns.forEach(t => {
    if (!t.modality || !t.mdr_rate || !t.mdr_charged) return;
    const key = t.modality;
    if (!mdrMap[key]) mdrMap[key] = { rates: [], charged: [] };
    mdrMap[key].rates.push(Number(t.mdr_rate));
    mdrMap[key].charged.push(Number(t.mdr_charged));
  });
  const mdrChart = Object.entries(mdrMap)
    .map(([key, v]) => ({
      name:       MODALITY_SHORT[key] ?? key,
      contratado: Number((v.rates.reduce((a,b)=>a+b,0)/v.rates.length).toFixed(2)),
      cobrado:    Number((v.charged.reduce((a,b)=>a+b,0)/v.charged.length).toFixed(2)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    totalVolume, totalFees, savings,
    openChargebacks: openCBs.length, cbAmount,
    totalTx, settledTx, divergentTx, noSettlementTx,
    volumeChart, mdrChart,
    alerts: alts.filter(a => !a.resolved),
    integrations: intgs,
  };
}

/* ════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter();
  const [viewState,  setViewState]  = useState<"loading" | "onboarding" | "ready">("loading");
  const [userInfo,   setUserInfo]   = useState<UserInfo>({ name: null, email: null, trialEnds: null });
  const [dashData,   setDashData]   = useState<DashboardData | null>(null);

  const init = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/"); return; }

    /* Perfil */
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, trial_ends")
      .eq("id", user.id)
      .single();

    setUserInfo({
      name:      profile?.full_name ?? user.user_metadata?.full_name ?? null,
      email:     user.email ?? null,
      trialEnds: profile?.trial_ends ? new Date(profile.trial_ends) : null,
    });

    /* Integrações */
    const { data: intgs } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", user.id);

    const connected = (intgs ?? []).filter(i => i.status === "connected");
    if (connected.length === 0) { setViewState("onboarding"); return; }

    /* Carrega dados em paralelo */
    const [txResult, cbResult, altResult] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("chargebacks").select("*").eq("user_id", user.id),
      supabase.from("alerts").select("*").eq("user_id", user.id).eq("resolved", false).order("created_at", { ascending: false }).limit(10),
    ]);

    const data = computeDashboard(
      (txResult.data ?? []) as Transaction[],
      (cbResult.data ?? []) as Chargeback[],
      (altResult.data ?? []) as Alert[],
      (intgs ?? []) as Integration[],
    );
    setDashData(data);
    setViewState("ready");
  }, [router]);

  useEffect(() => { init(); }, [init]);

  if (viewState === "loading")    return <LoadingSkeleton />;
  if (viewState === "onboarding") return <OnboardingState user={userInfo} />;
  return dashData ? <DashboardContent data={dashData} /> : <LoadingSkeleton />;
}
