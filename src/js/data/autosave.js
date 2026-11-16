/* Salvamento automático com estados reais (local, salvando, salvo, falha). */
// Mostra o estado de salvamento na barra do editor.
function setS(t,err){const s=$('#st');if(s){s.textContent=t;s.style.color=err?'#c0392b':''}}
// Chamado a cada edição: sobe a versão e agenda o salvamento em 500 ms (debounce).
function touch(){ver++;setS('Alterações locais…');clearTimeout(timer);timer=setTimeout(flush,500)}
// Grava a nota. Só escreve 'Salvo' se nenhuma edição nova chegou durante a gravação (v == ver).
async function flush(){clearTimeout(timer);timer=0;if(!cur||saved==ver)return;const v=ver,n=cur;n.updated=Date.now();n.dirty=true;setS('Salvando…');
 if(!await save(n))return setS('Falha ao salvar: exporte seus dados e tente de novo',1);
 if(v==ver){saved=v;setS(db?'Salvo às '+hm():'Só em memória: nada será mantido ao fechar',!db)}
 renderNav();renderList();renderLinks();syncSoon()}
