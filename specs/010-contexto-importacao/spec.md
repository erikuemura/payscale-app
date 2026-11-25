# 010 — Primeira fatia S01 do PRD v1
Status: fatia validada e publicada; S01 completo permanece pendente.

Escopo: S01-R03/R05, parte temporal de R01 e modo temporário de R02. Exercitar S01-A02; preservar modo temporário de A03. Pacote de negócio em ../produto-v1/ preservado como referência. Não confundir implantação desta fatia com conclusão de S01–S10.

- Mostrar fonte, horário de leitura e menor/maior data observada por arquivo.
- Sem arquivo: informar dados não recebidos, sem apresentar saldo zero.
- Intervalos diferentes: alertar cobertura potencialmente incompleta. Intervalos iguais não comprovam completude.
- Reimportar conteúdo normalizado idêntico, inclusive ordem distinta: informar repetição e não acumular registros. Comparação local, sem armazenamento persistente.
- Erro/novo arquivo/limpeza invalida resultado anterior. Preservar proteção contra leitura assíncrona obsoleta.
- Não alterar matching, exportação nem contrato CSV.

Pendentes: identificação de empresa/conta/provedor/canal/moeda por linha, bloqueio de mistura S01-A01, perfis S01-A04 e histórico autenticado. Não alegar esses aceites aprovados.
