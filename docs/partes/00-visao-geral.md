# NOEMA: documentação técnica completa

Este documento explica **todo o projeto** e mostra, **literalmente**, cada arquivo de lógica (JavaScript), de design (CSS) e de automação. Os blocos de código abaixo são copiados dos arquivos reais por `scripts/docs.mjs`; por isso nunca ficam desatualizados.

<!-- indice -->

## Visão geral e como rodar

NOEMA é um app web de anotações: perfil criado em telas cheias, espaços (Escola, Trabalho, Pessoal...), homepage gráfica, editor com capítulos e formatação, modo Zen, filtros, exportação (PDF, TXT, JSON, Markdown), conta Google/e-mail com sincronização entre aparelhos, configurações em modal, paleta de comandos e fundo animado de seda. Tudo roda no navegador, **sem servidor e sem dependências** (só GSAP, carregado de CDN, para animar).

```bash
# desenvolvimento: abra index.html direto no navegador (arquivos separados)
# produção: um único arquivo
npm run build        # gera dist/noema.html
npm run check        # verifica sintaxe, arquivos órfãos e declarações duplicadas
npm run docs         # regenera este README com o código literal
npm test             # teste de fumaça (Playwright)
npm run test:export  # valida a exportação (Playwright + pypdf)
npm run test:sync    # valida conta e sincronização entre 2 aparelhos (servidor simulado)
```

### Estrutura de pastas

```text
noema/
├─ index.html              entrada de desenvolvimento: lista CSS e JS na ordem de carga
├─ package.json            scripts (check, build, docs, test)
├─ README.md               resumo curto do projeto
├─ src/
│  ├─ css/                 design system em 12 arquivos numerados (a ordem é a cascata)
│  └─ js/
│     ├─ core/             utils, state, motion        (base, sem dependência de tela)
│     ├─ data/             indexeddb, notes, autosave, profile, data-io   (dados e persistência)
│     ├─ sync/             config, auth, firestore, engine   (conta Google/e-mail e sincronização)
│     ├─ features/         filters, pdf, export        (busca e exportação PDF/TXT/JSON)
│     ├─ ui/               nav, list, editor, color-picker, date-fields, onboarding,
│     │                    home, spaces, settings, palette, theme, animations, background
│     └─ app/              shortcuts, boot             (cola e inicialização)
├─ firebase/firestore.rules  regras de segurança do banco (cada pessoa só vê o seu)
├─ capacitor.config.json   ponte para o aplicativo Android (veja a seção Android)
├─ noema.config.example.json  modelo da configuração de conta (copie para noema.config.json)
├─ scripts/                build.mjs, check.mjs, docs.mjs, android.mjs   (automação em Node)
├─ tests/                  smoke.py, export.py, sync.py e mock-firebase.mjs (servidor Firebase de mentira)
├─ docs/
│  ├─ partes/              textos de explicação (editáveis)
│  └─ README.md            ESTE arquivo (gerado)
└─ dist/noema.html         build final em arquivo único
```
