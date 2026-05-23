"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle,
  Building2, User, Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

/* ── Segmentos ── */
const SEGMENTS = [
  { value: "",              label: "Selecione o segmento…"  },
  { value: "ecommerce",    label: "E-commerce"              },
  { value: "alimentacao",  label: "Alimentação & Bebidas"   },
  { value: "moda",         label: "Moda & Vestuário"        },
  { value: "esporte",      label: "Esporte & Fitness"       },
  { value: "automotivo",   label: "Automotivo"              },
  { value: "saude_beleza", label: "Saúde & Beleza"          },
  { value: "tecnologia",   label: "Tecnologia & SaaS"       },
  { value: "educacao",     label: "Educação"                },
  { value: "hotelaria",    label: "Hotelaria & Turismo"     },
  { value: "construcao",   label: "Construção & Imóveis"    },
  { value: "servicos",     label: "Serviços B2B"            },
  { value: "varejo",       label: "Varejo & Outros"         },
];

/* ── Google icon ── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

/* ── Barra de força da senha ── */
function PasswordStrength({ pwd }: { pwd: string }) {
  if (!pwd) return null;
  const score =
    (pwd.length >= 8  ? 1 : 0) +
    (pwd.length >= 12 ? 1 : 0) +
    (/\d/.test(pwd)   ? 1 : 0) +
    (/[a-zA-Z]/.test(pwd) ? 1 : 0);
  const colors = ["", "#dc2626", "#f59e0b", "#2563eb", "#059669"];
  const labels = ["", "Fraca", "Regular", "Boa", "Forte"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : "#e2e8f0" }} />
        ))}
      </div>
      <p className="text-[11px]" style={{ color: colors[score] }}>{labels[score]}</p>
    </div>
  );
}

