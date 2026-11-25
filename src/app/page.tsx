import type { Metadata } from "next";
import SitePageClient from "./site/SitePageClient";
import { faqs } from "./site/content";
const base = "https://www.payscale.com.br";
export const metadata: Metadata = {
  title: { absolute: "Gestão de pagamentos e conciliação de recebíveis | PayScale" },
  description: "Conciliação, parcelamento, taxas, antecipação e apoio a riscos e chargebacks para e-commerce, POS e empresas. Conheça a PayScale.",
  twitter: { card: "summary_large_image", title: "Gestão de pagamentos e recebíveis | PayScale", description: "Confira recebimentos e avalie taxas, parcelamento e riscos da sua operação.", images: ["/opengraph-image"] },
  alternates: { canonical: base },
  openGraph: { title: "PayScale — mais clareza em cada decisão de pagamento", description: "Da estratégia de venda à conferência dos recebimentos: conheça nossas frentes de gestão de pagamentos.", url: base, images: ["/opengraph-image"] },
};
export default function Home() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "Organization", "@id": `${base}/#organization`, name: "PayScale", url: base, email: "contato@payscale.com.br" }, { "@type": "WebSite", "@id": `${base}/#website`, url: base, name: "PayScale", inLanguage: "pt-BR", publisher: { "@id": `${base}/#organization` } }, { "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }] }).replace(/</g, "\\u003c") }}/><SitePageClient/></>;
}
