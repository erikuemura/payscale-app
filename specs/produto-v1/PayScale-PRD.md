# PayScale — PRD de evolução do produto

**Versão 1.0 · 6 de novembro de 2026 · Proposta para validação de produto**

**Objetivo:** transformar a PayScale em uma plataforma de inteligência de pagamentos que ajude empresas a receber corretamente, vender com margem e reduzir perdas, com proteção tanto para lojistas quanto para compradores.

**Formato:** Spec-Driven Development orientado a negócio. Este documento define contexto, decisões propostas, jornadas, regras e critérios de aceite. Não prescreve arquitetura, linguagem de programação ou infraestrutura. As especificações também estão separadas no pacote SDD para que cada tarefa use apenas o contexto necessário.

## 1. Recomendação executiva

A melhor oportunidade da PayScale é ser uma **camada independente de gestão sobre os provedores de pagamento**. A empresa pode conectar venda, custo, entrega, disputa e recebimento numa visão única. Começar por problemas verificáveis — conciliação, divergências contratuais e evidências — permite demonstrar valor sem exigir que o lojista troque de adquirente.

A proposta central é: **“Venda com margem. Comprove a entrega. Receba o que foi combinado.”**

Cinco diferenciais propostos:

1. **Extrato explicado:** cada recebimento mostra de qual venda veio, quais descontos sofreu e qual documento sustenta a conclusão.
2. **Passaporte da venda:** reúne contratação, condições, entrega ou execução, atendimento, cancelamentos e recebimento. Tem modelos diferentes para produtos físicos, serviços e produtos digitais.
3. **Conversão com margem:** recomenda métodos, parcelas e recuperação de pagamentos considerando custo, risco e caixa, além da aprovação.
4. **Caixa com alternativas:** compara esperar, antecipar parcialmente, renegociar saídas ou contratar crédito, em condições equivalentes.
5. **IA com evidências:** explica, organiza e recomenda; cálculos financeiros e confirmação de fatos permanecem verificáveis. Toda recomendação apresenta origem, data, limitações e ação sugerida.

Esses diferenciais são hipóteses de posicionamento, não alegações de exclusividade. Os concorrentes já oferecem partes dessa experiência; a oportunidade está na combinação independente e na execução adequada para pequenas e médias operações.

## 2. Ponto de partida verificado

