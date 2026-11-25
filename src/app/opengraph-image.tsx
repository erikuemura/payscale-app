import { ImageResponse } from "next/og";
export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "PayScale — gestão e estratégia de pagamentos";
export default function OGImage() {
  return new ImageResponse(<div style={{display:"flex",flexDirection:"column",justifyContent:"center",width:"100%",height:"100%",padding:"70px 85px",background:"#08152e",color:"#ffffff",fontFamily:"sans-serif"}}>
    <div style={{display:"flex",fontSize:30,fontWeight:800,marginBottom:45}}>payscale.</div>
    <div style={{display:"flex",fontSize:18,color:"#84b8ff",marginBottom:20}}>GESTÃO E ESTRATÉGIA DE PAGAMENTOS</div>
    <div style={{display:"flex",fontSize:70,fontWeight:700,lineHeight:1.1}}>Venda melhor. Receba com mais clareza.</div>
    <div style={{display:"flex",fontSize:25,color:"#c2cfe4",marginTop:30}}>Conciliação, taxas e apoio às decisões de pagamento.</div>
  </div>, size);
}
