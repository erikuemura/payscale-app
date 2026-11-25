# 006 — Empresas e histórico

Status: implementação local preparada; validação integrada e ativação pendentes de Supabase de testes com duas contas.

## Resultado e divisão
A entrega 006a acrescenta empresas com proprietário único, contas identificadas por apelido e snapshots imutáveis de conciliação. 006b acrescentará convites/membros, revisão reversível, arquivos privados e política de retenção. Não apresentar 006a como conclusão de 006.

## Requisitos 006a
- REQ-01: somente sessão autenticada pode criar/listar empresas próprias e contas BRL. Não coletar senha bancária, agência, número real ou documento fiscal nesta etapa.
- REQ-02: salvar análise exige empresa/conta própria, os dois CSV e confirmação explícita. Servidor valida novamente e recalcula resultados; não confia em totais enviados pelo cliente.
- REQ-03: snapshot inclui entradas normalizadas, versão da regra, autor e data; resultados são recalculados na leitura. Original bruto não é armazenado. Mesmo conteúdo normalizado na mesma conta e mesma versão retorna o snapshot existente; ordem das linhas e formatação CSV não criam cópia.
- REQ-04: snapshots imutáveis via API e banco: SELECT/INSERT, sem UPDATE/DELETE para authenticated. Contas/empresas não mudam de proprietário. FK composta impede vincular conta de outra empresa.
- REQ-05: RLS protege todas as tabelas, sem service_role nem user_metadata. Erros não expõem SQL ou dados. Consultas paginadas limitadas; documento de análise limitado a 2.1 MB no endpoint.
- REQ-06: rota/API desativadas por padrão (RECONCILIATION_HISTORY_ENABLED=true após testes). /conciliar e ferramenta temporária continuam locais. Não ativar em produção antes dos testes integrados.

## Aceitação
- AC-01: usuário A não lista/insere/consulta registros de B; visitante não acessa endpoint; troca de empresa/conta falha, inclusive chamada REST direta.
- AC-02: mesmas entradas em ordem diferente geram mesmo hash; valores ou conta diferentes geram análise diferente; repetição concorrente não duplica.
- AC-03: inputs inválidos não persistem; resultados são recalculados; totais em centavos preservados.
- AC-04: criar empresa/conta, salvar e reabrir análise funciona com sessão real; integração desligada não oferece falsa confirmação de salvamento.

## Pendências
Projeto Supabase de desenvolvimento e duas contas de teste. 006b: membros, revisão e reversão, exclusão/retencão, armazenamento privado, webhooks de cobrança. Nenhuma decisão de retenção inventada e nenhum SQL em produção como preparação local.