A inspeção pública da [página inicial](https://www.payscale.com.br/) e do [conciliador](https://www.payscale.com.br/conciliar), em 06/11/2026, mostrou:

- Conciliação de recebíveis por dois arquivos CSV: recebíveis previstos e créditos bancários.
- Processamento temporário no navegador; o site declara não enviar nem salvar o conteúdo dos arquivos.
- Regras verificáveis; a página informa que essa etapa ainda não utiliza IA.
- Demonstração de diferença entre taxa contratada e taxa cobrada.
- Parcelamento, taxas, antecipação, riscos e chargebacks apresentados como frentes consultivas.
- Histórico e conexões automáticas declarados como ainda não habilitados.
- A FAQ informa que a PayScale não oferece crédito nem executa antecipações nesta etapa.
- Públicos anunciados: e-commerce, lojas físicas/POS, empresas e serviços.

**Limite da verificação:** observação das páginas públicas, sem acesso ao painel autenticado, contratos, base de clientes, código ou dados reais. Não foi feita auditoria do processamento dos arquivos. Não há evidência para afirmar volume transacionado, acurácia, receita, integrações privadas ou maturidade operacional.

**Consequência:** o roadmap começa pela evolução do conciliador e pela transformação do apoio consultivo em fluxos de produto. Automação de pagamentos e oferta integrada de financiamento são expansões condicionais.

## 3. Leitura do mercado

Pesquisa qualitativa em documentação, páginas oficiais e termos públicos. Capacidade anunciada não equivale a resultado auditado. Não foi feito teste transacional nem cotação comercial individual. A ausência de uma função na pesquisa não prova que o concorrente não a ofereça. Fontes e limitações estão no final.

### PagSeguro / PagBank

**Observado:** checkout e links permitem configurar meios de pagamento, limite de parcelas e quantidade de parcelas com juros assumidos pelo vendedor; há integração de autenticação 3DS [F01–F02].

**Aprendizado:** dar ao lojista controle claro sobre condições de venda é requisito básico. A PayScale deve calcular o efeito dessas escolhas na margem e conferir posteriormente se o custo realizado correspondeu ao previsto.

**Diferencial proposto:** recomendação de política de parcelamento por faixa de ticket e margem, considerando contratos de diferentes provedores. Compatibilidade e condições precisam ser verificadas por integração.

### Getnet

**Observado:** há fluxo de antecipação com simulação de valores, bandeiras e taxas. O contrato descreve antifraude com IA/estatística e explicita que ele não elimina a responsabilidade por fraudes e chargebacks [F03–F04].

**Aprendizado:** proteção deve ser descrita com limites claros; simular antes de contratar é parte essencial da experiência.

**Diferencial proposto:** consolidar a agenda de diferentes provedores e recomendar apenas o montante necessário para cobrir uma necessidade de caixa. Mostrar custo, recebíveis comprometidos e alternativa de não antecipar.

### Cielo

**Observado:** oferece alternativas de recebimento/antecipação e autenticação 3DS. A documentação distingue versões e condições de responsabilidade; o contrato também trata de custos de retentativa [F05–F07].

**Aprendizado:** versão, bandeira, contrato e resultado da autenticação importam. “Usa 3DS” não significa cobertura universal.

**Diferencial proposto:** painel de custo total, calendário de recebimento e alertas de condições contratuais; recomendações de retentativa só quando permitidas, sem multiplicar custos ou cobranças.

### Mercado Pago

**Observado:** as páginas oficiais consultadas descrevem proteção ao vendedor para produtos físicos elegíveis, com documentação e comprovação de entrega. Intangíveis não recebem a mesma cobertura; há também documentação de 3DS [F08–F09]. O regulamento completo de proteção retornou bloqueio de acesso na pesquisa; a análise usa as explicações oficiais, sem presumir cobertura contratual de uma venda específica.

**Aprendizado:** organizar evidências e explicar elegibilidade tem valor próprio. Serviços precisam de comprovação adequada à sua natureza.

**Diferencial proposto:** passaporte da venda para serviços e digitais, com escopo, marcos de execução, registros de acesso pertinentes e histórico de resolução. Isso apoia a defesa, mas não cria seguro nem garante reversão.

### Appmax

**Observado:** oferece checkout, antifraude, recorrência, recuperação de vendas e outras soluções. Sua documentação de recuperação com IA está sinalizada como beta. A documentação de pedidos distingue autorização, análise de risco, aprovação e desfechos de chargeback [F10–F12]. Os percentuais de aprovação e volumes recuperados divulgados no site são alegações comerciais, sem base comparável disponível nesta análise.

**Aprendizado:** recuperação ativa e integração do funil merecem atenção. Confundir autorização com aprovação final ou venda recuperada com ganho incremental produz métricas enganosas.

**Diferencial proposto:** recuperação orientada por causa, com grupo de controle, limite de contatos e medição da margem incremental. Separar recuperação de carrinho, pagamento negado e disputa.

### Asaas

**Observado:** documentação de assinaturas, Pix Automático, antecipação e tratamento de chargeback. A política de chargeback atribui ao cliente responsabilidades pelo valor estornado [F13–F16].

**Aprendizado:** cobrança e previsibilidade de caixa são especialmente importantes para prestadores de serviços. Assinatura, parcelamento e Pix Automático são jornadas diferentes.

**Diferencial proposto:** associar cada cobrança ao contrato, período de serviço e comprovação de execução; conciliar a cobrança com o caixa e recomendar ação adequada a atraso, cancelamento ou falha de pagamento.

### Outros casos relevantes

**Stripe:** Smart Disputes organiza e submete evidências de disputas elegíveis com apoio de IA; a decisão final não é garantida [F17]. Inspira triagem, seleção de provas por motivo e controle de prazo. Na primeira versão PayScale, o envio exige revisão do responsável.

**Adyen:** Uplift combina risco, autenticação, tokenização, roteamento e experiência. A documentação descreve otimização de rota e recuperação de recorrência, com requisitos de disponibilidade [F18]. Inspira otimizar o resultado conjunto. Não se presume que todos os recursos internacionais estejam disponíveis no Brasil ou nos parceiros da PayScale.

**Pagar.me:** a entidade de recebíveis separa créditos, estornos, chargebacks e reversões, com efeitos sobre o saldo [F19]. Inspira uma agenda que preserve os ajustes e explique por que o caixa mudou.

### Síntese competitiva

**Básico esperado:** conciliação explicável, taxas claras, alertas, exportação e organização de disputas.

**Oportunidade de diferenciação:** visão independente entre provedores, comprovação específica para serviços, margem por condição de pagamento e antecipação orientada à necessidade.

**Vantagem a construir:** qualidade dos vínculos entre venda, contrato, entrega e caixa; histórico de recomendações e resultados; modelos de trabalho por segmento. Um chat genérico, isolado desses dados, não constitui vantagem sustentável.

## 4. Público e problemas prioritários

### Perfil inicial proposto

PMEs com vendas em mais de um meio/provedor e operação financeira ainda dependente de arquivos, planilhas e conferências manuais. Priorizar duas trilhas de descoberta: e-commerce com entrega física e empresas de serviços com cobrança parcelada ou recorrente. Lojas físicas compartilham a conciliação, mas exigem evidências próprias de POS; não copiar automaticamente regras de cartão não presente.

Esse recorte precisa ser confirmado com clientes; não representa uma descrição da base atual.

### Usuários

- **Dono/gestor:** quer saber quanto realmente ganhou e quando poderá usar o dinheiro.
- **Financeiro:** precisa conferir repasses, corrigir diferenças e planejar obrigações.
- **Operação/pós-venda:** precisa comprovar entrega, resolver reclamações e cumprir prazos.
- **Gestor de crescimento:** quer melhorar conversão sem destruir margem.
- **Comprador:** quer reconhecer a cobrança, entender condições, receber o contratado e resolver problemas com facilidade.
- **Consultor/contador autorizado:** quer visão por empresa, com acesso delimitado e exportação.

### Perguntas que o produto deve responder

“Recebi tudo?”, “Esta taxa está correta?”, “Vale parcelar mais?”, “Por que perdi essa venda?”, “Qual prova falta?”, “Devo reembolsar ou contestar?”, “Preciso antecipar quanto?”, “Qual opção preserva melhor meu caixa?”.

## 5. Escopo, prioridades e estratégia

### P0 — Confiança e valor comprovável

- S01: contexto da empresa, qualidade dos dados e histórico opcional.
- S02: conciliação operacional, agenda básica e fila de diferenças.
- S03: auditoria de taxas e condições contratuais.
- S04: evidências e gestão de chargebacks para produtos e serviços.
- S10: IA explicável e medição, aplicada inicialmente aos módulos anteriores.

O primeiro lançamento pode manter entrada por arquivos. Conexões automáticas são selecionadas conforme os provedores dos pilotos, sem prometer cobertura de todos os concorrentes pesquisados.

### P1 — Margem e previsibilidade

- S05: prevenção de perdas e resolução para o comprador.
- S06: diagnóstico de conversão e recuperação de vendas.
- S07: política de parcelamento e incentivo por método.
- S08: previsão de caixa e comparação de antecipação.

### P2 — Execução integrada e financiamento

- S09: comparação e encaminhamento de crédito para parceiros.
- Evoluções dos módulos anteriores: conexão de dados, envio de disputas, aplicação de políticas e contratação de antecipação, somente com parceiros, permissões e controles definidos.

### Fora do primeiro ciclo

Adquirência própria, conta de pagamento própria, custódia/escrow, concessão de crédito com balanço próprio, promessa de chargeback zero, aprovação de crédito por IA generativa, bloqueio automático de compradores por histórico de reclamações e roteamento em tempo real construído antes de validar a camada de gestão.

## 6. Jornadas integradas

### A. Do recebível à divergência resolvida

O financeiro importa arquivos, confirma empresa e período, revisa alertas de qualidade e vê valores conciliados, pendentes e divergentes. Abre uma diferença, confere documento e regra, atribui responsável e registra a resposta do provedor. O valor só entra como recuperado após confirmação financeira. Uma diferença pode ser taxa correta, data deslocada ou dado incompleto; nem toda divergência é prejuízo.

### B. Produto físico com contestação de não entrega

A venda recebe um passaporte com descrição, prazo, nota fiscal e rastreamento. Um atraso dispara uma tarefa de atendimento. Se houver disputa, o sistema pede as provas pertinentes ao motivo, organiza a cronologia e destaca contradições. O responsável decide entre aceitar a contestação, resolver com o comprador ou enviar defesa. O resultado e eventual crédito são acompanhados separadamente.

### C. Serviço parcelado com entrega em etapas

O contrato registra escopo, cronograma, valor e política aplicável. Cada etapa recebe registro de execução e aceite quando cabível. Se o cliente contesta uma etapa não prestada, a solução não tenta transformar uma assinatura genérica em prova de entrega integral: apresenta o que ocorreu e permite propor ajuste ou reembolso proporcional, conforme contrato e direitos aplicáveis.

### D. Venda negada ou abandonada

O sistema identifica o ponto de abandono ou motivo conhecido de recusa. Recomenda correção, autenticação ou método alternativo suportado. A recuperação só contata quem pode ser contatado e cessa ao receber pagamento, recusa de contato ou abertura de reclamação. A melhoria é medida contra controle, descontando custo de incentivo, comunicação e perdas posteriores.

### E. Necessidade de caixa

O gestor informa a obrigação, data e reserva mínima. O sistema mostra recebimentos confiáveis, entradas previstas, compromissos e possíveis faltas. Compara não antecipar, antecipar parte e propostas de crédito equivalentes. A opção selecionada passa por confirmação; uma simulação nunca é exibida como dinheiro disponível.

## 7. Métricas e metas de validação

**Métrica principal proposta:** benefício financeiro líquido verificado por empresa ativa, acompanhado da margem incremental estimada em experimentos. Mostrar realizado e estimado separadamente.

Benefício verificado = valores efetivamente recuperados + economias realizadas em condições comparáveis − custos adicionais do serviço e da ação. A mesma recuperação não pode entrar em dois módulos. O tempo economizado é apresentado em horas; sua conversão em reais exige premissa explícita.

### Painel mínimo

- **Conciliação:** valor conciliado / valor elegível importado; registros conciliados / registros elegíveis; pendências por idade; falsos vínculos confirmados em auditoria.
- **Taxas:** divergência identificada, validada e recuperada; custo efetivo realizado / volume bruto capturado, com componentes e modalidade.
- **Conversão:** pedidos pagos únicos / sessões elegíveis de checkout; aprovação por tentativa separada de aprovação por pedido; recortes por provedor, canal, método e parcelas.
- **Chargebacks:** quantidade e valor por coorte de vendas; perdas líquidas de recuperações; motivo; prazo cumprido; casos ganhos / casos encerrados contestados. Exibir também proporção dos casos que foram contestados, evitando seleção oportunista.
- **Comprador:** tempo até primeira resposta, tempo de reembolso confirmado, reclamações repetidas, contatos indevidos e falsos bloqueios.
- **Caixa:** erro absoluto em reais das previsões por horizonte; saldo mínimo projetado; custo total de antecipação; diferença entre simulado e contratado.
- **IA:** afirmações sem suporte, extrações corrigidas, tempo de revisão, custo por tarefa e incidentes de exposição de dados.

**Chargeback tem atraso:** não comparar uma coorte recente com outra completamente maturada. Exibir maturidade, janela e revisões. Índices exigidos por bandeiras/provedores são indicadores separados, calculados segundo a definição aplicável; a métrica interna não os substitui.

### Metas iniciais propostas, não resultados prometidos

1. Em piloto, reduzir em 30% o tempo mediano de conferência e preparação de dossiês, contra o processo manual observado.
2. Nenhuma conciliação indevida nos casos críticos de aceite e pelo menos 99,5% de precisão em amostra revisada das correspondências automáticas do piloto; casos ambíguos permanecem pendentes.
3. Pelo menos 95% dos casos elegíveis recebidos com antecedência suficiente devem chegar à revisão antes do prazo interno; nenhum prazo perdido por falha silenciosa do produto.
4. Todo valor financeiro exibido como fato deve ter cálculo ou fonte verificável; nenhuma evidência inventada é aceitável.
5. Conversão: buscar ganho relativo de 3% a 5% em piloto com margem incremental positiva e sem aumento material de reclamações/perdas. A meta só será adotada após conhecer volume e base de comparação.
6. Custos de pagamentos: medir economia efetiva por cenário equivalente, sem prometer um percentual universal.

Produto e financeiro definem a linha de base em 2–4 semanas de operação observada. Experimentos de conversão precisam de cálculo de amostra, duração e maturidade compatíveis com o efeito desejado; um prazo curto não prova redução de chargebacks.

## 8. Modelo de negócio e entrada no mercado

**Proposta para testar:** conciliador gratuito como porta de entrada; plano de gestão com histórico, taxas e alertas; adicional de evidências/chargebacks; plano avançado com políticas de venda e caixa. Cobrança por empresa e faixa de volume de registros/casos é mais alinhada à operação inicial que exigir processamento de todo o pagamento pela PayScale.

Honorário por recuperação pode ser avaliado somente sobre crédito efetivamente recebido e rastreável, com dedução e atribuição claras. Encaminhamento remunerado a parceiros deve ser divulgado e não alterar a ordem das recomendações em favor da maior comissão.

Não definir preços a partir de taxas promocionais de adquirentes: os modelos de negócio diferem. Validar disposição a pagar, custo de suporte, custo de IA, retenção e benefício realizado antes da precificação final.

**Piloto proposto:** 8–12 empresas, equilibrando comércio físico/online e serviços, com responsáveis disponíveis e documentação suficiente. Começar com poucos provedores representativos dos participantes. Entrevistar usuários e observar a rotina antes/depois; não solicitar dados pessoais desnecessários.

**Critério comercial de avanço:** uso recorrente, economia de tempo comprovada e disposição a pagar pelo fluxo completo, sem dependência permanente de intervenção do fundador em cada caso.

## 9. Roadmap por evidência

### Onda 0 — Descoberta e base confiável

Inventariar funções reais, formatos, provedores e contratos; observar a rotina; escolher pilotos; definir permissões, retenção e linha de base. Entrega: S01 e conjunto de exemplos revisados de conciliação, taxas e disputas.

### Onda 1 — MVP de operação

S02, S03 e versão inicial de S04; S10 como explicação contextual. Entrada por arquivos, histórico opcional, fila de tarefas e dossiê exportável. Saída: os critérios P0 passam em casos reais autorizados e há uso recorrente.

### Onda 2 — Margem e caixa

S05–S08; primeiros conectores selecionados; comparação de cenários; experimentos pequenos de recuperação e parcelamento. Saída: ganho incremental demonstrado, custos e reclamações dentro dos limites acordados.

### Onda 3 — Parceiros e ações integradas

S09 e execução de ações suportadas por parceiros. Saída: condições contratuais/regulatórias validadas, confirmação explícita, reconciliação da execução e suporte operacional definido.

**Planejamento indicativo:** pensar em ciclos de 4–6 semanas após descoberta, não em uma data firme para concluir todas as ondas. Capacidade da equipe, qualidade dos dados e acesso aos parceiros ainda não são conhecidos. Cada onda pode demandar mais de um ciclo.

## 10. Regras comuns de confiança

- **G01 — Evidência:** toda conclusão factual aponta fonte e período; ausência vira pendência, não certeza.
- **G02 — Dinheiro:** distinguir bruto, líquido, previsto, disponível, bloqueado, contratado e realizado. Não somar fluxo de caixa com lucro.
- **G03 — Autorização:** recomendação não executa pagamento, estorno, contratação ou envio de disputa. Ações externas exigem responsável autorizado e confirmação específica na jornada.
- **G04 — Consumidor:** facilitar esclarecimento, cancelamento e reembolso cabíveis. Não classificar uma reclamação legítima como fraude nem cobrar novamente só porque o lojista discorda.
- **G05 — IA:** não inventar evidências, valores, cláusulas ou probabilidades. A IA pode abster-se e encaminhar para revisão.
- **G06 — Privacidade:** dados de uma empresa não aparecem em outra; compartilhar só o necessário; informar finalidade e retenção; não usar arquivos para treinamento por padrão.
- **G07 — Rastreabilidade:** preservar versões, responsáveis, origem e alterações; correção não apaga o histórico da decisão.
- **G08 — Limites do parceiro:** disponibilidade, prazo, versão e regra de cobertura são específicas de cada provedor e operação.
- **G09 — Neutralidade:** ranking financeiro revela premissas, ofertas ausentes e comissão comercial.
- **G10 — Medição:** hipótese, simulação, estimativa, validação e resultado realizado são estados diferentes.

A mudança de processamento local para armazenamento ou análise por IA deve ser apresentada antes do envio de arquivos. Não conservar a promessa atual de “não enviado” em uma jornada que envia dados.

Referências para validação jurídica do produto: LGPD, especialmente finalidade, necessidade e revisão de decisões automatizadas [F23]; direitos do consumidor e tratamento de cancelamentos [F24]; regras aplicáveis aos parceiros e operações de recebíveis [F20]; distinção entre MED do Pix e disputa comercial [F21]; divulgação de custos de crédito [F22]. A revisão humana em decisões sensíveis é também uma escolha de desenho desta proposta; não se afirma que toda decisão automatizada seja legalmente obrigada a ser inicialmente humana.

## 11. Especificações de negócio

Cada módulo abaixo é uma unidade SDD. Os IDs são estáveis e devem ser citados em tarefas, revisões e evidências de aceite. “Aceite” descreve o resultado observável esperado, não uma implementação técnica.

<!-- SPEC:S01|Base de contexto e confiança -->
### S01 — Base de contexto e confiança

**Prioridade:** P0. **Responsável de negócio:** Produto e operação financeira. **Dependências:** nenhuma. **Hipótese:** dados corretamente contextualizados reduzem conclusões erradas e retrabalho.

**Jornada:** cadastrar empresa e canais → escolher análise temporária ou histórico → informar origem/período → revisar dados → autorizar uso pertinente → iniciar conferência.

**Requisitos**

- S01-R01: identificar empresa, conta, provedor, canal, moeda, período e data de atualização. Mistura entre empresas ou moedas fica bloqueada até correção.
- S01-R02: manter modo temporário identificado e oferecer histórico como escolha separada, explicando armazenamento, acesso e uso de IA.
- S01-R03: apontar arquivo vazio, campos ausentes, duplicidades, valores inválidos, datas ambíguas e cobertura incompleta; nunca preencher informação financeira ausente como fato.
- S01-R04: permitir perfis de consulta, revisão e aprovação; consultor acessa apenas as empresas autorizadas.
- S01-R05: mostrar cobertura dos dados e diferenciar “zero ocorrências” de “dados não recebidos”.

**IA útil:** sugerir correspondência de colunas e explicar erros em linguagem simples. O usuário confirma ambiguidades; não é necessário usar IA em arquivos já reconhecidos.

**Aceite**

- S01-A01: dado um arquivo com duas empresas, ao iniciar a análise, a mistura é identificada e nenhum total consolidado aparece como pertencente a uma delas.
- S01-A02: dado um arquivo já importado, ao reenviá-lo, o usuário vê a duplicidade e o saldo não dobra.
- S01-A03: dado o modo temporário, sair da análise não cria histórico; ao optar pelo histórico, o usuário recebe informação sobre a mudança antes do envio.
- S01-A04: dado um usuário de consulta, tentar aprovar uma ação financeira não a executa.

**Fora do módulo:** conexão de todos os provedores e cadastro de crédito. **Métrica:** tempo até primeira análise válida; imports corrigidos; incidentes de mistura. **Primeiras entregas:** contexto e qualidade → modos de uso → perfis e histórico.
<!-- END:S01 -->

<!-- SPEC:S02|Conciliação e agenda de recebíveis -->
### S02 — Conciliação e agenda de recebíveis

**Prioridade:** P0. **Responsável:** Financeiro. **Dependências:** S01. **Hipótese:** uma fila explicável de exceções gera mais valor que apenas um total conciliado.

**Jornada:** importar → revisar correspondências → investigar diferença → atribuir responsável → confirmar desfecho.

**Requisitos**

- S02-R01: relacionar vendas/parcelas, recebíveis e repasses com identificadores, datas e valores; mostrar os registros que sustentam cada vínculo.
- S02-R02: suportar repasses agrupados e parciais; igualdade de valor isolada não confirma correspondência.
- S02-R03: separar conciliado, parcial, divergente, a receber e não identificado; tratamento de finais de semana e feriados segue calendário/contrato informado.
- S02-R04: manter agenda por provedor com líquido previsto, ajustes, bloqueios conhecidos e situação de liquidação. Saldo previsto não equivale a disponível para saque.
- S02-R05: registrar estornos, chargebacks, reversões, reservas e antecipações como movimentos distintos, preservando a origem.
- S02-R06: criar tarefas por relevância e prazo, com estados novo, em análise, aguardando terceiro, resolvido ou descartado com justificativa.

**IA útil:** resumir a provável causa e sugerir investigação. Confirmação financeira depende das regras e documentos.

**Aceite**

- S02-A01: duas vendas de mesmo valor e referência insuficiente permanecem ambíguas, sem vínculo automático forçado.
- S02-A02: três parcelas agrupadas em um crédito exibem a composição e o valor residual, sem conciliar novamente cada parcela contra o mesmo crédito.
- S02-A03: um chargeback posterior atualiza a agenda com ajuste e preserva a liquidação original.
- S02-A04: uma diferença encerrada por correção de data não entra como dinheiro recuperado.
- S02-A05: um estorno parcial deixa claro o valor remanescente do pedido e do recebível.

**Fora:** cobrança automática ao adquirente. **Métricas:** precisão revisada, tempo de fechamento, pendências por idade. **Entregas:** vínculos simples → agrupamentos e ajustes → fila e agenda.
<!-- END:S02 -->

<!-- SPEC:S03|Taxas e negociação -->
### S03 — Taxas e negociação

**Prioridade:** P0. **Responsável:** Financeiro/comercial. **Dependências:** S01–S02.

**Jornada:** cadastrar contrato → validar condições extraídas → comparar custo esperado e realizado → preparar negociação ou revisão → acompanhar resultado.

**Requisitos**

- S03-R01: manter vigência e condições por provedor, canal, modalidade, parcelas e faixa de volume quando aplicável.
- S03-R02: separar taxa percentual de adquirência (MDR), tarifa fixa, parcelamento, antecipação e outros encargos. Não descontar novamente antecipação já embutida na condição contratada.
- S03-R03: comparar propostas para o mesmo perfil de vendas, volume, prazo, serviços e elegibilidade; sinalizar promoção, prazo limitado e custos não informados.
- S03-R04: classificar diferença como suspeita, validada, contestada ou recuperada; alteração de contrato não muda retroativamente a regra aplicada à venda anterior.
- S03-R05: gerar um resumo de negociação com volume, mix, custo efetivo e divergências documentadas; não prometer redução nem enviar negociação sem autorização.

**IA útil:** extrair cláusulas e vigências com referência à página; resumir diferenças. Dados extraídos precisam de confirmação antes de afetar valores.

**Aceite**

- S03-A01: venda de R$ 1.000 com taxa contratada de 3% e cobrada de 3,5%, sem outros encargos, mostra R$ 5 para revisão; não mostra R$ 5 recuperados.
- S03-A02: proposta de taxa menor com antecipação obrigatória mais cara não recebe automaticamente a primeira posição.
- S03-A03: contrato ilegível ou sem vigência gera pendência e não uma taxa inventada.
- S03-A04: parcela de período anterior usa a versão contratual correta, mesmo após cadastro de novo contrato.

**Fora:** negociação vinculante automática. **Métricas:** economia realizada, divergências confirmadas e tempo de preparação. **Entregas:** cadastro de condições → auditoria → comparação e resumo de negociação.
<!-- END:S03 -->

<!-- SPEC:S04|Chargebacks e passaporte da venda -->
### S04 — Chargebacks e passaporte da venda

**Prioridade:** P0. **Responsável:** Risco/pós-venda. **Dependências:** S01; S02 para comprovar efeito financeiro.

**Jornada:** preparar comprovação desde a venda → receber disputa → identificar motivo e prazo → conferir provas → revisar estratégia → exportar ou enviar por canal autorizado → registrar decisão → conferir crédito/débito.

**Requisitos**

- S04-R01: registrar tipo de venda, motivo informado pelo provedor, valor contestado, prazo externo, prazo interno, responsável e situação financeira.
- S04-R02: criar checklist por motivo, produto e provedor. Regras têm versão, origem e data de revisão. Prazo ausente exige confirmação; não aplicar um prazo genérico a todos os casos.
- S04-R03: manter documentos originais, versões e cronologia. IA destaca informações e contradições sem editar a prova original.
- S04-R04: separar evidência de contratação, entrega/execução e pagamento. Nenhuma, isoladamente, prova necessariamente as outras.
- S04-R05: gerar dossiê com alegação, fatos suportados, documentos, lacunas e versão revisada. Toda afirmação factual deve apontar sua fonte.
- S04-R06: recomendar avaliar contestação, aceite ou solução comercial, com custo da disputa e força documental; não apresentar probabilidade de vitória sem modelo validado.
- S04-R07: distinguir “dossiê preparado”, “enviado”, “recebido pelo provedor”, “ganho/perdido” e “crédito confirmado”. Exportação não significa protocolo.
- S04-R08: alertar sobre reembolso ou disputa já existente, para evitar instrução de devolução duplicada; exceções vão para análise com o provedor.

**Comprovação por modalidade**

- **Produto físico:** descrição e promessa originais, pedido, nota fiscal quando aplicável, rastreio, comprovante de entrega, identificação pertinente do recebedor e comunicações. Entrega parcial tem valor e itens próprios.
- **Serviço presencial/remoto:** escopo, valor, cronograma, autorizações, ordem de serviço, marcos efetivamente prestados, cancelamentos e aceite quando cabível. Evitar conteúdo sensível de saúde ou de outras atividades quando uma comprovação mínima basta.
- **Produto digital:** licença/compra, disponibilização, registros pertinentes de acesso ou consumo, período e comunicações. Log de acesso não prova automaticamente satisfação ou ausência de fraude.
- **Recorrência:** autorização inicial, ciclo cobrado, aviso pertinente, cancelamento e serviços entregues naquele período.
- **POS:** comprovante e informações fornecidas pelo adquirente sobre modalidade de captura/autenticação, sem presumir que compra presencial elimina chargebacks.

**IA útil:** extrair datas, organizar cronologia, encontrar lacunas e redigir uma defesa com fontes. Nunca criar assinatura, entrega, conversa ou aceite.

**Aceite**

- S04-A01: disputa de serviço não prestado com contrato assinado, mas sem execução comprovada, mostra lacuna; não afirma “serviço entregue”.
- S04-A02: disputa parcial de R$ 200 em compra de R$ 1.000 gera dossiê e exposição de R$ 200, sem alegar disputa integral.
- S04-A03: se rastreio e relato do lojista contradizem a entrega, a contradição fica visível e a defesa aguarda revisão.
- S04-A04: ao faltar prazo do provedor, o caso entra em confirmação urgente, sem prazo fictício.
- S04-A05: ganhar uma disputa sem crédito confirmado não aumenta o benefício financeiro realizado.
- S04-A06: pedido já reembolsado alerta o responsável antes de qualquer nova devolução ou solicitação de pagamento.

**Fora:** garantia de reversão, seguro próprio e cobrança automática de comprador após disputa. **Métricas:** tempo de dossiê, cumprimento de prazo, afirmações sem fonte, recuperação líquida em casos encerrados. **Entregas:** passaporte/checklists → fila e prazos → dossiê e acompanhamento.
<!-- END:S04 -->

<!-- SPEC:S05|Prevenção e proteção do comprador -->
### S05 — Prevenção e proteção do comprador

**Prioridade:** P1. **Responsável:** Pós-venda/risco. **Dependências:** S01 e S04.

**Jornada:** reconhecer compra → acompanhar entrega/serviço → pedir ajuda ou cancelamento → receber solução → acompanhar reembolso.

**Requisitos**

- S05-R01: orientar identificação clara do vendedor e descrição reconhecível da cobrança, com recibo e canal de atendimento.
- S05-R02: alertar atraso, falta de comprovante, divergência de valor, reclamação recorrente e cobrança após cancelamento; sinais geram investigação, não acusação.
- S05-R03: oferecer uma central de resolução vinculada ao pedido, com identificação do comprador, informações mínimas e histórico de respostas.
- S05-R04: registrar pedido de cancelamento e encaminhar reembolso cabível, mostrando valor, método e prazo informado pelo provedor.
- S05-R05: recomendar antifraude, autenticação e revisão conforme capacidades do parceiro. Registrar quando há cobertura confirmada, ausência ou desconhecimento; 3DS não cobre todo motivo de chargeback.
- S05-R06: distinguir cartão, estorno comercial e MED do Pix. Não oferecer MED como resolução de desacordo comercial [F21].

**IA útil:** triagem de motivo, resumo do histórico e sugestão de resposta respeitosa. Solicitação de direitos não vira sinal automático de fraude.

**Aceite**

- S05-A01: cancelamento confirmado interrompe futuras ações de cobrança relacionadas, respeitando o que ainda estiver legitimamente devido e revisado.
- S05-A02: cliente sem produto entregue consegue abrir solicitação sem ser obrigado a confirmar recebimento ou renunciar a direitos.
- S05-A03: venda Pix com desacordo comercial segue resolução comercial, sem promessa de chargeback ou MED aplicável.
- S05-A04: venda autenticada com disputa por serviço não prestado não é rotulada “garantida pelo 3DS”.

**Fora:** substituir a decisão do emissor ou impedir contestação legítima. **Métricas:** resolução antes de escalada, tempo de resposta/reembolso e reclamações repetidas. **Entregas:** recibo e alertas → central de resolução → acompanhamento do reembolso.
<!-- END:S05 -->

<!-- SPEC:S06|Conversão e recuperação de vendas -->
### S06 — Conversão e recuperação de vendas

**Prioridade:** P1. **Responsável:** Crescimento e risco. **Dependências:** S01–S03 e S05; dados de checkout necessários para métricas de funil.

**Jornada:** identificar queda → distinguir abandono e recusa → escolher ação elegível → executar com controle → medir resultado incremental.

**Requisitos**

- S06-R01: separar sessões, pedidos, tentativas, autorizações e pagamentos confirmados. Não inferir abandono a partir de extrato de liquidação.
- S06-R02: mostrar motivos conhecidos de recusa e “motivo indisponível” quando não houver informação.
- S06-R03: sugerir método alternativo, correção de dados, autenticação, carteira suportada ou retentativa permitida; nunca contornar negativa de fraude nem repetir resultado de pagamento desconhecido.
- S06-R04: recuperação por contato respeita autorização/base aplicável, canal, horário, frequência e descadastro. Piloto: no máximo dois contatos por pedido em 48 horas, salvo política mais restritiva; é regra proposta, não regra universal do setor.
- S06-R05: parar recuperação quando houver pagamento, cancelamento, disputa, reclamação aberta ou oposição ao contato.
- S06-R06: testar com grupo de controle e comparar margem incremental, deduplicando pedidos; mostrar descontos, taxas, mensagens e perdas posteriores.
- S06-R07: aplicação de roteamento exige parceiro habilitado, pelo menos duas rotas viáveis e política aprovada; diagnóstico continua útil mesmo sem controle do checkout.

**IA útil:** classificar causas e adaptar texto dentro de condições aprovadas. Não gerar descontos ou promessa de aprovação fora da política.

**Aceite**

- S06-A01: um pedido com três tentativas e um pagamento conta como um pedido convertido.
- S06-A02: retorno incerto do provedor bloqueia nova tentativa até esclarecimento, evitando duplicidade.
- S06-A03: pedido pago entre agendamento e envio não recebe mensagem de recuperação.
- S06-A04: aumento de receita com margem incremental negativa não é apresentado como experimento vencedor.
- S06-A05: ausência de sessões de checkout impede exibir taxa de conversão do checkout como fato.

**Fora:** motor próprio de autorização e liberação indiscriminada de antifraude. **Métricas:** conversão por pedido, margem incremental, contatos indevidos, duplicidades e perdas maturadas. **Entregas:** diagnóstico → recomendações → recuperação controlada → integração de aplicação.
<!-- END:S06 -->

<!-- SPEC:S07|Parcelamento e política comercial -->
### S07 — Parcelamento e política comercial

**Prioridade:** P1. **Responsável:** Comercial/financeiro. **Dependências:** S03; S06 para medir conversão.

**Jornada:** informar margem e custos → comparar condições → aprovar política → aplicar no canal suportado → revisar resultado.

**Requisitos**

- S07-R01: comparar Pix, cartão à vista e parcelas disponíveis usando ticket, margem antes do pagamento, encargos e prazo.
- S07-R02: explicitar quem arca com juros; comprador vê valor de cada parcela e total, incluindo acréscimos, antes da confirmação.
- S07-R03: definir limite de parcelas por faixa de ticket, parcela mínima e piso de margem; separar assinatura de parcelamento de uma compra.
- S07-R04: recomendar incentivo por método dentro da economia disponível e do piso de margem; não presumir que Pix custa zero.
- S07-R05: considerar custo de antecipação apenas quando fizer parte do cenário; não cobrar esse custo duas vezes nem ocultá-lo numa taxa genérica.
- S07-R06: política aprovada afeta novas ofertas; pedidos já aceitos preservam suas condições.

**IA útil:** explicar alternativas e sugerir testes. A seleção final depende do cálculo e das restrições aprovadas.

**Exemplo hipotético:** venda de R$ 1.000, margem antes do pagamento de R$ 300. Cartão custa R$ 40, restando R$ 260 antes de outros efeitos. Pix sem desconto custa 1% e deixa R$ 290. Com desconto Pix de R$ 20, a taxa de 1% incide em R$ 980: margem restante de R$ 270,20. A vantagem frente ao cartão é R$ 10,20, sem considerar mudança de conversão. Valores ilustrativos, não cotações de mercado.

**Aceite**

- S07-A01: os valores do exemplo são reproduzidos e as premissas ficam visíveis.
- S07-A02: sem margem informada, o sistema calcula custo e recebimento, mas não afirma que a condição é lucrativa.
- S07-A03: “12 vezes sem juros” não é recomendado quando o custo suportado viola o piso aprovado.
- S07-A04: mudança de política não altera o total de pedido já contratado.

**Fora:** impor crédito parcelado ao comprador. **Métricas:** margem por pedido, mix, ticket, conversão e necessidade de antecipação. **Entregas:** simulador → política aprovada → teste e revisão.
<!-- END:S07 -->

<!-- SPEC:S08|Caixa e antecipação -->
### S08 — Caixa e antecipação

**Prioridade:** P1. **Responsável:** Financeiro. **Dependências:** S02–S03; compromissos de saída informados.

**Jornada:** definir obrigação e reserva → projetar caixa → comparar opções → escolher → confirmar no provedor → conferir liquidação e agenda restante.

**Requisitos**

- S08-R01: mostrar horizontes de 7, 30 e 90 dias, distinguindo saldo conhecido, recebíveis constituídos e receitas ainda estimadas.
- S08-R02: pedir saídas e reserva mínima; sem despesas conhecidas, apresentar projeção de entradas, não diagnóstico de suficiência de caixa.
- S08-R03: sugerir antecipação parcial vinculada à necessidade; excluir valores bloqueados, já cedidos/antecipados ou sem elegibilidade confirmada.
- S08-R04: comparar valor líquido hoje, custo em reais, vencimentos originais, tributos/tarifas informados, garantias e impacto futuro. Fórmula segue o contrato, sem universalizar desconto simples ou juros compostos.
- S08-R05: cotação possui data, validade, fonte e condições; simulação própria é identificada e não vira oferta garantida.
- S08-R06: comparar esperar, antecipar e renegociar uma saída quando viável. Crédito é opção adicional apenas com dados suficientes de S09.
- S08-R07: após antecipação confirmada, remover a entrada futura correspondente, preservar o histórico e mostrar ajustes residuais.

**IA útil:** explicar os fatores de falta de caixa e cenários. A previsão informa incerteza; a IA não contrata sozinha.

**Exemplo hipotético:** R$ 10.000 líquidos de taxa de pagamento, vencendo em 30 dias. Sob contrato fictício de desconto simples de 2% por 30 dias, sem tarifas adicionais, líquido antecipado de R$ 9.800 e custo de R$ 200. O custo sobre o dinheiro recebido é 200/9.800 ≈ 2,04% no período. Não é uma taxa de mercado, nem cálculo universal de CET.

**Aceite**

- S08-A01: o exemplo produz R$ 9.800 e identifica a base de cálculo.
- S08-A02: recebível com gravame conhecido não é exibido como livre para nova operação.
- S08-A03: sem saídas, o produto não recomenda valor “necessário” para antecipação.
- S08-A04: cotação vencida exige atualização antes de confirmação.
- S08-A05: após antecipar R$ 10.000 nominais, a agenda não soma novamente os mesmos R$ 10.000 como entrada futura disponível.

**Fora:** garantir funding ou executar sem parceiro habilitado. **Métricas:** erro da previsão, custo contratado versus simulado, valor antecipado além da necessidade, efeito no saldo mínimo. **Entregas:** projeção → comparação → encaminhamento → acompanhamento.
<!-- END:S08 -->

<!-- SPEC:S09|Crédito responsável com parceiros -->
### S09 — Crédito responsável com parceiros

**Prioridade:** P2. **Responsável:** Financeiro, parcerias e responsável regulatório. **Dependências:** S08; parceiro e enquadramento validados antes da oferta integrada.

**Jornada:** declarar necessidade → comparar alternativas → escolher compartilhamento → receber proposta do parceiro → revisar condições → contratar no fluxo apropriado → acompanhar compromissos.

**Requisitos**

- S09-R01: distinguir recomendação de organização financeira, simulação, proposta, aprovação do parceiro e crédito contratado.
- S09-R02: apresentar valor líquido, valor total devido, parcelas, prazo, taxa, CET quando aplicável, encargos, garantias e condições de elegibilidade.
- S09-R03: comparar propostas para mesma necessidade de valor líquido e horizonte; não ordenar só pela taxa nominal ou prestação menor.
- S09-R04: considerar outras obrigações e testar queda de receita em cenários ilustrativos, sem confundir previsão com garantia.
- S09-R05: compartilhar dados apenas com parceiros identificados e finalidade informada; mostrar eventual remuneração da PayScale.
- S09-R06: decisão de concessão permanece no parceiro; IA generativa não aprova, nega ou inventa limite. Permitir esclarecimento e encaminhamento de revisão.
- S09-R07: incluir opção de não contratar se nenhuma proposta atender às restrições informadas.

**IA útil:** traduzir propostas, identificar informação ausente e explicar o efeito das parcelas. Não construir reputação negativa a partir do exercício de direitos do consumidor.

**Aceite**

- S09-A01: proposta com taxa menor, mas custo total maior, mostra ambos e não é rotulada automaticamente como mais barata.
- S09-A02: sem proposta válida, nenhum limite aparece como aprovado.
- S09-A03: duas propostas com líquidos diferentes exigem normalização ou aviso de incomparabilidade.
- S09-A04: encargo obrigatório não informado impede declaração de comparação completa.

**Fora:** crédito próprio e decisão autônoma de concessão. **Métricas:** completude da comparação, custo realizado, reclamações e aderência ao objetivo; originação não é a única medida de sucesso. **Entregas:** comparação manual → parceiros validados → encaminhamento → acompanhamento.
<!-- END:S09 -->

<!-- SPEC:S10|IA contextual e medição de valor -->
### S10 — IA contextual e medição de valor

**Prioridade:** P0 transversal, com ampliação por onda. **Responsável:** Produto e responsáveis dos módulos. **Dependências:** S01 e dados do módulo consultado.

**Jornada:** abrir uma pendência → pedir explicação ou resumo → conferir fontes → revisar recomendação → executar ação permitida → registrar resultado.

**Requisitos**

- S10-R01: cada resposta informa fatos, hipóteses, dados faltantes, fontes, período e próxima ação. Evitar um número de “confiança” sem significado calibrado.
- S10-R02: usar regras verificáveis para valores; IA explica os resultados. Pergunta sem dados retorna limitação e pedido específico, sem preencher lacunas.
- S10-R03: oferecer ações contextuais: explicar diferença, resumir contrato, listar provas faltantes, preparar defesa, comparar cenários e resumir prioridades da semana.
- S10-R04: manter aprovação humana de condições, defesas e ações externas. Conteúdo de arquivos não pode redefinir as regras de uso nem autorizar compartilhar dados.
- S10-R05: medir tempo, qualidade e custo por tarefa; reutilizar análise válida de documento inalterado, evitar reprocessar todo o histórico e limitar o contexto ao caso.
- S10-R06: registrar versão da análise, correções do revisor e resultado; dados pessoais não são reutilizados entre empresas por padrão.
- S10-R07: painel separa oportunidade, ação aprovada, benefício estimado e benefício confirmado, sem dupla contagem.

**Aceite**

- S10-A01: “qual valor recuperamos?” retorna apenas créditos confirmados, com referências; dossiês ganhos sem repasse ficam separados.
- S10-A02: um documento contendo instrução para ignorar regras não altera a tarefa nem expõe outra empresa.
- S10-A03: sem contratos, o sistema não inventa “taxa negociada”.
- S10-A04: uma afirmação de entrega sem documento correspondente é rejeitada na revisão de qualidade.
- S10-A05: o mesmo caso inalterado não exige nova leitura de todos os arquivos para produzir o mesmo resumo; qualquer dado relevante alterado invalida o resumo anterior.

**Fora:** assistente geral desconectado da operação e autonomia irrestrita. **Métricas:** correções, fatos sem suporte, tempo poupado, custo por caso e utilidade avaliada pelo usuário. **Entregas:** explicações P0 → tarefas assistidas → priorização por valor → recomendações P1/P2.
<!-- END:S10 -->

## 12. Qualidade, limites e critérios de lançamento

### Qualidade da experiência

Textos em português claro; valores e datas no padrão brasileiro; status compreensíveis sem depender apenas de cores; navegação por teclado; erros apontam como corrigir; exportação preserva fontes e ressalvas. Notificações agrupam informações e priorizam urgência real.

### Avaliação da IA

Antes do piloto, revisar pelo menos 100 casos anonimizados ou sintéticos representativos, incluindo produto físico, serviço, digital, recorrência, ausência de prova, prova contraditória e disputa parcial. Casos sintéticos testam comportamento, não comprovam acurácia de produção.

Critérios de liberação propostos: nenhum vazamento entre empresas, nenhum cálculo financeiro divergente nos exemplos de aceite, nenhuma prova fabricada e todo fato usado em defesa ligado à fonte. Erros materiais bloqueiam a função afetada e levam à correção. Probabilidades de fraude, conversão ou vitória só entram após avaliação específica de dados e desempenho.

### Avaliação de resultado

Para conversão e parcelamento: manter controle contemporâneo, definir unidade de comparação e efeito mínimo antes de começar, tratar sazonalidade, deduplicar pedidos e aguardar perdas posteriores. Para produtividade: comparar tarefas equivalentes, incluindo tempo de revisão e correções. Para taxas: usar custo realizado sob condições equivalentes, não diferença entre publicidade e contrato.

### Portões de lançamento

1. **Pronto para piloto:** origem dos dados e regras conhecidas, responsável definido, exemplos de aceite revisados e limitações visíveis.
2. **Pronto para ampliar:** uso recorrente, métricas confiáveis, correções operacionais tratadas e nenhum risco material pendente.
3. **Pronto para ação externa:** parceiro confirma capacidade, permissão e forma de acompanhamento; usuário confirma a ação e recebe comprovante/protocolo.

Em caso de erro, suspender a recomendação ou ação afetada e manter consulta aos dados originais. Não apagar histórico para “corrigir” métricas.

## 13. Decisões pendentes e riscos

**D01 — Público prioritário:** validar quais segmentos têm maior frequência de dor e disposição a pagar. Dono: Produto. Bloqueia o recorte comercial, não a especificação inicial.

**D02 — Estado real do produto:** inventariar painel privado e funções já construídas. Dono: Produto. Evita duplicar evolução já existente.

**D03 — Provedores iniciais:** escolher pelos pilotos e disponibilidade real dos dados. Dono: Parcerias/Operações. Bloqueia conectores específicos, não o fluxo por arquivos.

**D04 — Contratos e regras:** obter modelos autorizados de taxas, disputas e antecipação. Dono: Financeiro/Risco. Sem isso, comparar apenas cenários explicitamente simulados.

**D05 — Armazenamento e privacidade:** definir prazos de retenção por finalidade, acesso e tratamento de dados pessoais. Dono: responsável por privacidade. Bloqueia histórico real até definição.

**D06 — Metas e preços:** medir base, custo de operação e disposição a pagar. Dono: Produto/Financeiro. As metas deste documento são hipóteses iniciais.

**D07 — Financiamento:** definir papel da PayScale e responsabilidades dos parceiros. Dono: Parcerias/jurídico. Bloqueia oferta integrada e execução, não a comparação educacional de cenários.

**Riscos principais:** arquivos incompletos gerarem falsa certeza; IA produzir defesa incorreta; ampliação de aprovação elevar fraude; recomendação financeira favorecer comissão; antecipação comprometer caixa futuro; foco excessivo em funcionalidades antes de validar uso. Mitigações estão nos critérios dos módulos, com prioridade à qualidade e à rastreabilidade.

## 14. Como executar em SDD com menos contexto

### Fonte de verdade

Este PRD é a edição consolidada. No pacote, cada S01–S10 é a unidade de trabalho; o contexto global está em CONTEXTO.md. Após alterar uma regra, atualizar a especificação correspondente e registrar a decisão antes de gerar uma nova edição consolidada. Não manter duas versões divergentes silenciosamente.

### Fluxo por tarefa

1. Ler CONTEXTO.md e apenas a especificação afetada.
2. Selecionar um pequeno conjunto de requisitos e critérios de aceite.
3. Identificar dependências ou dúvida que realmente muda a entrega.
4. Executar a mudança respeitando as regras comuns.
5. Verificar os cenários selecionados e registrar evidências.
6. Encerrar com resumo curto: entregue, verificado, pendente e próximo passo.

### Política de contexto

- Não reler pesquisa inteira a cada tarefa. Carregar somente a fonte vinculada quando uma regra externa precisar de confirmação.
- Preservar IDs. Referenciar um requisito em vez de copiá-lo várias vezes.
- Trabalhar em um módulo ou fatia por vez. Alteração transversal deve listar os módulos afetados.
- Registrar decisões em poucas linhas: data, decisão, motivo e impacto.
- Ao retomar, usar resumo de até 200 palavras com estado e pendências; não colar todo o histórico.
- Preferir documentos e regras estáveis já revisados. Revalidar informações externas quando necessário, especialmente preços, contratos e regras de provedores.
- Não cortar exceções financeiras, critérios de aceite ou limites de responsabilidade para economizar tokens.

### Prompt de execução reutilizável

“Leia CONTEXTO.md e a especificação SXX. Trabalhe somente nos requisitos [IDs] e critérios de aceite [IDs]. Preserve as regras G01–G10. Use documentos dependentes apenas se necessários. Não invente capacidade de parceiro ou condição comercial. Entregue a evolução solicitada e registre, de forma curta, o que foi verificado, as pendências e as decisões. Se uma informação ausente impedir a ação financeira, mantenha a recomendação como simulação e conclua o restante.”

### Ordem inicial de tarefas

T01 contexto e qualidade de importação → T02 conciliação com exceções → T03 histórico e permissões → T04 contratos e taxas → T05 passaporte de venda → T06 fila de disputas e prazos → T07 dossiê assistido → T08 evidências de benefício. Depois: resolução do comprador, conversão, parcelamento, caixa e parceiros de crédito.

S10 acompanha cada entrega; não exige construir um chat completo antes de entregar valor.

## 15. Fontes e rastreabilidade

Consultadas em **06/11/2026**. Links remetem a fontes primárias. Páginas comerciais sustentam a existência da oferta anunciada, não eficácia independente ou disponibilidade em qualquer contrato. Regras e preços devem ser confirmados antes de implementação ou contratação.

- **F00 — PayScale:** [Página inicial](https://www.payscale.com.br/) e [conciliador](https://www.payscale.com.br/conciliar). Inspeção visual das páginas públicas pelo navegador; base da seção 2.
- **F01 — PagBank:** [Checkout e Link de Pagamento](https://developer.pagbank.com.br/docs/checkout). Configuração de parcelas e juros; S07.
- **F02 — PagBank:** [Criar e pagar com autenticação 3DS](https://developer.pagbank.com.br/reference/criar-pagar-pedido-com-3ds-validacao-pagbank). Capacidade de autenticação; S05–S06.
- **F03 — Getnet:** [Como antecipar vendas pelo aplicativo](https://site.getnet.com.br/get-ajuda-antecipacao-de-venda/como-antecipar-sua-vendas-pelo-app/). Simulação e confirmação; S08.
- **F04 — Getnet:** [Contrato de credenciamento, abril de 2025](https://site.getnet.com.br/wp-content/uploads/2025/04/getnet_contrato_de_credencimento_04_2025.pdf). Antifraude e limites de responsabilidade; S04–S05. Validar versão aplicável ao cliente.
- **F05 — Cielo:** [Escolha como receber](https://www.cielo.com.br/escolha-como-receber/). Alternativas de recebimento; S08.
- **F06 — Cielo:** [Autenticação 3DS](https://docs.cielo.com.br/atendimento/docs/autenticacao-3ds). Versões e responsabilidade; S05.
- **F07 — Cielo:** [Contrato de e-commerce](https://www.cielo.com.br/docs/contrato-de-credenciamento/e-commerce-transacoes-sem-presenca-do-cartao-25.04.08.pdf). Autenticação e custos de retentativa; S03/S06. Validar contrato vigente.
- **F08 — Mercado Pago:** [Proteção ao vendedor em contestações](https://www.mercadopago.com.br/blog/como-funciona-protecao-vendedor-contestacao). Explicação oficial de elegibilidade; S04. Não substitui o regulamento contratual.
- **F09 — Mercado Pago:** [3DS 2.0](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/payment-management/integrate-3ds?scope=prod). Autenticação no checkout; S05.
- **F10 — Appmax:** [Plataforma oficial](https://www.appmax.com.br/). Oferta comercial; S06/S07. Resultados promocionais não foram usados como metas.
- **F11 — Appmax:** [Recuperação de vendas com IA](https://docs.appmax.com.br/guides/recuperacao-vendas-ia). Documentação com indicação beta; S06.
- **F12 — Appmax:** [Status de pedidos](https://docs.appmax.com.br/guides/status-pedidos). Distinção entre estados de pagamento e disputa; S02/S04/S06.
- **F13 — Asaas:** [Introdução a assinaturas](https://docs.asaas.com/docs/assinaturas) e [Pix Automático](https://docs.asaas.com/docs/pix-automatico). Jornadas de recorrência; S04/S06/S07.
- **F14 — Asaas:** [Antecipação de recebíveis](https://www.asaas.com/antecipacao-de-recebiveis). Oferta e cálculo por prazo; S08.
- **F15 — Asaas:** [Política de Chargeback](https://central.ajuda.asaas.com/hc/pt-br/articles/32097763260699-Pol%C3%ADtica-de-Chargeback). Gestão da disputa e responsabilidade; S04.
- **F16 — Asaas:** [Cobrança recorrente](https://materiais.asaas.com/cobranca-recorrente). Lembretes e rotina de cobrança; S06. Preços da página não são usados como cotação neste PRD.
- **F17 — Stripe:** [Smart Disputes](https://docs.stripe.com/disputes/smart-disputes). Automação de evidências e limites; S04/S10.
- **F18 — Adyen:** [Enable Adyen Uplift](https://docs.adyen.com/partners/uplift-enablement). Otimização integrada e requisitos; S06. Disponibilidade regional precisa de validação.
- **F19 — Pagar.me:** [Recebíveis](https://docs.pagar.me/reference/receb%C3%ADveis). Créditos e ajustes; S02. Confirmar versão do produto na integração.
- **F20 — Banco Central:** [Operações com recebíveis](https://www.bcb.gov.br/meubc/faqs/s/operacao-com-recebiveis). Negociação, garantias e registro; S08/S09.
- **F21 — Banco Central:** [Segurança no Pix](https://bcb.gov.br/estabilidadefinanceira/pix-seguranca). MED e situações não aplicáveis; S05.
- **F22 — Banco Central:** [Cuidados ao contratar crédito](https://www.bcb.gov.br/meubc/faqs/p/cuidados-na-hora-de-contratar-uma-operacao-de-credito). Comparação por custo total; S09.
- **F23 — Câmara dos Deputados:** [LGPD, texto atualizado](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html). Privacidade e revisão de decisões automatizadas; S01/S09/S10.
- **F24 — Presidência da República:** [Código de Defesa do Consumidor](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm). Informação e direitos do consumidor; S04/S05/S07/S09.

**Não disponível nesta etapa:** contratos reais da PayScale e dos clientes, indicadores de base, taxas negociadas, resultados auditados dos concorrentes e escopo do painel privado. A proposta pode orientar descoberta e execução por módulos; publicação de promessas comerciais e automação financeira dependem das validações indicadas.
