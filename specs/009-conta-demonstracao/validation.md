# Validação — 06/11/2026
Conta criada pelo endpoint de cadastro existente e populada exclusivamente pela própria sessão (RLS existente), sem uso do seed genérico e sem alterar contas atuais. Três transações coerentes:1000/3%/970 liquidada;1000/3,5%/965 divergente contra3%;500/2%/490 pendente. Uma disputa parcial200 vinculada ao pedido1000; um alerta5. Sem integração conectada.
Senha incorreta retornou400; correta autenticou. Leitura autenticada de profiles retornou apenas o perfil da conta. Isto não substitui teste completo com duas contas de desenvolvimento; não houve alteração de RLS nesta entrega.
Login admin no navegador do domínio oficial chegou ao painel e exibiu banner de demonstração. A regra de onboarding foi ajustada para mostrar os exemplos sem integração ativa; verificação final concluída no domínio oficial: painel exibe2500 em volume,5 de divergência,1 chargeback200 e três transações (uma em cada situação).
TypeScript e25 testes aprovados. Build d58a914 aprovado e promovido; ajuste d99f5bc publicado: dpl_AyXXrevySJ3jApaG7C2YGmZBimJh, READY. Histórico continua desativado.
Correção de diagnóstico: valores sensitive retornados vazios pela Vercel não provam ausência de configuração. O bundle público aponta ao projeto correto e o cadastro/autenticação funcionam com as variáveis existentes. Nenhuma variável foi substituída.

Exemplo pendente ajustado exclusivamente pelo UUID sintético para status no_settlement, pois a tela legada mapeia pending incorretamente como conciliada. Corrigir esse mapeamento geral em entrega própria. Captura outputs/painel-demonstracao.png.
