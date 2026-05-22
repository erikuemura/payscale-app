"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, Search, Menu, LogOut, User, Settings } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props { title: string; subtitle?: string; }

export default function Topbar({ title, subtitle }: Props) {
  const { toggle }  = useSidebar();
  const router      = useRouter();
  const supabase    = createClient();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName]   = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
        setUserName(user.user_metadata?.full_name ?? null);
      }
    });
  }, []);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Iniciais do nome ou e-mail
  const initials = userName
    ? userName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : userEmail?.[0]?.toUpperCase() ?? "U";

  return (
    <header
      className="flex items-center gap-4 px-5 lg:px-8 h-16 shrink-0 sticky top-0 z-30"
      style={{ background: "var(--sidebar)", borderBottom: "1px solid var(--border)" }}>

      <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        style={{ color: "var(--text-2)" }}>
        <Menu size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold truncate" style={{ color: "var(--text)" }}>{title}</h1>
        {subtitle && <p className="text-xs hidden sm:block" style={{ color: "var(--muted)" }}>{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg cursor-text"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", width: 210 }}>
          <Search size={13} style={{ color: "var(--muted)" }} />
          <span className="text-xs flex-1" style={{ color: "var(--muted)" }}>Buscar...</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
            style={{ background: "var(--border)", color: "var(--muted)" }}>⌘K</span>
        </div>

        {/* Notificações */}
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all"
          style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
          <Bell size={16} strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--red)", outline: "2px solid white" }} />
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all hover:opacity-90"
            style={{ background: "var(--blue)", color: "#fff" }}
            title={userEmail ?? undefined}>
            {initials}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-56 rounded-xl overflow-hidden z-50"
              style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
              {/* User info */}
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>
                  {userName || "Usuário"}
                </p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--muted)" }}>
                  {userEmail}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors text-left"
                  style={{ color: "var(--text-2)" }}>
                  <User size={13} /> Meu perfil
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors text-left"
                  style={{ color: "var(--text-2)" }}>
                  <Settings size={13} /> Configurações
                </button>
              </div>

              {/* Logout */}
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
