# PLANO — Fases 1 a 6 (NOEMA)

> Prazo: uma fase por dia, segunda a sábado. Cada fase tem entre 3 e 8 commits,
> é independente e não quebra o fluxo atual do projeto (será executada só na etapa 2).
> Validação pós-fase: `npm run check` + abrir `dist/noema.html` no navegador (quando
> houver). A pilha existente usa vanilla JS com funções de nível superior globais,
> IndexedDB e um modelo de "render\*" — os novos módulos seguem a mesma arquitetura,
> sem novas dependências.

## Estado inicial verificado

- O projeto está na branch `main`, ainda sem commits; os arquivos estão não rastreados.
- O núcleo existente cobre notas, editor rico, espaços, onboarding, home, filtros,
  exportação, backup, sincronização Firebase opcional, tema, animações e preparação Android.
- As lacunas confirmadas pela documentação eram: tarefas, lembretes, calendário, grafo,
  canvas e IA. Tarefas e lembretes foram implementados nas Fases 1 e 2; as demais
  correspondem às fases seguintes.
- `npm run check` e `npm run build` passam após a implementação da Fase 2.
- `npm test`, `npm run test:export` e `npm run test:sync` não executam neste ambiente
  porque o módulo Python `playwright` não está instalado; isso deve ser resolvido antes
  da validação comportamental de cada fase.

## Regras gerais de cada fase

- Cada novo módulo precisa de: camada de dados (store IndexedDB + factory + CRUD),
  camada UI (render\* + eventos), estilos CSS, e uma integração discreta
  (item no nav, opcionalmente paleta / configurações — só em fases posteriores).
- **Ordem importa**: novo `.js` deve vir depois dos seus dependentes no `index.html`
  (deps = core, data, etc.). `npm run check` impede duplicatas de função/const de
  nível superior.
- Não modificar arquitetura ou demais módulos; injetar novo código lado a lado.
- Não adicionar dependências npm (o app segue sem elas); integração por script
  carregado e lógica embutida.
- Cada fase marca conclusão em PLANO.md antes do próximo dia.

---

## Fase 1 — Tarefas (board/lista)

**Objetivo:** adicionar um painel de tarefas com CRUD, status e filtro, guardado
em IndexedDB, com item no menu navegação.

**Tarefas:**

1. `src/js/data/tasks.js`: store `tasks`, factory `mk`, `getAll/save/rm`,
   regras visíveis `matchT`.
2. `src/js/ui/tasks.js`: view `renderTasks`, loader de tarefas, botões de criação
   / edição, status toggle, favoritar.
3. CSS (em `09-states.css`): painel, botões, valores de status, classes
   `[data-view="tasks"]`.
4. Integração no nav (`nav.js`): novo item "Tarefas" (`data-v="tasks"`).
5. `docs/partes/16-tarefas.md`.

**Arquivos prováveis:** `src/js/data/tasks.js`, `src/js/ui/tasks.js`,
`src/css/09-states.css`, `src/js/ui/nav.js`, `index.html`,
`docs/partes/16-tarefas.md`.

**Critério de conclusão:**

- `npm run check` passa.
- Criação, edição, exclusão e status de tarefa funcionam no navegador.
- Dados persistem após reload.
- O app ainda abre normalmente sem erros.

**Commit estimado:** 4

---

## Fase 2 — Lembretes

**Objetivo:** lembretes vinculados a datas (prazo), listados próximos e descartáveis.

**Tarefas:**

1. `src/js/data/reminders.js`: store `reminders`, factory `mk`, filtro por
   data/prioridade/ativo.
2. `src/js/ui/reminders.js`: view `renderReminders`, botão "descartar", agrupamento
   por data.
3. CSS (estilos no `09-states.css` ou novo): caixa de lembrete, botão descartar.
4. Novo item no nav "Lembretes".

**Arquivos prováveis:** `src/js/data/reminders.js`, `src/js/ui/reminders.js`,
`src/css/09-states.css`, `src/js/ui/nav.js`, `index.html`.

**Critério de conclusão:**

- `npm run check` passa.
- Criar lembrete com data funciona; lista mostra próximas; descartar remove.
- Persistência após reload.

**Commit estimado:** 4

---

## Fase 3 — Calendário

**Status:** concluída em 2026-11-04. A view mensal deriva tarefas e notas dos
dados carregados, oferece navegação entre meses e revela os itens do dia
selecionado.

**Objetivo:** visão mensal do calendário com tarefas/notas agrupadas por dia.

**Tarefas:**

1. `src/js/ui/calendar.js`: view `renderCalendar(mes,ano)`, grid de 7 colunas,
   clique num dia → filho daquele dia.
