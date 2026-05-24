"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Topbar from "@/components/Topbar";
import { createClient } from "@/lib/supabase/client";
import { User, Lock, CreditCard, CheckCircle, AlertCircle, Eye, EyeOff, Trash2, X as XIcon } from "lucide-react";
import { useToast } from "@/context/ToastContext";

type Tab = "perfil" | "senha" | "plano";

/* ── Password strength indicator ── */
function pwdStrength(pwd: string): { level: number; label: string; color: string } {
  if (!pwd) return { level: 0, label: "", color: "var(--border)" };
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level: 1, label: "Fraca",  color: "var(--red)"   };
  if (score <= 3) return { level: 2, label: "Média",  color: "var(--amber)" };
  return             { level: 3, label: "Forte",  color: "var(--green)" };
}

function PasswordStrength({ pwd }: { pwd: string }) {
  const { level, label, color } = pwdStrength(pwd);
  if (!pwd) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i <= level ? color : "var(--border)" }} />
        ))}
      </div>
      <p className="text-[11px] font-medium" style={{ color }}>{label}</p>
    </div>
  );
}

function formatDoc(doc: string | null | undefined): string {
  if (!doc) return "—";
  const d = doc.replace(/\D/g, "");
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  return doc;
}

function daysLeft(date: Date | null): number {
  if (!date) return 0;
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));
}

