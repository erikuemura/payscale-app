# PayScale Intelligence

Aplicação para conciliação financeira, auditoria de tarifas MDR e acompanhamento de chargebacks.
Next.js 16.2.6, React 19, TypeScript, Tailwind 4 e Supabase.

## Trabalhar no Codex

Abra esta pasta como projeto no Codex. As instruções estão em [AGENTS.md](AGENTS.md).
O processo de desenvolvimento orientado por especificações está em [specs/README.md](specs/README.md).
O [guia de migração](docs/codex-migration.md) explica o que foi transferido e o que depende do ambiente.

## Executar localmente

1. Instale Node.js compatível com a versão de Next.js do lockfile e npm.
2. Execute `npm ci`.
3. Copie `.env.example` para `.env.local` e preencha os valores do seu Supabase de desenvolvimento.
4. Em um banco de desenvolvimento novo, revise e aplique `supabase/schema.sql`. O script não é uma migração repetível: as políticas não usam `IF NOT EXISTS`.
5. Configure no Supabase os URLs de autenticação locais e o provedor Google, caso utilize OAuth. O callback da aplicação é `/auth/callback`.
6. Execute `npm run dev` e abra http://localhost:3000.

`SUPABASE_SERVICE_ROLE_KEY` é usada apenas no cadastro administrativo no servidor. Sem ela, essa rota responde `SERVICE_KEY_MISSING`; a página de cadastro contém um fluxo alternativo.
Não compartilhe `.env.local` nem coloque a chave administrativa em variáveis `NEXT_PUBLIC_*`.

## Verificar alterações

```sh
npm run lint
npx tsc --noEmit
npm run build
```

Ainda não há comando de testes automatizados. Build e tipagem não validam autenticação, políticas do banco nem comunicação com adquirentes.

## Estado do produto

As telas usam Supabase, mas a sincronização de adquirentes é simulada e a contestação de chargebacks é registrada localmente no banco. Consulte o [baseline](specs/baseline.md) antes de assumir comportamento operacional.
Dados de demonstração são inseridos por `POST /api/seed` na conta autenticada; use somente uma conta de desenvolvimento dedicada.
