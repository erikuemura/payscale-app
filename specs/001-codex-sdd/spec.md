# 001 — Migrar contexto para Codex e adotar SDD

Status: validado documentalmente; execução da aplicação não validada.

## Problema

Permitir desenvolvimento pelo Codex com contexto versionado e especificações antes de novas mudanças.

## Requisitos e aceitação

- REQ-01: contexto persistente. AC-01: AGENTS.md preserva orientação Next.js e inclui stack, comandos e leitura de specs/.
- REQ-02: fluxo SDD reutilizável. AC-02: existem templates de spec, plano, tarefas e validação, com critérios rastreáveis.
- REQ-03: baseline fiel. AC-03: documentação identifica arquivos de origem e distingue consultas reais de sincronização simulada.
- REQ-04: preparação reproduzível. AC-04: README descreve instalação e ambiente; .env.example contém somente placeholders e pode ser versionado.
- REQ-05: migração sem regressão funcional. AC-05: nenhum arquivo de src/, schema ou dependências é alterado.

## Fora do escopo

Implementar adquirentes, corrigir regras financeiras, migrar banco, transferir conversas privadas ou publicar no GitHub/produção.
