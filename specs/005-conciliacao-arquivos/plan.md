# Plano

1. Motor puro TypeScript sem dependências externas: parser CSV estrito e agrupamento por referência/data.
2. Testes de comportamento via node:test, executados com TypeScript nativo do Node 24.
3. Componente compartilhado e CSS modular; rotas pública temporária e autenticada; modelos CSV locais.
4. Revisão de importação antes do botão de conciliar; exportação e reset.
5. Testar casos financeiros, tipagem, lint direcionado, build e interface. Registrar limitações sem chamar o incremento de SaaS completo.

Reversão: remover as duas rotas, item do menu e componente; sem alterações de banco. Risco principal: associação incorreta; mitigar pela exigência de referência/data e bloqueio de ambiguidades.
