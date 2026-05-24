"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Link2, ArrowLeftRight, Percent,
  ShieldAlert, BarChart3, Zap, Settings, LogOut, X, Globe, Sun, Moon,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const nav = [
  { href: "/dashboard",             icon: LayoutDashboard, label: "Visão Geral",   badge: null                     },
  { href: "/dashboard/integracoes", icon: Link2,           label: "Integrações",   badge: "live" as const          },
  { href: "/dashboard/conciliacao", icon: ArrowLeftRight,  label: "Conciliação",   badge: null                     },
  { href: "/dashboard/tarifas",     icon: Percent,         label: "Tarifas & MDR", badge: "2" as const             },
  { href: "/dashboard/chargebacks", icon: ShieldAlert,     label: "Chargebacks",   badge: "5" as const             },
  { href: "/dashboard/relatorios",  icon: BarChart3,       label: "Relatórios",    badge: null                     },
];

function NavItem({
  href, icon: Icon, label, active, onClick, badge,
}: { href: string; icon: React.ElementType; label: string; active: boolean; onClick?: () => void; badge?: string | null }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-100"
      style={{
        background: active ? "var(--blue-dim)" : "transparent",
        color: active ? "var(--blue)" : "var(--text-2)",
      }}
    >
      <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
      <span className="flex-1">{label}</span>
      {badge === "live" && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: "var(--green)" }} />
          <span className="relative inline-flex rounded-full h-2 w-2"
            style={{ background: "var(--green)" }} />
        </span>
      )}
      {badge && badge !== "live" && (
        <span className="text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1"
          style={{ background: "var(--red-dim)", color: "var(--red)" }}>
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const path     = usePathname();
  const router   = useRouter();
  const { isOpen, close } = useSidebar();
  const { theme, toggle: toggleTheme } = useTheme();

  const [userName, setUserName]     = useState("Carregando...");
  const [userInitial, setUserInitial] = useState("?");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name    = user.user_metadata?.full_name ?? user.email ?? "Usuário";
        const initial = name.charAt(0).toUpperCase();
        setUserName(name);
        setUserInitial(initial);
      }
    }
    loadUser();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const content = (
    <div className="flex flex-col h-full" style={{ background: "var(--sidebar)" }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--blue)" }}>
            <Zap size={15} fill="white" className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: "var(--text)" }}>PayScale</div>
            <div className="text-[10px] font-medium" style={{ color: "var(--muted)" }}>Intelligence</div>
          </div>
        </div>
        <button onClick={close} className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          style={{ color: "var(--muted)" }} aria-label="Fechar menu">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Menu principal">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2"
          style={{ color: "var(--muted)" }}>Menu</p>
        {nav.map(item => (
          <NavItem key={item.href} {...item} active={path === item.href} onClick={close} badge={item.badge} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-0.5" style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        {/* Dark mode toggle */}
        <button onClick={toggleTheme}
          className="nav-link w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ color: "var(--text-2)" }}>
          {theme === "dark" ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
          {theme === "dark" ? "Modo claro" : "Modo escuro"}
        </button>
        <Link href="/site"
          className="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ color: "var(--text-2)" }}>
          <Globe size={16} strokeWidth={1.8} /> Site institucional
        </Link>
        <Link href="/dashboard/configuracoes"
          className="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: path === "/dashboard/configuracoes" ? "var(--blue-dim)" : "transparent",
            color: path === "/dashboard/configuracoes" ? "var(--blue)" : "var(--text-2)",
          }}>
          <Settings size={16} strokeWidth={1.8} /> Configurações
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-red-50"
          style={{ color: "var(--red)" }}>
          <LogOut size={16} strokeWidth={1.8} /> Sair
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5 mt-3 px-3 py-2.5 rounded-lg"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "var(--blue)", color: "#fff" }}>{userInitial}</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>{userName}</div>
            <div className="text-[11px]" style={{ color: "var(--muted)" }}>Administrador</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-56 min-h-screen shrink-0 sticky top-0"
        style={{ borderRight: "1px solid var(--border)" }}>
        {content}
      </aside>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}
            onClick={close} />
          <aside className="fixed left-0 top-0 bottom-0 z-50 w-56 flex flex-col lg:hidden"
            style={{ borderRight: "1px solid var(--border)" }}>
            {content}
          </aside>
        </>
      )}
    </>
  );
}
