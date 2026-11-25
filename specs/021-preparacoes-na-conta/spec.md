# 021 — Preparações de chargeback salvas na conta

Estado: especificado; ambiente de desenvolvimento pendente.

## Problema
A preparação hoje depende de arquivo local. O usuário precisa salvar, listar e retomar trabalhos autenticado, sem que outra conta acesse ou altere seus dados.

## Requisitos
- REQ01: salvamento explícito de preparação incompleta, nome obrigatório de 2–100 caracteres; formato de passaporte validado conforme 020. Sem upload de documentos ou respostas do diagnóstico nesta fatia.
- REQ02: listar somente preparações do usuário autenticado, com nome, referência, provedor e data de atualização; ordenação estável e paginação de 25 itens.
- REQ03: restaurar após confirmação, invalidando relatórios/plano anteriores. O estado salvo não é contestação enviada nem prova validada.
- REQ04: autenticação no servidor e RLS owner para leitura/escrita. owner_id vem da sessão, nunca do corpo do pedido. Nenhuma chave administrativa no fluxo.
- REQ05: revisão numérica para controle de concorrência. Atualização exige versão lida, incrementada atomicamente; divergência retorna conflito sem sobrescrever.
- REQ06: identificar caso opcional por UUID; associação deve pertencer ao mesmo usuário e ser validada na camada de banco. Arquivo importado não concede acesso a caso algum.
- REQ07: falha de rede/banco nunca mostra sucesso; preservar campos locais. Repetição de criação usa identificador idempotente gerado uma vez por preparação, para evitar duplicação após resposta perdida.
- REQ08: sem exclusão permanente nesta fatia. Não alterar status de chargeback nem registros financeiros.
- REQ09: recurso desligado por padrão até migração e testes de isolamento aprovados. Fluxo por arquivo permanece disponível.

## Critérios de aceitação
A salva, lista e reabre dados incompletos. B não lê nem altera registro de A por API ou Data API direta. B não associa preparação a caso de A. Ausência de sessão retorna401 quando recurso habilitado. Corpo inválido/maior que64KiB rejeitado. Duas edições na mesma revisão: apenas uma vence; outra recebe409 com trabalho local preservado. Repetição idempotente não cria duplicata. Atualização de owner por Data API rejeitada. Falha conserva preparação local.

## Pré-requisito de ativação
Banco de desenvolvimento separado, duas contas sintéticas e verificação de políticas antes de qualquer migração em produção. A criação de branch pode incorrer em custo; o conector solicita consentimento específico.
