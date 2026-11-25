# 015 — Auditoria de taxas por venda

09/11/2026 · Fatia S03-R01/R02/R04/R05 e S03-A01/A03.

Problema: comparar MDR isoladamente oculta encargos e pode chamar diferença de recuperação.

## Requisitos
- R01: uma venda em BRL, com referência, data, provedor, canal, modalidade e parcelas; contrato identificado por versão, fonte e vigência inclusiva. Documento e valores são declarados.
- R02: MDR percentual sobre o bruto, arredondado a centavos; fixa, parcelamento, antecipação e outros em reais, com esperado e cobrado separados. Campos vazios são desconhecidos; zero exige preenchimento explícito. MDR admite 4 casas; dinheiro 2 casas.
- R03: antecipação incluída na MDR não é somada novamente; valores separados não zero bloqueiam cálculo nesse modo. Origem do extrato obrigatória.
- R04: venda fora da vigência, data inválida, custos superiores ao bruto ou dados ausentes impedem resultado. Nenhuma escolha automática de contrato ou confirmação jurídica.
- R05: diferenças por componente e total; diferença positiva é suspeita para revisão, negativa é cobrança menor para conferir, zero apenas coincide com informado. Compensações entre componentes permanecem visíveis.
- R06: exportar relatório TXT com entradas e resultados; qualquer edição invalida o resultado anterior. Nada enviado, salvo no servidor ou recuperado.

## Aceitação
- A01: 1000 com MDR 3% vs 3,5%, outros zero, mostra 30/35 e diferença 5 para revisão.
- A02: cobrança menor gera diferença negativa; diferenças compensadas no total continuam sinalizadas.
- A03: falta de vigência/fonte/taxa não inventa zero; contrato fora da data bloqueia.
- A04: antecipação embutida não duplica custo e rejeita valor adicional.
- A05: arredondamento centesimal determinístico; valores negativos, excesso de casas e custos maiores que venda bloqueiam.
- A06: exemplo, limpar, edição e exportação funcionam em mobile e desktop.

Fora: persistência, múltiplas versões armazenadas, seleção automática de contrato, taxas por parcela/prazo/volume, importação de PDF, IA, contestação e recuperação. Não satisfaz S03-A04 integralmente.
