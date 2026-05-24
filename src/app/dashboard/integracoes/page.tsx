"use client";
import { useState } from "react";
import Topbar from "@/components/Topbar";
import { CheckCircle, XCircle, RefreshCw, Plus, Eye, EyeOff, ExternalLink, Link2, AlertTriangle } from "lucide-react";
import { useToast } from "@/context/ToastContext";

type Status = "connected" | "disconnected";
interface Integration { id: string; name: string; initials: string; description: string; status: Status; lastSync?: string; transactions?: number; volume?: string; color: string; }

const integrations: Integration[] = [
  { id: "pagseguro",   name: "PagSeguro",      initials: "PS", description: "Importa vendas, taxas MDR, chargebacks e liquidações automaticamente via API REST.", status: "connected",    lastSync: "Há 3 min", transactions: 1204, volume: "R$ 287.400", color: "#f59e0b" },
  { id: "mercadopago", name: "Mercado Pago",   initials: "MP", description: "Integração via API oficial. Movimentos, tarifas e disputas sincronizados em tempo real.",   status: "connected",    lastSync: "Há 5 min", transactions: 987,  volume: "R$ 195.800", color: "#2563eb" },
  { id: "bling",       name: "Bling ERP",      initials: "BL", description: "Sincronize pedidos e notas fiscais do Bling para cruzar com os pagamentos recebidos.",     status: "disconnected", color: "#10b981" },
  { id: "totvs",       name: "TOTVS Protheus", initials: "TO", description: "Integração com o módulo financeiro do TOTVS para conciliação de contas a receber.",        status: "disconnected", color: "#8b5cf6" },
];

function ConnectModal({ name, onClose }: { name: string; onClose: () => void }) {
  const [id, setId] = useState(""); const [secret, setSecret] = useState(""); const [show, setShow] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}>
      <div role="dialog" aria-modal="true" aria-label={`Conectar ${name}`} className="card p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="icon-box" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}><Link2 size={17} /></div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Conectar {name}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Credenciais criptografadas com AES-256</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>Client ID / App ID</label>
            <input className="input-base" value={id} onChange={e => setId(e.target.value)} placeholder="ex: APP-123456789" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>Access Token / Secret</label>
            <div className="relative">
              <input className="input-base" style={{ paddingRight: 42 }} type={show ? "text" : "password"} value={secret} onChange={e => setSecret(e.target.value)} placeholder="••••••••••••••••" />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ocultar token" : "Mostrar token"} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }}>
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
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>Cancelar</button>
          <button className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
            style={{ background: "var(--blue)", color: "#fff" }}>Testar e Conectar</button>
        </div>
      </div>
    </div>
  );
}

function DisconnectModal({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={`Desconectar ${name}`} className="card p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-box shrink-0" style={{ background: "var(--red-dim)", color: "var(--red)" }}>
            <AlertTriangle size={17} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Desconectar {name}?</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Esta ação irá remover a integração</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed mb-5"
          style={{ color: "var(--text-2)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
          Ao desconectar, a sincronização automática será interrompida e os dados históricos serão mantidos. Você pode reconectar a qualquer momento.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--red)", color: "#fff" }}>
            Sim, desconectar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IntegracoesPage() {
  const { toast } = useToast();
  const [modal,      setModal]      = useState<string | null>(null);
  const [disconnect, setDisconnect] = useState<string | null>(null);
  const [syncing,    setSyncing]    = useState<string | null>(null);
  const [statuses,   setStatuses]   = useState<Record<string, Status>>(
    Object.fromEntries(integrations.map(i => [i.id, i.status]))
  );
  const selected = integrations.find(i => i.id === modal);
  const disconnectTarget = integrations.find(i => i.id === disconnect);

  function confirmDisconnect() {
    if (disconnect) {
      const intg = integrations.find(i => i.id === disconnect);
      setStatuses(prev => ({ ...prev, [disconnect]: "disconnected" }));
      setDisconnect(null);
      toast(`${intg?.name ?? "Integração"} desconectada.`, "info");
    }
  }

  function handleSync(id: string) {
    const intg = integrations.find(i => i.id === id);
    setSyncing(id);
    setTimeout(() => {
      setSyncing(null);
      toast(`${intg?.name ?? "Integração"} sincronizada com sucesso!`);
    }, 2000);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <title>Integrações | PayScale Intelligence</title>
      <Topbar title="Integrações" subtitle="Gerencie suas conexões com adquirentes e ERPs" />
      <main className="flex-1 p-5 lg:p-8 space-y-5" style={{ background: "var(--bg)" }}>

        {/* Summary — dynamic based on statuses state */}
        {(() => {
          const connectedCount   = Object.values(statuses).filter(s => s === "connected").length;
          const totalCount       = integrations.length;
          const availableCount   = totalCount - connectedCount;
          const summary = [
            { label: "Conectadas",  value: String(connectedCount), color: "var(--green)", bg: "var(--green-dim)" },
            { label: "Disponíveis", value: String(availableCount), color: "var(--blue)",  bg: "var(--blue-dim)"  },
            { label: "Com erro",    value: "0",                    color: "var(--muted)", bg: "var(--border)"    },
          ];
          return (
            <div className="grid grid-cols-3 gap-4">
              {summary.map(s => (
                <div key={s.label} className="card p-5 flex items-center gap-4">
                  <p className="text-3xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations.map(intg => {
            const st = statuses[intg.id];
            return (
              <div key={intg.id} className="card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: intg.color + "18", color: intg.color }}>{intg.initials}</div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{intg.name}</p>
                      <span className={`badge ${st === "connected" ? "badge-green" : "badge-muted"}`}>
                        {st === "connected" ? "Conectado" : "Não conectado"}
                      </span>
                    </div>
                  </div>
                  {st === "connected"
                    ? <CheckCircle size={18} style={{ color: "var(--green)" }} />
                    : <XCircle size={18} style={{ color: "var(--border-2)" }} />
                  }
                </div>

                <div className="px-5 py-4">
                  <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-2)" }}>{intg.description}</p>

                  {st === "connected" && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: "Transações", value: intg.transactions?.toLocaleString("pt-BR") },
                        { label: "Volume",     value: intg.volume },
                        { label: "Última sync",value: intg.lastSync },
                      ].map(m => (
                        <div key={m.label} className="p-3 rounded-lg text-center"
                          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                          <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{m.value}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{m.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {st === "connected" ? (
                      <>
                        <button onClick={() => handleSync(intg.id)}
                          disabled={syncing === intg.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all disabled:opacity-60"
                          style={{ border: "1px solid var(--border)", color: "var(--blue)" }}>
                          <RefreshCw size={12} className={syncing === intg.id ? "animate-spin" : ""} />
                          {syncing === intg.id ? "Sincronizando..." : "Sincronizar"}
                        </button>
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all"
                          style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>Configurar</button>
                        <button onClick={() => setDisconnect(intg.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-red-50"
                          style={{ border: "1px solid var(--border)", color: "var(--red)" }}>Desconectar</button>
                      </>
                    ) : (
                      <button onClick={() => setModal(intg.id)}
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
      {modal && selected && <ConnectModal name={selected.name} onClose={() => setModal(null)} />}
      {disconnect && disconnectTarget && (
        <DisconnectModal name={disconnectTarget.name} onConfirm={confirmDisconnect} onClose={() => setDisconnect(null)} />
      )}
    </div>
  );
}
