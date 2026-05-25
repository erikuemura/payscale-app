"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Search, Menu, LogOut, User, Settings, AlertTriangle, ShieldAlert } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Alert } from "@/lib/supabase/types";

interface Props { title: string; subtitle?: string; }

const ALERT_HREF: Record<string, string> = {
  mdr_deviation:       "/dashboard/tarifas",
  no_settlement:       "/dashboard/conciliacao",
  chargeback_deadline: "/dashboard/chargebacks",
};

function alertColor(severity: string) {
  if (severity === "critical") return "var(--red)";
  if (severity === "warning")  return "var(--amber)";
  return "var(--blue)";
}

function alertIcon(type: string, severity: string) {
  const color = alertColor(severity);
  if (type === "chargeback_deadline") return <ShieldAlert size={13} style={{ color }} />;
  return <AlertTriangle size={13} style={{ color }} />;
}

export default function Topbar({ title, subtitle }: Props) {
  const { toggle }  = useSidebar();
  const router      = useRouter();
  const supabase    = createClient();

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [userEmail,  setUserEmail]  = useState<string | null>(null);
  const [userName,   setUserName]   = useState<string | null>(null);
  const [alerts,     setAlerts]     = useState<Alert[]>([]);

  // IDs de alertas marcados como lidos no localStorage
  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("notif_read_v2");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  function markRead(ids: string[]) {
    setReadIds(ids);
    try { localStorage.setItem("notif_read_v2", JSON.stringify(ids)); } catch { /* noop */ }
  }

  const menuRef  = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email ?? null);
      setUserName(user.user_metadata?.full_name ?? null);

      // Carrega alertas não resolvidos do Supabase
      const { data } = await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", user.id)
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setAlerts(data as Alert[]);
    }
    load();
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current  && !menuRef.current.contains(e.target as Node))  setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setMenuOpen(false); setNotifOpen(false); }
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", onKey); };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function markAllRead() { markRead(alerts.map(a => a.id)); }

  const unread = alerts.filter(a => !readIds.includes(a.id)).length;
  const initials = userName
    ? userName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : userEmail?.[0]?.toUpperCase() ?? "U";

  return (
    <header
      className="flex items-center gap-4 px-5 lg:px-8 h-16 shrink-0 sticky top-0 z-30"
      style={{ background: "var(--sidebar)", borderBottom: "1px solid var(--border)" }}>

      <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        style={{ color: "var(--text-2)" }} aria-label="Abrir menu">
        <Menu size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold truncate" style={{ color: "var(--text)" }}>{title}</h1>
        {subtitle && <p className="text-xs hidden sm:block" style={{ color: "var(--muted)" }}>{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search hint — opens Command Palette */}
        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
          }}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:opacity-80 transition-all"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", width: 210 }}>
          <Search size={13} style={{ color: "var(--muted)" }} />
          <span className="text-xs flex-1 text-left" style={{ color: "var(--muted)" }}>Buscar...</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
            style={{ background: "var(--border)", color: "var(--muted)" }}>⌘K</span>
        </button>

        {/* Notificações */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}
            aria-label={`${unread} notificações não lidas`}>
            <Bell size={16} strokeWidth={1.8} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--red)", outline: "2px solid var(--sidebar)" }} />
            )}
          </button>

          {notifOpen && (
            <div role="dialog" aria-label="Notificações" aria-live="polite"
              className="absolute right-0 top-11 w-80 rounded-xl overflow-hidden z-50"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                  Notificações{" "}
                  {unread > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                      style={{ background: "var(--red)", color: "#fff" }}>{unread}</span>
                  )}
                </p>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[11px] hover:underline" style={{ color: "var(--blue)" }}>
                    Marcar todas como lidas
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs" style={{ color: "var(--muted)" }}>Nenhum alerta ativo.</p>
                  </div>
                ) : alerts.map(a => {
                  const isRead = readIds.includes(a.id);
                  const href   = (a.metadata as Record<string,string>)?.href ?? ALERT_HREF[a.type] ?? "/dashboard";
                  const color  = alertColor(a.severity);
                  const dt     = new Date(a.created_at);
                  const timeStr = dt.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
                  return (
                    <Link key={a.id} href={href}
                      onClick={() => { markRead([...new Set([...readIds, a.id])]); setNotifOpen(false); }}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                      style={{ borderBottom: "1px solid var(--border)", opacity: isRead ? 0.55 : 1 }}>
                      <div className="mt-0.5 shrink-0">{alertIcon(a.type, a.severity)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-snug" style={{ color: "var(--text)" }}>{a.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {a.amount != null && (
                            <span className="text-[10px] font-semibold tabular-nums" style={{ color }}>
                              −{Number(a.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                          )}
                          <span className="text-[10px]" style={{ color: "var(--muted)" }}>{timeStr}</span>
                        </div>
                      </div>
                      {!isRead && <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: "var(--blue)" }} />}
                    </Link>
                  );
                })}
              </div>
              <div className="px-4 py-2.5" style={{ borderTop: "1px solid var(--border)" }}>
                <Link href="/dashboard" onClick={() => setNotifOpen(false)}
                  className="text-xs font-medium hover:underline" style={{ color: "var(--blue)" }}>
                  Ver todas as notificações →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all hover:opacity-90"
            style={{ background: "var(--blue)", color: "#fff" }}
            title={userEmail ?? undefined}
            aria-label="Menu do usuário"
            aria-expanded={menuOpen}
            aria-haspopup="menu">
            {initials}
          </button>

          {menuOpen && (
            <div role="menu" aria-label="Menu do usuário"
              className="absolute right-0 top-10 w-56 rounded-xl overflow-hidden z-50"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>
                  {userName || "Usuário"}
                </p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--muted)" }}>
                  {userEmail}
                </p>
              </div>
              <div className="py-1">
                <Link href="/dashboard/configuracoes?tab=perfil" onClick={() => setMenuOpen(false)}
                  role="menuitem"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors text-left"
                  style={{ color: "var(--text-2)" }}>
                  <User size={13} /> Meu perfil
                </Link>
                <Link href="/dashboard/configuracoes" onClick={() => setMenuOpen(false)}
                  role="menuitem"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors text-left"
                  style={{ color: "var(--text-2)" }}>
                  <Settings size={13} /> Configurações
                </Link>
              </div>
              <div style={{ borderTop: "1px solid var(--border)" }} className="py-1">
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-red-50 transition-colors text-left"
                  style={{ color: "var(--red)" }}>
                  <LogOut size={13} /> Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
