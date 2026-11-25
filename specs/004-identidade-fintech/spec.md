# 004 — Identidade visual fintech

Status: validado e publicado.

## Problema e direção
Usuário rejeitou a identidade verde e solicitou referências Visa, Mastercard, Stripe e PayPal. Consultadas as páginas oficiais em 2026-11-03. Adotar composição própria com azul-marinho, azul elétrico, branco, tipografia sem serifa, grandes contrastes e visual de produto em camadas. Não reproduzir marcas, depoimentos ou métricas dessas empresas.

## Requisitos e aceitação
- REQ-01: substituir a identidade verde integralmente na página institucional; cabeçalho, hero, demonstração, seções e rodapé coerentes.
- REQ-02: manter calculadora, links, FAQ e menu acessíveis e funcionais. Não modificar cálculo ou backend.
- REQ-03: layout sem overflow em 390px e desktop, foco visível e respeito a movimento reduzido.
- AC-01: capturas desktop/móvel e inspeção visual.
- AC-02: cálculo 1000 / 3% / 4% resulta em diferença 10; menu e FAQ respondem.
- AC-03: lint direcionado, tipagem e build aprovados; publicar no projeto existente conforme autorização vigente.

## Plano
Reescrever CSS modular, refinar composição da abertura, testar localmente e publicar pela Vercel. Preservar configuração Supabase e DNS. Referências: https://www.visa.com.br/ ; https://www.mastercard.com/br/pt.html ; https://stripe.com/br ; https://www.paypal.com/br/home .
