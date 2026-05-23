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
  success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534", Icon: CheckCircle },
  error:   { bg: "#fef2f2", border: "#fecaca", color: "#991b1b", Icon: XCircle    },
  info:    { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af", Icon: Info        },
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
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: 360 }}>
        {toasts.map(t => {
          const { bg, border, color, Icon } = cfg[t.type];
          return (
            <div key={t.id}
              className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
              style={{ background: bg, border: `1px solid ${border}`, color }}>
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
