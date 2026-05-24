"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface ToastItem { id: number; type: ToastType; message: string; }
interface ToastCtx  { toast: (message: string, type?: ToastType) => void; }

const ToastContext = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

let uid = 0;

const cfg: Record<ToastType, { bg: string; border: string; color: string; Icon: React.ElementType }> = {
  success: { bg: "var(--green-dim)", border: "rgba(5,150,105,0.25)", color: "var(--green)", Icon: CheckCircle },
  error:   { bg: "var(--red-dim)",   border: "rgba(220,38,38,0.25)", color: "var(--red)",   Icon: XCircle    },
  info:    { bg: "var(--blue-dim)",  border: "rgba(37,99,235,0.25)", color: "var(--blue)",  Icon: Info        },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++uid;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" aria-label="Notificações"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: 360 }}>
        {toasts.map(t => {
          const { bg, border, color, Icon } = cfg[t.type];
          return (
            <div key={t.id} role="status"
              className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in"
              style={{ background: bg, border: `1px solid ${border}`, color, backdropFilter: "blur(8px)" }}>
              <Icon size={16} className="shrink-0 mt-0.5" />
              <span className="flex-1 leading-snug">{t.message}</span>
              <button onClick={() => setToasts(prev => prev.filter(t2 => t2.id !== t.id))}
                className="shrink-0 hover:opacity-60 transition-opacity" style={{ color }}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
