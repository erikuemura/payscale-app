# Backlog proposto — ainda não implementado

As propostas abaixo vêm da inspeção estática. Priorização final depende do objetivo do produto.

1. **Separar demonstração de contas reais**: seed não pode sobrescrever integração real; repetir, executar em paralelo e recuperar falha parcial sem duplicação. Evidência: `src/app/api/seed/route.ts`.
2. **Proteger credenciais de adquirentes**: definir armazenamento no servidor e respostas sem tokens para navegador; testar isolamento entre usuários. Evidência: `handleConnect` e `.select()` em `src/app/dashboard/integracoes/page.tsx`.
3. **Implementar sincronização real**: escolher um provedor, especificar autenticação, paginação, deduplicação, falhas e rastreabilidade; atualizar última sincronização apenas após resultado comprovado.
4. **Especificar cálculos MDR e relatórios**: exemplos com taxa zero, valores nulos, diferentes volumes, arredondamento e períodos atravessando meses; resultados esperados aprovados pelo responsável do produto.
5. **Definir contestação operacional**: distinguir registro interno de envio ao adquirente, preservar metadados e registrar comprovante de envio.
6. **Definir cadastro e controles de abuso**: decidir confirmação de email, validação de entrada e limitação de tentativas antes de ampliar uso público.
7. **Criar testes e CI**: testes de regras financeiras e autorização, verificação de lint/tipagem/build e testes integrados em Supabase de desenvolvimento.

Para iniciar um item, crie uma especificação numerada. Este backlog não autoriza mudanças em produção.
