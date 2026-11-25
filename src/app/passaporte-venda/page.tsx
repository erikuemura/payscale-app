import type { Metadata } from 'next';
import PassportWorkspace from './PassportWorkspace';
export const metadata:Metadata={title:'Passaporte da venda',description:'Organize as referências de evidências para revisar uma disputa de pagamento.',alternates:{canonical:'/passaporte-venda'},robots:{index:false,follow:false}};
export default function Page(){return <PassportWorkspace/>;}
