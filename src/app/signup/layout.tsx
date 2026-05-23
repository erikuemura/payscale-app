import type { Metadata } from "next";

export const metadata: Metadata = {
  title:       "Criar conta gratuita",
  description: "Crie sua conta no PayScale Intelligence e comece seu período gratuito de 14 dias. Sem cartão de crédito.",
  alternates:  { canonical: "https://payscale-app.vercel.app/signup" },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
