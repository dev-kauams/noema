/* Seletor de cor próprio (substitui o input nativo). */
const SW=[['Padrão',null],['Violeta','#8b7be8'],['Azul','#4a86e8'],['Verde','#3fa46f'],['Amarelo','#d4a72c'],['Laranja','#e07a2f'],['Vermelho','#d9463e'],['Rosa','#d65ca3'],['Cinza','#8a8880']];
$('#cp .sw').innerHTML=SW.map(([n,c])=>`<button class="swb${c?'':' def'}" data-col="${c||''}" aria-label="${n}" title="${n}"${c?` style="background:${c}"`:''}></button>`).join('');
function openCP(){const p=$('#cp'),b=$('#cb');if(!p.hidden)return closeCP();p.hidden=false;const r=b.getBoundingClientRect(),h=p.offsetHeight,w=p.offsetWidth;let top=r.bottom+8;if(top+h>innerHeight-8)top=Math.max(8,r.top-h-8);
 p.style.top=top+'px';p.style.left=Math.max(8,Math.min(r.left,innerWidth-w-8))+'px';b.setAttribute('aria-expanded','true');if(anim())gsap.from(p,{opacity:0,y:-6,duration:.25,ease:'power2.out',clearProps:'transform,opacity'})}
function closeCP(){const p=$('#cp');if(p.hidden)return;p.hidden=true;const b=$('#cb');if(b)b.setAttribute('aria-expanded','false')}
// Aplica a cor. 'Padrão' usa uma cor-marca e depois remove a propriedade, voltando à cor do tema.
function setCol(c){const MK='#010203';fmt('foreColor',c||MK,true);if(!c)$$('#bo [style*="color"]').forEach(e=>{if(e.style.color=='rgb(1, 2, 3)'){e.style.removeProperty('color');if(!e.getAttribute('style'))e.removeAttribute('style')}});
 onEdit();const s=$('#cs');if(s)s.style.borderBottomColor=c||'var(--acc)';closeCP()}
$('#cp').addEventListener('mousedown',e=>{if(e.target.id!='hx')e.preventDefault()});
$('#cp').addEventListener('click',e=>{const b=e.target.closest('.swb');if(b)setCol(b.dataset.col||null)});
$('#hx').onkeydown=e=>{if(e.key=='Enter'){e.preventDefault();let v=e.target.value.trim();if(v&&v[0]!='#')v='#'+v;if(/^#[0-9a-f]{6}$/i.test(v)){e.target.removeAttribute('aria-invalid');e.target.value='';setCol(v)}else e.target.setAttribute('aria-invalid','true')}else e.target.removeAttribute('aria-invalid')};
document.addEventListener('mousedown',e=>{const p=$('#cp');if(!p.hidden&&!p.contains(e.target)&&!e.target.closest('#cb'))closeCP()});
addEventListener('keydown',e=>{if(e.key=='Escape'&&!$('#cp').hidden){closeCP();e.stopImmediatePropagation()}},true);
