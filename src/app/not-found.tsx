"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--bg)" }}>
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--blue)" }}>
          <Zap size={15} fill="white" className="text-white" />
        </div>
        <span className="font-bold text-sm" style={{ color: "var(--text)" }}>PayScale Intelligence</span>
      </div>

      {/* 404 */}
      <p className="text-8xl font-black tabular-nums mb-4" style={{ color: "var(--border)" }}>404</p>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Página não encontrada</h1>
      <p className="text-sm mb-8 max-w-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        A página que você está procurando não existe ou foi movida.
      </p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Link href="/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
          style={{ background: "var(--blue)", color: "#fff" }}>
          <Home size={15} /> Ir para o painel
        </Link>
        <button onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
          style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
          <ArrowLeft size={15} /> Voltar
        </button>
      </div>
    </div>
  );
}
