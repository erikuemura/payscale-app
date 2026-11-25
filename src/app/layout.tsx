import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

// Anti-FOUC: applies saved theme before first paint
const themeScript = `(function(){try{var t=localStorage.getItem('theme')||((window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

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
  metadataBase: new URL("https://www.payscale.com.br"),

  title: {
    default:  "PayScale — Gestão de pagamentos e recebíveis",
    template: "%s | PayScale",
  },
  description:
    "Conciliação de recebíveis e apoio em taxas, parcelamento e chargebacks para e-commerce, lojas físicas e empresas.",
  authors:  [{ name: "PayScale Intelligence", url: "https://www.payscale.com.br" }],
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
    url:         "https://www.payscale.com.br",
    siteName:    "PayScale Intelligence",
    title:       "PayScale — Gestão de pagamentos e recebíveis",
    description: "Conciliação de recebíveis e apoio em taxas, parcelamento e chargebacks para e-commerce, lojas físicas e empresas.",
    images: [{
      url:    "/opengraph-image",
      width:  1200,
      height: 630,
      alt:    "PayScale Intelligence — Conciliação Financeira",
    }],
  },

  twitter: {
    card:        "summary_large_image",
    title:       "PayScale — Gestão de pagamentos e recebíveis",
    description: "Conheça a conciliação por arquivos e o apoio à gestão de pagamentos para sua empresa.",
    images:      ["/opengraph-image"],
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
