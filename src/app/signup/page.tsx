"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle,
  Building2, User, Zap, Loader2,
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

/* ── Máscaras ──────────────────────────────────────────── */
function formatCNPJ(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2)  return d;
  if (d.length <= 5)  return `${d.slice(0,2)}.${d.slice(2)}`;
  if (d.length <= 8)  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
}

function formatCPF(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

/* ── Validações ────────────────────────────────────────── */
function validateCNPJ(cnpj: string): boolean {
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const calc = (digits: string, len: number) => {
    let sum = 0, pos = len - 7;
    for (let i = len; i >= 1; i--) {
      sum += parseInt(digits[len - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(d, 12) === parseInt(d[12]) && calc(d, 13) === parseInt(d[13]);
}

function validateCPF(cpf: string): boolean {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const calc = (digits: string, len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(digits[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r >= 10 ? 0 : r;
  };
  return calc(d, 9) === parseInt(d[9]) && calc(d, 10) === parseInt(d[10]);
}

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
    <div style={{ marginTop: "0.5rem" }}>
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.25rem" }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ height: 4, flex: 1, borderRadius: 99, transition: "background 0.3s", background: i <= score ? colors[score] : "var(--border)" }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color: colors[score] }}>{labels[score]}</p>
    </div>
  );
}

export default function SignupPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [personType, setPersonType] = useState<"pj" | "pf">("pj");
  const [name,     setName]     = useState("");
  const [document, setDocument] = useState(""); // CNPJ ou CPF (formatado)
  const [email,    setEmail]    = useState("");
  const [segment,  setSegment]  = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [oLoading, setOLoading] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [done,     setDone]     = useState(false);

  /* Reseta documento ao trocar tipo */
  function handlePersonType(t: "pj" | "pf") {
    setPersonType(t);
    setDocument("");
  }

  /* Handler de documento com máscara automática */
  function handleDocument(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setDocument(personType === "pj" ? formatCNPJ(raw) : formatCPF(raw));
  }

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

    /* Validações */
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres."); return;
    }
    if (!segment) {
      setError("Selecione o segmento da sua empresa."); return;
    }
    if (personType === "pj" && !validateCNPJ(document)) {
      setError("CNPJ inválido. Verifique os dígitos e tente novamente."); return;
    }
    if (personType === "pf" && !validateCPF(document)) {
      setError("CPF inválido. Verifique os dígitos e tente novamente."); return;
    }

    setLoading(true);

    const meta = {
      full_name:   name,
      person_type: personType,
      segment,
      document:    document.replace(/\D/g, ""), // armazena só dígitos
      company:     personType === "pj" ? name : null,
    };

    try {
      /* 1ª tentativa: rota server-side */
      const res  = await fetch("/api/auth/signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password, ...meta }),
      });
      const json = await res.json();

      if (json.ok && json.access_token) {
        await supabase.auth.setSession({
          access_token:  json.access_token,
          refresh_token: json.refresh_token,
        });
        router.push("/dashboard");
        router.refresh();
        return;
      }
      if (json.ok && json.redirect) { router.push(json.redirect); return; }
      if (res.status !== 500 && json.error) { setError(json.error); setLoading(false); return; }

      throw new Error("fallback");

    } catch {
      /* Fallback: signUp padrão */
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: meta, emailRedirectTo: `${location.origin}/auth/callback` },
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
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg)", padding: "1.5rem" }}>
        <div style={{ width: "100%", maxWidth: "24rem", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", background: "var(--green-dim)" }}>
            <CheckCircle size={32} style={{ color: "var(--green)" }} />
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text)" }}>Confirme seu e-mail</h1>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.5rem", color: "var(--muted)" }}>
            Enviamos um link para{" "}
            <strong style={{ color: "var(--text)" }}>{email}</strong>.
            {" "}Clique nele para ativar sua conta e acessar o painel.
          </p>
          <Link href="/" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--blue)" }}>
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  /* ── Labels dinâmicos por tipo ── */
  const isPJ = personType === "pj";
  const docLabel       = isPJ ? "CNPJ"               : "CPF";
  const docPlaceholder = isPJ ? "00.000.000/0001-00"  : "000.000.000-00";
  const docMaxLen      = isPJ ? 18                    : 14; // chars formatados

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      <title>Criar Conta | PayScale Intelligence</title>

      {/* ══ Painel esquerdo ══ */}
      <div className="hidden lg:flex flex-col justify-between"
        style={{ width: 400, flexShrink: 0, padding: "3rem", background: "linear-gradient(155deg,#0f172a 0%,#1e3a8a 60%,#0f172a 100%)" }}>

        <Link href="/site" style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={16} fill="white" color="white" />
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.875rem" }}>PayScale Intelligence</span>
        </Link>

        <div>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#60a5fa", marginBottom: "1rem" }}>
            14 dias grátis · Sem cartão de crédito
          </p>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 900, color: "#fff", lineHeight: 1.25, marginBottom: "1.25rem" }}>
            Descubra quanto você está perdendo para os adquirentes
          </h2>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#93c5fd", marginBottom: "2rem" }}>
            Configure em menos de 5 minutos e veja suas cobranças indevidas já no primeiro dia.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              "Conciliação automática de vendas",
              "Auditoria de MDR em tempo real",
              "Alertas de cobrança indevida",
              "Gestão de chargebacks com prazo",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "#bfdbfe" }}>
                <CheckCircle size={14} style={{ flexShrink: 0, color: "#34d399" }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: "0.75rem", color: "#1e3a5f" }}>© 2026 PayScale Intelligence</p>
      </div>

      {/* ══ Formulário ══ */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2.5rem 1.25rem", overflowY: "auto", background: "var(--bg)" }}>
        <div style={{ width: "100%", maxWidth: "22rem" }}>

          {/* Logo mobile */}
          <Link href="/site" className="lg:hidden" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={15} fill="white" color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text)" }}>PayScale Intelligence</span>
          </Link>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem", color: "var(--text)" }}>
            Criar sua conta
          </h1>
          <p style={{ fontSize: "0.875rem", marginBottom: "1.5rem", color: "var(--muted)" }}>
            14 dias grátis, sem cartão de crédito.
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={oLoading}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", padding: "0.625rem", borderRadius: 8, fontSize: "0.875rem", fontWeight: 600, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", cursor: "pointer", marginBottom: "1rem", opacity: oLoading ? 0.6 : 1 }}>
            {oLoading ? <><Loader2 size={15} className="animate-spin" /> Conectando…</> : <><GoogleIcon /> Continuar com Google</>}
          </button>

          {/* Divisor */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 11, fontWeight: 500, whiteSpace: "nowrap", color: "var(--muted)" }}>ou continue com e-mail</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Erro */}
          {error && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", padding: "0.75rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.875rem", background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)" }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* PF / PJ */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-2)" }}>
                Tipo de cadastro
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {([
                  { type: "pj" as const, Icon: Building2, label: "Empresa (PJ)" },
                  { type: "pf" as const, Icon: User,      label: "Pessoa Física" },
                ]).map(({ type, Icon, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handlePersonType(type)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                      padding: "0.625rem", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600,
                      border: `1.5px solid ${personType === type ? "var(--blue)" : "var(--border)"}`,
                      background: personType === type ? "var(--blue-dim)" : "var(--surface)",
                      color:      personType === type ? "var(--blue)"    : "var(--text-2)",
                      cursor: "pointer",
                    }}>
                    <Icon size={14} strokeWidth={1.8} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nome / Razão Social */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem", color: "var(--text-2)" }}>
                {isPJ ? "Razão social / Nome da empresa" : "Nome completo"}
              </label>
              <input
                type="text"
                className="input-base"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={isPJ ? "Minha Empresa Ltda." : "João Silva"}
                autoComplete={isPJ ? "organization" : "name"}
              />
            </div>

            {/* CNPJ / CPF */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem", color: "var(--text-2)" }}>
                {docLabel}
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="input-base"
                required
                value={document}
                onChange={handleDocument}
                placeholder={docPlaceholder}
                maxLength={docMaxLen}
                autoComplete="off"
              />
            </div>

            {/* E-mail */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem", color: "var(--text-2)" }}>
                E-mail
              </label>
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
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem", color: "var(--text-2)" }}>
                Segmento da empresa
              </label>
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
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem", color: "var(--text-2)" }}>
                Senha{" "}
                <span style={{ color: "var(--muted)", fontWeight: 400 }}>(mín. 8 caracteres)</span>
              </label>
              <div style={{ position: "relative" }}>
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
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <PasswordStrength pwd={password} />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.625rem", borderRadius: 8, fontSize: "0.875rem", fontWeight: 600, background: "var(--blue)", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Criando conta…</>
                : <><span>Criar conta grátis</span> <ArrowRight size={15} /></>}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.75rem", marginTop: "1.5rem", color: "var(--muted)" }}>
            Já tem uma conta?{" "}
            <Link href="/" style={{ fontWeight: 600, color: "var(--blue)" }}>Fazer login</Link>
          </p>
          <p style={{ textAlign: "center", fontSize: 11, marginTop: "0.75rem", lineHeight: 1.6, color: "var(--muted)" }}>
            Ao criar sua conta você concorda com os{" "}
            <a href="#" style={{ textDecoration: "underline", color: "var(--text-2)" }}>Termos de Uso</a>
            {" "}e a{" "}
            <a href="#" style={{ textDecoration: "underline", color: "var(--text-2)" }}>Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
