"use client";
import { useState, useEffect, useCallback } from "react";
import { reportPeriod } from "@/lib/payments/report-period";
import Topbar from "@/components/Topbar";
import { Download, TrendingUp, AlertTriangle, ShieldAlert, BarChart3, Printer } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/lib/supabase/client";
import type { Transaction, Chargeback } from "@/lib/supabase/types";

const MODALITY_LABEL: Record<string, string> = {
  debito: "Débito", credito_1x: "Crédito 1x", credito_2x: "Crédito 2x",
  credito_3x: "Crédito 3x", credito_6x: "Crédito 6x", credito_12x: "Crédito 12x",
  pix: "PIX", boleto: "Boleto",
};
const PROVIDER_LABEL: Record<string, string> = {
  pagseguro: "PagSeguro", mercadopago: "Mercado Pago", stone: "Stone", cielo: "Cielo",
};
const STATUS_LABEL: Record<string, string> = {
  settled: "Conciliado", divergent: "Divergência", no_settlement: "Sem liquidação", pending: "Pendente",
};
const CB_STATUS_LABEL: Record<string, string> = {
  aberto: "Aberto", contestado: "Contestado", ganho: "Ganho", perdido: "Perdido",
};

const fmt2 = (n: number) => n.toFixed(2).replace(".", ",");
const bom  = "﻿";

/* ── Geradores de CSV reais ── */
function buildConciliacaoCSV(txns: Transaction[]): string {
  const header = "ID;Data;Descrição;Adquirente;Modalidade;Valor Bruto;Tarifa (R$);Líquido;Status;Observação";
  const rows = txns.map(t => {
    const fee = t.mdr_charged != null
      ? Number(t.amount) * Number(t.mdr_charged) / 100
      : Number(t.amount) - Number(t.net_amount ?? t.amount);
    return [
      t.external_id,
      t.date,
      `"${(t.metadata as Record<string,string>)?.descricao ?? t.external_id}"`,
      PROVIDER_LABEL[t.provider] ?? t.provider,
      MODALITY_LABEL[t.modality ?? ""] ?? (t.modality ?? "—"),
      fmt2(Number(t.amount)),
      fmt2(fee),
      fmt2(Number(t.net_amount ?? t.amount)),
      STATUS_LABEL[t.status] ?? t.status,
      `"${(t.metadata as Record<string,string>)?.observacao ?? ""}"`,
    ].join(";");
  });
  return bom + [header, ...rows].join("\n");
}

function buildMdrCSV(txns: Transaction[]): string {
  const map: Record<string, { rates: number[]; charged: number[]; vol: number }> = {};
  txns.forEach(t => {
    const key = t.modality ?? "outros";
    if (!map[key]) map[key] = { rates: [], charged: [], vol: 0 };
    if (t.mdr_rate)    map[key].rates.push(Number(t.mdr_rate));
    if (t.mdr_charged) map[key].charged.push(Number(t.mdr_charged));
    map[key].vol += Number(t.amount);
  });
  const header = "Modalidade;Volume (R$);MDR Contratado (%);MDR Cobrado (%);Desvio (%);Status";
  const rows = Object.entries(map).map(([key, v]) => {
    const avgC = v.rates.length    ? v.rates.reduce((a,b)=>a+b)/v.rates.length       : 0;
    const avgR = v.charged.length  ? v.charged.reduce((a,b)=>a+b)/v.charged.length   : 0;
    const dev  = Math.max(0, avgR - avgC);
    return [
      MODALITY_LABEL[key] ?? key,
      fmt2(v.vol),
      fmt2(avgC),
      fmt2(avgR),
      dev > 0 ? `+${fmt2(dev)}` : "0,00",
      dev === 0 ? "OK" : "Indevida",
    ].join(";");
  });
  return bom + [header, ...rows].join("\n");
}

function buildChargebacksCSV(cbs: Chargeback[]): string {
  const header = "ID;Data;Cliente;Adquirente;Motivo;Valor;Prazo (dias);Status";
  const rows = cbs.map(cb => [
    cb.external_id ?? cb.id.slice(0, 8),
    cb.opened_at ?? cb.created_at.slice(0, 10),
    `"${cb.customer_name ?? "—"}"`,
    PROVIDER_LABEL[cb.provider] ?? cb.provider,
    `"${cb.reason ?? "—"}"`,
    fmt2(Number(cb.amount)),
    cb.deadline_days ?? 0,
    CB_STATUS_LABEL[cb.status] ?? cb.status,
  ].join(";"));
  return bom + [header, ...rows].join("\n");
}

