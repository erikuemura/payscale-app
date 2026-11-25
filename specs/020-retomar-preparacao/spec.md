# 020 — Guardar e retomar preparação por arquivo

## Contexto
Persistência no Supabase depende de ambiente de desenvolvimento e teste de isolamento com duas contas. A criação do ambiente exige confirmação de custo, ainda pendente. Entrega independente: arquivo de trabalho local, sem alegar armazenamento na conta.

## Requisitos
- REQ01: exportar e reabrir dados do passaporte e referências de evidências, inclusive incompletos. Não inclui documentos originais, respostas do diagnóstico, relatórios gerados ou autenticação.
- REQ02: formato identificado/versionado, até 64 KiB, tipos e chaves estritos; rejeitar versões futuras, dados inválidos, campos extras e valores não textuais/booleanos esperados. Arquivo não executa conteúdo.
- REQ03: importar primeiro para revisão mostrando referência/provedor; só substituir após confirmação explícita. Cancelar ou falhar mantém preparação atual.
- REQ04: no caso selecionado da central, impedir arquivo com referência ou provedor diferentes do registro. Não alterar status ou banco.
- REQ05: exportação exige escolha de modalidade, informa download solicitado e limite de confidencialidade. Nenhum envio ao servidor/localStorage.
- REQ06: após restauração, invalidar relatório e diagnóstico antigos para revisão. Dados e checklist restaurados não representam evidências validadas.

## Aceitação
Round-trip preserva valores e fontes; casos incompletos aceitos; formato/tamanho/tipos/versão inválidos rejeitados; arquivo de outro caso rejeitado; cancelar mantém campos; restaurar preenche e permite nova revisão.
