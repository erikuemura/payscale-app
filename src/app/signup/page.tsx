"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [show, setShow]         = useState(false);
  const [name, setName]         = useState("");
  const [company, setCompany]   = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, company },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(
        error.message.includes("already registered")
          ? "Este e-mail já está cadastrado. Faça login."
          : error.message
      );
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "var(--green-dim)" }}>
            <CheckCircle size={32} style={{ color: "var(--green)" }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Confirme seu e-mail</h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted)" }}>
            Enviamos um link de confirmação para <strong style={{ color: "var(--text)" }}>{email}</strong>.
            Clique no link para ativar sua conta.
          </p>
          <Link href="/" className="text-sm font-semibold hover:underline" style={{ color: "var(--blue)" }}>
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

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
            Comece gratuitamente por 14 dias
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed mb-8">
            Sem cartão de crédito. Configure em menos de 5 minutos e veja quanto você está perdendo nas tarifas dos adquirentes.
          </p>
          <div className="space-y-3">
            {[
              "Conecte PagSeguro e Mercado Pago",
              "Auditoria MDR desde o primeiro dia",
              "Alertas de cobrança indevida",
              "Relatórios prontos para o financeiro",
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm text-blue-50">
                <CheckCircle size={14} className="shrink-0 text-white/70" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-200 text-xs">© 2026 PayScale Intelligence · Todos os direitos reservados</p>
      </div>

      {/* ── Formulário ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--blue)" }}>
              <Zap size={15} fill="white" className="text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--text)" }}>PayScale Intelligence</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Criar sua conta</h1>
          <p className="text-sm mb-7" style={{ color: "var(--muted)" }}>14 dias grátis, sem cartão de crédito.</p>

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg mb-5 text-sm"
              style={{ background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)" }}>
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>Nome</label>
                <input
                  type="text" className="input-base" required
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="João Silva"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>Empresa</label>
                <input
                  type="text" className="input-base"
                  value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="Minha Empresa"
                  autoComplete="organization"
                />
              </div>
            </div>

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
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
                Senha <span style={{ color: "var(--muted)", fontWeight: 400 }}>(mín. 8 caracteres)</span>
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"} className="input-base"
                  style={{ paddingRight: 42 }} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
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
              {loading ? "Criando conta…" : <><span>Criar conta grátis</span> <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: "var(--muted)" }}>
            Já tem uma conta?{" "}
            <Link href="/" className="font-semibold hover:underline" style={{ color: "var(--blue)" }}>
              Fazer login
            </Link>
          </p>
          <p className="text-center text-[11px] mt-4 leading-relaxed" style={{ color: "var(--muted)" }}>
            Ao criar uma conta você concorda com os{" "}
            <a href="#" className="underline" style={{ color: "var(--text-2)" }}>Termos de Uso</a>
            {" "}e a{" "}
            <a href="#" className="underline" style={{ color: "var(--text-2)" }}>Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
