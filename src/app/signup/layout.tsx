import type { Metadata } from 'next';
export const metadata:Metadata={title:'Participar do piloto assistido',description:'Solicite uma avaliação acompanhada da PayScale. Cadastro automático fechado durante o piloto.',alternates:{canonical:'https://www.payscale.com.br/signup'},robots:{index:false,follow:true}};
export default function SignupLayout({children}:{children:React.ReactNode}){return <>{children}</>;}
