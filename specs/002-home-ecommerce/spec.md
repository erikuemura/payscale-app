# 002 — Home institucional para e-commerce

Status: primeira etapa implementada em 2026-11-03; público e-commerce confirmado pelo usuário. Captação persistida e mensuração ficam para a próxima etapa.

## Objetivo

Atrair responsáveis financeiros e donos de e-commerces, demonstrar valor compreensível e converter visitas em conversas qualificadas, com promessas sustentadas pelo produto e pela operação.

## Diagnóstico baseado em evidência

Inspeção do código e da home local /site em 2026-11-03. Não houve acesso a analytics, clientes, faturamento ou ambiente de produção. As recomendações de conversão são hipóteses a testar, não estimativas de aumento de vendas.

### P0 — Credibilidade da oferta

`src/app/site/SitePageClient.tsx` publica R$ 4,8 milhões recuperados, precisão de 98,7%, três depoimentos e recuperação superior a três mensalidades. Não há comprovação no repositório; a existência desses resultados ainda não foi confirmada pelo usuário. Solicitar origem, período, metodologia e autorização antes de publicar. Sem isso, substituir por demonstração identificada como exemplo.

O mesmo arquivo promete integração em dois minutos, AES-256 nas chaves, histórico de 12 meses, relatórios por email/PDF, multiempresa e SLA de 99,9%. A implementação inspecionada não sustenta essas garantias. `src/app/dashboard/integracoes/page.tsx`, função handleSync, atualiza uma data e simula espera; `src/app/dashboard/relatorios/page.tsx` exporta CSV; `supabase/schema.sql` guarda tokens em colunas text e dados por usuário, sem modelo de organizações/equipes. Serviços externos não presentes no repositório poderiam mudar essa avaliação, mas precisam de evidência.

Stone e Cielo aparecem como disponíveis no topo e “em breve” na seção de integrações. O rodapé mostra CNPJ 00.000.000/0001-00 e links href="#". Corrigir antes de investir em aquisição.

### P0 — Primeiro valor entregue

A rota / abre login; a home comercial está em /site. O CTA leva ao cadastro, que pede documento, segmento e senha antes de mostrar valor. Na cópia local, Supabase não está configurado e o login Google aponta para um domínio placeholder. Essa observação é local; não prova falha na produção.

Recomenda-se demonstração sem credenciais financeiras, com dados claramente fictícios, e CTA de diagnóstico assistido. Só oferecer diagnóstico quando houver responsável e capacidade de analisar os dados. Não prometer importação real ou prazo de entrega ainda não implementados.

### P1 — Posicionamento e diferenciação

A home mistura e-commerce, marketplace, SaaS, lojas e grandes grupos. Para a primeira versão comercial, priorizar e-commerces com financeiro enxuto que conferem repasses por planilha. Hipótese de qualificação: dificuldade com tarifas, parcelamento e divergências; selecionar um provedor/formato inicial após entrevistas, sem anunciar todos como disponíveis.

A identidade azul, o contraste do CTA e a prévia de painel podem ser aproveitados. A primeira dobra ocupa muito espaço com texto genérico e um painel de indicadores. Mostrar um caso compreensível de pedido → taxa → líquido esperado → repasse → diferença torna o valor mais concreto.

## Proposta de mensagem

Título: “Do pedido ao repasse, saiba onde está o dinheiro do seu e-commerce.”
Subtítulo proposto para uma oferta assistida: “Veja como conferir taxas, acompanhar recebimentos e organizar divergências para o seu financeiro saber o que revisar primeiro.”
CTA principal: “Solicitar diagnóstico”.
CTA secundário: “Ver demonstração”.
Microtexto: “Conheça o fluxo com dados de exemplo. A análise da sua operação depende dos provedores e arquivos disponíveis.”

Esta redação é proposta editorial. Não publicar o CTA principal sem um fluxo de atendimento operante.

## Estrutura da página

1. Cabeçalho simples: Como funciona, O que você recebe, Dúvidas, Entrar e CTA principal.
2. Primeira dobra: público explícito, resultado, dois CTAs e exemplo visual com explicação.
3. Três perguntas: Recebi o previsto? As taxas conferem? Qual divergência precisa de ação?
4. Demonstração: pedido de R$ 1.000; taxa contratada de 3%; cobrada de 3,5%; diferença de R$ 5. Hipótese simplificada, sem outras tarifas, antecipação ou cancelamento. Identificar como exemplo e não como valor recuperado.
5. Entrega do diagnóstico: resumo do período, divergências com evidência, valor em análise, prioridade e próxima ação. Depende de processo assistido ou implementação futura.
6. Como funciona: avaliar compatibilidade → receber dados por canal seguro → apresentar análise e próximos passos. Definir canal e responsável antes da publicação.
7. Compatibilidade: exibir apenas integrações validadas; demais com situação transparente e sem logos que impliquem parceria.
8. Confiança: operação responsável e contato verificados; dados de exemplo; política de privacidade real; case apenas quando comprovado.
9. Oferta: piloto/diagnóstico com escopo claro. Preços públicos só com pacote entregável, limites e condições definidos.
10. FAQ visível: dados necessários, compatibilidade, diferença entre identificar e recuperar, acesso a credenciais, acompanhamento e custos.
11. CTA final e rodapé enxuto, com todos os links funcionais.

## Requisitos e aceitação para futura implementação