2. `src/js/data/calendar.js`: helper `itemsOn(dateKey)` consulta tasks/notas
   computadas dos dados reais (sem novo store isolado — reusa o modulo data existente
   via cache, ou store pequeno local se necessário).
3. CSS (novo ou em `09-states.css`): grid do mês, células de dia, hover, classe
   `[data-cal="month"]`.
4. Integração no nav.

**Arquivos prováveis:** `src/js/ui/calendar.js`, `src/js/data/calendar.js`,
`src/css/*.css`, `src/js/ui/nav.js`, `index.html`.

**Critério de conclusão:**

- `npm run check` passa.
- Geração do mês mostram tarefas/notas por dia.
- Clique num dia revela itens; voltar mantém.
- Pesquisas e formatos não quebram.

**Commit estimado:** 5

---

## Fase 4 — Grafo

**Status:** implementada em 2026-11-04. O grafo deriva links de notas e
dependências de tarefas, com zoom e abertura por clique.

**Objetivo:** visualização relações entre tarefas (dependências, links de nota).

**Tarefas:**

1. `src/js/ui/graph.js`: view `renderGraph()` usando SVG/Canvas controlado pelo
   DOM (sem bibliotecas pesadas), nós tarefas + arestas, zoom básico, clique em nó → abrir
   tarefa.
2. `src/js/data/graph.js`: coletar relações dos dados existentes (tarefas, links
   [[...]], tags).
3. CSS (novo): containers do grafo, nós, arestas, tooltip.
4. Integração no nav.

**Arquivos prováveis:** `src/js/ui/graph.js`, `src/js/data/graph.js`,
`src/css/*.css`, `src/js/ui/nav.js`, `index.html`.

**Critério de conclusão:**

- `npm run check` passa.
- Gera grafos a partir de tarefas/links.
- Clique num nó abre a tarefa; zoom funcional.
- Não quebra listas, filtros, exportação.

**Commit estimado:** 5

---

## Fase 5 — Canvas (rascunho/desenho)

**Objetivo:** ferramenta de esboço livre em `<canvas>` anexada ao editor de
notas como recurso auxiliar (não substitui o editor principal).

**Tarefas:**

1. `src/js/ui/canvas.js`: trace draw, pincéis, limpar, exportar PDF.
2. `src/js/ui/canvas.js`: janela modal separada, paletas de cor/largura.
3. CSS (novo): modal, pincéis, contorno.
4. Integração discreta no menu (separada do editor principal).

**Arquivos prováveis:** `src/js/ui/canvas.js`, `src/css/*.css`, `index.html`.

**Critério de conclusão:**

- `npm run check` passa.
- Desenho livre funciona em todos os pincéis e cores.
- Limpar e exportar preservam o traço.
- Não interfere no editor principal.

**Commit estimado:** 4

---

## Fase 6 — IA

**Objetivo:** assistente leve (sem backend) que resume notas sugerindo keywords e
revisando frases-chave do texto.

**Tarefas:**

1. `src/js/features/ai.js`: helper de tokenização + resumo curto + sugestão de tags.
2. `src/js/ui/ai.js`: view `renderAi()` preview nos resultados recentes.
3. CSS (estilos no `09-states.css`): caixa de IA, sugestões.
4. Ícone/item discreto no menu ou paleta.

**Arquivos prováveis:** `src/js/features/ai.js`, `src/js/ui/ai.js`,
`src/css/09-states.css`, `index.html`.

**Critério de conclusão:**

- `npm run check` passa.
- Resumir nota retorna uma frase curta; sugerir tags testa semântica básica.
- Não vaza spoilers, não quebra busca nem exportação.

**Commit estimado:** 4

---

## Checklist de progresso

| Fase           | Dia     | Status                                        | Critérios acima OK? |
| -------------- | ------- | --------------------------------------------- | ------------------- |
| 1 — Tarefas    | Segunda | implementada; validação no navegador pendente | ☐                   |
| 2 — Lembretes  | Terça   | implementada; validação no navegador pendente | ☐                   |
| 3 — Calendário | Quarta  | pendente                                      | ☐                   |
| 4 — Grafo      | Quinta  | pendente                                      | ☐                   |
| 5 — Canvas     | Sexta   | pendente                                      | ☐                   |
| 6 — IA         | Sábado  | pendente                                      | ☐                   |

> Marcamos "concluída" logo que a validação (`check`) e as verificações
> físicas (abriu `dist/noema.html`, comportamento no navegador) passarem.

## Controle reverso

Cada fase fica isolada no branch `fase-N`; antes de desfazer o commit
inviável ou alterar arquitetura existente, pergunte. Segue o histórico de
commits locais (`git log --oneline`), não force push nem reescrita.
