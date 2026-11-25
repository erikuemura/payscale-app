# 011 — Contexto por registro (S01)
REQ01: aceitar CSV legado de quatro colunas e formato contextual com empresa;conta;provedor;canal;moeda adicionais. IDs de empresa e conta são declarados pelo usuário, não verificados externamente.
REQ02: rejeitar contexto incompleto, moedas diferentes de BRL e mistura de empresas ou contas dentro de cada arquivo, antes de exibir totais.
REQ03: bloquear conciliação entre contextos divergentes ou entre arquivo contextual e legado. Provedor/canal podem diferir entre banco e adquirente.
REQ04: manter confirmação manual e aviso explícito de limitação para dois arquivos legados. Não alterar regras financeiras ou histórico existente.
AC01: duas empresas/contas no mesmo arquivo produzem erro, sem prévia ou total.
AC02: arquivos válidos com contas distintas ficam bloqueados mesmo após confirmação.
AC03: pares legados continuam funcionando; par misto bloqueia; contexto BRL igual funciona.
AC04: identificação aparece na prévia; modelos contextuais disponíveis.
