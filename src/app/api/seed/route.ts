import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ──────────────────────────────────────────────────────────
   POST /api/seed
   Insere dados de demonstração na conta do usuário logado.
   Idempotente — se os dados já existirem (por external_id),
   o upsert apenas os atualiza.
────────────────────────────────────────────────────────── */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const uid = user.id;

  /* ── 1. Integrações ── */
  const integrationRows = [
    {
      user_id:      uid,
      provider:     "pagseguro",
      status:       "connected",
      client_id:    "APP-DEMO-PS-001",
      access_token: "demo-token-pagseguro",
      last_sync:    new Date(Date.now() - 3 * 60_000).toISOString(), // 3 min atrás
      metadata:     { demo: true },
    },
    {
      user_id:      uid,
      provider:     "mercadopago",
      status:       "connected",
      client_id:    "APP-DEMO-MP-001",
      access_token: "demo-token-mercadopago",
      last_sync:    new Date(Date.now() - 5 * 60_000).toISOString(), // 5 min atrás
      metadata:     { demo: true },
    },
  ];

  const { data: intgData, error: intgErr } = await supabase
    .from("integrations")
    .upsert(integrationRows, { onConflict: "user_id,provider" })
    .select("id,provider");

  if (intgErr) {
    return NextResponse.json({ error: "Erro ao criar integrações", detail: intgErr.message }, { status: 500 });
  }

  const psId = intgData?.find(i => i.provider === "pagseguro")?.id ?? null;
  const mpId = intgData?.find(i => i.provider === "mercadopago")?.id ?? null;

  /* ── 2. Transações ── */
  function d(daysAgo: number) {
    const dt = new Date();
    dt.setDate(dt.getDate() - daysAgo);
    return dt.toISOString().slice(0, 10);
  }

  const transactionRows = [
    // PagSeguro — OK
    { user_id: uid, integration_id: psId, provider: "pagseguro", external_id: "TXN-PS-001", date: d(3), amount: 1200.00, mdr_rate: 2.50, mdr_charged: 2.50, net_amount: 1170.00, modality: "credito_1x",  status: "settled",       customer_name: "Loja Online", metadata: { descricao: "Venda #8821 — Loja Online", observacao: null } },
    { user_id: uid, integration_id: psId, provider: "pagseguro", external_id: "TXN-PS-002", date: d(4), amount: 890.00,  mdr_rate: 1.20, mdr_charged: 1.20, net_amount: 879.32,  modality: "debito",       status: "settled",       customer_name: "App Mobile",  metadata: { descricao: "Venda #8810 — App Mobile", observacao: null } },
    { user_id: uid, integration_id: psId, provider: "pagseguro", external_id: "TXN-PS-003", date: d(4), amount: 650.00,  mdr_rate: 2.80, mdr_charged: 3.10, net_amount: 630.50,  modality: "credito_2x",  status: "divergent",     customer_name: "Marketplace", metadata: { descricao: "Venda #8799 — Marketplace",  observacao: "Tarifa cobrada: R$ 20,15 (+R$ 1,95 acima do contratado)" } },
    { user_id: uid, integration_id: psId, provider: "pagseguro", external_id: "TXN-PS-004", date: d(6), amount: 1580.00, mdr_rate: 2.50, mdr_charged: 2.50, net_amount: 1540.50, modality: "credito_1x",  status: "settled",       customer_name: "Loja Online", metadata: { descricao: "Venda #8791 — Loja Online", observacao: null } },
    { user_id: uid, integration_id: psId, provider: "pagseguro", external_id: "TXN-PS-005", date: d(6), amount: 1200.00, mdr_rate: 3.00, mdr_charged: 3.70, net_amount: 1164.00, modality: "credito_3x",  status: "divergent",     customer_name: "Marketplace", metadata: { descricao: "Venda #8762 — Marketplace",  observacao: "Tarifa cobrada: R$ 44,40 (+R$ 8,40 acima do contratado)" } },
    { user_id: uid, integration_id: psId, provider: "pagseguro", external_id: "TXN-PS-006", date: d(7), amount: 540.00,  mdr_rate: 0.99, mdr_charged: 0.99, net_amount: 534.65,  modality: "pix",          status: "settled",       customer_name: "Loja Online", metadata: { descricao: "Venda #8775 — Loja Online", observacao: null } },
    { user_id: uid, integration_id: psId, provider: "pagseguro", external_id: "TXN-PS-007", date: d(8), amount: 2100.00, mdr_rate: 3.20, mdr_charged: 3.20, net_amount: 2032.80, modality: "credito_6x",  status: "settled",       customer_name: "App Mobile",  metadata: { descricao: "Venda #8751 — App Mobile", observacao: null } },
    { user_id: uid, integration_id: psId, provider: "pagseguro", external_id: "TXN-PS-008", date: d(9), amount: 3200.00, mdr_rate: 3.80, mdr_charged: 4.10, net_amount: 3076.80, modality: "credito_12x", status: "divergent",     customer_name: "Marketplace", metadata: { descricao: "Venda #8740 — Marketplace",  observacao: "Tarifa cobrada: R$ 131,20 (+R$ 9,60 acima do contratado)" } },
    { user_id: uid, integration_id: psId, provider: "pagseguro", external_id: "TXN-PS-009", date: d(10), amount: 780.00, mdr_rate: 1.20, mdr_charged: 1.20, net_amount: 770.64,  modality: "debito",      status: "settled",       customer_name: "Loja Online", metadata: { descricao: "Venda #8738 — Loja Online", observacao: null } },
    { user_id: uid, integration_id: psId, provider: "pagseguro", external_id: "TXN-PS-010", date: d(12), amount: 430.00, mdr_rate: 2.50, mdr_charged: 2.50, net_amount: 419.25,  modality: "credito_1x",  status: "no_settlement", customer_name: "App Mobile",  metadata: { descricao: "Venda #8720 — App Mobile",  observacao: "Venda não liquidada após 3 dias úteis" } },

    // Mercado Pago — mix
    { user_id: uid, integration_id: mpId, provider: "mercadopago", external_id: "TXN-MP-001", date: d(3),  amount: 3450.00, mdr_rate: 3.20, mdr_charged: 3.20, net_amount: 3339.60, modality: "credito_6x",  status: "divergent",     customer_name: "Marketplace", metadata: { descricao: "Venda #8822 — Marketplace",  observacao: "Tarifa cobrada: R$ 138,00 (+R$ 27,60 acima do contratado)" } },
    { user_id: uid, integration_id: mpId, provider: "mercadopago", external_id: "TXN-MP-002", date: d(4),  amount: 2800.00, mdr_rate: 3.80, mdr_charged: 3.80, net_amount: 2693.60, modality: "credito_12x", status: "no_settlement", customer_name: "Loja Online", metadata: { descricao: "Venda #8805 — Loja Online",  observacao: "Venda não liquidada após 3 dias úteis" } },
    { user_id: uid, integration_id: mpId, provider: "mercadopago", external_id: "TXN-MP-003", date: d(5),  amount: 320.00,  mdr_rate: 1.20, mdr_charged: 1.20, net_amount: 316.16,  modality: "debito",      status: "settled",       customer_name: "App Mobile",  metadata: { descricao: "Venda #8798 — App Mobile",  observacao: null } },
    { user_id: uid, integration_id: mpId, provider: "mercadopago", external_id: "TXN-MP-004", date: d(6),  amount: 4200.00, mdr_rate: 3.20, mdr_charged: 3.20, net_amount: 4040.40, modality: "credito_6x",  status: "no_settlement", customer_name: "Marketplace", metadata: { descricao: "Venda #8788 — Marketplace",  observacao: "Aguardando confirmação do adquirente" } },
    { user_id: uid, integration_id: mpId, provider: "mercadopago", external_id: "TXN-MP-005", date: d(7),  amount: 980.00,  mdr_rate: 2.50, mdr_charged: 2.50, net_amount: 955.50,  modality: "credito_1x",  status: "settled",       customer_name: "Loja Online", metadata: { descricao: "Venda #8770 — Loja Online",  observacao: null } },
    { user_id: uid, integration_id: mpId, provider: "mercadopago", external_id: "TXN-MP-006", date: d(8),  amount: 460.00,  mdr_rate: 1.20, mdr_charged: 1.20, net_amount: 454.48,  modality: "debito",      status: "settled",       customer_name: "App Mobile",  metadata: { descricao: "Venda #8758 — App Mobile",  observacao: null } },
    { user_id: uid, integration_id: mpId, provider: "mercadopago", external_id: "TXN-MP-007", date: d(9),  amount: 1850.00, mdr_rate: 2.80, mdr_charged: 2.80, net_amount: 1798.30, modality: "credito_2x",  status: "settled",       customer_name: "Marketplace", metadata: { descricao: "Venda #8743 — Marketplace",  observacao: null } },
    { user_id: uid, integration_id: mpId, provider: "mercadopago", external_id: "TXN-MP-008", date: d(11), amount: 620.00,  mdr_rate: 0.99, mdr_charged: 0.99, net_amount: 613.86,  modality: "pix",         status: "settled",       customer_name: "Loja Online", metadata: { descricao: "Venda #8721 — Loja Online",  observacao: null } },
    { user_id: uid, integration_id: mpId, provider: "mercadopago", external_id: "TXN-MP-009", date: d(13), amount: 2200.00, mdr_rate: 3.80, mdr_charged: 4.10, net_amount: 2109.80, modality: "credito_12x", status: "divergent",     customer_name: "App Mobile",  metadata: { descricao: "Venda #8708 — App Mobile",  observacao: "Tarifa cobrada: R$ 90,20 (+R$ 2,40 acima do contratado)" } },
    { user_id: uid, integration_id: mpId, provider: "mercadopago", external_id: "TXN-MP-010", date: d(15), amount: 1100.00, mdr_rate: 2.50, mdr_charged: 2.50, net_amount: 1072.50, modality: "credito_1x",  status: "settled",       customer_name: "Marketplace", metadata: { descricao: "Venda #8690 — Marketplace",  observacao: null } },
  ];

  const { error: txErr } = await supabase
    .from("transactions")
    .upsert(transactionRows, { onConflict: "user_id,provider,external_id" });

  if (txErr) {
    return NextResponse.json({ error: "Erro ao criar transações", detail: txErr.message }, { status: 500 });
  }

  /* ── 3. Chargebacks ── */
  const cbRows = [
    { user_id: uid, integration_id: mpId, provider: "mercadopago", external_id: "CB-MP-001", customer_name: "Carlos M. Santos",  reason: "Não reconhece a compra",  amount: 450.00,  deadline_days: 3, status: "aberto",     opened_at: d(5),  metadata: { descricao: "Cliente alega não reconhecer a transação realizada. Compra via crédito 1x." } },
    { user_id: uid, integration_id: psId, provider: "pagseguro",   external_id: "CB-PS-001", customer_name: "Ana Paula Lima",    reason: "Produto não entregue",    amount: 1200.00, deadline_days: 5, status: "contestado", opened_at: d(7),  metadata: { descricao: "Cliente afirma que o produto adquirido nunca foi entregue. Compra parcelada em 3x." } },
    { user_id: uid, integration_id: mpId, provider: "mercadopago", external_id: "CB-MP-002", customer_name: "João R. Costa",     reason: "Cobrança duplicada",      amount: 380.00,  deadline_days: 0, status: "ganho",      opened_at: d(10), resolved_at: d(3), metadata: { descricao: "Contestação aceita pelo adquirente. Comprovante de entrega validado." } },
    { user_id: uid, integration_id: psId, provider: "pagseguro",   external_id: "CB-PS-002", customer_name: "Maria F. Oliveira", reason: "Não reconhece a compra",  amount: 890.00,  deadline_days: 0, status: "perdido",    opened_at: d(13), resolved_at: d(1), metadata: { descricao: "Chargeback não contestado dentro do prazo. Valor debitado da conta." } },
    { user_id: uid, integration_id: mpId, provider: "mercadopago", external_id: "CB-MP-003", customer_name: "Lucas T. Ferreira", reason: "Produto com defeito",     amount: 320.00,  deadline_days: 8, status: "aberto",     opened_at: d(15), metadata: { descricao: "Cliente relata que o produto chegou com defeito e solicitou estorno via adquirente." } },
  ];

  // Chargebacks não têm unique constraint — verificar por external_id
  const { count: cbCount } = await supabase
    .from("chargebacks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", uid)
    .in("external_id", cbRows.map(r => r.external_id));

  if ((cbCount ?? 0) === 0) {
    const { error: cbErr } = await supabase.from("chargebacks").insert(cbRows);
    if (cbErr) {
      return NextResponse.json({ error: "Erro ao criar chargebacks", detail: cbErr.message }, { status: 500 });
    }
  }

  /* ── 4. Alertas ── */
  // Para alertas, como não temos unique constraint fácil, vamos inserir apenas se não houver nenhum
  const { count: alertCount } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", uid);

  if ((alertCount ?? 0) === 0) {
    const alertRows = [
      { user_id: uid, type: "mdr_deviation",       severity: "critical", title: "Tarifa MDR acima do contratado — Crédito 12x (+0,3%)",           description: "PagSeguro cobrou 4,10% em vez de 3,80% nas vendas parceladas em 12x.",      amount: 1240, resolved: false, metadata: { href: "/dashboard/tarifas" } },
      { user_id: uid, type: "mdr_deviation",       severity: "warning",  title: "Tarifa MDR acima do contratado — Crédito 2x (+0,3%)",            description: "PagSeguro cobrou 3,10% em vez de 2,80% nas vendas parceladas em 2x.",       amount: 380,  resolved: false, metadata: { href: "/dashboard/tarifas" } },
      { user_id: uid, type: "no_settlement",       severity: "critical", title: "Divergência na conciliação — 4 transações sem liquidação",        description: "4 transações no total de R$ 11.450 estão sem liquidação por mais de 3 dias.", amount: 8750, resolved: false, metadata: { href: "/dashboard/conciliacao" } },
      { user_id: uid, type: "chargeback_deadline", severity: "warning",  title: "Chargeback recebido — prazo de contestação em 3 dias",           description: "Carlos M. Santos — R$ 450,00 via Mercado Pago. Conteste antes do prazo.",   amount: 450,  resolved: false, metadata: { href: "/dashboard/chargebacks" } },
    ];
    await supabase.from("alerts").insert(alertRows);
  }

  return NextResponse.json({ ok: true, integrations: intgData?.length, transactions: transactionRows.length, chargebacks: cbRows.length });
}
