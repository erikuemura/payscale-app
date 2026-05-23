"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { createClient } from "@/lib/supabase/client";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Plug, ArrowRight, Zap,
  ShieldCheck, Clock,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

/* ── Tipos ─────────────────────────────────────────────── */
interface UserInfo {
  name: string | null;
  email: string | null;
  trialEnds: Date | null;
}

/* ═══════════════════════════════════════════════════════
   TELA DE ONBOARDING (sem integrações)
═══════════════════════════════════════════════════════ */
const PROVIDERS = [
  { id: "pagseguro",    label: "PagSeguro",    initials: "PS", color: "#f59e0b" },
  { id: "mercadopago",  label: "Mercado Pago", initials: "MP", color: "#2563eb" },
  { id: "stone",        label: "Stone",        initials: "ST", color: "#059669" },
  { id: "cielo",        label: "Cielo",        initials: "CI", color: "#7c3aed" },
  { id: "rede",         label: "Rede",         initials: "RE", color: "#dc2626" },
  { id: "getnet",       label: "Getnet",       initials: "GN", color: "#0891b2" },
];

function OnboardingState({ user }: { user: UserInfo }) {
  const firstName = user.name?.split(" ")[0] ?? "por aí";

  const daysLeft = user.trialEnds
    ? Math.max(0, Math.ceil((user.trialEnds.getTime() - Date.now()) / 86_400_000))
    : 14;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Visão Geral" />

      <main className="flex-1 p-5 lg:p-8" style={{ background: "var(--bg)" }}>

        {/* Trial badge */}
        {daysLeft > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium mb-6 w-fit"
            style={{ background: "var(--blue-dim)", border: "1px solid rgba(37,99,235,0.15)", color: "var(--blue)" }}>
            <Clock size={13} />
            Período gratuito · {daysLeft} {daysLeft === 1 ? "dia restante" : "dias restantes"}
          </div>
        )}

        {/* Boas-vindas */}
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
            {
              num: "1", done: true,
              title: "Criar sua conta",
              desc: "Conta criada com sucesso.",
              icon: <CheckCircle size={16} />, color: "var(--green)",
            },
            {
              num: "2", done: false,
              title: "Conectar adquirente",
              desc: "Integre PagSeguro, Mercado Pago, Stone e outros.",
              icon: <Plug size={16} />, color: "var(--blue)",
            },
            {
              num: "3", done: false,
              title: "Ver seu painel",
              desc: "Conciliação, MDR e alertas em tempo real.",
              icon: <Zap size={16} />, color: "var(--amber)",
            },
          ].map(step => (
            <div key={step.num} className="card p-5 flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: step.done ? "var(--green-dim)" : "var(--blue-dim)",
                  color: step.done ? "var(--green)" : step.color,
                }}>
                {step.done ? <CheckCircle size={16} /> : step.icon}
              </div>
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text)" }}>{step.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Integrações disponíveis */}
        <div className="card">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Escolha seu adquirente</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Conecte em menos de 2 minutos</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px" style={{ background: "var(--border)" }}>
            {PROVIDERS.map(p => (
              <a
                key={p.id}
                href="/dashboard/integracoes"
                className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors group"
                style={{ background: "var(--sidebar)" }}>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{ background: p.color + "18", color: p.color }}>
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{p.label}</p>
                  <p className="text-[11px]" style={{ color: "var(--muted)" }}>Conectar →</p>
                </div>
              </a>
            ))}
          </div>

          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
              <ShieldCheck size={13} style={{ color: "var(--green)" }} />
              Conexão segura · suas credenciais são criptografadas
            </div>
            <a
              href="/dashboard/integracoes"
              className="flex items-center gap-1.5 text-xs font-semibold hover:underline"
              style={{ color: "var(--blue)" }}>
              Ver todas as integrações <ArrowRight size={13} />
            </a>
          </div>
        </div>

      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD REAL (com dados)
   Por enquanto exibe dados da conta logada + mock dos gráficos
   (substituir pelos dados reais do Supabase conforme integrações forem sendo construídas)
