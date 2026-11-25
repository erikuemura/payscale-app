# 019 — Área logada: ferramentas e evolução por etapas

## Problema
Ferramentas de pagamentos já validadas ficam fora do painel. Navegação mostra contadores fixos e a visão geral apresenta variações sem comparação calculada. O pedido é evoluir todos os módulos; esta primeira entrega conecta os fluxos existentes sem declarar integrações ou persistência prontas.

## Requisitos e aceitação
- REQ01: central autenticada com acesso às rotinas de conciliação, taxas, parcelamento/antecipação, prevenção, casos, relatórios e configurações; limites operacionais explícitos.
- REQ02: simulador, auditoria e prevenção utilizáveis dentro do layout autenticado, mantendo páginas públicas e cálculos existentes.
- REQ03: sidebar e busca acessam novos fluxos; nenhum contador fixo ou indicador de integração ativa sem evidência; retirar +12% e −2% fixos da visão geral.
- REQ04: formulários rotulados, navegação móvel disponível e sem transbordamento horizontal; exemplos sempre identificados.
- REQ05: informar ausência de salvamento e de envio externo. Não modificar banco, contratos ou estados financeiros nesta entrega.

## Próximas entregas do pedido amplo
1. Persistência de preparações/documentos com testes de isolamento em duas contas de desenvolvimento.
2. Conciliação: histórico por empresa/conta, pendências persistentes e revisão auditável.
3. Tarifas: contratos versionados e conferência em lote; substituir a simulação antiga de envio de contestação.
4. Integrações: substituir fluxo legado de sincronização simulada por conector homologado e logs reais.
5. Recebíveis: calendário e cenários de antecipação sobre agenda confirmada, sem promessa de crédito.
6. Relatórios: períodos consistentes, exportação validada e agendamento com entrega verificável.
7. Configurações: empresas, equipe e permissões conforme modelo de isolamento validado.

Estas etapas não são implementadas implicitamente por esta entrega. Recursos legados não são revalidados pelo simples acesso na central.

## Extensão após inspeção
REQ06: substituir envio fictício de tarifas por download de rascunho, sem protocolo ou prazo inventado. Remover histórico e agendamento fictícios dos relatórios; declarar escopo completo dos registros consultados e separar mês/ano no agrupamento semanal. REQ07: integrações devem oferecer importação por arquivos e informar indisponibilidade dos conectores; não coletar credenciais nem atualizar last_sync sem importação. Registros existentes preservados no banco.
