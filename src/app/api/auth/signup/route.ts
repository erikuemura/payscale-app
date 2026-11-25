import { NextResponse } from 'next/server';
/** The assisted pilot does not provision accounts from public requests. */
export async function POST() {
 return NextResponse.json({error:'O cadastro por formulário está fechado durante o piloto assistido. Solicite participação em contato@payscale.com.br.'},{status:403,headers:{'Cache-Control':'no-store'}});
}
