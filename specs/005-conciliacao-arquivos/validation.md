# Validação — 2026-11-04

## Evidências
- AC-01: testes node:test de BOM, CRLF, aspas, datas inválidas, valores, IDs duplicados e limites passaram. Upload pelo navegador de arquivo com 2026-02-30 mostrou “Linha 2: data inexistente”.
- AC-02: oito testes de comportamento passaram, cobrindo agrupamento, diferenças, ambiguidade, datas/referências distintas, preservação de IDs e totais e exportação segura.
- AC-03: arquivos public/modelos/recebiveis.csv e extrato.csv importados via seletor nativo. Prévias 4/R$430 e 3/R$385. Botão habilita somente após confirmação. Resultado: 1 grupo exato, diferença -R$5, recebível80 sem crédito e crédito40 sem recebível. Arquivo inválido removeu resultados e desmarcou confirmação; limpar removeu todos os dados.
- Exportação: conteúdo CSV testado automaticamente; acionamento do botão executado no navegador integrado, mas ele não disponibilizou evento/caminho de download. Entrega do arquivo ao usuário não confirmada nesse navegador; registrar como limite de QA, não como aprovação end-to-end.
- AC-04: inspeção desktop 1440 e celular390. Documento móvel 385px de largura útil e scrollWidth385; tabelas têm rolagem própria. IDs receberam largura mínima após revisão visual. Autenticação com usuário real não exercitada.
- TypeScript e ESLint direcionado: passaram. Revisão React: estado em handlers, leitura assíncrona com controle de versão, sem efeitos para estado derivado; arquivos permanecem em memória.
- Build Vercel aprovado. Deployment `dpl_FwhdHbnzhoh35oqFh51D7QxHwngc` READY e promovido. https://www.payscale.com.br/conciliar respondeu HTTP200 e demonstrou os resultados no navegador. /dashboard/importacoes sem sessão retornou307 para /login?redirect=%2Fdashboard%2Fimportacoes.
- Lint global: 15 erros e 7 avisos preexistentes; lint direcionado sem erros.

## Limites
Sem persistência, IA, OFX/XLSX, cobrança, conciliação por tolerância de dias ou multiempresa. Dados fictícios utilizados na validação; nenhum seed, SQL, token de adquirente ou documento financeiro real utilizado. Lint global possui erros preexistentes e é registrado separadamente.
