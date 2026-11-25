# 003 — Refinar home e publicar no domínio existente

Status: layout publicado no endereço Vercel; domínio personalizado pendente. Pedido do usuário: melhorar o layout e publicar em www.payscale.com.br, já vinculado à conta Vercel.

## Escopo

Refinar hierarquia, espaçamento, prévia visual, chamadas de contato e apresentação da demonstração. Usar o projeto Vercel existente, preservar variáveis e banco existentes, atualizar metadados para o domínio confirmado. Nenhuma migração SQL ou criação de projeto é necessária por padrão.

## Aceitação

- AC-01: home responsiva em 390px e desktop; CTA de contato visível, exemplo claramente identificado e sem métricas inventadas.
- AC-02: simulador conserva comportamento e menu móvel funciona; build e tipagem passam.
- AC-03: projeto e domínio confirmados antes de publicar; variáveis existentes preservadas, sem exposição de segredos.
- AC-04: produção responde no domínio informado com nova home, SEO consistente e login separado; registrar URL e resultado real do deploy.

## Plano

Verificar Vercel → refinar layout → testar → gerar deploy de produção sem promover → verificar → promover no domínio existente. Publicação solicitada explicitamente pelo usuário. Se DNS ou autenticação externa impedir conclusão, registrar bloqueio concreto.

## Validação — 2026-11-03

- Código publicado: commit `2d0c174`.
- Projeto existente: `payscale-app`, equipe `erikuemura-s-projects`.
- Deployment `dpl_zBCA2b35CDpBjKSzr82gYWjTcngD`: READY, promovido com sucesso.
- URL pública: https://payscale-app.vercel.app/ — home verificada no navegador.
- Build Vercel e TypeScript passaram; lint direcionado à home passou. Lint global possui problemas preexistentes documentados anteriormente.
- Calculadora em produção: venda 1000, contratada 3%, cobrada 4% → líquido 960 e diferença 10; restaurada para exemplo inicial.
- Variáveis de produção Supabase preservadas. Nenhuma migração SQL executada; autenticação com usuário real não testada.
- Domínio personalizado: consultas de payscale.com.br e www.payscale.com.br não encontraram o domínio na equipe conectada. Usuário solicitado a identificar a conta/projeto onde está vinculado. AC-04 permanece pendente; metadados continuam no endereço Vercel verificado.
