# Plano proposto

Status: planejamento, sem alterações na aplicação.

1. Validar oferta e capacidade de atendimento com o responsável do produto.
2. Corrigir alegações, identidade, links e consistência de conteúdo em SitePageClient.tsx e site/page.tsx.
3. Reorganizar home e demonstração em torno de e-commerce.
4. Implementar captura de interesse e atendimento com destino confirmado; não enviar dados ou mensagens nesta fase de análise.
5. Mover institucional para / e autenticação para /login, revisando middleware, callback, reset e navegação.
6. Corrigir canonical, sitemap, robots e imagens sociais reais; retirar páginas utilitárias do sitemap comercial e definir indexação apropriada.
7. Testar navegação, formulário, responsividade, acessibilidade e eventos; medir desempenho em build de produção, não usar latência de desenvolvimento como indicador.
8. Validar com potenciais clientes antes de ampliar aquisição.

Arquivos principais: src/app/site/SitePageClient.tsx, src/app/site/page.tsx, src/app/page.tsx, src/lib/supabase/middleware.ts, src/app/auth/callback/route.ts, src/app/auth/reset-password/page.tsx, src/app/sitemap.ts, src/app/robots.ts e componentes de navegação.

Backend de leads e eventual armazenamento são decisões pendentes de implementação; preservar isolamento e não registrar dados pessoais em analytics.
