# Validação da primeira entrega — 2026-11-03

- Build de produção e verificação TypeScript: passaram.
- ESLint dirigido à nova home, conteúdo, layout de login, imagem social, middleware e sitemap: passou.
- ESLint do repositório: 15 erros e 7 avisos em código legado. O login foi movido sem alteração de conteúdo (comparado com git show HEAD:src/app/page.tsx); seu erro de hooks é preexistente. Os demais erros estão em páginas do dashboard e componentes existentes. Não foi feito refactor fora do escopo para eliminá-los.
- Navegador: home renderizada, demonstração inicial R$ 970/R$ 965/diferença R$ 5; taxa cobrada de 4% resulta em líquido R$ 960 e diferença R$ 10; taxa zero resulta em R$ 1.000 e diferença favorável de R$ 30; taxa de 101% mostra erro sem resultado.
- Viewport 390px: inspeção visual, menu abre, link Demonstração navega e fecha menu. Não substitui auditoria completa de acessibilidade.
- HTTP: / e /login respondem 200; /site responde 308 para /; visitante em /dashboard chega a /login?redirect=%2Fdashboard; callback sem código retorna ao login com erro; sitemap e imagem social respondem 200.
- Home pública não depende do Supabase. Login autenticado, recuperação de senha e cadastro não foram validados com conta real porque não há ambiente Supabase configurado.
- Contato: link mailto com endereço já existente no projeto; nenhuma mensagem enviada, nem confirmação de entrega simulada. Titularidade e recebimento do endereço ainda dependem de confirmação.
- Foi observado aviso de hidratação causado pela classe de tema aplicada antes da hidratação. O html agora declara suppressHydrationWarning para essa alteração intencional; conteúdo da home não depende do tema salvo.

## Critérios

AC-01, AC-02, AC-04 e AC-05: atendidos no escopo da home. AC-06: rotas não autenticadas verificadas; fluxo com sessão real pendente. AC-07: inspeção móvel e controles básicos; auditoria completa pendente. AC-03 e AC-08: não implementados nesta primeira etapa (captação persistida e analytics).

## Execução e publicação

Prévia local de produção em http://127.0.0.1:3001. A porta 3000 está ocupada também por outro projeto e não foi reutilizada. Não houve push, deploy, migração SQL ou uso de dados reais.
