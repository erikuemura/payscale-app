import {failure,json,session} from '@/lib/launch/http';
export async function GET(){try{const c=await session();if(c.error)return c.error;return json({disputes:process.env.DISPUTE_WORKSPACE_ENABLED==='true',commercial:process.env.COMMERCIAL_REQUESTS_ENABLED==='true'});}catch{return failure('capabilities');}}
