# Validação 006a — 2026-11-04

## Realizado
- Build de produção local passou (Next16.2.6).
- 11 testes node:test passaram: 8 do motor005 e 3 de canonicalização/hash, releitura de inputs, recálculo e validação de nomes/UUIDs.
- TypeScript e lint direcionado passaram após ajuste do carregamento assíncrono da interface.
- API desativada retornou HTTP503, Cache-Control:no-store e mensagem “Histórico ainda não ativado”.
- Migração aditiva criada pelo Supabase CLI3.0.0, sem aplicação. Sem mudança de schema/variáveis em produção.
- Revisão estática: RLS nas três tabelas, grants somente SELECT/INSERT a authenticated, predicates owner_id=auth.uid(), FKs compostas, nenhum service_role/security definer/user_metadata, sem UPDATE/DELETE, conferência do fingerprint na leitura.
- Teste SQL transacional preparado em supabase/tests/reconciliation_history.sql, para duas contas de Auth existentes; rollback ao final. Não executado.

## Pendente / critérios não aprovados
- AC-01: teste efetivo de RLS com duas contas (incluindo REST direto).
- AC-02: concorrência real na constraint única, além de testes unitários de idempotência.
- AC-03/04: criação de empresa/conta e gravação/reabertura reais via sessão Supabase; interface autenticada não verificada no navegador.
- Ambiente atualizado em 2026-11-04: MCP Supabase disponível. Único projeto acessível jmxubfyemgaajhuwgeev, nome “erikuemura's Project”, status INACTIVE, sem branches. Vínculo com PayScale não confirmado. As três variáveis Supabase na Vercel estão vazias; valores secretos não foram registrados. Identificação do banco solicitada ao usuário. Nenhuma restauração ou migração executada.
- Código publicado com flag não ativada; funcionalidade não liberada. Etapa006b permanece planejada.

## Procedimento de ativação
1. Identificar projeto de desenvolvimento e conectar acesso; confirmar que não é produção.
2. Aplicar baseline existente, se necessário, e a migração006a com ferramenta conectada ao projeto de testes.
3. Criar/usar duas contas sintéticas e executar teste SQL; testar GET/POST com sessões de ambas, IDs trocados, corpo inválido, corrida de duas gravações idênticas e integridade na leitura.
4. Habilitar RECONCILIATION_HISTORY_ENABLED apenas no ambiente de testes, testar interface e retorno para análise temporária.
5. Registrar evidências e só então planejar aplicação controlada da migração e ativação em produção. Não aplicar baseline destrutivamente sobre banco existente.

## Referências consultadas
https://supabase.com/changelog.md (CLI3 passou a priorizar ambiente local); https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/database/functions .

## Publicação controlada concluída
- 11 testes passaram novamente; TypeScript sem erros.
- Publicação solicitada pelo usuário; código006a enviado com flag desativada. A publicação do código não aprova os critérios integrados nem ativa persistência.

- Vercel READY, dpl_2Ch2uoNCEX4izyiwvUqzjiYHcsEz; código 9a75238, Next16.2.6, build remoto30s. Promovido aos domínios em 2026-11-04.
- Antes da promoção: /conciliar HTTP200; API de histórico HTTP503 com mensagem esperada de desativação.
- Persistência segue bloqueada pela identificação/configuração do banco e validação integrada. Não houve migração nem ativação de flag.
