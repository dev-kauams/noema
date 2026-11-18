## Design system (CSS)

### Princípios

Minimalista e editorial: preto **AMOLED** (`#000`), texto branco quente, um único destaque violeta, linhas finas em vez de caixas, **hover = texto em itálico** (nunca fundo colorido), sem setas ou ícones genéricos, fonte Plus Jakarta Sans (pesos 600/700 nos títulos) e uma tela de perfil que ocupa 100% da viewport.

### A ordem dos arquivos é a cascata

Os 12 arquivos são carregados em ordem numérica e **regras posteriores vencem as anteriores quando têm a mesma especificidade**:

| Arquivo | Papel |
|---|---|
| `00-tokens` | variáveis de cor (claro em `:root`, AMOLED em `:root:not([data-theme="light"])`) e `--d` (fonte) |
| `01-base` | reset, tipografia, foco, seleção, rolagem fina, botão fantasma `.gh` |
| `02-layout` | grade `#app`, painéis, `z-index`, escrims translúcidos sobre o fundo |
| `03-nav-list` | menu lateral, lista e painel de filtros |
| `04-editor` | título, barra de formatação, corpo, contador de capítulos |
| `05-zen` | modo Zen (inclui `body.zen #hm{display:none}`) |
| `06-overlays` | diálogos, paleta, seletor de cor, espaços |
| `07-home` | homepage gráfica |
| `08-onboarding` | criação de perfil em tela cheia e campos de data |
| `09-states` | estados transversais (hover em itálico, item atual); **depois** dos componentes, para vencê-los |
| `10-motion` | transições e a chave `[data-motion=off]` |
| `11-responsive` | todas as media queries, **por último** |

### Camadas (z-index) e o esqueleto

```text
 z=100  #ob        criação de perfil (transparente: deixa ver o fundo)
 z=60   #cp        painel do seletor de cor
 z=9    #ed (Zen)  editor em tela cheia
 z=1    #app       a interface
 z=0    #sk        canvas do fundo (pointer-events: none)
 base   body       fundo preto

 Desktop (>= 801 px), colunas 176 | 290 | 1fr   (210 | 360 | 1fr a partir de 1500 px)
 +----------+-------------+-----------------------------------+
 | nav      | #lp lista   | #ed editor                        |
 | espaços  | busca       | meta · título · tags · espaço     |
 | visões   | filtros     | barra de formatação (sticky)      |
 | tags     | notas       | sumário · corpo · links           |
 +----------+-------------+-----------------------------------+
 Início:  #hm ocupa as colunas 2 e 3 (lista e editor somem).
 Celular (<= 800 px): nav vira barra horizontal; lista em tela cheia;
 o editor abre por cima (position: fixed, fundo opaco).
```

Painéis (`nav`, `#lp`, `#ed`, `#hm`) e blocos da home têm fundo `color-mix(in srgb, var(--bg) 40–62%, transparent)`: o desenho de seda fica **abaixo** de tudo, mas o texto continua legível.

### Breakpoints (`11-responsive.css`)

| Condição | O que muda |
|---|---|
| `min-width: 1500px` | colunas maiores; conteúdo do editor centralizado |
| `max-width: 1100px` | colunas 150 / 250 e menos padding |
| `801px–920px` | colunas 132 / 224 |
| `max-width: 800px` | layout de celular (flex em coluna, editor sobreposto) |
| `max-width: 380px` | blocos da home em 1 coluna, barra mais compacta |
| `max-height: 520px` | celular deitado: letras do perfil proporcionais à altura |
| `pointer: coarse` | alvos de toque de 44 px; campos com 16 px (evita zoom do iOS) |

### Código literal de todos os arquivos CSS

<!-- codigo: src/css/00-tokens.css -->

<!-- codigo: src/css/01-base.css -->

<!-- codigo: src/css/02-layout.css -->

<!-- codigo: src/css/03-nav-list.css -->

<!-- codigo: src/css/04-editor.css -->

<!-- codigo: src/css/05-zen.css -->

<!-- codigo: src/css/06-overlays.css -->

<!-- codigo: src/css/07-home.css -->

<!-- codigo: src/css/08-onboarding.css -->

<!-- codigo: src/css/09-states.css -->

<!-- codigo: src/css/10-motion.css -->

<!-- codigo: src/css/11-responsive.css -->
