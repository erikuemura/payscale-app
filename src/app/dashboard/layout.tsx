import { SidebarProvider } from "@/context/SidebarContext";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Proteção server-side (o middleware já redireciona, mas isso garante SSR)
  if (!user) redirect("/");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
