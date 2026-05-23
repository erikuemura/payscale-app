"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Zap, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function PasswordStrength({ pwd }: { pwd: string }) {
  if (!pwd) return null;
  const score =
    (pwd.length >= 8  ? 1 : 0) +
    (pwd.length >= 12 ? 1 : 0) +
    (/\d/.test(pwd)        ? 1 : 0) +
    (/[a-zA-Z]/.test(pwd)  ? 1 : 0);
  const colors = ["", "#dc2626", "#f59e0b", "#2563eb", "#059669"];
  const labels = ["", "Fraca", "Regular", "Boa", "Forte"];
  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.25rem" }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ height: 4, flex: 1, borderRadius: 99, transition: "background 0.3s",
            background: i <= score ? colors[score] : "#e2e8f0" }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color: colors[score] }}>{labels[score]}</p>
    </div>
  );
}

/* ── Etapa 1: solicitar e-mail de reset ── */
function RequestReset() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password?step=update`,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "var(--green-dim)" }}>
          <CheckCircle size={32} style={{ color: "var(--green)" }} />
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>E-mail enviado</h1>
        <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted)" }}>
          Enviamos o link de recuperação para <strong style={{ color: "var(--text)" }}>{email}</strong>.
          Verifique sua caixa de entrada.
        </p>
        <Link href="/" className="text-sm font-semibold hover:underline" style={{ color: "var(--blue)" }}>
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Recuperar senha</h1>
      <p className="text-sm mb-7" style={{ color: "var(--muted)" }}>
        Informe seu e-mail e enviaremos um link de recuperação.
      </p>
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg mb-5 text-sm"
          style={{ background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)" }}>
          <AlertCircle size={15} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>E-mail</label>
          <input type="email" className="input-base" required
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="voce@empresa.com.br" autoComplete="email" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--blue)", color: "#fff" }}>
          {loading ? "Enviando…" : <><span>Enviar link</span> <ArrowRight size={15} /></>}
        </button>
      </form>
      <p className="text-center text-xs mt-8" style={{ color: "var(--muted)" }}>
        <Link href="/" className="font-semibold hover:underline" style={{ color: "var(--blue)" }}>
          Voltar ao login
        </Link>
      </p>
    </>
  );
}

/* ── Etapa 2: definir nova senha ── */
function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 8)  { setError("A senha deve ter pelo menos 8 caracteres."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => { window.location.href = "/?message=password_updated"; }, 2000);
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "var(--green-dim)" }}>
          <CheckCircle size={32} style={{ color: "var(--green)" }} />
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Senha atualizada!</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Redirecionando para o login…</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Nova senha</h1>
      <p className="text-sm mb-7" style={{ color: "var(--muted)" }}>Escolha uma senha segura de pelo menos 8 caracteres.</p>
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg mb-5 text-sm"
          style={{ background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)" }}>
          <AlertCircle size={15} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: "Nova senha",       value: password, set: setPassword, ac: "new-password" },
          { label: "Confirme a senha", value: confirm,  set: setConfirm,  ac: "new-password" },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>{f.label}</label>
            <div className="relative">
              <input type={show ? "text" : "password"} className="input-base"
                style={{ paddingRight: 42 }} required
                value={f.value} onChange={e => f.set(e.target.value)}
                placeholder="••••••••" autoComplete={f.ac} />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {f.label === "Nova senha" && <PasswordStrength pwd={f.value} />}
          </div>
        ))}
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--blue)", color: "#fff" }}>
          {loading ? "Salvando…" : <><span>Salvar nova senha</span> <ArrowRight size={15} /></>}
        </button>
      </form>
    </>
  );
}

/* ── Wrapper com Suspense ── */
function ResetContent() {
  const searchParams = useSearchParams();
  const step = searchParams.get("step");
  return step === "update" ? <UpdatePassword /> : <RequestReset />;
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--blue)" }}>
            <Zap size={15} fill="white" className="text-white" />
          </div>
          <span className="font-bold text-sm" style={{ color: "var(--text)" }}>PayScale Intelligence</span>
        </div>
        <Suspense fallback={<div className="text-sm" style={{ color: "var(--muted)" }}>Carregando…</div>}>
          <ResetContent />
        </Suspense>
      </div>
    </div>
  );
}
