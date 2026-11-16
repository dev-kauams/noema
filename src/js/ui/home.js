/* Homepage gráfica: saudação, blocos por espaço, mapa de calor, recentes. */
// Saudação por horário e contagem regressiva do aniversário.
function hiHTML(){const n=prof&&prof.name||'',t=new Date(),h=t.getHours(),g=h<5?'Boa madrugada':h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';let b='';
 if(prof&&prof.bday){const [y,m,d]=prof.bday.split('-').map(Number),y0=t.getFullYear(),td=new Date(y0,t.getMonth(),t.getDate());
  if(m-1==t.getMonth()&&d==t.getDate())b=`Hoje é seu aniversário. Feliz ${y0-y} anos.`;else{let nx=new Date(y0,m-1,d);if(nx<td)nx=new Date(y0+1,m-1,d);b=Math.round((nx-td)/864e5)+' dias até o seu aniversário'}}
 return `<div class="hi"><div class="m">${esc(t.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'}))}</div><h1>${esc(g)}${n?',<br>'+esc(n)+'.':'.'}</h1><p class="m">${b}</p><p class="hk m">Alt+N nova nota · Ctrl+K comandos · Ctrl+. Zen</p></div>`}
// Home: tudo calculado dos dados reais (atividade por dia, blocos por espaço, recentes).
function renderHome(a){const H=$('#hm'),live=notes.filter(n=>!n.trash),sp=(prof&&prof.spaces)||[],t0=new Date();t0.setHours(0,0,0,0);
 const days=[];for(let i=97;i>=0;i--){const d=new Date(t0);d.setDate(d.getDate()-i);days.push(d)}
 const dk=t=>{const d=new Date(t);return d.getFullYear()*372+d.getMonth()*31+d.getDate()};
 const cnt=arr=>{const m={};arr.forEach(n=>{const k=dk(n.updated);m[k]=(m[k]||0)+1});return days.map(d=>m[dk(d)]||0)};
 const all=cnt(live),mx=Math.max(1,...all),pad=days[0].getDay();
 const tile=(key,label,arr)=>{const c=cnt(arr).slice(-14),m=Math.max(1,...c);return `<button class="tile hx" data-sp="${esc(key)}"><span class="tn">${arr.length}</span><span class="tl">${esc(label)}</span><span class="bars">${c.map(v=>`<i style="height:${4+Math.round(v/m*26)}px;opacity:${v?1:.22}"></i>`).join('')}</span></button>`};
 const un=live.filter(n=>!n.space);
 const rec=live.filter(n=>!n.arch&&!n.inbox&&(SP===null||n.space===SP)).sort((x,y)=>y.updated-x.updated).slice(0,5);
 H.innerHTML=`<div class="hx">${hiHTML()}</div><input id="hcap" class="hx" placeholder="Capturar um pensamento (Enter)" aria-label="Captura rápida">
 <div class="tiles">${sp.map(s=>tile(s,s,live.filter(n=>n.space===s))).join('')}${un.length?tile('__none','Sem espaço',un):''}</div>
 <div class="hg hx"><div><div class="m">notas editadas por dia, últimas 14 semanas</div><div class="heat">${Array.from({length:pad},()=>'<i style="visibility:hidden"></i>').join('')}${all.map((v,i)=>`<i title="${days[i].toLocaleDateString('pt-BR')}: ${v}" style="opacity:${v?(.28+.72*v/mx).toFixed(2):.08}"></i>`).join('')}</div></div>
 <div><div class="m" style="margin-bottom:6px">recentes</div>${rec.map(n=>`<button class="it" data-open="${n.id}"><b>${esc(ttl(n))}</b><span class="s">${esc(n.space||'Sem espaço')}</span></button>`).join('')||'<div class="empty">Nenhuma nota ainda.</div>'}</div></div>`;
 if(a&&anim())gsap.from('#hm .hx',{y:24,opacity:0,duration:.8,stagger:.08,ease:'power3.out',clearProps:'transform,opacity'})}
$('#hm').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.sp!==undefined){const v=b.dataset.sp;SP=v=='__none'?'':v;go('all')}
 else if(b.dataset.open){const n=notes.find(x=>x.id==b.dataset.open);if(!n)return;view=n.inbox?'inbox':'all';renderNav();openN(n.id)}});
$('#hm').addEventListener('keydown',async e=>{if(e.target.id!='hcap'||e.key!='Enter'||!e.target.value.trim())return;const v=e.target.value.trim(),n=mk({inbox:true,space:SP||'',body:v,html:'<p>'+esc(v)+'</p>'});notes.push(n);await save(n);renderNav();renderHome();$('#hcap').focus()});
