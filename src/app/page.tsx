"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Zap, ArrowRight, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

/* ── Formulário (usa useSearchParams — precisa de Suspense) ── */
function LoginForm() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const supabase    = createClient();

  const [show,     setShow]     = useState(false);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [oLoading, setOLoading] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [info,     setInfo]     = useState<string | null>(null);

  useEffect(() => {
    const e = searchParams.get("error");
    const m = searchParams.get("message");
    if (e === "auth_callback_failed") setError("Falha na autenticação. Tente novamente.");
    if (m === "check_email")          setInfo("Verifique seu e-mail para confirmar o cadastro.");
    if (m === "password_updated")     setInfo("Senha atualizada com sucesso! Faça login.");
  }, [searchParams]);

  /* ── Google OAuth ── */
  async function handleGoogle() {
    setOLoading(true);
    setError(null);
    const redirect = searchParams.get("redirect") || "/dashboard";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });
    if (error) {
      setError("Não foi possível conectar com o Google. Tente novamente.");
      setOLoading(false);
    }
  }

  /* ── Login e-mail ── */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message
      );
      setLoading(false);
      return;
    }

    const redirect = searchParams.get("redirect") || "/dashboard";
    router.push(redirect);
    router.refresh();
  }

  return (
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
        Bem-vindo de volta
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Acesse seu painel de conciliação financeira.
      </p>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={oLoading}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:bg-gray-50 active:scale-[0.99] disabled:opacity-60 mb-4"
        style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}>
        {oLoading ? <><Loader2 size={15} className="animate-spin" /> Conectando…</> : <><GoogleIcon /> Continuar com Google</>}
      </button>

      {/* Divisor */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        <span className="text-[11px] font-medium whitespace-nowrap"
          style={{ color: "var(--muted)" }}>ou entre com e-mail</span>
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg mb-4 text-sm"
          style={{ background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)" }}>
          <AlertCircle size={15} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}
      {info && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg mb-4 text-sm"
          style={{ background: "var(--green-dim)", border: "1px solid rgba(5,150,105,0.2)", color: "var(--green)" }}>
          <CheckCircle size={15} className="shrink-0 mt-0.5" /> {info}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
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
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
              Senha
            </label>
            <Link href="/auth/reset-password"
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--blue)" }}>
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              className="input-base"
              style={{ paddingRight: 42 }}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted)" }}>
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
          style={{ background: "var(--blue)", color: "#fff" }}>
          {loading ? <><Loader2 size={15} className="animate-spin" /> Entrando…</> : <><span>Entrar</span> <ArrowRight size={15} /></>}
        </button>
      </form>

      <p className="text-center text-xs mt-6" style={{ color: "var(--muted)" }}>
        Não tem uma conta?{" "}
        <Link href="/signup" className="font-semibold hover:underline"
          style={{ color: "var(--blue)" }}>
          Criar conta grátis
        </Link>
      </p>
    </div>
  );
}

/* ── Layout da página ── */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <title>Login | PayScale Intelligence</title>

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
          <h2 className="text-3xl font-black text-white leading-snug mb-5">
            Conciliação financeira inteligente
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#93c5fd" }}>
            Conecte seus meios de pagamento, detecte cobranças indevidas e consolide a saúde
            financeira da sua empresa — tudo em um painel.
          </p>
          <div className="space-y-3">
            {[
              "Conciliação automática de vendas",
              "Alertas de MDR acima do contratado",
              "Gestão de chargebacks com prazo",
              "Relatórios exportáveis em PDF",
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm"
                style={{ color: "#bfdbfe" }}>
                <div className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: "#34d399" }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "#1e3a5f" }}>
          © 2026 PayScale Intelligence · Todos os direitos reservados
        </p>
      </div>

      {/* ══ Formulário ══ */}
      <div className="flex-1 flex items-center justify-center px-5 py-16"
        style={{ background: "var(--bg)" }}>
        <Suspense fallback={
          <div className="text-sm" style={{ color: "var(--muted)" }}>Carregando…</div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
