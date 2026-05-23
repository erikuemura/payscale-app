"use client";
import Topbar from "@/components/Topbar";
import { AlertTriangle, CheckCircle, Bell, Download } from "lucide-react";
import { useToast } from "@/context/ToastContext";

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
const axisStyle = { fontSize: 10, fill: "#8896a8" };
const grid = { strokeDasharray: "3 3", stroke: "#f1f5f9" };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ttStyle = { contentStyle: { background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }, formatter: (v: any) => [`${v}%`] };

export default function TarifasPage() {
  const { toast } = useToast();
  const total = alertas.reduce((s, a) => s + a.impacto, 0);
  return (
    <div className="flex flex-col min-h-screen">
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
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-50 transition-all shrink-0"
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
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="m" tick={{ fontSize: 10, fill: "#8896a8" }} />
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
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                  {["Modalidade","MDR Contratado","MDR Cobrado","Desvio","Status"].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-semibold" style={{ color: "var(--muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mdrData.map((m, i) => (
                  <tr key={m.m} style={{ borderTop: "1px solid var(--border)", background: i%2===0?"white":"var(--surface-2)" }}
                    className="hover:bg-blue-50/30 transition-colors">
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
    </div>
  );
}
