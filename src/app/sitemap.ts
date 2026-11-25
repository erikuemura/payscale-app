import type { MetadataRoute } from "next";
import { solutions } from './solucoes/content';
export default function sitemap(): MetadataRoute.Sitemap {
 return [{url:'https://www.payscale.com.br/planos',changeFrequency:'monthly',priority:0.8},{url:'https://www.payscale.com.br/piloto',changeFrequency:'monthly',priority:0.8},{url:'https://www.payscale.com.br',changeFrequency:'monthly',priority:1},{url:'https://www.payscale.com.br/contato',changeFrequency:'monthly',priority:0.8},...Object.keys(solutions).map(slug=>({url:`https://www.payscale.com.br/solucoes/${slug}`,changeFrequency:'monthly' as const,priority:0.8}))];
}
