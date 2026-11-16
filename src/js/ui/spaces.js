/* Gerenciador de espaços (Escola, Trabalho...). */
function openSpaces(){if(!prof)return;renderSL();$('#sd').showModal()}
function renderSL(){$('#sl').innerHTML=prof.spaces.map((s,i)=>`<div class="sr"><input value="${esc(s)}" data-i="${i}" maxlength="24" aria-label="Nome do espaço"><button class="gh d" data-rm="${i}">Remover</button></div>`).join('')||'<p class="m">Nenhum espaço ainda.</p>'}
$('#sl').addEventListener('change',async e=>{const i=+e.target.dataset.i,old=prof.spaces[i],nv=e.target.value.trim();
 if(!nv||prof.spaces.some((s,j)=>j!=i&&s.toLowerCase()==nv.toLowerCase())){e.target.value=old;return}
 prof.spaces[i]=nv;await Promise.all(notes.filter(n=>n.space===old).map(n=>{n.space=nv;n.updated=Date.now();n.dirty=true;return save(n)}));if(SP===old)SP=nv;persistProf();renderNav();renderList();if(view=='home')renderHome()});
$('#sl').addEventListener('click',async e=>{const b=e.target.closest('[data-rm]');if(!b)return;if(!b.dataset.arm){b.dataset.arm=1;b.textContent='Confirmar remoção';return}
 const old=prof.spaces[+b.dataset.rm];prof.spaces.splice(+b.dataset.rm,1);await Promise.all(notes.filter(n=>n.space===old).map(n=>{n.space='';n.updated=Date.now();n.dirty=true;return save(n)}));if(SP===old)SP=null;persistProf();renderSL();renderNav();renderList();if(view=='home')renderHome()});
$('#sn').addEventListener('keydown',e=>{if(e.key!='Enter')return;e.preventDefault();const v=e.target.value.trim();if(!v||prof.spaces.some(s=>s.toLowerCase()==v.toLowerCase()))return;prof.spaces.push(v);e.target.value='';persistProf();renderSL();renderNav();if(view=='home')renderHome()});
$('#sx').onclick=()=>$('#sd').close();
