# PayScale — produto SaaS de conciliação para e-commerce

Status: direção aprovada pelo usuário em 2026-11-04; entregas abaixo têm estados independentes.

## Resultado
Uma loja importa sua agenda de recebíveis e extrato, identifica correspondências e investiga diferenças com evidências. Pode contratar online quando autenticação, isolamento, cobrança e suporte estiverem verificados.

## Jornada
Conhecer → testar com arquivos → cadastrar empresa → importar → revisar → salvar histórico → assinar → acompanhar próximos períodos.

## Sequência de entregas
| Entrega | Resultado / dependências | Estado |
| --- | --- | --- |
| 005 — Arquivos e motor inicial | CSV padrão, prévia, validação, cruzamento exato e por lote explícito, exportação; dados na sessão | Publicada em beta; limite de QA de download registrado |
| 006 — Empresas e histórico | Empresas, membros, contas bancárias, arquivos privados, importações idempotentes, revisão reversível e trilha de auditoria; testes RLS com duas empresas | 006a preparada localmente; ativação depende de testes Supabase; 006b planejada |
| 007 — Formatos e fontes | OFX e XLSX, adaptador da primeira adquirente com arquivos anonimizados e casos reais; prévia de mapeamento | Planejada |
| 008 — Assistente de IA | Explicações vinculadas a evidências e sugestões revisáveis; avaliação de erros, custo, privacidade e resistência a instruções em arquivos | Planejada |
| 009 — Contratação online | Planos, checkout hospedado, webhooks idempotentes, assinatura, limites, cancelamento e portal; provedor/preços pendentes | Planejada |
| 010 — Operação assistida | Conexões autorizadas, processamento assíncrono, reprocessamento, alertas e observabilidade | Planejada |

## Regras transversais
- Dinheiro em centavos inteiros no motor; precisão e arredondamentos explicitados por formato.
- Não associar automaticamente apenas por valor. Referência, conta, moeda e data precisam de contexto.
- Correspondência encontrada não comprova cobrança indevida nem dinheiro recuperado.
- Todo resultado persistido deve rastrear fonte, versão de regra e alterações/reversões.
- IA não define valores, não executa transferências, não realiza baixa definitiva e não inventa fontes.
- Cada empresa só acessa seus dados; exportação, exclusão e retenção devem ser especificadas antes do armazenamento real.
- Não apresentar mocks, conectores simulados ou planos sem checkout validado como prontos.

## Indicadores a medir, sem metas inventadas
Tempo até a primeira conciliação; proporção de dados importáveis; correspondências confirmadas e corrigidas; pendências resolvidas; custo por conciliação; conversão de teste para assinatura.

## Pendências comerciais
Primeiro provedor de recebíveis, formatos reais, unidade de cobrança, preços, provedor de pagamento, política de retenção e conta Supabase de desenvolvimento. Especificações detalhadas das próximas entregas serão escritas antes de seus códigos.
