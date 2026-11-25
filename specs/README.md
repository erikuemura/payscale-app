# Desenvolvimento orientado por especificações (SDD)

Neste repositório, SDD significa Spec-Driven Development. A especificação antecede mudanças de comportamento e acompanha sua implementação. Não depende de Claude, Codex ou de um gerador externo.

## Produto em desenvolvimento

- [Visão e entregas do SaaS](product.md)
- [005 — Conciliação por arquivos](005-conciliacao-arquivos/spec.md)
- [006 — Empresas e histórico](006-empresas-historico/spec.md)

- [007 — Home de gestão de pagamentos](007-home-gestao-pagamentos/spec.md)

- [008 — SEO e comunicação comercial](008-seo-conversao/spec.md)

## Fontes de contexto

- [Baseline](baseline.md): comportamento observado e limitações no commit de origem.
- [Migração inicial](001-codex-sdd/spec.md): escopo e aceitação desta organização.
- [Backlog](backlog.md): propostas futuras, sem implementação implícita.
- [Decisão de adoção](../docs/decisions/0001-sdd.md): convenções escolhidas.

## Ciclo de trabalho

1. Copie `_template` para `NNN-nome-curto` usando o próximo número disponível.
2. Preencha `spec.md`: problema, requisitos REQ, cenários AC, limites e dúvidas.
3. Preencha `plan.md`: arquivos envolvidos, dados, abordagem, riscos e validação.
4. Divida `tasks.md` em entregas verificáveis e implemente o escopo solicitado.
5. Execute verificações e registre resultado real em `validation.md`.
6. Atualize documentação e status. Concluído exige evidência para cada AC; bloqueios ficam explícitos.

Estados: rascunho → especificado → em implementação → validado. Use bloqueado quando um pré-requisito externo impedir validação. Decisões de negócio sem evidência continuam propostas, não requisitos aprovados.

Exemplo de pedido ao Codex: “Leia AGENTS.md e specs/baseline.md. Especifique e implemente a correção do seed descrita no backlog, com cenários de repetição, concorrência e falha parcial.”

## PRD de evolução aprovado para execução
[Pacote de negócio v1](produto-v1/LEIA-ME.md) · [Primeira fatia S01](010-contexto-importacao/spec.md). Estados de execução em produto-v1/PROGRESSO.md.

- [011 — Contexto por registro](011-contexto-por-registro/spec.md)
- [012 — Fila de pendências](012-fila-pendencias/spec.md)
- [013 — Simulador de pagamentos](013-simulador-pagamentos/spec.md)

- [014 — Passaporte da venda](014-passaporte-venda/spec.md)

- [015 — Auditoria de taxas por venda](015-auditoria-taxas/spec.md)

- [016 — Serviços de prevenção de chargebacks (proposta)](016-protecao-chargebacks/spec.md) · [Pesquisa de parceiros](016-protecao-chargebacks/pesquisa.md)

- [017 — Diagnóstico preventivo no passaporte](017-diagnostico-preventivo/spec.md)

- [018 — Central de chargebacks na área logada](018-central-chargebacks/spec.md)

- [019 — Área logada e central de trabalho](019-area-logada/spec.md)

- [020 — Guardar e retomar preparação por arquivo](020-retomar-preparacao/spec.md)

- [021 — Preparações salvas na conta (especificado, ambiente pendente)](021-preparacoes-na-conta/spec.md)

- [022 — SEO, contato e backend comercial](022-seo-contato-backend/spec.md) · [Prontidão do backend](022-seo-contato-backend/PRONTIDAO.md)

- [023 — Piloto assistido (publicado)](023-piloto-assistido/spec.md)
- [024 — Preparação para lançamento (implementação parcial, não ativada)](024-preparacao-lancamento/spec.md) · [Validação e pendências](024-preparacao-lancamento/validation.md)
