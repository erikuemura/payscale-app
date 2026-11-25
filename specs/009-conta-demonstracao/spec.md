# 009 — Conta de demonstração
Status: Supabase restaurado; configuração de autenticação e conta de demonstração pendentes.

Pedido: acesso admin com senha fornecida pelo usuário e dados fictícios para exploração.

- Conta separada, sem privilégios administrativos reais. Credenciais não versionadas.
- Alias admin deverá resolver para a conta de demonstração; autenticação permanece no Supabase.
- Confirmar schema existente antes de qualquer migração; não aplicar baseline cegamente.
- Popular exclusivamente UUID da nova conta sintética. Não executar endpoint seed genérico sobre contas existentes.
- Cenários: recebimento conciliado, diferença de taxa, repasse pendente e chargeback fictício. Valores e observações devem ser coerentes.
- Identificação visível de demonstração; não prometer conexão real com adquirentes.
- Verificar login correto/incorreto, isolamento e visualização antes de entregar credenciais como funcionais.

## Evidência inicial
2026-11-05: usuário confirmou projeto jmxubfyemgaajhuwgeev. restore_project retornou success=true; status COMING_UP. Leitura de tabelas indisponível durante restauração. Nenhuma conta criada nem dados inseridos ainda.

## Diagnóstico de retomada — 06/11/2026
Supabase ACTIVE_HEALTHY; URL e chave pública disponíveis. Auth contém quatro usuários existentes; não alterar suas credenciais nem usar seed nessas contas. Ferramenta de criação administrativa requer credencial exclusivamente de servidor. Conector Vercel retornou403 por falta de autorização da equipe; solicitado link de consentimento. Histórico continua desativado até testes de isolamento com duas contas de desenvolvimento. Nenhuma conta criada nesta retomada.

Conta criada: 5f53db15-c645-4896-99ec-a7f55987eb60, email sintético demo-admin@payscale.invalid. Alias admin autentica normalmente. Exibição do painel da conta demonstrativa independe de adquirente conectado; não cria integração fictícia como ativa.
