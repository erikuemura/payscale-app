# Plano 006a
- Migração aditiva: reconciliation_companies, reconciliation_accounts, reconciliation_runs; RLS owner + FKs compostas, restrição de escrita, índices.
- Validador puro e hash SHA-256 de payload canônico. Reusar parser e motor005 no servidor.
- Endpoint GET/POST /api/reconciliation/history com sessão SSR; feature flag fechada por padrão; nunca usar chave administrativa.
- Interface /dashboard/historico para empresa/conta, CSV, salvamento e visualização.
- node:test para invariantes. Teste SQL transacional com dois usuários em banco de desenvolvimento, rollback no final. Não executar na produção.
- Testes browser autenticados/REST direto, build, tipagem e lint antes de habilitar flag. Reversão pela flag; não apagar tabelas ou dados.
