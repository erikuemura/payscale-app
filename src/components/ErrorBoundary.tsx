"use client";
import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props   { children: React.ReactNode; fallback?: React.ReactNode; }
interface State   { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center flex-1 p-8 gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--red-dim)" }}>
            <AlertTriangle size={24} style={{ color: "var(--red)" }} />
          </div>
          <div className="text-center max-w-sm">
            <p className="text-base font-semibold mb-1" style={{ color: "var(--text)" }}>
              Algo deu errado
            </p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Ocorreu um erro inesperado ao carregar esta página.
            </p>
            {this.state.error?.message && (
              <p className="text-xs mt-2 font-mono px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--blue)", color: "#fff" }}>
            <RefreshCw size={14} /> Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
