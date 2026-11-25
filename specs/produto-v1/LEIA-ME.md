# Guia de execução SDD — PayScale

Este pacote contém especificações de negócio, sem prescrever arquitetura ou código.

1. Leia CONTEXTO.md.
2. Escolha uma especificação e uma fatia pequena de requisitos.
3. Execute e verifique seus critérios de aceite.
4. Registre decisões em DECISOES.md e o estado em PROGRESSO.md.
5. Atualize a especificação antes de alterar uma regra; regenere a edição consolidada do PRD quando houver revisão aprovada.

Não carregue todos os arquivos em toda tarefa. O PRD consolidado é leitura de visão geral; as especificações são a unidade de execução.

## Módulos

- [S01 — Base de contexto e confiança](S01.md)
- [S02 — Conciliação e agenda de recebíveis](S02.md)
- [S03 — Taxas e negociação](S03.md)
- [S04 — Chargebacks e passaporte da venda](S04.md)
- [S05 — Prevenção e proteção do comprador](S05.md)
- [S06 — Conversão e recuperação de vendas](S06.md)
- [S07 — Parcelamento e política comercial](S07.md)
- [S08 — Caixa e antecipação](S08.md)
- [S09 — Crédito responsável com parceiros](S09.md)
- [S10 — IA contextual e medição de valor](S10.md)

## Prompt curto

Leia CONTEXTO.md e SXX.md. Trabalhe somente em [requisitos] e [aceites]. Preserve G01–G10. Consulte dependências apenas se necessário. Não invente condições ou capacidade de parceiro. Entregue a mudança e resuma verificação, pendências e decisões. Informações faltantes que bloqueiem ação financeira mantêm a saída como simulação; conclua o restante.

## Primeira sequência

S01 → S02 → S03/S04 → S05/S06/S07/S08 → S09. S10 acompanha cada módulo. Paralelismo de planejamento não elimina dependências de dados ou validação.

## Conclusão de uma fatia

Requisitos atendidos; critérios exercitados com resultado; limitações visíveis; efeito em módulos relacionados registrado. Se não há evidência suficiente para um aceite, marque pendente — não concluído.
