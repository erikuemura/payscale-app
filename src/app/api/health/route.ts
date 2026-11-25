export const dynamic='force-dynamic';
/** Liveness only: does not claim database, mail, Storage or external-provider health. */
export async function GET(){return Response.json({status:'ok',scope:'application',version:'024'},{headers:{'Cache-Control':'no-store'}});}
