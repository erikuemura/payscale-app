"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, CheckCircle, ChevronRight, Menu, X,
  Zap, Shield, TrendingUp, Bell, FileBarChart2, RefreshCw,
  Star,
} from "lucide-react";

/* ── data ── */
const NAV = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Integrações",     href: "#integracoes"     },
  { label: "Preços",          href: "#precos"           },
];

const METRICS = [
  { value: "R$ 4,8M", label: "recuperados pelos clientes"           },
  { value: "98,7%",   label: "precisão na auditoria MDR"            },
  { value: "< 2 min", label: "para conectar o primeiro adquirente"  },
  { value: "6+",      label: "adquirentes e ERPs suportados"        },
];

const PAINS = [
  {
    icon: <RefreshCw size={20} />,
    title: "Horas perdidas na conciliação manual",
    desc:  "Sua equipe gasta dias cruzando planilhas de vendas com extratos dos adquirentes, enquanto divergências passam despercebidas.",
  },
  {
    icon: <Bell size={20} />,
    title: "Taxas cobradas acima do contratado",
    desc:  "PagSeguro, Mercado Pago e outras plataformas frequentemente cobram MDR acima do acordado. Sem monitoramento, você paga sem saber.",
  },
  {
    icon: <Shield size={20} />,
    title: "Chargebacks viram prejuízo silencioso",
    desc:  "Disputas não contestadas no prazo, ou não contestadas por falta de controle, geram perdas financeiras que se acumulam mês a mês.",
  },
];

const FEATURES = [
  {
    id: "conciliacao",
    icon: <RefreshCw size={22} />,
    title: "Conciliação Automática",
    desc:  "Cruzamento diário entre suas vendas e liquidações dos adquirentes. Divergências detectadas e sinalizadas automaticamente.",
    color: "#2563eb",
    wide: true,
  },
  {
    id: "mdr",
    icon: <TrendingUp size={22} />,
    title: "Monitor MDR",
    desc:  "Compare as taxas contratadas com as efetivamente cobradas, modalidade a modalidade.",
    color: "#059669",
    wide: false,
  },
  {
    id: "alertas",
    icon: <Bell size={22} />,
    title: "Alertas em Tempo Real",
    desc:  "Seja notificado imediatamente quando uma tarifa sair do contratado ou uma liquidação atrasar.",
    color: "#b45309",
    wide: false,
  },
  {
    id: "chargebacks",
    icon: <Shield size={22} />,
    title: "Gestão de Chargebacks",
    desc:  "Acompanhe todas as disputas, prazos de contestação e taxa de sucesso em um único painel.",
    color: "#dc2626",
    wide: false,
  },
  {
    id: "relatorios",
    icon: <FileBarChart2 size={22} />,
    title: "Relatórios Automáticos",
    desc:  "Relatórios mensais de conciliação, MDR e chargebacks enviados direto ao e-mail do seu financeiro.",
    color: "#7c3aed",
    wide: false,
  },
  {
    id: "multi",
    icon: <Zap size={22} />,
    title: "Multi-adquirente",
    desc:  "Consolide PagSeguro, Mercado Pago, Stone, Cielo e outros em um único dashboard.",
    color: "#2563eb",
    wide: true,
  },
];

const STEPS = [
  {
    num: "01",
    title: "Conecte suas contas",
    desc:  "Adicione suas credenciais de API do PagSeguro, Mercado Pago ou ERP em menos de 2 minutos. Criptografia AES-256 em todas as chaves.",
    badge: "2 minutos",
  },
  {
    num: "02",
    title: "Importamos tudo automaticamente",
    desc:  "Vendas, liquidações, tarifas e chargebacks são importados diariamente. Histórico completo dos últimos 12 meses na primeira sincronização.",
    badge: "100% automático",
  },
  {
    num: "03",
    title: "Recupere o que é seu",
    desc:  "Alertas imediatos sobre cobranças indevidas, divergências e chargebacks. Ação rápida = mais dinheiro voltando para o seu caixa.",
    badge: "ROI imediato",
  },
];

