# 016 — Serviços de prevenção e gestão de chargebacks

09/11/2026 · Pesquisa e proposta de escopo; NÃO implementado ou contratado.
Dependências: S01, S04, S05; armazenamento isolado e validado antes de documentos reais.

## Oferta proposta
1. Diagnóstico de prevenção: revisar identificação na fatura, atendimento, cancelamentos, entrega, configuração 3DS e antifraude. Entrega: plano de ação priorizado. Cobrança proposta: implantação/diagnóstico.
2. Operação assistida de disputas: fila, responsável, prazo da notificação, dossiê revisado e acompanhamento do crédito. Cobrança proposta: mensalidade por faixa de casos; sucesso, se adotado, somente sobre crédito efetivamente conciliado e conforme contrato comercial.
3. Comprovação de produtos e serviços: passaporte com originais, versões, marcos de execução e lacunas. Contratação não comprova execução. Cobrança proposta: módulo mensal, limites de armazenamento explícitos.
4. Alertas preventivos: integração contratada com Ethoca/Verifi ou parceiro habilitado. Taxas por alerta/resolução dependem de cotação; devolução pode evitar chargeback sem preservar a receita.
5. Antifraude e proteção contratual: implantação e acompanhamento de parceiro. Não oferecer garantia própria PayScale nem afirmar cobertura universal. Disponibilidade Brasil, serviços, digitais, POS, motivos e limites exigem confirmação contratual.

## Requisitos da próxima implementação
- R01: classificar causa informada: fraude/não reconhecimento, entrega/execução, cancelamento, duplicidade, outros/desconhecido. Nunca inferir fraude a partir de reclamação legítima.
- R02: diagnóstico por modalidade; evidências, fontes e ações por responsável, sem pontuação que alegue probabilidade de vitória.
- R03: cobertura em estados desconhecida/em avaliação/confirmada pelo parceiro/não coberta; confirmada exige fonte, data, parceiro, motivo e escopo contratual, sem inferência por logotipo ou checkbox 3DS.
- R04: 3DS autenticado não implica proteção contra serviço não prestado. Registrar resultado e elegibilidade fornecidos pelo processador, inclusive exceções.
- R05: notificações duplicadas não geram casos ou devoluções duplicadas; verificar estorno e disputa existentes antes de recomendar ação. Prazo ausente gera urgência para confirmação, não data inventada.
- R06: separar preparado, envio solicitado, enviado, recebido pelo provedor, decisão e crédito confirmado; timeout de envio exige reconciliação antes de nova tentativa.
- R07: credenciais somente no servidor, vínculo da conta autorizado e isolamento por empresa testado com duas contas. Originais privados, retenção e acesso definidos; não armazenar PAN/CVV.
- R08: IA poderá resumir e sugerir texto com referência às fontes; nunca fabricar comprovantes, modificar originais ou enviar sem revisão/autorização.
- R09: métricas separadas: alerta recebido, devolução executada, disputa evitada confirmada pelo parceiro, perda, custo operacional, crédito conciliado e conversão. Não contar reembolso como receita salva.

## Aceitação
- Serviço com contrato e sem prova de execução mostra lacuna.
- Serviço não prestado com 3DS não é rotulado como garantido.
- Política que exclui intangíveis não cobre curso por associação ao provedor.
- Reenvio de webhook não cria segunda devolução.
- Dossiê exportado não vira enviado; ganho sem crédito não vira recuperado.
- Usuário A não acessa dados/documentos de B.

## Sequência
A. Diagnóstico e plano preventivo sobre o passaporte existente.
B. Persistência e documentos privados após isolamento validado em ambiente de teste.
C. Piloto PagBank em sandbox, consulta/notificação primeiro; envio após homologação e revisão.
D. Avaliação comercial Ethoca/Verifi e antifraude com cobertura, sem anúncio de parceria antes de contratação.

Fora: seguro próprio, garantia de reversão, impedimento de contestação legítima, reembolso automático nesta fase. Nenhum contato comercial ou contratação realizado.
