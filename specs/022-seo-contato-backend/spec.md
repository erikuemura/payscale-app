# 022 — SEO, contato e backend comercial

## Escopo aprovado
Usuário solicitou SEO, contatos e backend; confirmou em 16/11/2026 que contato@payscale.com.br recebe mensagens. WhatsApp não informado. Esta entrega organiza SEO e canal confirmado e prepara API comercial; não declara todo o backend do SaaS concluído.

## Requisitos
R1: páginas indexáveis com conteúdo específico de conciliação, taxas/parcelamento e chargebacks; title, description, canonical, links internos e sitemap coerentes. Sem métricas, depoimentos ou garantias inventadas.
R2: /contato com e-mail confirmado, mensagem orientada e aviso que envio é feito pelo aplicativo de e-mail. Home e páginas de soluções apontam para contato. Não publicar número não informado.
R3: POST /api/contact aceita campos mínimos e limitados; origem autorizada, JSON até16KiB, validação no servidor, honeypot e token Turnstile validado pelo servidor, hostname/action conferidos. Destinatário fixo confirmado; remetente verificado configurado em ambiente; nunca aceitar destinatário do cliente.
R4: entrega Resend via texto puro, timeout, chave só no servidor, erro sem conteúdo sensível; só retornar202 após ID aceito pelo provedor, sem alegar entrega na caixa. Idempotência por hash do conteúdo e ID do pedido. Nenhum disparo real de teste sem autorização específica.
R5: desativado até configuração completa e flag explícita. Fallback de contato por e-mail permanece funcional. Não criar serviço pago ou gravar leads no banco nesta entrega.
R6: documento de prontidão identifica pendências concretas de autenticação, persistência, conectores e entrega; sem afirmar backend completo.

## Aceitação
Páginas canônicas e sitemap refletem URLs reais; link contato abre destinatário confirmado. Testes da API cobrem inválidos, origem, limite, desafio rejeitado, timeout/erro do provedor, aceitação e configuração ausente. SEO não garante indexação ou posição.

R7: desativar o endpoint legado de seed que poderia sobrescrever integrações. Retornar410 sem chamar o banco; preservar os dados demonstrativos já existentes.
