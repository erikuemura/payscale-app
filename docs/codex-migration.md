# Migração de Claude para Codex

## Entrega local

Cópia do repositório GitHub na branch `codex/sdd-migration`, com histórico preservado. As alterações são locais; nada foi publicado no GitHub ou implantado.

- AGENTS.md: instruções do projeto, workflow SDD, comandos e limites.
- specs/: baseline do código, backlog, templates e especificação desta migração.
- README.md e .env.example: preparação local sem valores secretos.
- CLAUDE.md continua apontando para AGENTS.md; .claude/launch.json registra apenas `npm run dev` na porta 3000. Não há regra de negócio exclusiva do Claude nesses arquivos.

## Como continuar

Abra a pasta desta cópia como projeto no Codex e envie: “Leia AGENTS.md e specs/README.md. Continue a partir de specs/backlog.md e prepare a especificação da próxima mudança solicitada.”

Para executar a aplicação, siga o README e configure um Supabase de desenvolvimento. Não reutilize automaticamente credenciais de produção. O app desktop e as credenciais do Supabase não são configurados por estes arquivos.

## O que não é transferido pelo Git

Conversas e memória privada do Claude, arquivos não versionados, conexões externas, segredos, dados do banco e configuração do serviço de deploy. Esta migração cobre o contexto versionado do projeto. Nenhuma dependência de SDK Anthropic foi encontrada no package.json; não foi necessária substituição de API de IA.

## Reversão

A branch de origem permanece intacta. As alterações desta migração são documentação e um modelo de ambiente; o código da aplicação e o schema não foram alterados.

## Referência

[Documentação oficial: workflows com Codex](https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex) descreve AGENTS.md como instrução reconhecida pelo Codex; os demais documentos são convenções do projeto.
