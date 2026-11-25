import type { Metadata } from "next";
import { SidebarProvider } from "@/context/SidebarContext";
import { ToastProvider }   from "@/context/ToastContext";
import Sidebar          from "@/components/Sidebar";
import Link from "next/link";
import CommandPalette          from "@/components/CommandPalette";
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal";
import ErrorBoundary    from "@/components/ErrorBoundary";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s — Painel | PayScale Intelligence" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Proteção server-side (o middleware já redireciona, mas isso garante SSR)
  if (!user) redirect("/");

  return (
    <ToastProvider>
      <SidebarProvider>
        {/* Skip to main content — accessibility */}
        <a href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
          style={{ background: "var(--blue)", color: "#fff" }}>
          Ir para o conteúdo
        </a>
        <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
          <Sidebar />
          <div id="main-content" className="flex flex-col flex-1 min-w-0">
            {user.email === "demo-admin@payscale.invalid" && <div role="status" className="px-6 py-3 text-sm" style={{ background: "#eef3ff", color: "#173d88" }}><strong>Conta de demonstração.</strong> Dados fictícios para exploração. Nenhuma conexão real com adquirentes. Não insira dados ou credenciais reais nesta conta.</div>}
            <aside className="px-6 py-3 text-sm" style={{ background: "var(--surface-2)", color: "var(--text)" }}><strong>Piloto assistido.</strong> Preparações não são salvas automaticamente na conta. <Link href="/piloto" className="underline">Ver escopo e suporte</Link></aside>
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </div>
        <CommandPalette />
        <KeyboardShortcutsModal />
      </SidebarProvider>
    </ToastProvider>
  );
}
