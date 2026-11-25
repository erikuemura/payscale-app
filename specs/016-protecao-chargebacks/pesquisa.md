# Pesquisa de serviços — 09/11/2026

Fontes primárias consultadas; descrição pública não comprova acesso da PayScale, elegibilidade no Brasil, preço ou contrato de parceria.

| Serviço | Evidência pública | Papel possível da PayScale | Pendente |
|---|---|---|---|
| PagBank API Chargeback | Consulta, notificações e envio de disputa, incluindo online e presencial; sandbox documentado | Fila integrada e operação assistida | Credenciais autorizadas, escopo da conta, homologação e testes |
| Cielo 3DS/SoftDescriptor | Autenticação e identificação de cobrança; prevenção | Diagnóstico/configuração e monitoramento | Produto, versão, bandeira, resultado e exceções por transação |
| Getnet antifraude/gestão de disputa | Antifraude e procedimento de defesa com provas por motivo | Consultoria preventiva e organização de casos | Acesso técnico e modalidade contratada; não presumir API de disputa |
| Ethoca Alerts | Compartilhamento de dados de disputa entre emissores e lojistas, independente de bandeira | Central de alertas via parceiro habilitado | Cobertura por emissor/país, SLA, preço, deduplicação, elegibilidade |
| Verifi Order Insight, CDRN/RDR | Dados de compra e resolução antes de chargeback; CDRN/RDR utilizam crédito ao comprador | Reconhecimento de compra e resolução preventiva | Contratação/acesso, regras, países e custo total incluindo devoluções |
| ClearSale | Oferta pública de antifraude e garantia em pedidos aprovados | Seleção, implantação e acompanhamento de parceiro | Oferta brasileira específica, motivos, exclusões, serviços/digitais, limites, ressarcimento e revenda |
| Mercado Pago proteção ao vendedor | Descrição pública focada em produtos físicos nacionais elegíveis; intangíveis excluídos | Verificação documental e elegibilidade; defesa assistida distinta de cobertura | Termos aplicáveis ao lojista e transação, sem transportar promessa para serviços |

## Fontes
- [PagBank — Chargeback](https://developer.pagbank.com.br/docs/chargeback): consulta, notificação CHARGEBACK, disputa e sandbox. Não implementado na PayScale.
- [Cielo — Prevenção](https://docs.cielo.com.br/ecommerce-cielo/docs/prevencao): SoftDescriptor, autenticação e operação preventiva.
- [Cielo — Autenticação 3DS](https://docs.cielo.com.br/atendimento/docs/autenticacao-3ds): limitações de versões por bandeira; não adotar manual antigo como garantia vigente.
- [Stripe — limites do liability shift](https://support.stripe.com/questions/liability-shift-with-frictionless-flow-for-3d-secure-v2-%283ds2%29?locale=en-GB): autenticação não cobre motivos não fraudulentos; existem exceções.
- [Getnet — Antifraude](https://site.getnet.com.br/antifraude/): análise preventiva de vendas digitais.
- [Getnet — Chargeback](https://site.getnet.com.br/get-ajuda-chargeback/sobre-o-chargeback/): defesa baseada em motivo e evidências, sem garantia de vitória. Prazo do caso deve vir da notificação.
- [Mastercard — Dispute Management](https://www.mastercard.com/us/en/business/cybersecurity-fraud-prevention/dispute-management.html): Ethoca Alerts e dados de compra. Não extrapolar disponibilidade de programas lançados nos EUA para o Brasil.
- [Ethoca — Consumer Clarity](https://www.ethoca.com/ethoca-consumer-clarity): informações da compra no aplicativo bancário.
- [Verifi — soluções para vendedores](https://www.verifi.com/solutions-sellers.html): Order Insight, CDRN/RDR e recuperação. Resolução por crédito implica custo de devolução.
- [ClearSale — oferta pública](https://www.clear.sale/): antifraude e garantia contratual; página global não é cotação brasileira.
- [Mercado Pago — Proteção ao vendedor](https://www.mercadopago.com.br/blog/como-funciona-protecao-vendedor-contestacao): requisitos de produtos físicos e exclusão de intangíveis. Confirmar regulamento aplicável antes de afirmar cobertura.

## Diferencial proposto (inferência de produto)
Unir prevenção, contratação, entrega/execução, disputa e conciliação do efeito financeiro, através de provedores distintos. Para serviços: escopo e marcos efetivamente realizados separados, cancelamento e comunicações pertinentes; para produtos: promessa, itens, rastreio e entrega; para POS: captura e autenticação declaradas pelo adquirente, sem imunidade presumida. Coletar apenas evidência necessária, sem documentos sensíveis desnecessários.

## Qualificação de parceiros
Solicitar proposta com disponibilidade Brasil/CNPJ, canais e segmentos elegíveis, adquirentes/emissores abrangidos, motivos cobertos e excluídos, limites e custos, obrigações documentais, prazos, API/sandbox/webhooks/idempotência, tratamento de devolução duplicada, acesso/retencão de dados e permissão de revenda/uso da marca. Não há parceiros contratados ou cotações verificadas nesta pesquisa.
