/* Atalhos globais de teclado. */
// Atalhos globais: Ctrl+K, Alt+N, Ctrl+. e Esc (ignorados durante a criação de perfil).
addEventListener('keydown',e=>{if(document.body.classList.contains('onb'))return;const k=e.key.toLowerCase();
 if((e.ctrlKey||e.metaKey)&&k=='k'){e.preventDefault();$('#pi').value='';pIdx=0;renderPal();$('#pal').showModal()}
 else if(e.altKey&&k=='n'){e.preventDefault();newNote()}
 else if((e.ctrlKey||e.metaKey)&&k=='.'){e.preventDefault();toggleZen()}
 else if(k=='escape'&&document.body.classList.contains('zen')&&!$('#pal').open&&!$('#dd').open)toggleZen()});