function triggerDownload(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const types = [
  {id:"conciliacao",title:"Relatório de Conciliação",     desc:"Transações, divergências e valores pendentes de liquidação.",           icon:<TrendingUp size={16}/>, color:"var(--blue)",  ultima:"22/05/2026",tipo:"Mensal"},
  {id:"mdr",        title:"Auditoria de Tarifas MDR",      desc:"Taxas contratadas vs. cobradas com impacto financeiro por modalidade.", icon:<AlertTriangle size={16}/>,color:"var(--amber)", ultima:"22/05/2026",tipo:"Mensal"},
  {id:"chargebacks",title:"Gestão de Chargebacks",         desc:"Disputas e estados registrados; não comprova envio ou crédito recebido.",        icon:<ShieldAlert size={16}/>, color:"var(--red)",   ultima:"21/05/2026",tipo:"Mensal"},
  {id:"saude",      title:"Saúde Financeira",              desc:"Volume e líquido registrado por mês e faixa de sete dias, sem projeções.",            icon:<BarChart3 size={16}/>,   color:"var(--green)", ultima:"22/05/2026",tipo:"Semanal"},
];
export default function RelatoriosPage() {
  const { toast } = useToast();
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [cbs,  setCbs]  = useState<Chargeback[]>([]);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [txRes, cbRes] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", user.id),
      supabase.from("chargebacks").select("*").eq("user_id", user.id),
    ]);
    setTxns((txRes.data ?? []) as Transaction[]);
    setCbs((cbRes.data ?? []) as Chargeback[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const now = new Date();
  const monthLabel = "Todos os registros consultados";

  function handleExport(id: string, title: string) {
    let csv = "";
    const slug = `${id}_${now.getFullYear()}_${String(now.getMonth()+1).padStart(2,"0")}`;
    if (id === "conciliacao") csv = buildConciliacaoCSV(txns);
    else if (id === "mdr")    csv = buildMdrCSV(txns);
    else if (id === "chargebacks") csv = buildChargebacksCSV(cbs);
    else {
      // Saúde financeira — agrega por semana
      const header = "Mês e faixa de 7 dias;Volume Total;Líquido registrado;Média simples MDR informado (%)";
      const weekMap: Record<string, { vol: number; net: number; fees: number; n: number }> = {};
      txns.forEach(t => {
        const wk = reportPeriod(t.date);
        if (!weekMap[wk]) weekMap[wk] = { vol: 0, net: 0, fees: 0, n: 0 };
        weekMap[wk].vol += Number(t.amount);
        weekMap[wk].net += Number(t.net_amount ?? t.amount);
        if (t.mdr_charged) { weekMap[wk].fees += Number(t.mdr_charged); weekMap[wk].n++; }
      });
      const rows = Object.entries(weekMap).map(([wk, v]) => [
        wk,
        fmt2(v.vol),
        fmt2(v.net),
        v.n > 0 ? fmt2(v.fees / v.n) : "0,00",
      ].join(";"));
      csv = bom + [header, ...rows].join("\n");
    }
    if (!csv) { toast("Sem dados para exportar. Conecte um adquirente primeiro.", "info"); return; }
    triggerDownload(csv, `${slug}.csv`);
    toast(`${title} exportado com sucesso!`);
  }

  const months = {
    conciliacao: monthLabel, mdr: monthLabel,
    chargebacks: monthLabel, saude: monthLabel,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <title>Relatórios | PayScale Intelligence</title>
      <Topbar title="Relatórios" subtitle="Exporte os registros disponíveis na sua conta"/>
      <main className="flex-1 p-5 lg:p-8 space-y-6" style={{background:"var(--bg)"}}>

        {/* Generate */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{color:"var(--text)"}}>Gerar Relatório</p>
            <button onClick={() => window.print()}
              className="no-print flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all"
              style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}>
              <Printer size={13}/> Imprimir página
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {types.map(r=>(
              <div key={r.id} className="card overflow-hidden">
                <div className="flex items-start gap-3 px-5 py-4" style={{borderBottom:"1px solid var(--border)"}}>
                  <div className="icon-box shrink-0" style={{background:r.color+"18",color:r.color}}>{r.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{color:"var(--text)"}}>{r.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{color:"var(--text-2)"}}>{r.desc}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <p className="text-xs" style={{color:"var(--muted)"}}>Gerado sob demanda</p>
                  <span className="badge badge-blue">CSV</span>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 rounded-lg"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                      {months[r.id as keyof typeof months]}
                    </span>
                    <button
                      onClick={() => handleExport(r.id, r.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                      style={{background:"var(--blue)",color:"#fff"}}>
                      <Download size={12}/>Exportar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="card p-5"><h2 className="font-semibold">Histórico e envio por e-mail</h2><p className="mt-2 text-sm">Os arquivos são gerados no navegador a partir dos registros consultados. Não há histórico de arquivos armazenados nem envio agendado ativo. Guarde os arquivos exportados.</p></section>
      </main>

    </div>
  );
}