═══════════════════════════════════════════════════════ */
const volumeData = [
  { dia: "01/05", pagseguro: 42000, mercadopago: 31000 },
  { dia: "05/05", pagseguro: 58000, mercadopago: 44000 },
  { dia: "10/05", pagseguro: 51000, mercadopago: 39000 },
  { dia: "15/05", pagseguro: 73000, mercadopago: 62000 },
  { dia: "20/05", pagseguro: 67000, mercadopago: 55000 },
  { dia: "22/05", pagseguro: 80000, mercadopago: 71000 },
];
const mdrData = [
  { name: "Déb",      contratado: 1.2, cobrado: 1.2 },
  { name: "Créd 1x",  contratado: 2.5, cobrado: 2.5 },
  { name: "Créd 2x",  contratado: 2.8, cobrado: 3.1 },
  { name: "Créd 6x",  contratado: 3.2, cobrado: 3.2 },
  { name: "Créd 12x", contratado: 3.8, cobrado: 4.1 },
];
const kpis = [
  { label: "Volume Total",        value: "R$ 483.200", sub: "PagSeguro + Mercado Pago", trend: "+12%", up: true  },
  { label: "Tarifas Pagas (MDR)", value: "R$ 14.640",  sub: "sobre todo o volume",      trend: "−2%",  up: false },
  { label: "Economia Potencial",  value: "R$ 3.870",   sub: "Cobranças indevidas",       trend: "+28%", up: true  },
  { label: "Chargebacks Abertos", value: "5",           sub: "R$ 2.340 em risco",         trend: "−1",   up: false },
];
const alertas = [
  { type: "red",   text: "Tarifa MDR acima do contratado — Crédito 12x (+0,3%)", val: "−R$ 1.240", time: "Hoje, 09:14" },
  { type: "red",   text: "Divergência na conciliação — 12 transações sem liquidação", val: "−R$ 8.750", time: "Hoje, 08:02" },
  { type: "amber", text: "Chargeback recebido — prazo de contestação em 3 dias", val: "R$ 450",   time: "Ontem, 16:30" },
  { type: "amber", text: "Tarifa MDR acima do contratado — Crédito 2x (+0,3%)",  val: "−R$ 380",  time: "Ontem, 11:45" },
];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-3 text-xs shadow-lg" style={{ minWidth: 160 }}>
      <p className="font-medium mb-2" style={{ color: "var(--muted)" }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4 mt-1">
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ color: "var(--text)" }}>R$ {(p.value / 1000).toFixed(0)}k</span>
        </div>
      ))}
    </div>
  );
}
const chartAxisStyle = { fontSize: 11, fill: "#8896a8" };
const chartGrid     = { strokeDasharray: "3 3", stroke: "#f1f5f9" };
const tooltipStyle  = {
  contentStyle: { background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, color: "var(--text)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatter: (v: any) => [`${v}%`],
};

function DashboardContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Visão Geral" subtitle="Maio 2026 · 2 integrações ativas" />
      <main className="flex-1 p-5 lg:p-8 space-y-5" style={{ background: "var(--bg)" }}>

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="card p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>{k.label}</p>
                <span className="badge shrink-0"
                  style={{ background: k.up ? "var(--green-dim)" : "var(--red-dim)", color: k.up ? "var(--green)" : "var(--red)" }}>
                  {k.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{k.trend}
                </span>
              </div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text)" }}>{k.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="card p-5 xl:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Volume de Vendas</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Maio 2026 por adquirente</p>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: "var(--blue)" }} /> PagSeguro
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#10b981" }} /> Mercado Pago
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={volumeData} margin={{ left: -10, right: 4, top: 4 }}>
                <defs>
                  <linearGradient id="gPS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--blue)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartGrid} vertical={false} />
                <XAxis dataKey="dia" tick={chartAxisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="pagseguro"   name="PagSeguro"   stroke="var(--blue)" strokeWidth={2} fill="url(#gPS)" dot={false} />
                <Area type="monotone" dataKey="mercadopago" name="Mercado Pago" stroke="#10b981"      strokeWidth={2} fill="url(#gMP)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <div className="mb-5">
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>MDR: Contratado vs Cobrado</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Desvios sinalizados em vermelho</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mdrData} barCategoryGap={10} margin={{ left: -12, right: 4 }}>
                <CartesianGrid {...chartGrid} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#8896a8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#8896a8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="contratado" name="Contratado" fill="var(--blue)" radius={[3,3,0,0]} />
                <Bar dataKey="cobrado"    name="Cobrado"    fill="var(--red)"  radius={[3,3,0,0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts + integrations */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="card xl:col-span-2">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Alertas Recentes</p>
              <span className="badge badge-red">{alertas.length} ativos</span>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {alertas.map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0"
                    style={{ color: a.type === "red" ? "var(--red)" : "var(--amber)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: "var(--text)" }}>{a.text}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>{a.time}</p>
                  </div>
                  <span className="text-xs font-semibold tabular-nums shrink-0"
                    style={{ color: a.type === "red" ? "var(--red)" : "var(--amber)" }}>{a.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Integrações</p>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {[
                { name: "PagSeguro",    ok: true,  detail: "1.204 transações · 3 min",  initials: "PS", color: "#f59e0b" },
                { name: "Mercado Pago", ok: true,  detail: "987 transações · 5 min",    initials: "MP", color: "var(--blue)" },
                { name: "Bling ERP",    ok: false, detail: "Não conectado",              initials: "BL", color: "#10b981" },
              ].map(s => (
                <div key={s.name} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{ background: s.color + "18", color: s.color }}>{s.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: "var(--text)" }}>{s.name}</p>
                    <p className="text-[11px] truncate" style={{ color: "var(--muted)" }}>{s.detail}</p>
                  </div>
                  <span className="badge"
                    style={{ background: s.ok ? "var(--green-dim)" : "#f1f5f9", color: s.ok ? "var(--green)" : "var(--muted)" }}>
                    {s.ok ? "Online" : "Off"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conciliation summary */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Conciliação — Maio 2026</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>2.191 transações processadas</p>
            </div>
            <a href="/dashboard/conciliacao" className="text-xs font-medium hover:underline" style={{ color: "var(--blue)" }}>
              Ver tudo →
            </a>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0" style={{ borderColor: "var(--border)" }}>
            {[
              { label: "Processadas",     value: "2.191", icon: <TrendingUp size={15}/>,   color: "var(--blue)"  },
              { label: "Conciliadas",     value: "2.155", icon: <CheckCircle size={15}/>,  color: "var(--green)" },
              { label: "Com Divergência", value: "24",    icon: <AlertTriangle size={15}/>,color: "var(--amber)" },
              { label: "Sem Liquidação",  value: "12",    icon: <TrendingDown size={15}/>, color: "var(--red)"   },
            ].map(item => (
              <div key={item.label} className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2" style={{ color: item.color }}>
                  {item.icon}
                  <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>{item.label}</span>
                </div>
                <p className="text-xl font-bold tabular-nums" style={{ color: "var(--text)" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   LOADING SKELETON
═══════════════════════════════════════════════════════ */
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
          <div className="h-3 w-20 rounded mt-1" style={{ background: "var(--border)" }} />
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PÁGINA PRINCIPAL — decide qual estado exibir
═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter();
  const [viewState, setViewState] = useState<"loading" | "onboarding" | "ready">("loading");
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: null, email: null, trialEnds: null });

  useEffect(() => {
    async function init() {
      const supabase = createClient();

      // Verifica autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/"); return; }

      // Carrega perfil do Supabase
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

      // Verifica se tem integrações conectadas
      const { count } = await supabase
        .from("integrations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "connected");

      setViewState((count ?? 0) > 0 ? "ready" : "onboarding");
    }

    init();
  }, [router]);

  if (viewState === "loading")    return <LoadingSkeleton />;
  if (viewState === "onboarding") return <OnboardingState user={userInfo} />;
  return <DashboardContent />;
}
