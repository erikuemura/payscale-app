"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import {
  LayoutDashboard, Link2, ArrowLeftRight, Percent,
  ShieldAlert, BarChart3, Zap, Settings, LogOut, X, Globe,
} from "lucide-react";

const nav = [
  { href: "/dashboard",             icon: LayoutDashboard, label: "Visão Geral"  },
  { href: "/dashboard/integracoes", icon: Link2,           label: "Integrações"  },
  { href: "/dashboard/conciliacao", icon: ArrowLeftRight,  label: "Conciliação"  },
  { href: "/dashboard/tarifas",     icon: Percent,         label: "Tarifas & MDR"},
  { href: "/dashboard/chargebacks", icon: ShieldAlert,     label: "Chargebacks"  },
  { href: "/dashboard/relatorios",  icon: BarChart3,       label: "Relatórios"   },
];

function NavItem({
  href, icon: Icon, label, active, onClick,
}: { href: string; icon: React.ElementType; label: string; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-100"
      style={{
        background: active ? "var(--blue-dim)" : "transparent",
        color: active ? "var(--blue)" : "var(--text-2)",
      }}
    >
      <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const path = usePathname();
  const { isOpen, close } = useSidebar();

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
          style={{ color: "var(--muted)" }}>
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2"
          style={{ color: "var(--muted)" }}>Menu</p>
        {nav.map(item => (
          <NavItem key={item.href} {...item} active={path === item.href} onClick={close} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-0.5" style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <Link href="/site"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ color: "var(--text-2)" }}>
          <Globe size={16} strokeWidth={1.8} /> Site institucional
        </Link>
        <Link href="#"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ color: "var(--text-2)" }}>
          <Settings size={16} strokeWidth={1.8} /> Configurações
        </Link>
        <Link href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ color: "var(--red)" }}>
          <LogOut size={16} strokeWidth={1.8} /> Sair
        </Link>
        {/* User */}
        <div className="flex items-center gap-2.5 mt-3 px-3 py-2.5 rounded-lg"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "var(--blue)", color: "#fff" }}>E</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>Erik Uemura</div>
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
