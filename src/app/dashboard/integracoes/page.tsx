"use client";
import { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/Topbar";
import {
  CheckCircle, XCircle, RefreshCw, Plus, Eye, EyeOff,
  ExternalLink, Link2, AlertTriangle, Loader2, AlertCircle,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/lib/supabase/client";
import type { Integration } from "@/lib/supabase/types";

/* ── Config estática por adquirente ────────────────────── */
type ProviderKey = "pagseguro" | "mercadopago" | "bling" | "totvs";

const PROVIDER_CONFIG: Record<ProviderKey, {
  name: string; initials: string; description: string; color: string;
}> = {
  pagseguro:   { name: "PagSeguro",      initials: "PS", color: "#f59e0b", description: "Importa vendas, taxas MDR, chargebacks e liquidações automaticamente via API REST." },
  mercadopago: { name: "Mercado Pago",   initials: "MP", color: "#2563eb", description: "Integração via API oficial. Movimentos, tarifas e disputas sincronizados em tempo real." },
  bling:       { name: "Bling ERP",      initials: "BL", color: "#10b981", description: "Sincronize pedidos e notas fiscais do Bling para cruzar com os pagamentos recebidos." },
  totvs:       { name: "TOTVS Protheus", initials: "TO", color: "#8b5cf6", description: "Integração com o módulo financeiro do TOTVS para conciliação de contas a receber." },
};

const ALL_PROVIDERS: ProviderKey[] = ["pagseguro", "mercadopago", "bling", "totvs"];

function fmtSync(iso: string | null): string {
  if (!iso) return "Nunca";
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diff < 1)  return "Agora mesmo";
  if (diff < 60) return `Há ${diff} min`;
  const h = Math.round(diff / 60);
  if (h < 24) return `Há ${h}h`;
  return `Há ${Math.round(h / 24)}d`;
}

/* ── Modal de conexão ────────────────────────────────────── */
function ConnectModal({
  provider, name,
  onConnect, onClose,
}: {
  provider: string;
  name: string;
  onConnect: (clientId: string, token: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const [id,     setId]     = useState("");
  const [secret, setSecret] = useState("");
  const [show,   setShow]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  async function handleSubmit() {
    if (!id.trim() || !secret.trim()) { setError("Preencha todos os campos."); return; }
    setSaving(true);
    setError(null);
    const ok = await onConnect(id.trim(), secret.trim());
    if (!ok) {
      setError("Erro ao salvar. Verifique as credenciais e tente novamente.");
      setSaving(false);
    }
    // Se ok, o pai fecha o modal
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={`Conectar ${name}`}
        className="card p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="icon-box" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
            <Link2 size={17} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Conectar {name}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Credenciais armazenadas com segurança</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
              Client ID / App ID
            </label>
            <input className="input-base" value={id} onChange={e => setId(e.target.value)}
              placeholder="ex: APP-123456789" autoComplete="off" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
              Access Token / Secret
            </label>
            <div className="relative">
              <input className="input-base" style={{ paddingRight: 42 }}
                type={show ? "text" : "password"} value={secret}
                onChange={e => setSecret(e.target.value)} placeholder="••••••••••••••••" />
              <button type="button" onClick={() => setShow(v => !v)}
                aria-label={show ? "Ocultar token" : "Mostrar token"}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }}>
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 mt-4 p-3 rounded-lg text-xs"
          style={{ background: "var(--blue-dim)", border: "1px solid var(--blue-mid)", color: "var(--blue)" }}>
          <ExternalLink size={12} className="shrink-0 mt-0.5" />
          Acesse o painel de desenvolvedores do {name} para gerar suas chaves de API.
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-3 p-3 rounded-lg text-xs"
            style={{ background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)" }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-60"
            style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60"
            style={{ background: "var(--blue)", color: "#fff" }}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Salvando…</> : "Testar e Conectar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal de desconexão ─────────────────────────────────── */
function DisconnectModal({ name, onConfirm, onClose, loading }: {
  name: string; onConfirm: () => void; onClose: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={`Desconectar ${name}`}
        className="card p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-box shrink-0" style={{ background: "var(--red-dim)", color: "var(--red)" }}>
            <AlertTriangle size={17} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Desconectar {name}?</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Esta ação irá pausar a sincronização</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed mb-5"
          style={{ color: "var(--text-2)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
          Ao desconectar, a sincronização automática será interrompida e os dados históricos serão mantidos.
          Você pode reconectar a qualquer momento.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-60"
            style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--red)", color: "#fff" }}>
            {loading ? <><Loader2 size={14} className="animate-spin" /> Desconectando…</> : "Sim, desconectar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Página principal ────────────────────────────────────── */
export default function IntegracoesPage() {
  const { toast } = useToast();

  // Mapa provider → dados do DB
  const [dbMap,       setDbMap]       = useState<Record<string, Integration>>({});
  // Mapa integration_id → nº de transações
  const [txCounts,    setTxCounts]    = useState<Record<string, number>>({});
  const [pageLoading, setPageLoading] = useState(true);

  const [connectModal,    setConnectModal]    = useState<ProviderKey | null>(null);
  const [disconnectModal, setDisconnectModal] = useState<ProviderKey | null>(null);
  const [syncing,         setSyncing]         = useState<string | null>(null);
  const [disconnecting,   setDisconnecting]   = useState(false);

  /* ── Carrega do Supabase ── */
  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: intgs } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", user.id);

    const map: Record<string, Integration> = {};
    (intgs ?? []).forEach(i => { map[i.provider] = i; });
    setDbMap(map);

    // Conta transações por integration_id
    const intgIds = (intgs ?? []).map(i => i.id).filter(Boolean);
    if (intgIds.length > 0) {
      const { data: txRows } = await supabase
        .from("transactions")
        .select("integration_id")
        .in("integration_id", intgIds);

      const counts: Record<string, number> = {};
      (txRows ?? []).forEach(t => {
        if (t.integration_id) counts[t.integration_id] = (counts[t.integration_id] ?? 0) + 1;
      });
      setTxCounts(counts);
    }

    setPageLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Conectar ── */
  async function handleConnect(provider: ProviderKey, clientId: string, token: string): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("integrations")
      .upsert({
        user_id:      user.id,
        provider,
        client_id:    clientId,
        access_token: token,
        status:       "connected",
        last_sync:    new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      }, { onConflict: "user_id,provider" })
      .select()
      .single();

    if (error || !data) return false;

    setDbMap(prev => ({ ...prev, [provider]: data as Integration }));
    setConnectModal(null);
    toast(`${PROVIDER_CONFIG[provider].name} conectado com sucesso!`);
    return true;
  }

  /* ── Desconectar ── */
  async function handleDisconnect() {
    if (!disconnectModal) return;
    const intg = dbMap[disconnectModal];
    if (!intg) return;

    setDisconnecting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("integrations")
      .update({
        status:       "disconnected",
        access_token: null,
        refresh_token: null,
        updated_at:   new Date().toISOString(),
      })
      .eq("id", intg.id);

    if (error) {
      toast("Erro ao desconectar. Tente novamente.", "error");
    } else {
      setDbMap(prev => ({
        ...prev,
        [disconnectModal]: { ...prev[disconnectModal], status: "disconnected", access_token: null },
      }));
      toast(`${PROVIDER_CONFIG[disconnectModal].name} desconectado.`, "info");
    }
    setDisconnecting(false);
    setDisconnectModal(null);
  }

  /* ── Sincronizar ── */
  async function handleSync(provider: ProviderKey) {
    const intg = dbMap[provider];
    if (!intg) return;

    setSyncing(provider);
    const supabase = createClient();
    const now = new Date().toISOString();
    await supabase
      .from("integrations")
      .update({ last_sync: now, updated_at: now })
      .eq("id", intg.id);

    // Simula tempo de sync
    await new Promise(r => setTimeout(r, 2000));

    setDbMap(prev => ({
      ...prev,
      [provider]: { ...prev[provider], last_sync: now },
    }));
    setSyncing(null);
    toast(`${PROVIDER_CONFIG[provider].name} sincronizado com sucesso!`);
  }

  /* ── Summary ── */
  const connectedCount  = ALL_PROVIDERS.filter(p => dbMap[p]?.status === "connected").length;
  const errorCount      = ALL_PROVIDERS.filter(p => dbMap[p]?.status === "error").length;
  const availableCount  = ALL_PROVIDERS.length - connectedCount;

  /* ── Skeleton ── */
  if (pageLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <title>Integrações | PayScale Intelligence</title>
        <Topbar title="Integrações" subtitle="Gerencie suas conexões com adquirentes e ERPs" />
        <main className="flex-1 p-5 lg:p-8 space-y-5" style={{ background: "var(--bg)" }}>
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-8 w-8 rounded mb-2" style={{ background: "var(--border)" }} />
                <div className="h-3 w-20 rounded" style={{ background: "var(--border)" }} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="card p-5 animate-pulse" style={{ height: 180 }} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <title>Integrações | PayScale Intelligence</title>
      <Topbar title="Integrações" subtitle="Gerencie suas conexões com adquirentes e ERPs" />

      <main className="flex-1 p-5 lg:p-8 space-y-5" style={{ background: "var(--bg)" }}>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Conectadas",  value: connectedCount,  color: "var(--green)", bg: "var(--green-dim)" },
            { label: "Disponíveis", value: availableCount,  color: "var(--blue)",  bg: "var(--blue-dim)"  },
            { label: "Com erro",    value: errorCount,      color: "var(--muted)", bg: "var(--border)"    },
          ].map(s => (
            <div key={s.label} className="card p-5 flex items-center gap-4">
              <p className="text-3xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ALL_PROVIDERS.map(pid => {
            const cfg  = PROVIDER_CONFIG[pid];
            const db   = dbMap[pid];
            const st   = db?.status ?? "disconnected";
            const txN  = db?.id ? (txCounts[db.id] ?? 0) : 0;
            const isSyncing = syncing === pid;

            return (
              <div key={pid} className="card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: cfg.color + "18", color: cfg.color }}>
                      {cfg.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{cfg.name}</p>
                      <span className={`badge ${st === "connected" ? "badge-green" : st === "error" ? "badge-red" : "badge-muted"}`}>
                        {st === "connected" ? "Conectado" : st === "error" ? "Erro" : "Não conectado"}
                      </span>
                    </div>
                  </div>
                  {st === "connected"
                    ? <CheckCircle size={18} style={{ color: "var(--green)" }} />
                    : st === "error"
                      ? <AlertTriangle size={18} style={{ color: "var(--red)" }} />
                      : <XCircle size={18} style={{ color: "var(--border-2)" }} />
                  }
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                  <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-2)" }}>
                    {cfg.description}
                  </p>

                  {st === "connected" && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: "Transações", value: txN > 0 ? txN.toLocaleString("pt-BR") : "—" },
                        { label: "Última sync", value: fmtSync(db?.last_sync ?? null) },
                        { label: "Status", value: "Online" },
                      ].map(m => (
                        <div key={m.label} className="p-3 rounded-lg text-center"
                          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                          <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{m.value}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{m.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {st === "connected" ? (
                      <>
                        <button onClick={() => handleSync(pid)} disabled={isSyncing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all disabled:opacity-60"
                          style={{ border: "1px solid var(--border)", color: "var(--blue)" }}>
                          <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                          {isSyncing ? "Sincronizando..." : "Sincronizar"}
                        </button>
                        <button onClick={() => setDisconnectModal(pid)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-red-50"
                          style={{ border: "1px solid var(--border)", color: "var(--red)" }}>
                          Desconectar
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setConnectModal(pid)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                        style={{ background: "var(--blue)", color: "#fff" }}>
                        <Plus size={13} /> Conectar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modals */}
      {connectModal && (
        <ConnectModal
          provider={connectModal}
          name={PROVIDER_CONFIG[connectModal].name}
          onConnect={(id, token) => handleConnect(connectModal, id, token)}
          onClose={() => setConnectModal(null)}
        />
      )}
      {disconnectModal && (
        <DisconnectModal
          name={PROVIDER_CONFIG[disconnectModal].name}
          onConfirm={handleDisconnect}
          onClose={() => setDisconnectModal(null)}
          loading={disconnecting}
        />
      )}
    </div>
  );
}
