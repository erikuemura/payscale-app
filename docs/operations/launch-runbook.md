# Operação e liberação 024

## Estado
Piloto para demonstrações. Implementação não equivale a homologação. Flags novas desligadas por padrão. Somente Supabase de produção disponível em 19/11/2026; ambiente adicional não criado.

## Monitoramento
GET /api/health: liveness da aplicação, não verifica banco, Storage, e-mail ou adquirentes. Novas APIs registram event/area/reference sem corpo, documentos ou credenciais; referência é retornada ao cliente para suporte. instrumentation registra falhas inesperadas sanitizadas. Consultar logs do deployment correspondente e correlacionar a referência. Não há serviço externo de alertas configurado nem envio de incidentes automático.

## Liberação do armazenamento
1. Criar ambiente Supabase de desenvolvimento, sem copiar dados reais; custos exigem aprovação.
2. Aplicar baseline + 006 + 024 apenas nesse ambiente; gerar duas contas sintéticas A/B por Auth.
3. Testar via sessão/API e Data API: criação/listagem/reabertura; usuário B não lê/altera A; caso alheio rejeitado; revisão concorrente causa409; repetição não duplica; usuário anônimo401; corpo grande rejeitado.
4. Testar upload/download via Storage real: PDF/PNG/JPEG, >4MiB, MIME divergente, path de outra conta, URL pública negada, overwrite negado. Inspecionar policies/advisors.
5. Definir retenção de dados/documentos, responsáveis por suporte e alertas, plano de backup contratado e acesso operacional. Arquivos de Storage precisam de backup próprio: backup do banco não comprova recuperação dos binários.
6. Só então aplicar as migrações revisadas em produção e habilitar DISPUTE_WORKSPACE_ENABLED / COMMERCIAL_REQUESTS_ENABLED / RECONCILIATION_HISTORY_ENABLED individualmente, com smoke autenticado e reversão pela flag.

## Backup e ensaio de recuperação
O script npm run test:db cria Postgres efêmero, usa apenas identidades sintéticas e restaura um snapshot em outra instância. Isso valida o mecanismo local e preservação de políticas; não comprova o backup gerenciado Supabase.
Antes de dados reais: identificar backup e retenção reais do projeto, restaurar cópia em ambiente separado, comparar contagens e amostras sintéticas + políticas A/B; restaurar anexos de armazenamento separadamente e conferir hashes. Registrar duração, ponto recuperável e responsáveis. Nunca restaurar por cima da produção para ensaiar. Não prometer RPO/RTO sem medição.

## Incidente
Desabilitar a flag do recurso afetado, preservar dados e logs sem exportar PII ao chat, verificar alcance, corrigir em desenvolvimento e repetir testes. Se somente interface falhar, reverter deployment para último aprovado sem apagar tabelas. Chamadas interrompidas não confirmam salvamento. Não orientar repetição de criação com novo identificador até verificar idempotência.