export default function ConfiguracoesPage() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const supabase    = createClient();
  const { toast }   = useToast();

  const initialTab = (searchParams.get("tab") as Tab | null) ?? "perfil";
  const [tab, setTab] = useState<Tab>(initialTab);

  function switchTab(t: Tab) {
    setTab(t);
    router.replace(`/dashboard/configuracoes?tab=${t}`, { scroll: false });
  }

  /* ── Perfil ── */
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [document,   setDocument]   = useState<string | null>(null);
  const [personType, setPersonType] = useState<string | null>(null);
  const [segment,    setSegment]    = useState<string | null>(null);
  const [trialEnds,  setTrialEnds]  = useState<Date | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saveLoading,    setSaveLoading]    = useState(false);
  const [deleteModal,    setDeleteModal]    = useState(false);
  const [deleteConfirm,  setDeleteConfirm]  = useState("");
  const [profileMsg,     setProfileMsg]     = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* ── Senha ── */
  const [pwd,     setPwd]     = useState("");
  const [newPwd,  setNewPwd]  = useState("");
  const [confPwd, setConfPwd] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg,     setPwdMsg]     = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* ── Load ── */
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/"); return; }

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, document, person_type, segment, trial_ends")
        .eq("id", user.id)
        .single();

      setName(profile?.full_name ?? user.user_metadata?.full_name ?? "");
      setDocument(profile?.document ?? user.user_metadata?.document ?? null);
      setPersonType(profile?.person_type ?? user.user_metadata?.person_type ?? null);
      setSegment(profile?.segment ?? user.user_metadata?.segment ?? null);
      setTrialEnds(profile?.trial_ends ? new Date(profile.trial_ends) : null);
      setProfileLoading(false);
    }
    load();
  }, [router, supabase]);

  /* ── Salvar perfil ── */
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaveLoading(true);
    setProfileMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim() })
      .eq("id", user.id);

    if (error) {
      setProfileMsg({ type: "err", text: "Erro ao salvar. Tente novamente." });
      toast("Erro ao salvar o perfil.", "error");
    } else {
      // Atualiza também o user_metadata
      await supabase.auth.updateUser({ data: { full_name: name.trim() } });
      setProfileMsg({ type: "ok", text: "Perfil atualizado com sucesso!" });
      toast("Perfil atualizado!");
    }
    setSaveLoading(false);
  }

  /* ── Alterar senha ── */
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);

    if (newPwd.length < 8) {
      setPwdMsg({ type: "err", text: "A nova senha deve ter pelo menos 8 caracteres." });
      return;
    }
    if (newPwd !== confPwd) {
      setPwdMsg({ type: "err", text: "A confirmação não confere com a nova senha." });
      return;
    }

    setPwdLoading(true);

    // Reautentica com a senha atual
    const { data: { user } } = await supabase.auth.getUser();
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user?.email ?? "",
      password: pwd,
    });

    if (signInErr) {
      setPwdMsg({ type: "err", text: "Senha atual incorreta." });
      setPwdLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) {
      setPwdMsg({ type: "err", text: "Erro ao alterar senha. Tente novamente." });
      toast("Erro ao alterar a senha.", "error");
    } else {
      setPwdMsg({ type: "ok", text: "Senha alterada com sucesso!" });
      toast("Senha alterada com sucesso!");
      setPwd(""); setNewPwd(""); setConfPwd("");
    }
    setPwdLoading(false);
  }

  const days = daysLeft(trialEnds);
  const segmentLabels: Record<string, string> = {
    restaurantes: "Restaurantes & Food Service",
    ecommerce: "E-commerce",
    saude: "Saúde & Bem-estar",
    educacao: "Educação",
    servicos: "Serviços Profissionais",
    varejo: "Varejo & Outros",
  };

  /* ── UI ── */
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "perfil", label: "Perfil",   icon: <User size={15} />   },
    { id: "senha",  label: "Senha",    icon: <Lock size={15} />   },
    { id: "plano",  label: "Plano",    icon: <CreditCard size={15} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Configurações" subtitle="Gerencie seu perfil, segurança e plano" />

      <main className="flex-1 p-5 lg:p-8" style={{ background: "var(--bg)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => switchTab(t.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: tab === t.id ? "var(--blue)" : "transparent",
                  color:      tab === t.id ? "#fff"        : "var(--text-2)",
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ── Perfil ── */}
          {tab === "perfil" && (
            <div className="card p-6 space-y-5">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
                  style={{ background: "var(--blue)", color: "#fff" }}>
                  {name ? name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() : (email?.[0]?.toUpperCase() ?? "U")}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text)" }}>{name || "Usuário"}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{email}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Edite seu nome de exibição abaixo.</p>
                </div>
              </div>

              {profileLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "var(--border)" }} />
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
                      Nome / Razão Social
                    </label>
                    <input
                      className="input-base"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
                      E-mail
                    </label>
                    <input className="input-base" value={email} readOnly
                      style={{ background: "var(--surface-2)", color: "var(--muted)", cursor: "not-allowed" }} />
                    <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
                      O e-mail não pode ser alterado por aqui.
                    </p>
                  </div>

                  {/* Campos somente leitura */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
                        {personType === "pj" ? "CNPJ" : "CPF"}
                      </label>
                      <input className="input-base" value={formatDoc(document)} readOnly
                        style={{ background: "var(--surface-2)", color: "var(--muted)", cursor: "not-allowed" }} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
                        Tipo de pessoa
                      </label>
                      <input className="input-base"
                        value={personType === "pj" ? "Pessoa Jurídica" : personType === "pf" ? "Pessoa Física" : "—"}
                        readOnly
                        style={{ background: "var(--surface-2)", color: "var(--muted)", cursor: "not-allowed" }} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
                      Segmento
                    </label>
                    <input className="input-base"
                      value={segment ? (segmentLabels[segment] ?? segment) : "—"}
                      readOnly
                      style={{ background: "var(--surface-2)", color: "var(--muted)", cursor: "not-allowed" }} />
                  </div>

                  {profileMsg && (
                    <div className="flex items-center gap-2 p-3 rounded-lg text-sm"
                      style={{
                        background: profileMsg.type === "ok" ? "var(--green-dim)" : "var(--red-dim)",
                        border: `1px solid ${profileMsg.type === "ok" ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.2)"}`,
                        color: profileMsg.type === "ok" ? "var(--green)" : "var(--red)",
                      }}>
                      {profileMsg.type === "ok" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      {profileMsg.text}
                    </div>
                  )}

                  <button type="submit" disabled={saveLoading}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60"
                    style={{ background: "var(--blue)", color: "#fff" }}>
                    {saveLoading ? "Salvando…" : "Salvar alterações"}
                  </button>
                </form>
              )}

              {/* Danger zone */}
              <div className="pt-4 mt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--red)" }}>Zona de perigo</p>
                <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                  A exclusão da conta é permanente e remove todos os dados associados.
                </p>
                <button onClick={() => setDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-red-50 transition-all"
                  style={{ border: "1px solid var(--red)", color: "var(--red)" }}>
                  <Trash2 size={13} /> Excluir minha conta
                </button>
              </div>
            </div>
          )}

          {/* ── Senha ── */}
          {tab === "senha" && (
            <div className="card p-6 space-y-5">
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text)" }}>Alterar senha</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>Use uma senha forte com pelo menos 8 caracteres.</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
                    Senha atual
                  </label>
                  <div className="relative">
                    <input className="input-base" style={{ paddingRight: 42 }}
                      type={showPwd ? "text" : "password"} value={pwd}
                      onChange={e => setPwd(e.target.value)} required
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--muted)" }}>
                      {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
                    Nova senha
                  </label>
                  <div className="relative">
                    <input className="input-base" style={{ paddingRight: 42 }}
                      type={showNew ? "text" : "password"} value={newPwd}
                      onChange={e => setNewPwd(e.target.value)} required
                      placeholder="Mínimo 8 caracteres" />
                    <button type="button" onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--muted)" }}>
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <PasswordStrength pwd={newPwd} />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
                    Confirmar nova senha
                  </label>
                  <input className="input-base"
                    type="password" value={confPwd}
                    onChange={e => setConfPwd(e.target.value)} required
                    placeholder="Repita a nova senha" />
                </div>

                {pwdMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-lg text-sm"
                    style={{
                      background: pwdMsg.type === "ok" ? "var(--green-dim)" : "var(--red-dim)",
                      border: `1px solid ${pwdMsg.type === "ok" ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.2)"}`,
                      color: pwdMsg.type === "ok" ? "var(--green)" : "var(--red)",
                    }}>
                    {pwdMsg.type === "ok" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {pwdMsg.text}
                  </div>
                )}

                <button type="submit" disabled={pwdLoading}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60"
                  style={{ background: "var(--blue)", color: "#fff" }}>
                  {pwdLoading ? "Alterando…" : "Alterar senha"}
                </button>
              </form>
            </div>
          )}

          {/* ── Plano ── */}
          {tab === "plano" && (
            <div className="space-y-4">
              {/* Status do trial */}
              <div className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Plano atual</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Você está no período gratuito</p>
                  </div>
                  <span className="badge badge-blue">Gratuito</span>
                </div>

                {/* Trial bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--muted)" }}>
                    <span>Período gratuito</span>
                    <span style={{ color: days <= 3 ? "var(--red)" : "var(--text-2)", fontWeight: 600 }}>
                      {days > 0 ? `${days} dias restantes` : "Expirado"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (days / 14) * 100)}%`,
                        background: days <= 3 ? "var(--red)" : "var(--blue)",
                      }} />
                  </div>
                </div>

                <div className="p-3 rounded-lg text-xs" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
                  Aproveite o período gratuito para conectar seus adquirentes e explorar todas as funcionalidades.
                </div>
              </div>

              {/* Plano Pro */}
              <div className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>PayScale Pro</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Acesso completo a todas as funcionalidades</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black tabular-nums" style={{ color: "var(--text)" }}>R$ 97</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>/mês</p>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {[
                    "Conciliação automática ilimitada",
                    "Alertas de MDR em tempo real",
                    "Gestão completa de chargebacks",
                    "Relatórios exportáveis (PDF e CSV)",
                    "Integrações com todos os adquirentes",
                    "Suporte prioritário",
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-2)" }}>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--green)" }} />
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  className="w-full py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
                  style={{ background: "var(--blue)", color: "#fff" }}>
                  Fazer upgrade para o Pro
                </button>
                <p className="text-center text-xs mt-2" style={{ color: "var(--muted)" }}>
                  Cancele a qualquer momento · Sem fidelidade
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Delete account confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}
          onMouseDown={e => { if (e.target === e.currentTarget) { setDeleteModal(false); setDeleteConfirm(""); } }}>
          <div className="card w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <Trash2 size={15} style={{ color: "var(--red)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Excluir conta</p>
              </div>
              <button onClick={() => { setDeleteModal(false); setDeleteConfirm(""); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: "var(--muted)" }}>
                <XIcon size={15} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="p-3 rounded-xl text-xs leading-relaxed"
                style={{ background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)" }}>
                Esta ação é irreversível. Todos os seus dados — integrações, histórico e relatórios — serão permanentemente excluídos.
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
                  Digite <strong style={{ color: "var(--text)" }}>EXCLUIR</strong> para confirmar
                </label>
                <input
                  className="input-base"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="EXCLUIR"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => { setDeleteModal(false); setDeleteConfirm(""); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
                Cancelar
              </button>
              <button
                disabled={deleteConfirm !== "EXCLUIR"}
                onClick={() => {
                  toast("Por favor entre em contato com o suporte para excluir sua conta.", "info");
                  setDeleteModal(false);
                  setDeleteConfirm("");
                }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
                style={{ background: "var(--red)", color: "#fff" }}>
                Excluir permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
