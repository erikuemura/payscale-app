# PayScale — instruções para Codex

## Contexto e escopo
- Aplicação de conciliação financeira, auditoria MDR e gestão de chargebacks, em português brasileiro.
- Stack: Next.js 16.2.6 App Router, React 19, TypeScript, Tailwind 4 e Supabase.
- Leia `specs/README.md`, `specs/baseline.md` e a especificação da mudança antes de implementar.
- `specs/baseline.md` descreve o código observado; não é promessa de funcionalidade validada.

## Fluxo SDD
- Para mudanças de comportamento, crie `specs/NNN-nome/` usando `specs/_template/`.
- Defina problema, escopo, requisitos identificáveis e critérios de aceitação antes do código.
- Registre plano, tarefas e evidências de validação; mantenha-os atualizados durante a execução.
- Correções pequenas podem usar uma especificação curta. Não exija confirmação repetida para trabalho já autorizado.
- Diferencie observado, proposto e validado. Nunca marque integração simulada como pronta para produção.
- Registre decisões arquiteturais relevantes em `docs/decisions/`.

## Convenções e limites
- Preserve interface pt-BR, organização `src/app`, alias `@/` e padrões existentes.
- Mantenha `supabase/schema.sql` e `src/lib/supabase/types.ts` coerentes quando alterar dados.
- Preserve isolamento por usuário; valide mudanças de RLS com duas contas em ambiente de teste.
- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no navegador, nos logs ou em arquivos versionados.
- Não use credenciais reais de adquirentes em dados de demonstração.
- Não execute seed ou SQL em produção como parte da preparação local.
- Não altere cálculos financeiros ou contrato de APIs sem especificar exemplos e tratamento de erros.

## Verificação
- Instalação reproduzível: `npm ci`; desenvolvimento: `npm run dev`.
- Verificações: `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Não existe suíte automatizada de testes no baseline. Acrescente testes de comportamento para novas regras críticas.
- Registre falhas preexistentes e bloqueios de ambiente sem alegar que verificações passaram.
- Testes de autenticação e banco exigem Supabase de desenvolvimento configurado.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
