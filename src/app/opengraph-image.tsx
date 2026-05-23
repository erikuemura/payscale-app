import { ImageResponse } from "next/og";

export const runtime     = "edge";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt         = "PayScale Intelligence — Conciliação Financeira e Auditoria de Tarifas MDR";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        width: "100%", height: "100%", padding: "60px 80px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Grid texture */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Blue glow */}
      <div style={{
        position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)",
        width: 700, height: 450,
        background: "radial-gradient(circle, #2563eb, transparent 70%)",
        opacity: 0.18, filter: "blur(80px)",
      }} />

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40, zIndex: 1 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 28, fontWeight: 900,
        }}>P</div>
        <span style={{ color: "white", fontSize: 30, fontWeight: 700 }}>PayScale Intelligence</span>
      </div>

      {/* Headline */}
      <h1 style={{
        color: "white", fontSize: 68, fontWeight: 900, textAlign: "center",
        lineHeight: 1.1, marginBottom: 28, zIndex: 1,
        textShadow: "0 2px 20px rgba(0,0,0,0.4)",
      }}>
        Conciliação Financeira
        <br />
        <span style={{ color: "#60a5fa" }}>e Auditoria de Tarifas</span>
      </h1>

      {/* Sub */}
      <p style={{
        color: "#94a3b8", fontSize: 26, textAlign: "center",
        maxWidth: 800, lineHeight: 1.5, zIndex: 1,
      }}>
        Audite MDR, concilie vendas e gerencie chargebacks de PagSeguro,
        Mercado Pago e outros — no piloto automático.
      </p>

      {/* Badge */}
      <div style={{
        marginTop: 44, display: "flex", gap: 12, zIndex: 1,
      }}>
        {["PagSeguro", "Mercado Pago", "Stone", "Cielo"].map(n => (
          <div key={n} style={{
            padding: "8px 18px", borderRadius: 40,
            background: "rgba(37,99,235,0.2)", border: "1px solid rgba(37,99,235,0.4)",
            color: "#93c5fd", fontSize: 16, fontWeight: 600,
          }}>{n}</div>
        ))}
      </div>
    </div>,
    { ...size }
  );
}
