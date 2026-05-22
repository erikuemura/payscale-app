"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Zap, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [show, setShow]         = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [info, setInfo]         = useState<string | null>(null);

  useEffect(() => {
    const e = searchParams.get("error");
    const m = searchParams.get("message");
    if (e === "auth_callback_failed") setError("Falha na autenticação. Tente novamente.");
    if (m === "check_email") setInfo("Verifique seu e-mail para confirmar o cadastro.");
    if (m === "password_updated") setInfo("Senha atualizada! Faça login com a nova senha.");
  }, [searchParams]);

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
      <div className="flex items-center gap-2 mb-10 lg:hidden">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--blue)" }}>
          <Zap size={15} fill="white" className="text-white" />
        </div>
        <span className="font-bold text-sm" style={{ color: "var(--text)" }}>PayScale Intelligence</span>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Entrar na sua conta</h1>
      <p className="text-sm mb-7" style={{ color: "var(--muted)" }}>Acesse seu painel de conciliação financeira.</p>

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg mb-5 text-sm"
          style={{ background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)" }}>
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {info && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg mb-5 text-sm"
          style={{ background: "var(--green-dim)", border: "1px solid rgba(5,150,105,0.2)", color: "var(--green)" }}>
          <CheckCircle size={15} className="shrink-0 mt-0.5" />
          {info}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>E-mail</label>
          <input
            type="email" className="input-base" required
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="voce@empresa.com.br"
            autoComplete="email"
          />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Senha</label>
            <Link href="/auth/reset-password" className="text-xs font-medium hover:underline" style={{ color: "var(--blue)" }}>
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              type={show ? "text" : "password"} className="input-base"
              style={{ paddingRight: 42 }} required
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShow(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted)" }}>
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] mt-1 disabled:opacity-60"
          style={{ background: "var(--blue)", color: "#fff" }}>
          {loading ? "Entrando…" : <><span>Entrar</span> <ArrowRight size={15} /></>}
        </button>
      </form>

      <p className="text-center text-xs mt-8" style={{ color: "var(--muted)" }}>
        Não tem uma conta?{" "}
        <Link href="/signup" className="font-semibold hover:underline" style={{ color: "var(--blue)" }}>
          Criar conta grátis
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ background: "#fff" }}>

      {/* ── Painel esquerdo ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12"
        style={{ background: "var(--blue)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Zap size={16} fill="white" className="text-white" />
          </div>
          <span className="text-white font-bold text-sm">PayScale Intelligence</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Conciliação financeira inteligente
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed mb-8">
            Conecte seus meios de pagamento, detecte cobranças indevidas e consolide a saúde financeira da sua empresa — tudo em um painel.
          </p>
          <div className="space-y-3">
            {[
              "Conciliação automática de vendas",
              "Alertas de MDR acima do contratado",
              "Gestão de chargebacks com prazo",
              "Relatórios exportáveis em PDF",
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm text-blue-50">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-200 text-xs">© 2026 PayScale Intelligence · Todos os direitos reservados</p>
      </div>

      {/* ── Formulário ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16"
        style={{ background: "var(--bg)" }}>
        <Suspense fallback={<div className="text-sm" style={{ color: "var(--muted)" }}>Carregando…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
