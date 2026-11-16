/* Lista de notas e captura rápida. */
// Desenha a lista aplicando visão, espaço, busca, filtros e ordenação.
function renderList(){const L=$('#lp'),qq=q.toLowerCase();
 const rows=notes.filter(inV).filter(n=>matchF(n)&&(!qq||(n.title+' '+n.body+' '+n.tags.join(' ')).toLowerCase().includes(qq))).sort(sortF);
 L.innerHTML=`<h2 class="lh">${esc(SP===null?'Tudo':SP||'Sem espaço')}<span class="m">${esc((VIEWS.find(v=>v[0]==view)||[])[1]||'')}</span></h2><input id="q" type="search" placeholder="Buscar" aria-label="Buscar" value="${esc(q)}">`+`<button class="gh" data-f="open" aria-expanded="${fOpen}">Filtros${fn()?' ('+fn()+')':''}</button>`+(fOpen?fpHTML():'')+
 (view=='inbox'?`<input id="cap" placeholder="Capturar um pensamento (Enter)" aria-label="Captura rápida">`:`<button class="gh" id="nn" style="margin-bottom:8px">Nova nota</button>`)+
 (rows.length?rows.map(n=>`<button class="it" data-id="${n.id}" aria-current="${!!cur&&cur.id==n.id}"><b>${esc(ttl(n))}</b><span class="s">${esc(n.body.replace(/\s+/g,' ').slice(0,90)||'vazia')}</span><span class="m">${new Date(n.updated).toLocaleDateString('pt-BR')}${n.fav?' · favorita':''}</span></button>`).join(''):
 `<div class="empty">${view=='inbox'?'Nada pendente. Escreva o que passou pela cabeça e organize depois.':q||fn()?'Nenhuma nota para esse filtro.':'Esta lista está vazia.'}</div>`);
 $('#q').oninput=e=>{q=e.target.value;const p=e.target.selectionStart;renderList();const n=$('#q');n.focus();n.setSelectionRange(p,p)};
 const c=$('#cap');if(c)c.onkeydown=async e=>{if(e.key=='Enter'&&c.value.trim()){const n=mk({inbox:true,space:SP||'',body:c.value.trim(),html:'<p>'+esc(c.value.trim())+'</p>'});notes.push(n);await save(n)||setS('Falha ao salvar',1);renderNav();renderList();$('#cap').focus()}};
 const b=$('#nn');if(b)b.onclick=newNote}
$('#lp').addEventListener('click',e=>{const b=e.target.closest('.it');if(b)openN(b.dataset.id)});
