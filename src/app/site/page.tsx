import type { Metadata } from "next";
import Script from "next/script";
import SitePageClient from "./SitePageClient";

const BASE = "https://payscale-app.vercel.app";

/* ── Metadata específica da landing page ── */
export const metadata: Metadata = {
  title: "Conciliação Financeira e Auditoria de Tarifas MDR",
  description:
    "Pare de perder dinheiro para os adquirentes. Concilie vendas, audite tarifas MDR e gerencie chargebacks de PagSeguro, Mercado Pago, Stone e Cielo automaticamente. 14 dias grátis.",
  keywords: [
    "conciliação financeira automatizada",
    "auditoria MDR PagSeguro",
    "auditoria MDR Mercado Pago",
    "gestão chargebacks",
    "divergência de pagamentos",
    "cobranças indevidas adquirente",
    "fintech financeira",
    "conciliação pagamentos eletrônicos Brasil",
  ],
  alternates: {
    canonical: BASE + "/site",
  },
  openGraph: {
    title:       "PayScale Intelligence — Conciliação Financeira e Auditoria de Tarifas MDR",
    description: "Pare de perder dinheiro para os adquirentes. Concilie vendas, audite MDR e gerencie chargebacks — no piloto automático. 14 dias grátis.",
    url:         BASE + "/site",
    type:        "website",
  },
};

/* ── JSON-LD Structured Data ── */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id":    BASE + "/#organization",
      name:     "PayScale Intelligence",
      url:      BASE,
      logo: {
        "@type": "ImageObject",
        url:     BASE + "/icon.png",
      },
      contactPoint: {
        "@type":           "ContactPoint",
        email:             "contato@payscale.com.br",
        contactType:       "customer support",
        availableLanguage: "Portuguese",
      },
      address: {
        "@type":           "PostalAddress",
        addressLocality:   "São Paulo",
        addressRegion:     "SP",
        addressCountry:    "BR",
      },
    },
    {
      "@type":            "SoftwareApplication",
      "@id":              BASE + "/#app",
      name:               "PayScale Intelligence",
      applicationCategory:"FinanceApplication",
      operatingSystem:    "Web",
      url:                BASE + "/site",
      description:
        "Plataforma SaaS de conciliação financeira, auditoria de tarifas MDR e gestão de chargebacks para empresas que processam pagamentos eletrônicos no Brasil.",
      offers: [
        {
          "@type":         "Offer",
          name:            "Plano Starter",
          price:           "297",
          priceCurrency:   "BRL",
          priceSpecification: {
            "@type":        "RecurringChargeSpecification",
            billingDuration: 1,
            billingIncrement:"P1M",
          },
        },
        {
          "@type":         "Offer",
          name:            "Plano Growth",
          price:           "597",
          priceCurrency:   "BRL",
          priceSpecification: {
            "@type":        "RecurringChargeSpecification",
            billingDuration: 1,
            billingIncrement:"P1M",
          },
        },
      ],
      aggregateRating: {
        "@type":       "AggregateRating",
        ratingValue:   "5",
        reviewCount:   "3",
        bestRating:    "5",
        worstRating:   "1",
      },
    },
    {
      "@type": "WebPage",
      "@id":   BASE + "/site",
      url:     BASE + "/site",
      name:    "PayScale Intelligence — Conciliação Financeira e Auditoria de Tarifas MDR",
      description:
        "Pare de perder dinheiro para os adquirentes. Concilie vendas, audite tarifas MDR e gerencie chargebacks automaticamente.",
      isPartOf: { "@id": BASE + "/#website" },
      publisher: { "@id": BASE + "/#organization" },
      inLanguage: "pt-BR",
    },
    {
      "@type": "WebSite",
      "@id":   BASE + "/#website",
      url:     BASE,
      name:    "PayScale Intelligence",
      publisher: { "@id": BASE + "/#organization" },
      inLanguage: "pt-BR",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name:    "Quanto tempo leva para conectar meu adquirente?",
          acceptedAnswer: {
            "@type": "Answer",
            text:    "Menos de 2 minutos. Você insere suas credenciais de API e o PayScale Intelligence começa a importar seus dados automaticamente.",
          },
        },
        {
          "@type": "Question",
          name:    "Quais adquirentes são suportados?",
          acceptedAnswer: {
            "@type": "Answer",
            text:    "PagSeguro, Mercado Pago, Stone, Cielo, Bling ERP e TOTVS Protheus. Novos adquirentes são adicionados periodicamente.",
          },
        },
        {
          "@type": "Question",
          name:    "O PayScale Intelligence precisa de cartão de crédito para o período gratuito?",
          acceptedAnswer: {
            "@type": "Answer",
            text:    "Não. Você tem 14 dias grátis sem precisar cadastrar nenhum cartão de crédito. Cancele quando quiser.",
          },
        },
        {
          "@type": "Question",
          name:    "Como funciona a auditoria de tarifas MDR?",
          acceptedAnswer: {
            "@type": "Answer",
            text:    "O sistema compara automaticamente as taxas MDR contratadas com as efetivamente cobradas pelos adquirentes, modalidade por modalidade, e alerta sobre qualquer divergência.",
          },
        },
      ],
    },
  ],
};

export default function SitePage() {
  return (
    <>
      <Script
        id="site-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SitePageClient />
    </>
  );
}
