## Fundo de seda (design complexo)

Inspirado numa referência de tecido preto dobrado com fio de luz nas bordas. É desenhado em `<canvas id="sk">` fixo atrás de tudo (`z-index:0`), gerado por código (não é imagem).

**Por que é infinito.** O desenho acontece num sistema de coordenadas **rotacionado em −0,42 rad** e centrado na tela. A área desenhada é um quadrado de meia-aresta `L = hypot(w, h)/2 + 70`, maior que a diagonal da tela; qualquer viewport, de 320×568 a 3840×1080, cabe dentro dele (verificado numericamente nos quatro cantos). As pontas das curvas ficam sempre fora da vista e a animação é periódica (senos), sem reinício.

**Camadas.** São `N = max(8, ceil(2L/130))` faixas de espaçamento `sp = 2L/N`, pintadas de cima para baixo. A crista da faixa `i` é

`y(x) = Y_i + A_i·sin(f1·x + p1) + 0,42·A_i·sin(f2·x + p2)`

com `Y_i = −L + i·sp`, amplitude `A_i = sp·(0,6 + 0,4·sin(0,83i + 1,3))`, fases que deslizam com o tempo (`p1 = 0,34i + 0,21t`, `p2 = −0,52i + 0,16t`) e frequências levemente diferentes por camada. Faixas vizinhas quase paralelas, mas não idênticas, imitam as dobras do tecido.

**Pintura.** Cada faixa preenche só uma banda (a crista e a mesma curva deslocada `4,2·sp` para baixo), com degradê do cinza até o preto; as faixas seguintes cobrem o resto. Isso evita pintar a tela inteira dezenas de vezes (era o que travava). O **brilho da borda** é um traço fino por cima da crista, com um degradê horizontal de 25 paradas cuja opacidade é `sin(...)⁶ × rim`, o que faz a luz aparecer e sumir ao longo da curva.

**Sem inconsistências de arredondamento.** O tamanho do canvas vem de `getBoundingClientRect` e a escala é `canvas.width / w` (a razão real, não a densidade nominal), então não há desencontro por pixels fracionários. As curvas usam pontos médios com `quadraticCurveTo` (sem facetas). A resolução é limitada a 1,25× e o quadro a ~30 fps. Um `ResizeObserver` e o evento `orientationchange` redesenham; o canvas usa `100lvh` para não "pular" quando a barra do navegador móvel aparece.

<!-- codigo: src/js/ui/background.js -->
