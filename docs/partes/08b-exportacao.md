## Exportar nota: PDF, TXT, JSON e Markdown

No editor, o botão **Exportar** (ou a paleta, Ctrl+K → "Exportar nota") abre um diálogo com quatro formatos. **Todos preservam a formatação**: negrito, itálico, sublinhado, tachado, cor do texto, grifo (cor de fundo), tamanho, capítulos, tópicos e listas.

### Passo 1: do HTML da nota para "blocos com trechos" (`noteBlocks`)

O HTML do editor é sanitizado (`clean`) e percorrido. Cada bloco (`h1`, `h2`, `h3`, `p`, item de lista) vira uma lista de **trechos** (*runs*), e cada trecho carrega o texto e o estilo acumulado dos elementos pelos quais passou: `<b>`/`<strong>` → `bold`; `<i>`/`<em>` → `italic`; `<u>` → `underline`; `<s>` → `strike`; e, no atributo `style`, `color`, `background-color` (grifo), `font-weight`, `font-style`, `text-decoration` e `font-size`. As cores são lidas exatamente de `rgb()`/`rgba()` (o navegador normaliza o atributo) e guardadas como `hex` + alfa. Capítulos recebem numeração (`1.`, `2.`...), como o contador CSS do editor.

### Os formatos

| Formato | O que contém |
|---|---|
| **JSON** | metadados da nota, autor, crédito `@dev-kauams`, e para cada trecho: `text`, `bold`, `italic`, `underline`, `strike`, `color`, `background`, `backgroundAlpha`, `fontSizePx`; também o texto puro e o HTML original |
| **TXT** | texto legível com marcas: `**negrito**`, `_itálico_`, `__sublinhado__`, `~~tachado~~`, `==grifado==`, `{cor:#d9463e}…{/cor}`, `{tam:27px}…{/tam}`, com legenda no topo |
| **PDF** | página A4; **cabeçalho em todas as páginas** com o nome da aplicação (NOEMA) e a data; **rodapé em todas as páginas** com `@dev-kauams`, `Autor: <nome do perfil>` e `Página i de N`; corpo com todas as formatações |
| **Markdown** | capítulos `##`, tópicos `###`, listas `-` (o Markdown não tem cor nem grifo) |

### O gerador de PDF próprio (`pdf.js`)

Para não depender de biblioteca externa, o PDF é escrito à mão (PDF 1.4):

1. **Quebra de linha.** O texto vira *tokens* (palavras e espaços, cada um com seu estilo). A largura de cada token é medida num `canvas` com Arial a 100 px e escalada pelo tamanho; Arial e Helvetica têm as mesmas métricas, então o PDF (que usa a Helvetica do leitor) fica alinhado. Palavra maior que a linha é quebrada por caracteres.
2. **Desenho.** Cada trecho vira `BT /F<n> <tam> Tf <r g b> rg x y Td (texto) Tj ET`. A fonte é escolhida entre Helvetica, Bold, Oblique e BoldOblique conforme negrito/itálico. O grifo é um retângulo preenchido atrás do texto (o alfa já é misturado com o branco do papel); sublinhado e tachado são linhas finas.
3. **Páginas.** Antes de cada linha, se não couber acima da margem inferior, abre-se outra página.
4. **Cabeçalho e rodapé em 2 passadas.** Só depois de paginar tudo se sabe o total de páginas; então cada página recebe cabeçalho, rodapé e "Página i de N".
5. **Estrutura do arquivo.** Catálogo, árvore de páginas, 4 fontes, dicionário de informações (título, **autor**, criador) e, por página, um objeto página e um *stream*. A tabela `xref` guarda o deslocamento em bytes de cada objeto.
6. **Alfabeto.** Usa a codificação WinAnsi (todo o português, aspas, travessão, euro). Emoji e alfabetos não latinos viram `?`, e o diálogo avisa quantos caracteres foram trocados.

### Como o arquivo chega até você

`xSave` tenta, nesta ordem: (1) o recurso **downloads** do claude.ai quando a página está publicada (você confirma o salvamento); (2) o download normal do navegador, quando o `noema.html` é aberto no computador. Se a visualização não permitir download, TXT/JSON/Markdown são mostrados numa caixa para copiar e o PDF informa que precisa abrir o arquivo no computador.

### Verificação automática

`tests/export.py` cria uma nota com todas as formatações, gera os três arquivos e confere: o PDF tem várias páginas, **cada página** contém `NOEMA`, `@dev-kauams`, `Autor: <nome>` e `Página i de N`, o autor está nos metadados; o JSON marca corretamente negrito, itálico, sublinhado, cor `#d9463e`, grifo `#ffc800` e tamanho 27 px; o TXT contém todas as marcas.

<!-- codigo: src/js/features/pdf.js -->

<!-- codigo: src/js/features/export.js -->

<!-- codigo: tests/export.py -->
