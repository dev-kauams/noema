## Movimento e animações

Há **três modos**, escolhidos no botão "Animações" do menu (ou pela paleta) e guardados em `noema-motion`:

| Modo | Efeito |
|---|---|
| **sim** (padrão) | sempre anima, mesmo que o sistema peça "reduzir movimento" |
| **auto** | segue `prefers-reduced-motion` do sistema |
| **não** | tudo estático: GSAP, fundo e transições (`html[data-motion=off] *{transition:none}`) |

`anim()` é a porta única: só devolve `true` se o GSAP carregou **e** `motionOn()`. Todas as animações de entrada passam por ela, então desligar o movimento é imediato. Se o GSAP falhar no endereço principal (cdnjs), o `<script>` tenta o jsDelivr.

As animações usam `gsap.from` com `clearProps`, para não deixar estilos inline que atrapalhem o CSS: a lista entra com atraso escalonado, o editor sobe em cascata, a home entra por blocos e o modo Zen faz fade.

<!-- codigo: src/js/core/motion.js -->

<!-- codigo: src/js/ui/animations.js -->
