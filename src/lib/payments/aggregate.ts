import {decimalUnits} from './simulation.ts';
export type FeeRecord={provider:string;modality:string|null;amount:number|string;mdr_rate:number|string|null;mdr_charged:number|string|null};
function rate(v:unknown){if(v===null||v===undefined||v==='')throw new Error('Taxa ausente');const s=String(v);if(!/^\d{1,3}(\.\d{1,4})?$/.test(s))throw new Error('Taxa inválida');const [w,d='']=s.split('.');const n=Number(w)*10000+Number(d.padEnd(4,'0'));if(n>1000000)throw new Error('Taxa inválida');return n;}
const fee=(cents:number,units:number)=>Number((BigInt(cents)*BigInt(units)+BigInt(500000))/BigInt(1000000));
export function aggregateFees(rows:FeeRecord[]){
 const groups=new Map<string,{provider:string;modality:string;count:number;gross:number;expected:number;charged:number;over:number;under:number}>();let excluded=0;
 for(const row of rows){try{const gross=decimalUnits(String(row.amount),'Bruto');if(!gross)throw new Error('Bruto zero');const expected=fee(gross,rate(row.mdr_rate));const charged=fee(gross,rate(row.mdr_charged));const key=JSON.stringify([row.provider,row.modality]);const g=groups.get(key)??{provider:row.provider,modality:row.modality??'Não informada',count:0,gross:0,expected:0,charged:0,over:0,under:0};g.count++;g.gross+=gross;g.expected+=expected;g.charged+=charged;g.over+=Math.max(0,charged-expected);g.under+=Math.max(0,expected-charged);if(!Number.isSafeInteger(g.gross))throw new Error('Volume fora do limite');groups.set(key,g);}catch{excluded++;}}
 const items=[...groups.values()].sort((a,b)=>a.provider.localeCompare(b.provider)||a.modality.localeCompare(b.modality)).map(g=>({...g,expectedRate:g.expected/g.gross*100,chargedRate:g.charged/g.gross*100}));
 const totals=items.reduce((a,g)=>({gross:a.gross+g.gross,expected:a.expected+g.expected,charged:a.charged+g.charged,over:a.over+g.over,under:a.under+g.under,count:a.count+g.count}),{gross:0,expected:0,charged:0,over:0,under:0,count:0});return {items,totals,excluded};
}
