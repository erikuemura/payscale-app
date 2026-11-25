import { NextResponse } from 'next/server';
/** Demo data is provisioned separately; this public route must not overwrite accounts. */
export async function POST() {
 return NextResponse.json({error:'A carga automática de demonstração foi desativada. Use a conta demonstrativa já preparada ou importe seus arquivos.'},{status:410,headers:{'Cache-Control':'no-store'}});
}
