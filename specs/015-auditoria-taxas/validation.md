# Validação — 09/11/2026

33 testes Node passaram, incluindo cinco de auditoria cobrindo A01–A05. TypeScript e ESLint dos novos arquivos passaram. Revisão React: estado local, sem effects ou requisições, inputs com rótulos, tabela com cabeçalhos, resultado invalidado em qualquer edição.

Navegador local: exemplo 1000/3%/3,5% mostra custo 30/35, diferença 5 e líquidos 970/965; edição remove resultado; MDR vazia bloqueia; limpar remove resultado. Mobile 390x844: documento 385px, scrollWidth385, sem transbordamento da página; tabela tem rolagem própria.

Exportação: conteúdo TXT validado por teste e leitura de implementação. Clique de download executado, mas o evento de download não foi confirmado pelo navegador automatizado (timeout15s). A06 permanece parcialmente validado quanto ao download real.

Lint global permanece com problemas preexistentes; 15 erros e 7 avisos no lint global. Build Vercel aprovado (27 rotas).

Publicado em 09/11/2026: código 3bc5b22, deployment dpl_ExukekjDN5ufrwqGdo7tb5f7vjqW. HTTP 200 e conteúdo esperado antes da promoção. Após promoção, https://www.payscale.com.br/auditar-taxas confirmou exemplo com diferença R$ 5,00 no navegador. Captura no workspace pai: outputs/auditoria-taxas-producao.png.
