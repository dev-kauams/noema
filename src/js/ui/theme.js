/* Alternância de tema claro / AMOLED. */
// Aplica o tema (data-theme na raiz) e guarda a escolha. O canvas do fundo observa esse atributo.
function setTheme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem('noema-theme',t)}catch(e){}}
// Alterna entre o tema AMOLED (padrão) e o claro.
function toggleTheme(){setTheme(document.documentElement.dataset.theme!='light'?'light':'dark');if(typeof renderSettings=='function'&&$('#sg').open)renderSettings()}