const INTEGRATIONS = [
  { initials: "PS", name: "PagSeguro",    color: "#f59e0b" },
  { initials: "MP", name: "Mercado Pago", color: "#2563eb" },
  { initials: "ST", name: "Stone",        color: "#059669" },
  { initials: "CI", name: "Cielo",        color: "#dc2626" },
  { initials: "BL", name: "Bling ERP",    color: "#10b981" },
  { initials: "TO", name: "TOTVS",        color: "#8b5cf6" },
];

const PLANS = [
  {
    name: "Starter",
    price: "297",
    desc: "Para pequenas empresas dando os primeiros passos na gestão financeira.",
    features: [
      "Até 2 adquirentes",
      "Conciliação automática diária",
      "Monitor MDR básico",
      "Alertas por e-mail",
      "Relatório mensal PDF",
      "Suporte por chat",
    ],
    cta: "Começar grátis",
    highlight: false,
  },
  {
    name: "Growth",
    price: "597",
    desc: "Controle total sobre tarifas, chargebacks e liquidações.",
    features: [
      "Até 4 adquirentes + 1 ERP",
      "Tudo do Starter",
      "Auditoria MDR avançada com histórico",
      "Gestão completa de chargebacks",
      "Relatórios automáticos por e-mail",
      "Dashboard multi-empresa",
      "Suporte prioritário",
    ],
    cta: "Começar grátis",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: null,
    desc: "Para grupos e grandes operações com múltiplas empresas e adquirentes.",
    features: [
      "Adquirentes e ERPs ilimitados",
      "Tudo do Growth",
      "Integração customizada",
      "SLA garantido (99,9% uptime)",
      "Onboarding dedicado",
      "Gerente de conta exclusivo",
    ],
    cta: "Falar com consultor",
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    quote: "Identificamos R$ 18.400 em tarifas cobradas acima do contratado no primeiro mês. O sistema se pagou em 3 dias.",
    name:  "Rafael M.",
    role:  "CFO — e-commerce de moda",
    stars: 5,
  },
  {
    quote: "Nossa equipe financeira gastava 2 dias por mês na conciliação. Hoje leva menos de 30 minutos e é muito mais precisa.",
    name:  "Camila S.",
    role:  "Gerente Financeira — marketplace",
    stars: 5,
  },
  {
    quote: "A gestão de chargebacks melhorou nossa taxa de sucesso de 38% para 71% em 60 dias.",
    name:  "Bruno A.",
    role:  "Head de Operações — SaaS B2B",
    stars: 5,
  },
];

