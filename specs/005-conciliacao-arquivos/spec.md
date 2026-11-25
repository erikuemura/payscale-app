# 005 — Importação CSV e conciliação verificável

Status: implementado e publicado em beta; QA de download pendente no navegador integrado.

## Problema e resultado esperado
Hoje o painel não importa recebíveis/extrato reais. Entregar o primeiro fluxo utilizável sem depender de integração externa: importar dois CSV padrão, validar, conferir prévia, conciliar e exportar resultado. Esta é uma análise temporária, não um livro financeiro persistido.

## Escopo e exclusões
CSV UTF-8 separado por ponto e vírgula, cabeçalho obrigatório `id;data;valor;referencia`, valores positivos em BRL (ponto ou vírgula decimal, sem milhar), datas ISO YYYY-MM-DD. Recebíveis usam valor líquido esperado e data de repasse; extrato contém somente créditos. Arquivos de uma única conta e BRL por análise. Até 1 MB e 2.000 registros por arquivo. Arquivo com erro é rejeitado integralmente. Sem OFX, XLSX, PDF, saldo, débitos, multimoeda, persistência, IA ou cobrança nesta entrega.

## Requisitos
- REQ-01: parser suporta BOM, CRLF, campos entre aspas, aspas escapadas; cabeçalhos extras/ausentes, linhas malformadas, IDs duplicados, valor zero/negativo, data inválida e limite excedido bloqueiam importação, com mensagem e linha.
- REQ-02: mostrar quantidade, total e primeiras 10 linhas antes da execução. Novo arquivo substitui o anterior desse tipo; erro remove prévia anterior e resultados. Nenhum envio, log, localStorage ou gravação de conteúdo.
- REQ-03: agrupar recebíveis por referência explícita de repasse + data. Somar centavos; somente um crédito de extrato com a mesma referência/data pode corresponder. Um recebível ou crédito não pode ser consumido duas vezes. Referência é texto exato, sensível a maiúsculas, com espaços externos removidos.
- REQ-04: soma igual → correspondência exata; diferença → revisar valor; múltiplos créditos com mesma chave → ambíguo, sem associação; ausência → sem correspondência. Não somar subconjuntos nem concluir atraso sem calendário. Diferença = crédito - esperado.
- REQ-05: exportação CSV contém IDs, referência, data, valores, diferença e regra, escapando fórmulas de planilha. Limpar análise apaga sessão e inputs. Mudanças nos arquivos invalidam resultados anteriores.
- REQ-06: /conciliar oferece ferramenta temporária sem login e sem dados do servidor. /dashboard/importacoes reutiliza o mesmo componente sob autenticação existente; menu aponta para ela. Avisos explicam limites; botão de exemplo usa dados fictícios claramente identificados.

## Critérios de aceitação
- AC-01 (REQ-01): CSV com aspas/BOM/CRLF é lido; datas impossíveis, valores inválidos, duplicidades e arquivo acima dos limites são rejeitados.
- AC-02 (REQ-03/04): dois recebíveis 100+50, mesma referência/data, crédito150 → exato; crédito145 → diferença -5; dois créditos → ambíguo; mesmo valor sem referência correspondente → sem correspondência.
- AC-03 (REQ-02/05): prévia precede execução; substituir/erro/limpar removem resultados; exportação conserva centavos e neutraliza fórmulas.
- AC-04 (REQ-06): interface móvel/desktop, labels/foco, estados vazios e resultados compreensíveis; rota autenticada continua protegida.

## Dados e segurança
Processamento local na memória; sem nova tabela ou API. Não usar arquivos financeiros reais para QA. Persistência futura exige empresa/conta/moeda, hash de importação, transação de banco e validação de isolamento.
