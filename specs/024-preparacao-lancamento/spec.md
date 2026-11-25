# 024 — Preparação para lançamento
Solicitação: implementar as sete melhorias aprovadas, com autonomia. Não tratar implementação como validação de produção.

## Requisitos e aceitação
- R1 Persistência: implementar SDD021 (preparações autenticadas, 64KiB, revisão otimista, idempotência, associação de caso do mesmo proprietário), preservando arquivo local. Histórico006 permanece disponível atrás de flag.
- R2 Acesso: destinos de login limitados a rotas internas; APIs usam getUser, RLS e origem nas mutações. Sem chave administrativa. Testar proprietário A/B e acesso anônimo em banco separado antes de ativar.
- R3 Financeiro: MDR em centavos arredondado por venda; médias ponderadas pelo volume; taxa zero válida; ausência/valor inválido excluído com contagem. R$100 a 2% e R$900 a 4% = R$38 / 3,8%, não 3%. Diferenças positivas e negativas separadas. Consulta paginada não omite registros silenciosamente.
- R4 Operação: health endpoint mínimo sem segredos; registro de falhas sanitizado e identificador de referência; procedimento de backup/recuperação e teste restaurável em ambiente isolado. Não alegar monitoramento externo ou recuperação ensaiada sem execução.
- R5 Onboarding: guia de primeiro uso, perfil da empresa, CSV fictício, links à importação e ferramentas. Confirmação de salvamento apenas após banco responder. Sem marcar passos ficticiamente concluídos.
- R6 Chargebacks: responsável, prazo com horário/fuso e fonte confirmados, checklist e dossiê existente; anexos privados PDF/JPEG/PNG <=4MiB. A não acessa anexos de B. Sem exclusão, envio automático ou garantia de ganho. Novos dados protegidos por flags até validação integrada.
- R7 Comercial: modalidades de atendimento com escopo, preços sob proposta, solicitação e acompanhamento na conta; nada de cobrança ou assinatura fictícia. Solicitação não equivale a contrato nem mensagem enviada.

## Limites
Não conectar adquirentes, cobrar, enviar e-mails ou criar recursos pagos sem consentimento específico. Não modificar dados reais para testes. No ambiente atual existe apenas o Supabase de produção e não há Docker. Implementação dependente de banco fica desligada até testes integrados.
