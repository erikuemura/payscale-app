# 013 — Simulador de pagamentos (primeira fatia S03/S07)
REQ01: comparação hipotética de três cenários (Pix, cartão à vista, cartão parcelado) sobre mesmo preço e margem antes do pagamento, sem cotações de mercado ou recomendação de crédito.
REQ02: separar desconto ao comprador, MDR sobre preço com desconto, tarifa fixa e custo total de antecipação informado em reais. Antecipação opcional, sem converter taxas mensais ou inferir calendário.
REQ03: centavos inteiros; MDR com duas casas percentuais e arredondamento por venda. Líquido = cobrado - MDR - fixa - antecipação. Margem final = margem inicial - desconto - custos. Margem ausente permanece desconhecida.
REQ04: exibir total ao comprador e divisão de parcelas com ajuste de centavos na última. Juros ao comprador fora do escopo, custos assumidos pelo lojista. Nunca afirmar aumento de conversão.
REQ05: piso de margem e parcela mínima opcionais; violação é sinalizada sem aprovar política. Prazo de recebimento declarado por cenário; nenhuma simulação é saldo disponível ou contratação.
REQ06: dados somente em memória; limpar e exemplo fictício. Valores ausentes ou inválidos não viram zero silenciosamente; rejeitar desconto acima do preço e custos acima do cobrado.
AC01: preço1000, margem300, cartão4% =>260. Pix1% sem desconto=>290; desconto20=>270,20.
AC02: margem vazia não afirma lucro; piso violado sinaliza.
AC03: MDR menor com antecipação maior pode ter líquido menor; custo desativado não é aplicado.
AC04: 100/3 parcelas conserva100; entradas negativas, vazias obrigatórias e excesso de casas rejeitadas.
Fora: contratos versionados, auditoria de taxas reais, CET de crédito, agenda de parcelas, política aplicada, integrações e IA.
