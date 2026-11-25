# 018 — Central de preparação na área logada
09/11/2026. Fatia S04/S05, sem nova persistência ou integração externa.

R01: selecionar caso da listagem autenticada e preparar evidências e diagnóstico no próprio painel. Prefill de referência, provedor, motivo e valor contestado; total da venda, modalidade e responsável exigem conferência. Total nunca inferido do valor parcial.
R02: substituir o falso envio de contestação por preparação temporária; nenhuma atualização de status ou metadados. Dados legados 'contestado' serão rotulados como registro interno com envio não verificado, sem reescrever histórico.
R03: deadline_days legado não é contador confiável: mostrar como dias registrados a confirmar, nunca como prazo restante/expirado. Não estimar data externa.
R04: ordenar pendências abertas primeiro (depois registros internos, desconhecidos e encerrados), mostrar necessidade de confirmar prazo e distinguir ganho de crédito conciliado.
R05: falha de consulta não é lista vazia. Consulta conserva filtro user_id e RLS existente. Remover entrada do seed genérico nesta tela para não sobrescrever integrações.
R06: abrir preparação com botão acessível; troca/fechamento do caso avisa perda de rascunho e exige ação explícita. Dados não trafegam em URL nem armazenamento local. Casos desconhecidos não quebram badges.

Aceite: caso parcial200 mantém total vazio; nenhum botão atualiza status; prazo null/zero/positivo não vira data inventada; consulta com erro mostra retry; selecionar caso abre formulário/diagnóstico autenticado; sair da preparação exige confirmação; comportamento público do passaporte preservado.
