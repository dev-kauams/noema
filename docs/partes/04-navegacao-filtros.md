## Navegação, lista e filtros

**Menu (`nav.js`).** Mostra *Início*, os **espaços** (cada um com contagem de notas não arquivadas), as **visões** (Inbox, Notas, Favoritas, Arquivo, Lixeira) e as tags. Trocar de espaço filtra tudo; estando na Início, vai para "Notas".

**Lista (`list.js`).** Aplica, nesta ordem: `inV` (visão + espaço) → busca por texto (título, corpo, tags) → `matchF` (filtros) → `sortF` (ordem). Na Inbox há o campo de captura rápida (Enter cria o item).

**Filtros (`filters.js`).** Estado em `F`: tags (a nota precisa ter **todas** as marcadas), sem tags, favoritas, período (Hoje, 7 dias, 30 dias, Este ano ou intervalo `dd/mm/aaaa`), qual data considerar (edição ou criação) e ordenação. A máscara de data digita as barras sozinha e só aplica o filtro quando a data é completa e existe no calendário.

<!-- codigo: src/js/ui/nav.js -->

<!-- codigo: src/js/ui/list.js -->

<!-- codigo: src/js/features/filters.js -->
