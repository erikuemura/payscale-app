# 012 — Fila temporária de pendências (S02-R06)
REQ01: gerar uma tarefa para cada resultado não exato, vinculada aos IDs de origem e sem alterar a conciliação.
REQ02: permitir prioridade baixa/normal/alta, prazo opcional e estados novo/em análise/aguardando terceiro/resolvido/descartado.
REQ03: exigir justificativa de 3 a 500 caracteres em resolvido/descartado e registrar cada alteração com horário local, estado anterior e novo. Prazo deve ser uma data válida.
REQ04: tudo temporário no navegador. Nova análise/limpeza remove fila. Exportar acompanhamento como JSON com evidências e histórico; sem dados enviados ao servidor.
REQ05: encerramento operacional não significa recuperação financeira. Não somar divergências como benefício nem executar ações externas.
AC01: exemplo gera três tarefas; correspondência exata não gera tarefa.
AC02: encerramento sem justificativa falha; encerramento válido preserva valores e IDs originais.
AC03: data inválida falha; alterações não removem histórico anterior.
AC04: limpar e reimportar não reaproveita decisões; exportação identifica modo temporário.