- REQ-01: oferta dirigida a e-commerce. AC-01: título/subtítulo deixam claro público e resultado; nenhuma alegação de recuperação garantida.
- REQ-02: prova verificável. AC-02: toda métrica/case publicado tem fonte interna, período e autorização; exemplos estão rotulados; sem comprovante, não há estrelas ou aggregateRating.
- REQ-03: conversão funcional. AC-03: formulário curto (nome, contato profissional, loja e provedor principal), validação, persistência, retorno de sucesso/erro e entrega ao responsável testados; erro não mostra sucesso. Não solicitar documentos ou credenciais nessa etapa.
- REQ-04: demonstração independente de integração. AC-04: visitante vê o exemplo sem login e sem inserir tokens; nenhum seed em conta real.
- REQ-05: consistência. AC-05: página, preços, metadados e dados estruturados refletem a mesma disponibilidade. FAQ marcado corresponde ao FAQ visível. Nenhum href="#" usado como destino final.
- REQ-06: acesso comercial. AC-06: / apresenta institucional, /login preserva autenticação, /site redireciona para a home e os fluxos de logout/callback/reset mantêm destino correto. Mudança exige testes próprios; não mover apenas o arquivo da página.
- REQ-07: uso em celular e acessibilidade. AC-07: 390px e desktop sem rolagem horizontal, menu e formulário operáveis por teclado, foco visível, labels associados e contraste verificado; demonstração tem explicação textual acessível.
- REQ-08: mensuração. AC-08: eventos de CTA e lead recebido distinguem intenção de envio concluído; origem é preservada sem dados pessoais nos eventos; visitas internas excluídas das análises.

## Entrega de valor no produto — sequência proposta

1. Entrada de dados confiável: começar por um formato CSV e/ou um provedor escolhido, com validação, duplicatas, período e cobertura explícitos. CSV de entrada ainda não existe; não confundir com exportação atual.
2. Regra rastreável por transação: manter bruto, descontos, taxa esperada, taxa cobrada, líquido, vencimento e repasse. Definir arredondamento, parcelamento, estorno, antecipação e diferenças de calendário antes de cálculo automático.
3. Fila de divergências: classificar tarifa, atraso, ausência de repasse ou divergência de dados; mostrar origem, valor e ação sugerida. Não classificar todo pendente como perda.
4. Acompanhamento: novo → em análise → enviado ao provedor → resolvido; guardar evidência. Valor identificado, contestado e efetivamente recuperado são métricas distintas.
5. Recorrência: resumo de pendências e prazos depois de fluxo validado, com canal de notificação realmente implementado.
6. Expandir conectores e automações a partir dos casos reais. Equipes/multiempresa, ERP e SLA contratual ficam para uma etapa posterior.

## Oferta e aquisição

Hipótese inicial: piloto assistido com um período e um provedor, sem promessa de economia mínima. Se houver cobrança, explicitar preço e escopo antes do compromisso; não presumir gratuidade. Validar os preços atuais de R$ 297 e R$ 597 com entrevistas e custos de atendimento antes de mantê-los ou alterá-los.

Começar com entrevistas e demonstrações para e-commerces, parcerias com agências/BPOs que atendam esse público e conteúdo específico sobre conferência de repasses e taxas. BPO é canal possível, não mudança do público prioritário. Investir em tráfego pago após medir lead → reunião → dados disponíveis → diagnóstico entregue → cliente, e conhecer capacidade de atendimento.

## Métricas

- Conversão em lead qualificado: leads de e-commerce com problema e dados compatíveis / visitantes únicos elegíveis, no mesmo período e canal.
- Comparecimento: reuniões realizadas / reuniões agendadas.
- Ativação: pilotos que receberam uma análise rastreável / pilotos iniciados; reportar também tempo mediano até essa entrega.
- Resultado: divergências confirmadas, valores efetivamente recuperados com evidência e tempo de trabalho economizado com medição antes/depois.
- Retenção: clientes que voltam para conferir o período seguinte e renovam.

Não estabelecer meta numérica de conversão sem baseline. Em tráfego baixo, começar por entrevistas e observação de uso; não declarar vencedor de teste A/B com amostra insuficiente.

## Pendências de negócio

Público e-commerce confirmado. Ainda faltam: existência de cases reais, provedor inicial, responsável pelo diagnóstico, canal de atendimento, capacidade/prazo operacional, identidade comercial e preços aprovados.

## Referências externas e limites

Consulta em 2026-11-03. São mensagens comerciais dos fornecedores, não avaliação independente de desempenho.
- https://conciliadora.com.br/ — usa recebimento correto como mensagem e demonstração como CTA.
- https://conciliador.com.br/ — destaca conferência de vendas/tarifas e captura de contato.
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies — dados estruturados devem representar conteúdo verdadeiro e visível.

Inferência: disputar apenas amplitude de integrações é uma posição difícil para este estágio; clareza sobre uma dor de e-commerce e atendimento assistido são hipóteses de diferenciação a validar.

## Recorte da primeira entrega

Home redesenhada, simulador local, FAQ, contato direto por mailto usando o endereço já existente no projeto, home em /, login em /login e /site redirecionado. Não foi criado formulário que simule recebimento. AC-03 e AC-08 continuam pendentes; confirmação do canal, processo assistido e backend de leads são necessários antes dessa etapa. Não há envio de dados pela demonstração.
