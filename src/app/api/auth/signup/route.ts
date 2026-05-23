import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, full_name, person_type, segment, company } = await req.json();

  // Validações básicas
  if (!email || !password || !full_name || !segment) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "A senha deve ter pelo menos 8 caracteres." }, { status: 400 });
  }

  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!serviceKey) {
    // Se não tiver service key, cai de volta para o fluxo normal (com e-mail)
    return NextResponse.json({ error: "SERVICE_KEY_MISSING" }, { status: 500 });
  }

  // Admin client — usa service_role, nunca exposto ao browser
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Cria usuário já confirmado (sem enviar e-mail)
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,   // ← confirma direto, sem e-mail
    user_metadata: { full_name, person_type, segment, company },
  });

  if (error) {
    const msg = error.message.includes("already been registered")
      ? "Este e-mail já está cadastrado. Faça login."
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Faz login automático após criar
  const supabasePub = createClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  );
  const { data: signInData, error: signInErr } = await supabasePub.auth.signInWithPassword({
    email,
    password,
  });

  if (signInErr || !signInData.session) {
    // Usuário criado mas login falhou — manda pro login
    return NextResponse.json({ ok: true, redirect: "/" });
  }

  return NextResponse.json({
    ok: true,
    access_token:  signInData.session.access_token,
    refresh_token: signInData.session.refresh_token,
  });
}
