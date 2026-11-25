# Validação e sincronização — 25/11/2026

## Implementado localmente
- Preparações 021: contratos, API com sessão, idempotência e revisão; interface de salvar/reabrir; migração aditiva.
- Prazo/responsável e anexos privados por caso, com controles de proprietário e limite de 4 MiB.
- Perfil e guia de primeiros passos com dois CSV fictícios.
- Modalidades de atendimento, solicitação comercial autenticada e acompanhamento básico.
- Tarifas: cálculo em centavos por venda e taxas ponderadas, taxa zero válida, dados ausentes excluídos e contados.
- Destinos de login validados; saúde mínima da aplicação; logs sanitizados e runbook operacional.

## Evidências
- 60 testes unitários aprovados.
- 24 verificações PostgreSQL isoladas aprovadas: visibilidade A/B, proprietário forjado, caso alheio, revisão, idempotência/uniqueness, permissões de Storage modeladas e restauração de snapshot.
- TypeScript aprovado. Lint direcionado aprovado após corrigir efeito preexistente do login.
- As identidades e schemas Auth/Storage do teste PGlite são sintéticos. Não substituem testes HTTP/Data API/Storage no Supabase real.

## Não concluído / não ativado
- Sem ambiente Supabase separado, migração024 não aplicada em produção; flags DISPUTE_WORKSPACE_ENABLED e COMMERCIAL_REQUESTS_ENABLED continuam desligadas. Histórico006 também aguarda validação integrada.
- Upload/download real, login A/B e navegador dos novos fluxos não homologados.
- Backup gerenciado e arquivos reais não restaurados; monitoramento externo não contratado/configurado.
- A revisão financeira desta entrega cobre a tela Tarifas. Agregações legadas da visão geral e relatórios ainda exigem alinhamento.
- Não houve publicação024 na Vercel. Produção permanece no piloto023.

## GitHub
Publicação de código em branch de desenvolvimento; não confundir com merge em main ou ativação de banco/produção. Nenhum arquivo de ambiente com credenciais ou cache Vercel deve ser versionado.

## Build para sincronização
`npm run build -- --webpack` aprovado em 25/11/2026. A tentativa padrão com Turbopack ficou sem progresso no ambiente local e foi interrompida; não foi marcada como aprovada. Aviso existente sobre migração futura de middleware para proxy permanece.
Revisão React: efeitos de consulta com descarte de respostas após desmontagem, destinos de login derivados sem setState em efeito, campos rotulados, dependências de banco protegidas por flags. Homologação visual permanece pendente.
Verificação de padrões de chaves privadas nos arquivos candidatos não encontrou ocorrências; somente modelos de ambiente estão versionados.
