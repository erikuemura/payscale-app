# Baseline observado — PayScale

Origem: `abd96e161e2ccd6f42cfd2b8af3fca1b2778e6f5`, inspecionado em 2026-11-03.
Status: leitura estática do código; comportamento em ambiente integrado não validado.

## Produto e arquitetura

O produto reúne login, cadastro, página institucional e área financeira autenticada.
`src/app` contém páginas e rotas HTTP; `src/components` contém navegação e componentes compartilhados; `src/context` contém tema, sidebar e notificações. Clientes Supabase ficam em `src/lib/supabase`. Não há backend de adquirentes separado neste repositório.

## Funcionalidades observadas e pontos de entrada

- AUTH: `/`, `/signup`, `/auth/callback`, `/auth/reset-password`. Login por senha e Google, cadastro e recuperação de senha. `src/lib/supabase/middleware.ts` redireciona visitantes de `/dashboard` ao login. `src/app/api/auth/signup/route.ts` usa chave administrativa e cria usuário com email já confirmado. Isso é comportamento atual, não decisão de segurança validada.
- DASH: `src/app/dashboard/page.tsx` consulta perfil, integrações, transações, chargebacks e alertas do usuário.
- REC: `src/app/dashboard/conciliacao/page.tsx` consulta transações, exibe estados e oferece carga de demonstração.
- MDR: `src/app/dashboard/tarifas/page.tsx` agrega taxas por modalidade e gera alertas. Há médias simples e estimativas por volume; a fórmula de negócio precisa de especificação antes de mudanças. O envio de contestação de tarifa contém temporização de interface.
- CB: `src/app/dashboard/chargebacks/page.tsx` consulta chargebacks; `handleContest` grava status `contestado` e metadados no Supabase. Não envia contestação ao adquirente.
- INT: `src/app/dashboard/integracoes/page.tsx` grava credenciais e status via cliente de navegador. `handleSync` apenas atualiza `last_sync` e espera dois segundos; não importa transações de uma API externa.
- REPORT: `src/app/dashboard/relatorios/page.tsx` consulta transações e chargebacks e gera CSV no navegador. A agregação semanal de saúde financeira usa o dia do mês; revisar limites de período antes de tratar como relatório financeiro validado.
- PROFILE: `src/app/dashboard/configuracoes/page.tsx` lê/atualiza perfil e permite mudar senha.
- DEMO: `src/app/api/seed/route.ts` exige usuário e insere integrações, 20 transações, cinco chargebacks e alertas demonstrativos. Upserts de integrações podem substituir credenciais existentes do mesmo provedor. Não executar em conta real.

## Dados e contratos existentes

Fonte: `supabase/schema.sql`; tipos manuais: `src/lib/supabase/types.ts`.
- `profiles`: chave igual ao usuário autenticado; plano inicial `trial` e prazo inicial de 14 dias via SQL.
- `integrations`: único por `(user_id, provider)`; tokens em colunas text. O comentário sobre criptografia não comprova implementação de criptografia.
- `transactions`: único por `(user_id, provider, external_id)`; valores monetários `numeric(12,2)` e taxas percentuais `numeric(6,4)`.
- `chargebacks`: não tem unicidade por identificador externo; estados descritos nos comentários não são enums SQL.
- `alerts`: alertas por usuário, com resolução e metadados.
- As cinco tabelas habilitam RLS e têm políticas por usuário. Isolamento real depende da implantação e requer teste com duas contas.
- `POST /api/auth/signup`: campos obrigatórios email, password, full_name e segment; senha mínima de oito caracteres. Pode retornar tokens de sessão ou redirecionamento ao login; erros 400 e ausência de chave 500.
- `POST /api/seed`: 401 sem usuário; 500 em alguns erros de escrita; sucesso retorna contagens. A alegação de idempotência no comentário não cobre concorrência nem recuperação parcial de chargebacks/alertas.

## Validação e ambiente

Scripts existentes: dev, build, start e lint. Não foram encontrados testes automatizados nem configuração de CI no commit de origem. São necessárias três variáveis, listadas em `.env.example`. O layout usa fontes Google por `next/font`, portanto build pode depender de acesso externo.

Não foram importados histórico privado do Claude, configurações globais, segredos ou dados do Supabase. Os materiais comerciais da pasta local “PayScale” não integram este repositório.
