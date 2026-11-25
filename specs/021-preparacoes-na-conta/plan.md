# Plano técnico
1. Reutilizar readBackup para sanitizar o payload; não confiar em dados de registros anteriores sem revalidar.
2. Inspecionar schema do ambiente de desenvolvimento; gerar migração com CLI conforme skill Supabase. Tabela de preparações: id UUID, owner_id FK auth.users, case_id opcional, name, payload JSONB, revision, created_at/updated_at. Índices por owner/data/id. Restrições de formato/tamanho e associação de proprietário no banco.
3. DML via sessão normal do usuário, RLS com USING e WITH CHECK. Se necessário, função SECURITY INVOKER para atualização atômica e revisão; nenhum SECURITY DEFINER para contornar políticas.
4. GET/POST/PATCH autenticados, no-store, limite de corpo em streaming, validação de origem nas mutações. Atualização condicional por id/owner/revision; não confiar em timestamps do navegador.
5. Interface salva explicitamente, mantém id/revisão, carrega e confirma restauração. Sinalizar alterações posteriores ao salvamento. Falhas não limpam formulário.
6. Testes de contrato, concorrência e isolamento com A/B em desenvolvimento, incluindo Data API direta. Testar associação de caso alheio e mudança de owner.
7. Revisar advisors, implantar migração aprovada, habilitar flag e verificar em produção com dados sintéticos autorizados. Reversão pela flag, preservando dados.

Sem custo aprovado para ambiente adicional, manter esta entrega especificada e não ativar armazenamento no banco de produção.
