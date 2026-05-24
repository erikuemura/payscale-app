"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Search, Menu, LogOut, User, Settings, AlertTriangle, TrendingDown, ShieldAlert, CheckCircle } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props { title: string; subtitle?: string; }

const NOTIFS = [
  { id: 1, icon: <AlertTriangle size={13} />, color: "var(--red)",   text: "Tarifa MDR acima do contratado — Crédito 12x (+0,3%)", val: "−R$ 1.240", time: "Hoje, 09:14", href: "/dashboard/tarifas",    read: false },
  { id: 2, icon: <TrendingDown size={13} />,  color: "var(--red)",   text: "12 transações sem liquidação detectadas",             val: "−R$ 8.750", time: "Hoje, 08:02", href: "/dashboard/conciliacao", read: false },
  { id: 3, icon: <ShieldAlert size={13} />,   color: "var(--amber)", text: "Chargeback CB-001 com prazo em 3 dias",              val: "R$ 450",    time: "Ontem, 16:30",href: "/dashboard/chargebacks", read: false },
  { id: 4, icon: <AlertTriangle size={13} />, color: "var(--amber)", text: "Tarifa MDR acima do contratado — Crédito 2x (+0,3%)",val: "−R$ 380",   time: "Ontem, 11:45",href: "/dashboard/tarifas",    read: true  },
  { id: 5, icon: <CheckCircle size={13} />,   color: "var(--green)", text: "Chargeback CB-003 — contestação aprovada",           val: "R$ 380",    time: "20/05, 14:20",href: "/dashboard/chargebacks", read: true  },
];

export default function Topbar({ title, subtitle }: Props) {
  const { toggle }  = useSidebar();
  const router      = useRouter();
  const supabase    = createClient();

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [readIds,    setReadIds]    = useState<number[]>([4, 5]);
  const [userEmail,  setUserEmail]  = useState<string | null>(null);
  const [userName,   setUserName]   = useState<string | null>(null);

  const menuRef  = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
        setUserName(user.user_metadata?.full_name ?? null);
      }
    });
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current  && !menuRef.current.contains(e.target as Node))  setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function markAllRead() { setReadIds(NOTIFS.map(n => n.id)); }

  const unread = NOTIFS.filter(n => !readIds.includes(n.id)).length;
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
            <div className="absolute right-0 top-11 w-80 rounded-xl overflow-hidden z-50"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                  Notificações {unread > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: "var(--red)", color: "#fff" }}>{unread}</span>}
                </p>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[11px] hover:underline" style={{ color: "var(--blue)" }}>
                    Marcar todas como lidas
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {NOTIFS.map(n => {
                  const isRead = readIds.includes(n.id);
                  return (
                    <Link key={n.id} href={n.href}
                      onClick={() => { setReadIds(prev => [...new Set([...prev, n.id])]); setNotifOpen(false); }}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                      style={{ borderBottom: "1px solid var(--border)", opacity: isRead ? 0.55 : 1 }}>
                      <div className="mt-0.5 shrink-0" style={{ color: n.color }}>{n.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-snug" style={{ color: "var(--text)" }}>{n.text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold tabular-nums" style={{ color: n.color }}>{n.val}</span>
                          <span className="text-[10px]" style={{ color: "var(--muted)" }}>{n.time}</span>
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
            aria-label="Menu do usuário">
            {initials}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-56 rounded-xl overflow-hidden z-50"
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
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors text-left"
                  style={{ color: "var(--text-2)" }}>
                  <User size={13} /> Meu perfil
                </Link>
                <Link href="/dashboard/configuracoes" onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors text-left"
                  style={{ color: "var(--text-2)" }}>
                  <Settings size={13} /> Configurações
                </Link>
              </div>
              <div style={{ borderTop: "1px solid var(--border)" }} className="py-1">
                <button
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
