"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, X, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function TrialBanner() {
  const [days, setDays]       = useState<number | null>(null);
  const [dismissed, setDism]  = useState(false);

  useEffect(() => {
    async function load() {
      // Check session-level dismiss
      if (sessionStorage.getItem("trial_banner_dismissed")) { setDism(true); return; }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("trial_ends")
        .eq("id", user.id)
        .single();
      if (!profile?.trial_ends) return;
      const d = Math.max(0, Math.ceil((new Date(profile.trial_ends).getTime() - Date.now()) / 86400000));
      setDays(d);
    }
    load();
  }, []);

  function dismiss() {
    sessionStorage.setItem("trial_banner_dismissed", "1");
    setDism(true);
  }

  // Only show when ≤ 3 days remain
  if (dismissed || days === null || days > 3) return null;

  const expired = days === 0;

  return (
    <div className="flex items-center gap-3 px-5 py-2.5 text-xs font-medium"
      style={{
        background: expired ? "var(--red)" : "#b45309",
        color: "#fff",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
      }}>
      {expired ? <Zap size={13} /> : <Clock size={13} />}
      <span className="flex-1">
        {expired
          ? "Seu período gratuito expirou — faça upgrade para continuar usando o PayScale."
          : `Seu período gratuito termina em ${days} ${days === 1 ? "dia" : "dias"} — não perca o acesso.`}
      </span>
      <Link href="/dashboard/configuracoes?tab=plano"
        className="shrink-0 px-3 py-1 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
        Ver planos
      </Link>
      <button onClick={dismiss} className="shrink-0 hover:opacity-70 transition-opacity p-0.5"
        aria-label="Fechar aviso de trial">
        <X size={13} />
      </button>
    </div>
  );
}
