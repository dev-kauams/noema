# NOEMA

Sistema de pensamento, organização e memória digital: anotações com capítulos, espaços (Escola, Trabalho, Pessoal...), perfil criado em telas cheias, homepage gráfica, modo Zen, filtros, exportação de notas em PDF/TXT/JSON com toda a formatação, paleta de comandos e um fundo animado de seda em tema AMOLED. Roda no navegador sem servidor; com um projeto Firebase opcional, entra com Google ou e-mail e sincroniza entre aparelhos. Há também a base para empacotar um APK (Capacitor).

## Rodar

- **Desenvolvimento:** abra `index.html` no navegador.
- **Produção:** `npm run build` gera `dist/noema.html` (arquivo único).
- **Verificar / testar:** `npm run check` · `npm test` · `npm run test:export` · `npm run test:sync` (Playwright + Chromium).

## Estrutura

```text
src/css/   design system (12 arquivos; a ordem é a cascata)
src/js/    core · data · features · ui · app
scripts/   build, check, docs (Node, sem dependências)
tests/     teste de fumaça
docs/      explicação completa, com TODO o código literal
dist/      build final
```

## Documentação

Leia **[docs/README.md](docs/README.md)**: arquitetura, modelo de dados, fluxos (com diagramas), design system e o código literal de cada arquivo. Para regenerar: `npm run docs`.
