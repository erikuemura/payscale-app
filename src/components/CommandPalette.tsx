"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Link2, ArrowLeftRight, Percent,
  ShieldAlert, BarChart3, Settings, LogOut, Sun, Moon,
  Globe, Search, X, ArrowRight, Keyboard,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { createClient } from "@/lib/supabase/client";

interface Cmd {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
  keywords?: string;
}

export default function CommandPalette() {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [gPressed, setGPressed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);
  const router   = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();

  const close = useCallback(() => { setOpen(false); setQuery(""); setActive(0); }, []);
  const go    = useCallback((href: string) => { router.push(href); close(); }, [router, close]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    close();
  }

  const commands: Cmd[] = [
    /* Navigation */
    { id:"dashboard",    label:"Visão Geral",         description:"Resumo do painel",                   icon:<LayoutDashboard size={15}/>, action:()=>go("/dashboard"),              group:"Navegar",  keywords:"home inicio overview" },
    { id:"integracoes",  label:"Integrações",          description:"Conectar adquirentes",               icon:<Link2 size={15}/>,           action:()=>go("/dashboard/integracoes"), group:"Navegar",  keywords:"pagbank stone cielo mercado" },
    { id:"conciliacao",  label:"Conciliação",           description:"Conferir transações",                icon:<ArrowLeftRight size={15}/>,  action:()=>go("/dashboard/conciliacao"),group:"Navegar",  keywords:"transacoes vendas liquidacao" },
    { id:"tarifas",      label:"Tarifas & MDR",         description:"Auditoria de tarifas",               icon:<Percent size={15}/>,         action:()=>go("/dashboard/tarifas"),    group:"Navegar",  keywords:"mdr taxa cobrança" },
    { id:"chargebacks",  label:"Chargebacks",           description:"Disputas e contestações",            icon:<ShieldAlert size={15}/>,     action:()=>go("/dashboard/chargebacks"),group:"Navegar",  keywords:"disputa contestacao reembolso" },
    { id:"relatorios",   label:"Relatórios",            description:"Exportar e agendar relatórios",      icon:<BarChart3 size={15}/>,       action:()=>go("/dashboard/relatorios"), group:"Navegar",  keywords:"export csv relatorio" },
    { id:"config",       label:"Configurações",         description:"Perfil e preferências",              icon:<Settings size={15}/>,        action:()=>go("/dashboard/configuracoes"),group:"Navegar",keywords:"perfil senha conta" },
    { id:"site",         label:"Site institucional",    description:"Ver site público",                   icon:<Globe size={15}/>,           action:()=>go("/site"),                 group:"Navegar",  keywords:"landing page publico" },
    /* Actions */
    { id:"theme",        label: theme==="dark"?"Ativar modo claro":"Ativar modo escuro",
                                                        description:"Alternar tema da interface",          icon: theme==="dark"?<Sun size={15}/>:<Moon size={15}/>,
                                                                                                           action:()=>{ toggleTheme(); close(); },                                   group:"Ações",    keywords:"dark light modo escuro claro tema" },
    { id:"shortcuts",    label:"Atalhos de teclado",    description:"Ver todos os atalhos",               icon:<Keyboard size={15}/>,        action:()=>{ close(); window.dispatchEvent(new KeyboardEvent("keydown",{key:"?",bubbles:true})); }, group:"Ações", keywords:"keyboard shortcuts teclas atalho ajuda help" },
    { id:"logout",       label:"Sair da conta",         description:"Encerrar sessão",                    icon:<LogOut size={15}/>,          action:handleLogout,                    group:"Ações",    keywords:"sair logout deslogar" },
  ];

  const filtered = query.trim()
    ? commands.filter(c => {
        const q = query.toLowerCase();
        return (
          c.label.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.keywords?.toLowerCase().includes(q)
        );
      })
    : commands;

  // Group items
  const groups = Array.from(new Set(filtered.map(c => c.group)));

  // Flat index for keyboard navigation
  const flat = filtered;

  useEffect(() => { setActive(0); }, [query]);

  // G+letter navigation shortcuts (GitHub-style)
  const G_NAV: Record<string, string> = {
    d: "/dashboard",
    i: "/dashboard/integracoes",
    c: "/dashboard/conciliacao",
    t: "/dashboard/tarifas",
    b: "/dashboard/chargebacks",
    r: "/dashboard/relatorios",
  };

  useEffect(() => {
    let gTimer: ReturnType<typeof setTimeout>;
    function down(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(v => !v);
        return;
      }

      // G+letter navigation (only when not in input/modal)
      const inInput = (e.target as HTMLElement).tagName === "INPUT"
        || (e.target as HTMLElement).tagName === "TEXTAREA"
        || (e.target as HTMLElement).isContentEditable;
      if (!open && !inInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key.toLowerCase() === "g") {
          setGPressed(true);
          clearTimeout(gTimer);
          gTimer = setTimeout(() => setGPressed(false), 800);
          return;
        }
        if (gPressed && G_NAV[e.key.toLowerCase()]) {
          e.preventDefault();
          setGPressed(false);
          clearTimeout(gTimer);
          router.push(G_NAV[e.key.toLowerCase()]);
          return;
        }
      }

      if (!open) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(v => Math.min(v + 1, flat.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActive(v => Math.max(v - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); flat[active]?.action(); }
    }
    window.addEventListener("keydown", down);
    return () => { window.removeEventListener("keydown", down); clearTimeout(gTimer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, close, flat, active, gPressed, router]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-active="true"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  if (!open) return null;

  let globalIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <Search size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar páginas e ações..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text)" }}
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Limpar busca" style={{ color: "var(--muted)" }}>
              <X size={14} />
            </button>
          )}
          <kbd className="text-[10px] px-1.5 py-0.5 rounded font-medium"
            style={{ background: "var(--border)", color: "var(--muted)" }}>Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {flat.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>
              Nenhum resultado para "{query}"
            </p>
          ) : (
            groups.map(group => {
              const items = filtered.filter(c => c.group === group);
              return (
                <div key={group}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest px-4 pt-3 pb-1"
                    style={{ color: "var(--muted)" }}>{group}</p>
                  {items.map(cmd => {
                    const idx = globalIdx++;
                    const isActive = idx === active;
                    return (
                      <button
                        key={cmd.id}
                        data-active={isActive}
                        onMouseEnter={() => setActive(idx)}
                        onClick={cmd.action}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                        style={{ background: isActive ? "var(--blue-dim)" : "transparent" }}>
                        <span style={{ color: isActive ? "var(--blue)" : "var(--muted)", flexShrink: 0 }}>
                          {cmd.icon}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="text-sm font-medium block" style={{ color: isActive ? "var(--blue)" : "var(--text)" }}>
                            {cmd.label}
                          </span>
                          {cmd.description && (
                            <span className="text-xs" style={{ color: "var(--muted)" }}>{cmd.description}</span>
                          )}
                        </span>
                        {isActive && <ArrowRight size={13} style={{ color: "var(--blue)", flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 text-[10px]"
          style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}>
          <span><kbd className="font-mono">↑↓</kbd> navegar</span>
          <span><kbd className="font-mono">↵</kbd> selecionar</span>
          <span><kbd className="font-mono">Esc</kbd> fechar</span>
          <span className="ml-auto"><kbd className="font-mono">?</kbd> atalhos</span>
        </div>
      </div>
    </div>
  );
}
