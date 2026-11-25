# Prontidão do backend — 16/11/2026

Este documento diferencia implementação de ativação; não atesta backend completo.

| Área | Estado | O que falta |
| --- | --- | --- |
| Contato comercial | E-mail confirmado pelo usuário; página e links implementados | WhatsApp comercial não informado |
| API de contato | Implementada, desligada por padrão, testes com transportes simulados | Resend com remetente verificado; Turnstile; widget no formulário; teste real autorizado e observação de entrega |
| Login e sessão | Supabase existente utilizado em produção | Revisar cadastro administrativo que confirma e-mail sem validação e proteger contra abuso; não alterado nesta fatia |
| Preparações na conta | SDD021 especificado | Ambiente de desenvolvimento, migração, API, interface e testes com duas contas |
| Histórico de conciliação | Código006 preparado e desativado | Validar RLS com duas contas antes de ativar |
| Arquivos de documentos | Não implementado | Storage privado, limites, validação, políticas de acesso e retenção |
| Adquirentes | Importação por arquivos disponível | Conectores homologados, credenciais seguras, webhooks assinados e reconciliação idempotente |
| Relatórios agendados | Não implementado | Agendador, fila, retry e confirmação de entrega |
| Demonstração | Conta sintética existente | Endpoint seed desativado com410, sem escrita; provisionamento futuro deve ser isolado e idempotente |
| Observabilidade | Verificação manual de entregas | Alertas operacionais e rotina de monitoramento; não configurados nesta fatia |

## Ativação do contato web
Não colar segredos no chat. Configurar no ambiente do servidor RESEND_API_KEY, CONTACT_FROM e TURNSTILE_SECRET_KEY. Manter CONTACT_FORM_ENABLED desligado até: domínio/remetente verificados, widget cliente com action=contact e hostname autorizado, teste com token real e envio de teste expressamente autorizado. Destinatário fixo contato@payscale.com.br. A resposta202 indica aceitação pelo serviço, não entrega na caixa. Falhas/timeout exigem revisão, sem alegar recebimento.

## Referências técnicas
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/dashboard/emails/idempotency-keys

## SEO externo
Sitemap não comprova indexação. Configurar propriedade no Google Search Console com acesso do proprietário e acompanhar páginas indexadas. Nenhuma posição ou tráfego garantido. Não publicar depoimentos, números de clientes ou garantias sem comprovação.
