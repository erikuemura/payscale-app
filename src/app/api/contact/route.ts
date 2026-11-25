import { receiveContact } from '@/lib/contact/service';
export const runtime='nodejs';
export async function POST(request:Request){return receiveContact(request,{enabled:process.env.CONTACT_FORM_ENABLED==='true',apiKey:process.env.RESEND_API_KEY,from:process.env.CONTACT_FROM,challengeSecret:process.env.TURNSTILE_SECRET_KEY,origin:'https://www.payscale.com.br'});}
