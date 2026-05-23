import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* ── Viewport ── */
export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

/* ── Metadata base ── */
export const metadata: Metadata = {
  metadataBase: new URL("https://payscale-app.vercel.app"),

  title: {
    default:  "PayScale Intelligence — Conciliação Financeira e Auditoria de Tarifas MDR",
    template: "%s | PayScale Intelligence",
  },
  description:
    "Concilie vendas, audite tarifas MDR e gerencie chargebacks de PagSeguro, Mercado Pago, Stone e Cielo — tudo automaticamente. Teste grátis por 14 dias.",
  keywords: [
    "conciliação financeira", "auditoria MDR", "chargeback", "PagSeguro",
    "Mercado Pago", "conciliação de pagamentos", "tarifa MDR", "fintech",
    "gestão financeira", "conciliação automática", "Stone", "Cielo",
  ],
  authors:  [{ name: "PayScale Intelligence", url: "https://payscale-app.vercel.app" }],
  creator:  "PayScale Intelligence",
  publisher:"PayScale Intelligence",

  robots: {
    index:   true,
    follow:  true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },

  openGraph: {
    type:        "website",
    locale:      "pt_BR",
    url:         "https://payscale-app.vercel.app",
    siteName:    "PayScale Intelligence",
    title:       "PayScale Intelligence — Conciliação Financeira e Auditoria de Tarifas MDR",
    description: "Concilie vendas, audite tarifas MDR e gerencie chargebacks de PagSeguro, Mercado Pago, Stone e Cielo — tudo automaticamente. Teste grátis por 14 dias.",
    images: [{
      url:    "/og-image.png",
      width:  1200,
      height: 630,
      alt:    "PayScale Intelligence — Conciliação Financeira",
    }],
  },

  twitter: {
    card:        "summary_large_image",
    title:       "PayScale Intelligence — Conciliação Financeira e Auditoria de Tarifas MDR",
    description: "Concilie vendas, audite tarifas MDR e gerencie chargebacks automaticamente. Teste grátis por 14 dias.",
    images:      ["/og-image.png"],
  },

  alternates: {
    canonical: "https://payscale-app.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
