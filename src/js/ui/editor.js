/* Editor rico: formatação, capítulos, sumário, links, Markdown e modo Zen. */
async function newNote(){await flush();const n=mk({space:SP||''});notes.push(n);view='all';document.body.classList.remove('home');await save(n);cur=n;ver=saved=0;document.body.classList.add('ed');renderNav();renderList();renderEd();$('#ti').focus()}
// Abre uma nota: grava a anterior antes, zera o controle de versão e mostra o editor.
async function openN(id){await flush();cur=notes.find(n=>n.id==id);delArm=false;lastEd=null;document.body.classList.remove('home');if(view=='home')view='all';ver=saved=0;document.body.classList.add('ed');renderList();renderEd()}
// Desenha o editor da nota atual (título, tags, espaço, barra, corpo, links). Sem nota, mostra a saudação.
function renderEd(){const E=$('#ed');if(!cur){E.innerHTML=(setTimeout(animHi,0),hiHTML());return}
 const n=cur;
 E.innerHTML=`<div class="meta"><button class="gh back" id="bk">Voltar</button><span class="m" id="st" role="status">${db?'Aberta':'Só em memória: nada será mantido ao fechar'}</span><span class="sp"></span><button class="gh" id="zn" title="Modo Zen (Ctrl+.)">Zen</button></div>
 <input id="ti" placeholder="Título" aria-label="Título"><input id="tg" class="m" placeholder="tags, separadas por vírgula" aria-label="Tags"><div class="fr" id="sps" role="group" aria-label="Espaço da nota" style="margin-bottom:14px"><button class="fc" data-sa="" aria-pressed="${!n.space}">Sem espaço</button>${((prof&&prof.spaces)||[]).map(s=>`<button class="fc" data-sa="${esc(s)}" aria-pressed="${n.space===s}">${esc(s)}</button>`).join('')}</div>
 <div class="tb" role="toolbar" aria-label="Formatação">
 <button data-c="h1" title="Capítulo" aria-label="Capítulo">Capítulo</button><button data-c="h2" title="Tópico" aria-label="Tópico">Tópico</button><button data-c="p" title="Texto normal" aria-label="Texto normal">Texto</button><i class="v"></i>
 <button data-c="b" title="Negrito (Ctrl+B)" aria-label="Negrito"><b>N</b></button><button data-c="i" title="Itálico (Ctrl+I)" aria-label="Itálico"><i>I</i></button><button data-c="u" title="Sublinhado (Ctrl+U)" aria-label="Sublinhado"><u>S</u></button><button data-c="hl" title="Grifar" aria-label="Grifar"><span style="background:rgba(255,200,0,.45);padding:0 4px">Grifar</span></button>
 <button data-c="cor" id="cb" title="Cor do texto (sem seleção, muda o texto todo)" aria-label="Cor do texto" aria-haspopup="true" aria-expanded="false"><span id="cs" style="border-bottom:3px solid var(--acc)">Cor</span></button><i class="v"></i>
 <button data-c="s-" title="Diminuir (sem seleção, o texto todo)" aria-label="Diminuir tamanho">A−</button><button data-c="s+" title="Aumentar (sem seleção, o texto todo)" aria-label="Aumentar tamanho">A+</button><button data-c="ul" title="Lista" aria-label="Lista">Lista</button><button data-c="rf" title="Limpar formatação" aria-label="Limpar formatação">Limpar</button></div>
 <div id="ol"></div><div id="bo" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Conteúdo" data-ph="Escreva. Use [[Nome de outra nota]] para criar um link."></div>
 <div class="meta" style="margin:22px 0 0;flex-wrap:wrap;gap:4px">${n.trash?`<button class="gh" data-a="rest">Restaurar</button><button class="gh d" data-a="del">${delArm?'Confirmar exclusão definitiva':'Excluir definitivamente'}</button>`:
 `${n.inbox?'<button class="gh" data-a="org">Mover para Notas</button>':''}<button class="gh" data-a="fav">${n.fav?'Desfavoritar':'Favoritar'}</button><button class="gh" data-a="arch">${n.arch?'Desarquivar':'Arquivar'}</button><button class="gh" data-a="trash">Lixeira</button>`}<button class="gh" data-a="exp">Exportar</button></div>
 <div id="links"></div><div class="m" id="wc" style="margin-top:14px"></div>`;
 $('#ti').value=n.title;$('#tg').value=n.tags.join(', ');
 $('#bo').innerHTML=clean(n.html||esc(n.body).split('\n').map(l=>'<p>'+(l||'<br>')+'</p>').join(''));
 try{document.execCommand('defaultParagraphSeparator',false,'p')}catch(e){}
 const bo=$('#bo');outline();wc();
 $('#ti').oninput=e=>{n.title=e.target.value;touch()};
 $('#tg').oninput=e=>{n.tags=[...new Set(e.target.value.split(',').map(s=>s.trim().replace(/^#/,'')).filter(Boolean))];touch()};
 bo.oninput=onEdit;
 bo.onpaste=e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'))};
 $('#bk').onclick=async()=>{await flush();document.body.classList.remove('ed')};
 $('#zn').onclick=toggleZen;
 animEd();
 renderLinks()}
function wc(){const w=$('#wc');if(w&&cur)w.textContent=(cur.body.trim()?cur.body.trim().split(/\s+/).length:0)+' palavras · criada em '+new Date(cur.created).toLocaleDateString('pt-BR')}
// Toda edição: copia HTML e texto puro, atualiza contagem e sumário e agenda o autosave.
function onEdit(){cur.html=$('#bo').innerHTML;cur.body=$('#bo').innerText;wc();outline();touch()}
// Sumário: capítulos (h1) e tópicos (h2) viram links que rolam até o título.
function outline(){const o=$('#ol');if(!o)return;const hs=$$('#bo h1,#bo h2');let c=0;
 o.innerHTML=hs.length?`<div class="m" style="margin-bottom:4px">sumário</div>`+hs.map((h,i)=>`<button data-h="${i}" class="${h.tagName=='H2'?'l2':''}">${h.tagName=='H1'?++c+'. ':''}${esc(h.textContent.trim()||'sem título')}</button>`).join(''):''}
// Guarda o último trecho selecionado no editor para formatar mesmo depois de clicar num botão.
document.addEventListener('selectionchange',()=>{const s=getSelection(),b=$('#bo');if(b&&s.rangeCount&&b.contains(s.anchorNode))lastR=s.getRangeAt(0).cloneRange()});
// Formata via execCommand. Sem seleção e com whole=true, aplica ao texto inteiro.
function fmt(cmd,val,whole){const b=$('#bo');b.focus();const s=getSelection();if(lastR&&b.contains(lastR.startContainer)){s.removeAllRanges();s.addRange(lastR)}
 let all=false;if(whole&&s.isCollapsed){document.execCommand('selectAll');all=true}
 document.execCommand('styleWithCSS',false,true);document.execCommand(cmd,false,val);if(all)getSelection().collapseToEnd();onEdit()}
// Tamanho relativo: troca <font size=7> por <span> com font-size em px, multiplicando o tamanho atual.
function size(f){const b=$('#bo');b.focus();const s=getSelection();if(lastR&&b.contains(lastR.startContainer)){s.removeAllRanges();s.addRange(lastR)}
 let all=false;if(s.isCollapsed){document.execCommand('selectAll');all=true}
 document.execCommand('styleWithCSS',false,false);document.execCommand('fontSize',false,'7');
 $$('#bo font[size="7"]').forEach(x=>{const px=parseFloat(getComputedStyle(x.parentElement).fontSize)*f,sp=document.createElement('span');sp.style.fontSize=Math.max(10,Math.min(80,px)).toFixed(1)+'px';sp.innerHTML=x.innerHTML;x.replaceWith(sp)});
 if(all)getSelection().collapseToEnd();onEdit()}
// Grifar/desgrifar: alterna a cor de fundo do trecho.
function hl(){const s=getSelection(),e=s.anchorNode&&(s.anchorNode.nodeType==1?s.anchorNode:s.anchorNode.parentElement);
 const on=e&&getComputedStyle(e).backgroundColor!='rgba(0, 0, 0, 0)'&&getComputedStyle(e).backgroundColor!='transparent';fmt('hiliteColor',on?'transparent':'rgba(255,200,0,.42)')}
// Backlinks ([[título]] em outras notas) e links de saída, com atalho para criar a nota inexistente.
function renderLinks(){const L=$('#links');if(!L||!cur)return;const t=cur.title.trim().toLowerCase();
 const inb=t?notes.filter(m=>m.id!=cur.id&&!m.trash&&m.body.toLowerCase().includes('[['+t+']]')):[];
 const out=[...new Set([...cur.body.matchAll(/\[\[([^\]\n]+)\]\]/g)].map(m=>m[1].trim()))];
 L.innerHTML=`<div class="m">referências de entrada</div>`+(inb.length?inb.map(m=>`<button data-open="${m.id}">${esc(ttl(m))}</button>`).join(''):'<div class="m">nenhuma</div>')+
 `<div class="m" style="margin-top:10px">referências de saída</div>`+(out.length?out.map(x=>{const f=notes.find(m=>!m.trash&&m.title.toLowerCase()==x.toLowerCase());return f?`<button data-open="${f.id}">${esc(x)}</button>`:`<button data-mk="${esc(x)}" style="color:#c0392b">${esc(x)} (inexistente: criar)</button>`}).join(''):'<div class="m">nenhuma</div>')}
// Exporta em Markdown: capítulos viram ##, tópicos ###, listas viram '-'.
function toMd(n){const t=document.createElement('template');t.innerHTML=clean(n.html);const o=[];t.content.childNodes.forEach(c=>{const x=c.textContent.trim();if(!x)return;const k=c.nodeName;
 o.push(k=='H1'?'## '+x:k=='H2'?'### '+x:k=='UL'||k=='OL'?[...c.children].map(l=>'- '+l.textContent.trim()).join('\n'):x)});
 return `# ${ttl(n)}\n\n`+(n.tags.length?n.tags.map(x=>'#'+x).join(' ')+'\n\n':'')+(n.html?o.join('\n\n'):n.body)+'\n'}
// Modo Zen: esconde a interface (classe body.zen).
function toggleZen(){if(!cur&&!document.body.classList.contains('zen'))return newNote().then(toggleZen);const z=document.body.classList.toggle('zen');if(z)document.body.classList.add('ed');const b=$('#zn');if(b)b.textContent=z?'Sair do Zen':'Zen';if(z)$('#bo').focus();if(anim())gsap.from('#ed>*:not(.tb)',{opacity:0,y:10,duration:.7,stagger:.06,ease:'power2.out',clearProps:'transform,opacity'})}
$('#ed').addEventListener('mousedown',e=>{if(e.target.closest('.tb button'))e.preventDefault()});
// Ações dos botões do editor, por delegação de eventos.
$('#ed').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.h!==undefined){const h=$$('#bo h1,#bo h2')[+b.dataset.h];if(h)h.scrollIntoView({block:'center'});return}
 const c=b.dataset.c;if(c){({h1:()=>fmt('formatBlock','<h1>'),h2:()=>fmt('formatBlock','<h2>'),p:()=>fmt('formatBlock','<p>'),b:()=>fmt('bold'),i:()=>fmt('italic'),u:()=>fmt('underline'),ul:()=>fmt('insertUnorderedList'),hl,'s+':()=>size(1.15),'s-':()=>size(.87),rf:()=>fmt('removeFormat',null,true),cor:openCP})[c]();return}
 if(b.dataset.sa!==undefined&&cur){cur.space=b.dataset.sa;ver++;await flush();return renderEd()}
 if(b.dataset.open)return openN(b.dataset.open);
 if(b.dataset.mk){await flush();const n=mk({title:b.dataset.mk});notes.push(n);await save(n);renderNav();return openN(n.id)}
 const a=b.dataset.a;if(!a||!cur)return;const n=cur;
 if(a=='exp'){await flush();return openExport()}
 if(a=='md'){await flush();return openData(toMd(n),'Markdown da nota. Copie o texto.')}
 if(a=='del'){if(!delArm){delArm=true;return renderEd()}await rm(n.id).catch(()=>{});syncTomb(n.id);notes=notes.filter(x=>x.id!=n.id);cur=null;delArm=false;document.body.classList.remove('ed');renderNav();renderList();return renderEd()}
 if(a=='fav')n.fav=!n.fav;if(a=='arch')n.arch=!n.arch;if(a=='trash')n.trash=true;if(a=='rest')n.trash=false;if(a=='org')n.inbox=false;
 ver++;await flush();if(!inV(n)){cur=null;document.body.classList.remove('ed')}renderNav();renderList();renderEd()});