export default function SignupPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [personType, setPersonType] = useState<"pj" | "pf">("pj");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [segment,  setSegment]  = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [oLoading, setOLoading] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [done,     setDone]     = useState(false);

  /* ── Google OAuth ── */
  async function handleGoogle() {
    setOLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      setError("Não foi possível conectar com o Google. Tente novamente.");
      setOLoading(false);
    }
  }

  /* ── Cadastro e-mail ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("A senha deve ter pelo menos 8 caracteres."); return; }
    if (!segment)            { setError("Selecione o segmento da sua empresa.");       return; }
    setLoading(true);

    try {
      // 1ª tentativa: rota server-side (não envia e-mail, sem rate limit)
      const res  = await fetch("/api/auth/signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          email, password,
          full_name:   name,
          person_type: personType,
          segment,
          company: personType === "pj" ? name : null,
        }),
      });
      const json = await res.json();

      if (json.ok && json.access_token) {
        // Seta a sessão no browser e redireciona
        await supabase.auth.setSession({
          access_token:  json.access_token,
          refresh_token: json.refresh_token,
        });
        router.push("/dashboard");
        router.refresh();
        return;
      }

      if (json.ok && json.redirect) {
        router.push(json.redirect);
        return;
      }

      // Rota server retornou erro não-500 → mostra pro usuário
      if (res.status !== 500 && json.error) {
        setError(json.error);
        setLoading(false);
        return;
      }

      // 2ª tentativa: fluxo normal do Supabase (fallback)
      throw new Error("fallback");

    } catch {
      // Fallback: signUp padrão (com e-mail)
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { full_name: name, person_type: personType, segment, company: personType === "pj" ? name : null },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      setLoading(false);
      if (error) {
        setError(
          error.message.includes("already registered")
            ? "Este e-mail já está cadastrado. Faça login."
            : error.message.includes("rate limit") || error.message.includes("email")
            ? "Limite de e-mails atingido. Tente entrar com Google ou aguarde alguns minutos."
            : error.message
        );
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) { router.push("/dashboard"); router.refresh(); }
      else setDone(true);
    }
  }

  /* ── Confirmação enviada ── */
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "var(--green-dim)" }}>
            <CheckCircle size={32} style={{ color: "var(--green)" }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Confirme seu e-mail</h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted)" }}>
            Enviamos um link para{" "}
            <strong style={{ color: "var(--text)" }}>{email}</strong>.
            {" "}Clique nele para ativar sua conta e acessar o painel.
          </p>
          <Link href="/" className="text-sm font-semibold hover:underline"
            style={{ color: "var(--blue)" }}>
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#fff" }}>

      {/* ══ Painel esquerdo ══ */}
      <div className="hidden lg:flex flex-col justify-between w-[400px] shrink-0 p-12"
        style={{ background: "linear-gradient(155deg,#0f172a 0%,#1e3a8a 60%,#0f172a 100%)" }}>

        <Link href="/site" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Zap size={16} fill="white" className="text-white" />
          </div>
          <span className="text-white font-bold text-sm">PayScale Intelligence</span>
        </Link>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#60a5fa" }}>
            14 dias grátis · Sem cartão de crédito
          </p>
          <h2 className="text-3xl font-black text-white leading-snug mb-5">
            Descubra quanto você está perdendo para os adquirentes
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#93c5fd" }}>
            Configure em menos de 5 minutos e veja suas cobranças indevidas já no primeiro dia.
          </p>
          <div className="space-y-3">
            {[
              "Conciliação automática de vendas",
              "Auditoria de MDR em tempo real",
              "Alertas de cobrança indevida",
              "Gestão de chargebacks com prazo",
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm"
                style={{ color: "#bfdbfe" }}>
                <CheckCircle size={14} className="shrink-0"
                  style={{ color: "#34d399" }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "#1e3a5f" }}>
          © 2026 PayScale Intelligence
        </p>
      </div>

      {/* ══ Formulário ══ */}
      <div className="flex-1 flex items-start justify-center px-5 py-10 overflow-y-auto"
        style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <Link href="/site" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--blue)" }}>
              <Zap size={15} fill="white" className="text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--text)" }}>
              PayScale Intelligence
            </span>
          </Link>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
            Criar sua conta
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            14 dias grátis, sem cartão de crédito.
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={oLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:bg-gray-50 active:scale-[0.99] disabled:opacity-60 mb-4"
            style={{ border: "1px solid var(--border)", background: "#fff", color: "var(--text)" }}>
            {oLoading ? "Conectando…" : <><GoogleIcon /> Continuar com Google</>}
          </button>

          {/* Divisor */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-[11px] font-medium whitespace-nowrap"
              style={{ color: "var(--muted)" }}>ou continue com e-mail</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {/* Erro */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg mb-4 text-sm"
              style={{ background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)" }}>
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* PF / PJ */}
            <div>
              <label className="block text-xs font-semibold mb-2"
                style={{ color: "var(--text-2)" }}>Tipo de cadastro</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { type: "pj" as const, Icon: Building2, label: "Empresa (PJ)" },
                  { type: "pf" as const, Icon: User,      label: "Pessoa Física" },
                ] as const).map(({ type, Icon, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPersonType(type)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      border: `1.5px solid ${personType === type ? "var(--blue)" : "var(--border)"}`,
                      background: personType === type ? "var(--blue-dim)" : "#fff",
                      color:      personType === type ? "var(--blue)"    : "var(--text-2)",
                    }}>
                    <Icon size={14} strokeWidth={1.8} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nome / Razão Social */}
            <div>
              <label className="block text-xs font-semibold mb-1.5"
                style={{ color: "var(--text-2)" }}>
                {personType === "pj" ? "Razão social / Nome da empresa" : "Nome completo"}
              </label>
              <input
                type="text"
                className="input-base"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={personType === "pj" ? "Minha Empresa Ltda." : "João Silva"}
                autoComplete={personType === "pj" ? "organization" : "name"}
              />
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-xs font-semibold mb-1.5"
                style={{ color: "var(--text-2)" }}>E-mail</label>
              <input
                type="email"
                className="input-base"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="voce@empresa.com.br"
                autoComplete="email"
              />
            </div>

            {/* Segmento */}
            <div>
              <label className="block text-xs font-semibold mb-1.5"
                style={{ color: "var(--text-2)" }}>Segmento da empresa</label>
              <select
                className="input-base"
                required
                value={segment}
                onChange={e => setSegment(e.target.value)}
                style={{ cursor: "pointer" }}>
                {SEGMENTS.map(s => (
                  <option key={s.value} value={s.value} disabled={!s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-xs font-semibold mb-1.5"
                style={{ color: "var(--text-2)" }}>
                Senha{" "}
                <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                  (mín. 8 caracteres)
                </span>
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  className="input-base"
                  style={{ paddingRight: 42 }}
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted)" }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <PasswordStrength pwd={password} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
              style={{ background: "var(--blue)", color: "#fff" }}>
              {loading
                ? "Criando conta…"
                : <><span>Criar conta grátis</span> <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: "var(--muted)" }}>
            Já tem uma conta?{" "}
            <Link href="/" className="font-semibold hover:underline"
              style={{ color: "var(--blue)" }}>Fazer login</Link>
          </p>
          <p className="text-center text-[11px] mt-3 leading-relaxed"
            style={{ color: "var(--muted)" }}>
            Ao criar sua conta você concorda com os{" "}
            <a href="#" className="underline" style={{ color: "var(--text-2)" }}>Termos de Uso</a>
            {" "}e a{" "}
            <a href="#" className="underline" style={{ color: "var(--text-2)" }}>Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
