"use client";
import { useEffect, useState } from "react";
import { X, Keyboard } from "lucide-react";

interface ShortcutGroup {
  title: string;
  items: { keys: string[]; desc: string }[];
}

const GROUPS: ShortcutGroup[] = [
  {
    title: "Navegação",
    items: [
      { keys: ["⌘", "K"], desc: "Abrir paleta de comandos" },
      { keys: ["?"],        desc: "Mostrar atalhos de teclado" },
      { keys: ["G", "D"],   desc: "Ir para Visão Geral" },
      { keys: ["G", "C"],   desc: "Ir para Conciliação" },
      { keys: ["G", "T"],   desc: "Ir para Tarifas" },
      { keys: ["G", "B"],   desc: "Ir para Chargebacks" },
      { keys: ["G", "I"],   desc: "Ir para Integrações" },
      { keys: ["G", "R"],   desc: "Ir para Relatórios" },
    ],
  },
  {
    title: "Ações",
    items: [
      { keys: ["Esc"],           desc: "Fechar modal / paleta" },
      { keys: ["↑", "↓"],        desc: "Navegar na paleta" },
      { keys: ["↵"],             desc: "Confirmar seleção" },
      { keys: ["←", "→"],        desc: "Trocar abas (Configurações)" },
    ],
  },
  {
    title: "Tabelas",
    items: [
      { keys: ["⌘", "E"],   desc: "Exportar CSV" },
      { keys: ["⌘", "F"],   desc: "Focar na busca" },
    ],
  },
];

function Key({ label }: { label: string }) {
  return (
    <kbd
      className="inline-flex items-center justify-center rounded text-[11px] font-semibold px-1.5 py-0.5 min-w-[22px]"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border-2)",
        color: "var(--text-2)",
        fontFamily: "var(--font-geist-mono), monospace",
        boxShadow: "0 1px 0 var(--border-2)",
      }}
    >
      {label}
    </kbd>
  );
}

export default function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable;

      // "?" opens shortcuts (only when not typing)
      if (e.key === "?" && !inInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(v => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onMouseDown={() => setOpen(false)}
    >
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          maxWidth: 520,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--blue-dim)" }}>
            <Keyboard size={15} style={{ color: "var(--blue)" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Atalhos de Teclado</p>
            <p className="text-[11px]" style={{ color: "var(--muted)" }}>Navegue mais rápido no PayScale</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar atalhos de teclado"
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: "var(--muted)" }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Groups */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 max-h-[60vh] overflow-y-auto">
          {GROUPS.map(g => (
            <div key={g.title}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--muted)" }}>
                {g.title}
              </p>
              <div className="space-y-2">
                {g.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <span className="text-xs" style={{ color: "var(--text-2)" }}>{item.desc}</span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {item.keys.map((k, ki) => (
                        <Key key={ki} label={k} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex items-center gap-1.5" style={{ borderTop: "1px solid var(--border)" }}>
          <Key label="?" />
          <span className="text-[11px]" style={{ color: "var(--muted)" }}>para abrir/fechar · </span>
          <Key label="Esc" />
          <span className="text-[11px]" style={{ color: "var(--muted)" }}>para fechar</span>
        </div>
      </div>
    </div>
  );
}
