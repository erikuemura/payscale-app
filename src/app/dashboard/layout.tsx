import type { Metadata } from "next";
import { SidebarProvider } from "@/context/SidebarContext";
import { ToastProvider }   from "@/context/ToastContext";
import Sidebar          from "@/components/Sidebar";
import TrialBanner      from "@/components/TrialBanner";
import CommandPalette   from "@/components/CommandPalette";
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
        <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <TrialBanner />
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </div>
        <CommandPalette />
      </SidebarProvider>
    </ToastProvider>
  );
}