/* ── page ── */
export default function SitePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>

      {/* ══ NAV ══ */}
      <header className="fixed top-0 inset-x-0 z-50 h-16"
        style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(226,232,240,0.8)" }}>
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-5 lg:px-8">

          <Link href="/site" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}>P</div>
            <span className="font-bold text-sm tracking-tight" style={{ color: "#1a202c" }}>
              PayScale <span style={{ color: "#2563eb" }}>Intelligence</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {NAV.map(n => (
              <a key={n.href} href={n.href} className="text-sm font-medium transition-colors hover:text-blue-600"
                style={{ color: "#4a5568" }}>{n.label}</a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium transition-colors hover:text-blue-600"
              style={{ color: "#4a5568" }}>Entrar</Link>
            <Link href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "#2563eb" }}>
              Começar grátis <ArrowRight size={14} />
            </Link>
          </div>

          <button className="md:hidden p-2 rounded-lg" style={{ color: "#4a5568" }}
            onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden absolute top-16 inset-x-0 px-5 pb-5 pt-2"
            style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
            {NAV.map(n => (
              <a key={n.href} href={n.href} onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-medium border-b"
                style={{ color: "#4a5568", borderColor: "#f1f5f9" }}>{n.label}</a>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <Link href="/login" className="py-3 text-sm font-medium text-center rounded-lg"
                style={{ border: "1px solid #e2e8f0", color: "#4a5568" }}>Entrar</Link>
              <Link href="/login"
                className="py-3 rounded-lg text-sm font-bold text-white text-center"
                style={{ background: "#2563eb" }}>Começar grátis — 14 dias</Link>
            </div>
          </div>
        )}
      </header>

      {/* ══ HERO ══ */}
      <section className="relative px-5 lg:px-8 overflow-hidden"
        style={{ background: "linear-gradient(155deg,#0f172a 0%,#1e293b 55%,#0f172a 100%)", paddingTop: "clamp(6rem,10vw,9rem)", paddingBottom: "clamp(3rem,6vw,5rem)" }}>
        {/* grid texture */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        {/* blue glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] sm:w-[700px] h-[300px] sm:h-[450px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle,#2563eb,transparent 70%)" }} />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold mb-6 sm:mb-8"
            style={{ background: "rgba(37,99,235,0.18)", border: "1px solid rgba(37,99,235,0.35)", color: "#93c5fd" }}>
            <Zap size={11} /> Novo: integração com Stone e Cielo disponível
          </div>

          {/* headline — smaller on mobile */}
          <h1 className="text-[2rem] sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-4 sm:mb-6 text-white">
            Pare de perder dinheiro
            <br />
            <span style={{ background: "linear-gradient(90deg,#60a5fa,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              para os adquirentes
            </span>
          </h1>

          <p className="text-sm sm:text-lg max-w-md sm:max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0"
            style={{ color: "#94a3b8" }}>
            Conecte PagSeguro, Mercado Pago, Bling e outros em minutos. O PayScale Intelligence
            audita suas tarifas, concilia vendas e alerta sobre cobranças indevidas — no piloto automático.
          </p>

          {/* CTAs — stack on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-0">
            <Link href="/login"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 0 0 1px rgba(255,255,255,0.1),0 8px 32px rgba(37,99,235,0.4)" }}>
              Começar grátis — 14 dias <ArrowRight size={15} />
            </Link>
            <a href="#funcionalidades"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.18)", color: "#e2e8f0" }}>
              Ver como funciona <ChevronRight size={15} />
            </a>
          </div>

          {/* dashboard mockup */}
          <div className="relative max-w-3xl mx-auto rounded-xl sm:rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            {/* browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 sm:py-3" style={{ background: "#1e293b", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400/70"/>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400/70"/>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400/70"/>
              <div className="flex-1 mx-3 h-4 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}/>
            </div>
            {/* fake app */}
            <div className="p-3 sm:p-5" style={{ background: "#0f172a" }}>
              {/* KPIs: 2 cols on mobile, 4 on sm+ */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
                {[
                  { label: "Volume Total", value: "R$ 483k",   up: true  },
                  { label: "MDR Cobrado",  value: "R$ 14,6k",  up: false },
                  { label: "Recuperado",   value: "R$ 3,9k",   up: true  },
                  { label: "Chargebacks",  value: "5 abertos", up: false },
                ].map(k => (
                  <div key={k.label} className="rounded-lg sm:rounded-xl p-2.5 sm:p-3"
                    style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[9px] sm:text-[10px] mb-1 sm:mb-1.5" style={{ color: "#64748b" }}>{k.label}</p>
                    <p className="text-xs sm:text-sm font-bold leading-tight"
                      style={{ color: k.up ? "#34d399" : "#f87171" }}>{k.value}</p>
                  </div>
                ))}
              </div>
              {/* chart */}
              <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 mb-2.5 sm:mb-3"
                style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)", height: 64 }}>
                <div className="flex items-end gap-1 sm:gap-1.5 h-full">
                  {[35,55,42,68,58,80,62,74,88,70,95,82].map((h,i) => (
                    <div key={i} className="flex-1 rounded-sm"
                      style={{ height: `${h}%`, background: i > 8 ? "#2563eb" : "#1d4ed8", opacity: 0.75 }} />
                  ))}
                </div>
              </div>
              {/* alert */}
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs"
                style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.2)", color: "#fca5a5" }}>
                <Bell size={10} className="shrink-0" />
                <span className="truncate">MDR Crédito 12x cobrado 0,30% acima do contratado —&nbsp;
                  <strong style={{ color: "#f87171" }}>−R$ 1.240</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ METRICS ══ */}
      <section style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div className="max-w-5xl mx-auto px-5 lg:px-8" style={{ paddingTop: "2.5rem", paddingBottom: "2.5rem" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {METRICS.map(m => (
              <div key={m.value} className="text-center">
                <p className="text-2xl sm:text-3xl font-black mb-1" style={{ color: "#2563eb" }}>{m.value}</p>
                <p className="text-xs sm:text-sm leading-snug" style={{ color: "#8896a8" }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROBLEM ══ */}
      <section className="px-5 lg:px-8" style={{ background: "#f7f9fc", paddingTop: "clamp(3.5rem,7vw,6rem)", paddingBottom: "clamp(3.5rem,7vw,6rem)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 lg:mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#2563eb" }}>O Problema</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight" style={{ color: "#1a202c" }}>
              Seu dinheiro está escorregando<br className="hidden sm:block" /> por buracos invisíveis
            </h2>
            <p className="mt-4 text-sm sm:text-base max-w-xl mx-auto" style={{ color: "#64748b" }}>
              Toda empresa que processa pagamentos eletrônicos convive com esses três problemas — e a maioria nem sabe.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {PAINS.map(p => (
              <div key={p.title} className="rounded-2xl p-6 sm:p-7"
                style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-4 sm:mb-5"
                  style={{ background: "#fef2f2", color: "#dc2626" }}>{p.icon}</div>
                <h3 className="text-sm sm:text-base font-bold mb-2" style={{ color: "#1a202c" }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="funcionalidades" className="px-5 lg:px-8" style={{ background: "#fff", paddingTop: "clamp(3.5rem,7vw,6rem)", paddingBottom: "clamp(3.5rem,7vw,6rem)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 lg:mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#2563eb" }}>Funcionalidades</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight" style={{ color: "#1a202c" }}>
              Tudo que você precisa para<br className="hidden sm:block" /> controlar seus pagamentos
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.id}
                className={`rounded-2xl p-6 sm:p-7 flex flex-col gap-4 ${f.wide ? "md:col-span-2" : ""}`}
                style={{ background: f.color + "08", border: `1px solid ${f.color}20` }}>
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: f.color + "15", color: f.color }}>{f.icon}</div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold mb-1.5" style={{ color: "#1a202c" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="px-5 lg:px-8" style={{ background: "#f7f9fc", paddingTop: "clamp(3.5rem,7vw,6rem)", paddingBottom: "clamp(3.5rem,7vw,6rem)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#2563eb" }}>Como funciona</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight" style={{ color: "#1a202c" }}>
              Da conexão ao resultado em minutos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            {/* connector (desktop only) */}
            <div className="hidden md:block absolute top-[52px] left-[calc(33%+28px)] right-[calc(33%+28px)] h-px"
              style={{ background: "linear-gradient(90deg,#2563eb,#34d399)", opacity: 0.35 }} />

            {STEPS.map((s, i) => (
              <div key={s.num} className="flex gap-5 md:flex-col md:gap-0 md:items-center md:text-center">
                {/* step number + badge */}
                <div className="shrink-0 flex flex-col items-center gap-2 md:mb-5">
                  {/* badge above number on all sizes */}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap"
                    style={{ background: "#2563eb" }}>{s.badge}</span>
                  <div className="w-14 h-14 md:w-18 md:h-18 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl font-black"
                    style={{ background: "#fff", border: "2px solid #e2e8f0", color: "#2563eb",
                      boxShadow: "0 4px 16px rgba(37,99,235,0.1)", width: 56, height: 56 }}>
                    {s.num}
                  </div>
                  {/* vertical connector on mobile */}
                  {i < STEPS.length - 1 && (
                    <div className="md:hidden w-px flex-1 min-h-[24px]"
                      style={{ background: "linear-gradient(to bottom,#2563eb,#34d399)", opacity: 0.3 }} />
                  )}
                </div>
                {/* text */}
                <div className="pt-1 md:pt-0">
                  <h3 className="text-sm sm:text-base font-bold mb-2" style={{ color: "#1a202c" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INTEGRATIONS ══ */}
      <section id="integracoes" className="px-5 lg:px-8" style={{ background: "#fff", paddingTop: "clamp(3.5rem,7vw,6rem)", paddingBottom: "clamp(3.5rem,7vw,6rem)" }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#2563eb" }}>Integrações</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4" style={{ color: "#1a202c" }}>
            Funciona com as plataformas<br className="hidden sm:block" /> que você já usa
          </h2>
          <p className="text-sm sm:text-base mb-10 sm:mb-12 max-w-lg mx-auto" style={{ color: "#64748b" }}>
            Conexão via API oficial com os principais adquirentes e ERPs do mercado brasileiro.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {INTEGRATIONS.map(g => (
              <div key={g.name} className="flex flex-col items-center gap-2.5 w-20 sm:w-28">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-base sm:text-lg font-black"
                  style={{ background: g.color + "12", border: `2px solid ${g.color}20`, color: g.color }}>
                  {g.initials}
                </div>
                <p className="text-[11px] sm:text-xs font-semibold text-center" style={{ color: "#4a5568" }}>{g.name}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs sm:text-sm" style={{ color: "#94a3b8" }}>
            + Stone, Cielo e mais em breve.{" "}
            <a href="#" className="underline" style={{ color: "#2563eb" }}>Sugerir integração</a>
          </p>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="px-5 lg:px-8" style={{ background: "#f7f9fc", paddingTop: "clamp(3.5rem,7vw,6rem)", paddingBottom: "clamp(3.5rem,7vw,6rem)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 lg:mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#2563eb" }}>Resultados</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight" style={{ color: "#1a202c" }}>
              Empresas que já recuperaram o controle
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="rounded-2xl p-6 sm:p-7"
                style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div className="flex gap-0.5 mb-4 sm:mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={13} fill="#f59e0b" style={{ color: "#f59e0b" }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4 sm:mb-5" style={{ color: "#1a202c" }}>"{t.quote}"</p>
                <div>
                  <p className="text-xs font-bold" style={{ color: "#1a202c" }}>{t.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8896a8" }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="precos" className="px-5 lg:px-8" style={{ background: "#fff", paddingTop: "clamp(3.5rem,7vw,6rem)", paddingBottom: "clamp(3.5rem,7vw,6rem)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 lg:mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#2563eb" }}>Preços</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4" style={{ color: "#1a202c" }}>
              Transparente como deveriam<br className="hidden sm:block" /> ser suas tarifas
            </h2>
            <p className="text-sm sm:text-base" style={{ color: "#64748b" }}>
              14 dias grátis, sem cartão de crédito. Cancele quando quiser.
            </p>
          </div>

          {/* px-1 prevents ring from being clipped on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-start px-1">
            {PLANS.map(p => (
              <div key={p.name}
                className={`rounded-2xl overflow-hidden ${p.highlight ? "ring-2 ring-blue-500 shadow-xl shadow-blue-100" : ""}`}
                style={{ border: p.highlight ? "none" : "1px solid #e2e8f0" }}>
                {p.highlight && (
                  <div className="py-2 text-center text-xs font-bold text-white" style={{ background: "#2563eb" }}>
                    Mais popular
                  </div>
                )}
                <div className="p-6 sm:p-7">
                  <p className="text-sm font-bold mb-1" style={{ color: "#1a202c" }}>{p.name}</p>
                  <p className="text-xs mb-5 leading-snug" style={{ color: "#8896a8" }}>{p.desc}</p>

                  {p.price ? (
                    <div className="flex items-end gap-1 mb-5 sm:mb-6">
                      <span className="text-xs font-medium" style={{ color: "#8896a8" }}>R$</span>
                      <span className="text-3xl sm:text-4xl font-black" style={{ color: "#1a202c" }}>{p.price}</span>
                      <span className="text-xs mb-1" style={{ color: "#8896a8" }}>/mês</span>
                    </div>
                  ) : (
                    <div className="mb-5 sm:mb-6">
                      <span className="text-xl sm:text-2xl font-black" style={{ color: "#1a202c" }}>Sob consulta</span>
                    </div>
                  )}

                  <Link href="/login"
                    className="block w-full py-3 rounded-xl text-sm font-bold text-center transition-all hover:opacity-90 mb-6 sm:mb-7"
                    style={{
                      background: p.highlight ? "#2563eb" : "#f7f9fc",
                      color:      p.highlight ? "#fff"    : "#1a202c",
                      border:     p.highlight ? "none"    : "1px solid #e2e8f0",
                    }}>
                    {p.cta}
                  </Link>

                  <ul className="space-y-3">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "#4a5568" }}>
                        <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: "#059669" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DARK CTA ══ */}
      <section className="px-5 lg:px-8 relative overflow-hidden"
        style={{ paddingTop: "clamp(3.5rem,7vw,6rem)", paddingBottom: "clamp(3.5rem,7vw,6rem)", background: "linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#0f172a 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[500px] h-[250px] sm:h-[300px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle,#3b82f6,transparent 70%)" }} />

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black tracking-tight mb-5 sm:mb-6 text-white">
            Quanto você está perdendo<br /> por mês?
          </h2>
          <p className="text-sm sm:text-lg mb-8 sm:mb-10 max-w-lg mx-auto" style={{ color: "#94a3b8" }}>
            A maioria das empresas descobre, no primeiro mês, pelo menos 3× o valor da mensalidade
            em cobranças indevidas. O PayScale Intelligence se paga — e sobra.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Link href="/login"
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 0 0 1px rgba(255,255,255,0.1),0 8px 32px rgba(37,99,235,0.4)" }}>
              Começar grátis — 14 dias <ArrowRight size={15} />
            </Link>
            <a href="mailto:contato@payscale.com.br"
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#e2e8f0" }}>
              Falar com um especialista
            </a>
          </div>
          <p className="mt-6 text-[11px] sm:text-xs" style={{ color: "#475569" }}>
            Sem cartão de crédito · Cancele quando quiser · Setup em menos de 5 minutos
          </p>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-5 lg:px-8" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-10" style={{ marginBottom: "2.5rem" }}>
            {/* brand — full row on mobile */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                  style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}>P</div>
                <span className="font-bold text-sm text-white">PayScale Intelligence</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
                Conciliação financeira e auditoria de tarifas para empresas que processam pagamentos eletrônicos.
              </p>
            </div>
            {/* link columns */}
            {[
              { title: "Produto",  links: ["Funcionalidades","Preços","Integrações","Novidades"]          },
              { title: "Empresa",  links: ["Sobre nós","Blog","Carreiras","Contato"]                     },
              { title: "Suporte",  links: ["Central de ajuda","Status","Termos de uso","Privacidade"]    },
            ].map(col => (
              <div key={col.title}>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4"
                  style={{ color: "#94a3b8" }}>{col.title}</p>
                <ul className="space-y-2 sm:space-y-2.5">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-xs sm:text-sm transition-colors hover:text-white"
                        style={{ color: "#64748b" }}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[11px] text-center sm:text-left" style={{ color: "#475569" }}>
              © 2026 PayScale Intelligence. Todos os direitos reservados.
            </p>
            <p className="text-[11px]" style={{ color: "#475569" }}>
              CNPJ 00.000.000/0001-00 · São Paulo, SP
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
