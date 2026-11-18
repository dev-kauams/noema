## Modelo de dados e persistência

### Onde cada coisa é guardada

| Dado | Onde | Chave / nome |
|---|---|---|
| Notas | IndexedDB, banco `noema`, store `notes` (`keyPath: id`) | uma linha por nota |
| Perfil (nome, aniversário, espaços) | `localStorage` | `noema-profile` |
| Tema | `localStorage` | `noema-theme` (`light` ou ausente = AMOLED) |
| Preferência de animação | `localStorage` | `noema-motion` (`on`, `auto`, `off`) |

Nenhum dado sai do navegador. Se o armazenamento estiver bloqueado, o app avisa (barra do editor: "Só em memória") em vez de fingir que salvou.

### A nota (criada por `mk`)

| Campo | Tipo | Significado |
|---|---|---|
| `id` | string | identificador único (`crypto.randomUUID`) |
| `title` / `body` | string | título e **texto puro** (usado em busca, contagem e links) |
| `html` | string | conteúdo formatado, **sempre sanitizado** por `clean()` |
| `space` | string | nome do espaço (`''` = sem espaço) |
| `tags` | string[] | etiquetas |
| `fav`, `arch`, `trash`, `inbox` | boolean | favorita, arquivada, na lixeira, ainda na Inbox |
| `created`, `updated` | número (ms) | datas de criação e última edição |

### Regra de visibilidade (`inV`)

Uma única função decide se a nota aparece na visão atual; menu, contagens e lista usam a mesma regra, então nunca divergem. Ordem: espaço (se houver um selecionado) → lixeira → arquivo → inbox → favoritas → "Notas" (tudo que não está na inbox).

### Segurança do HTML

O conteúdo do editor é HTML. Antes de ser reinserido na tela (ao abrir uma nota ou importar um JSON), passa por `clean()`: remove `script`, `style`, `iframe`, `object`, `embed`, `link`, `meta`, `form` e todo atributo `on*` ou com `javascript:`. Colar no editor insere **só texto puro**. Todo texto do usuário que entra em `innerHTML` passa por `esc()`.

<!-- codigo: src/js/core/utils.js -->

<!-- codigo: src/js/core/state.js -->

<!-- codigo: src/js/data/indexeddb.js -->

<!-- codigo: src/js/data/notes.js -->

<!-- codigo: src/js/data/profile.js -->
