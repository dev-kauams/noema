## Editor rico

O corpo da nota é um `<div contenteditable>`. A formatação usa `document.execCommand`, antigo mas ainda suportado, porque entrega negrito, itálico, cor e fundo sem escrever um motor de edição.

**Seleção parcial ou texto inteiro.** `fmt(cmd, valor, whole)` restaura a última seleção guardada (`lastR`, atualizada em `selectionchange`) antes de aplicar o comando. Por isso o botão pode ser clicado, ou um diálogo aberto, sem perder o trecho. Com `whole = true` e **sem seleção**, a função seleciona tudo, aplica e recolhe o cursor; é assim que "cor" e "tamanho" valem para o texto todo.

**Tamanho relativo (`size`).** O navegador só oferece 7 tamanhos fixos. A função aplica `fontSize=7` (cria `<font size="7">`) e troca cada `<font>` por um `<span>` cujo `font-size` é o tamanho **atual** do pai × 1,15 (ou × 0,87), limitado entre 10 px e 80 px. Assim, aumentar duas vezes cresce de forma acumulada.

**Capítulos e tópicos.** `h1` = capítulo, `h2` = tópico. A numeração dos capítulos não existe no HTML: é um contador CSS (`counter-increment` em `#bo h1`), então reordenar renumera sozinho. O **sumário** (`outline`) lê os `h1`/`h2` do corpo e cria links que rolam até eles.

**Cor "Padrão".** Não existe `execCommand` para remover só a cor. `setCol(null)` aplica uma cor-marca (`#010203`) e, em seguida, remove essa propriedade dos elementos, devolvendo o texto à cor do tema.

**Links entre notas.** `[[Título]]` no texto cria *referência de saída*; a nota citada mostra a *referência de entrada*. Se o título não existe, o botão vermelho cria a nota.

**Markdown.** `toMd` percorre os blocos do HTML: `h1` → `##`, `h2` → `###`, listas → `-`, o resto vira parágrafo. (O `#` simples é o título da nota.)

**Seletor de cor próprio.** O `<input type="color">` nativo não aceita estilo. O botão **Cor** abre um painel com 9 amostras e um campo hexadecimal (`#a99aef` + Enter), posicionado com `getBoundingClientRect` (abre para cima se faltar espaço) e fechado por clique fora ou Esc.

<!-- codigo: src/js/ui/editor.js -->

<!-- codigo: src/js/ui/color-picker.js -->
