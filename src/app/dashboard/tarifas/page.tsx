"use client";
import { useState } from "react";
import Topbar from "@/components/Topbar";
import { AlertTriangle, CheckCircle, Bell, Download, X as XIcon, FileText, Send } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";

function exportMDR(data: { m: string; c: number; r: number; d: number }[]) {
  const bom    = "﻿";
  const header = "Modalidade;MDR Contratado (%);MDR Cobrado (%);Desvio (%);Status";
  const rows   = data.map(m => [
    m.m,
    m.c.toFixed(2).replace(".", ","),
    m.r.toFixed(2).replace(".", ","),
    m.d > 0 ? `+${m.d.toFixed(2).replace(".", ",")}` : "0,00",
    m.d === 0 ? "OK" : "Indevida",
  ].join(";"));
  const csv  = bom + [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "auditoria_mdr_maio_2026.csv"; a.click();
  URL.revokeObjectURL(url);
}
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

const mdrData = [
  { m: "Débito",     c: 1.20, r: 1.20, d: 0    },
  { m: "Créd 1x",   c: 2.50, r: 2.50, d: 0    },
  { m: "Créd 2x",   c: 2.80, r: 3.10, d: 0.30 },
  { m: "Créd 3x",   c: 3.00, r: 3.00, d: 0    },
  { m: "Créd 6x",   c: 3.20, r: 3.20, d: 0    },
  { m: "Créd 12x",  c: 3.80, r: 4.10, d: 0.30 },
  { m: "PIX",       c: 0.99, r: 0.99, d: 0    },
];
const radarData = [
  { m: "Déb",     PS: 1.20, MP: 1.15 },
  { m: "Créd 1x", PS: 2.50, MP: 2.49 },
  { m: "Créd 2x", PS: 3.10, MP: 2.85 },
  { m: "Créd 6x", PS: 3.20, MP: 3.18 },
  { m: "Créd 12x",PS: 4.10, MP: 3.99 },
  { m: "PIX",     PS: 0.99, MP: 0.99 },
];
const alertas = [
  { id: 1, adquirente: "PagSeguro", modalidade: "Crédito 12x", contratado: 3.80, cobrado: 4.10, desvio: 0.30, impacto: 1240, desde: "15/05" },
  { id: 2, adquirente: "PagSeguro", modalidade: "Crédito 2x",  contratado: 2.80, cobrado: 3.10, desvio: 0.30, impacto: 380,  desde: "18/05" },
];
// Chart styles are now computed inside TarifasPage (theme-aware)

type Alerta = typeof alertas[number];

function ContestarModal({ alerta, onClose, onSend }: { alerta: Alerta; onClose: () => void; onSend: () => void }) {
  const [msg, setMsg] = useState("");
  const [step, setStep] = useState<"form"|"done">("form");

  function submit() {
    if (!msg.trim()) return;
    setStep("done");
    setTimeout(() => { onSend(); onClose(); }, 1800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Contestar cobrança indevida" className="card w-full max-w-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <FileText size={15} style={{ color: "var(--red)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Contestar Cobrança Indevida</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "var(--muted)" }}>
            <XIcon size={15} />
          </button>
        </div>

        {step === "done" ? (
          <div className="px-5 py-10 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--green-dim)" }}>
              <CheckCircle size={22} style={{ color: "var(--green)" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Contestação enviada!</p>
            <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
              O adquirente foi notificado e tem até 10 dias para responder.
            </p>
          </div>
        ) : (
          <>
            {/* Alert summary */}
            <div className="mx-5 mt-4 p-3 rounded-xl text-xs space-y-1.5"
              style={{ background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.2)" }}>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Adquirente</span>
                <span className="font-semibold" style={{ color: "var(--text)" }}>{alerta.adquirente}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Modalidade</span>
                <span className="font-semibold" style={{ color: "var(--text)" }}>{alerta.modalidade}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Contratado vs. Cobrado</span>
                <span className="font-semibold" style={{ color: "var(--red)" }}>{alerta.contratado}% → {alerta.cobrado}% (+{alerta.desvio}%)</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Impacto estimado</span>
                <span className="font-bold" style={{ color: "var(--red)" }}>−R$ {alerta.impacto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Message */}
            <div className="px-5 mt-4">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
                Descrição da contestação
              </label>
              <textarea
                value={msg}
                onChange={e => setMsg(e.target.value)}
                rows={4}
                placeholder="Descreva o motivo da contestação e referencie o contrato ou aditivo que confirma a tarifa acordada..."
                className="input-base resize-none text-xs"
              />
              <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
                O adquirente receberá esta mensagem junto aos dados da auditoria automaticamente.
              </p>
            </div>

            <div className="flex gap-3 px-5 py-4">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>Cancelar</button>
              <button onClick={submit} disabled={!msg.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: "var(--red)", color: "#fff" }}>
                <Send size={13} /> Enviar contestação
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TarifasPage() {
  const { toast }  = useToast();
  const { theme }  = useTheme();
  const [contesting, setContesting] = useState<Alerta | null>(null);
  const total = alertas.reduce((s, a) => s + a.impacto, 0);

  const axisStyle = { fontSize: 10, fill: theme === "dark" ? "#64748b" : "#8896a8" };
  const grid      = { strokeDasharray: "3 3", stroke: theme === "dark" ? "#334155" : "#f1f5f9" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ttStyle = { contentStyle: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }, formatter: (v: any) => [`${v}%`] };
  return (
    <div className="flex flex-col min-h-screen">
      <title>Tarifas & MDR | PayScale Intelligence</title>
      <Topbar title="Tarifas & MDR" subtitle="Taxas cobradas vs. contratadas" />
      <main className="flex-1 p-5 lg:p-8 space-y-5" style={{ background: "var(--bg)" }}>

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "MDR Total Cobrado",  value: "R$ 14.640", sub: "sobre R$ 483.200 em volume", color: "var(--text)" },
            { label: "MDR Médio Efetivo",  value: "3,03%",     sub: "Contratado: 2,88%",           color: "var(--amber)" },
            { label: "Cobranças Indevidas",value: `R$ ${total.toLocaleString("pt-BR",{minimumFractionDigits:2})}`, sub: `${alertas.length} modalidades fora do contrato`, color: "var(--red)" },
            { label: "Modalidades OK",     value: `${mdrData.filter(m=>m.d===0).length}/${mdrData.length}`, sub: "dentro do contratado", color: "var(--green)" },
          ].map(k => (
            <div key={k.label} className="card p-5">
              <p className="text-xs font-medium mb-3" style={{ color: "var(--muted)" }}>{k.label}</p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: k.color }}>{k.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2">
              <Bell size={15} style={{ color: "var(--red)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Alertas de Cobrança Indevida</p>
            </div>
            <span className="badge badge-red">{alertas.length} ativos</span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {alertas.map(a => (
              <div key={a.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
                <AlertTriangle size={16} className="shrink-0" style={{ color: "var(--red)" }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{a.adquirente} — {a.modalidade}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    Contratado {a.contratado}% · Cobrado {a.cobrado}% · Desvio +{a.desvio}% · Desde {a.desde}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: "var(--red)" }}>−R$ {a.impacto.toLocaleString("pt-BR",{minimumFractionDigits:2})}</p>
                  <p className="text-[11px]" style={{ color: "var(--muted)" }}>impacto no mês</p>
                </div>
                <button onClick={() => setContesting(a)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-50 transition-all shrink-0"
                  style={{ border: "1px solid var(--border)", color: "var(--red)" }}>Contestar</button>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text)" }}>Contratado vs. Cobrado</p>
            <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>PagSeguro — Maio 2026</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mdrData} barCategoryGap={10} margin={{ left: -12, right: 4 }}>
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="m" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip {...ttStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
                <Bar dataKey="c" name="Contratado" fill="var(--blue)" radius={[3,3,0,0]} />
                <Bar dataKey="r" name="Cobrado"    fill="var(--red)"  radius={[3,3,0,0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text)" }}>MDR por Adquirente</p>
            <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>PagSeguro vs. Mercado Pago</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
                <PolarAngleAxis dataKey="m" tick={{ fontSize: 10, fill: theme === "dark" ? "#64748b" : "#8896a8" }} />
                <Radar name="PagSeguro"   dataKey="PS" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Mercado Pago" dataKey="MP" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.15} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
                <Tooltip {...ttStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Detalhamento por Modalidade</p>
            <button
              onClick={() => { exportMDR(mdrData); toast("Auditoria MDR exportada!"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
              style={{ background: "var(--blue)", color: "#fff" }}>
              <Download size={12} /> Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" aria-label="Detalhamento de MDR por modalidade">
              <thead>
                <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                  {["Modalidade","MDR Contratado","MDR Cobrado","Desvio","Status"].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-semibold" style={{ color: "var(--muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mdrData.map((m, i) => (
                  <tr key={m.m} style={{ borderTop: "1px solid var(--border)", background: i%2===0?"var(--surface)":"var(--surface-2)" }}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium" style={{ color: "var(--text)" }}>{m.m}</td>
                    <td className="px-5 py-3 tabular-nums" style={{ color: "var(--text-2)" }}>{m.c.toFixed(2)}%</td>
                    <td className="px-5 py-3 font-semibold tabular-nums" style={{ color: m.d>0?"var(--red)":"var(--text)" }}>{m.r.toFixed(2)}%</td>
                    <td className="px-5 py-3 tabular-nums" style={{ color: m.d>0?"var(--red)":"var(--muted)" }}>
                      {m.d>0?`+${m.d.toFixed(2)}%`:"—"}
                    </td>
                    <td className="px-5 py-3">
                      {m.d===0
                        ? <span className="badge badge-green"><CheckCircle size={10}/>OK</span>
                        : <span className="badge badge-red"><AlertTriangle size={10}/>Indevida</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {contesting && (
        <ContestarModal
          alerta={contesting}
          onClose={() => setContesting(null)}
          onSend={() => { setContesting(null); toast("Contestação enviada ao adquirente!", "success"); }}
        />
      )}
    </div>
  );
}
