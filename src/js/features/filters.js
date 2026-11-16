/* Filtros combináveis: tags, período, favoritas, ordenação. */
// Estado padrão dos filtros.
const F0=()=>({tags:[],range:'any',from:'',to:'',by:'updated',fav:false,un:false,sort:'updated'});
let F=F0(),fOpen=false;
const fn=()=>F.tags.length+(F.range!='any'?1:0)+((F.from||F.to)?1:0)+(F.fav?1:0)+(F.un?1:0);
// Filtro de uma nota: tags (todas), sem tags, favoritas e período (por data de edição ou criação).
function matchF(n){if(F.tags.length&&!F.tags.every(t=>n.tags.includes(t)))return false;if(F.un&&n.tags.length)return false;if(F.fav&&!n.fav)return false;
 const t=n[F.by],d=new Date(),s0=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(),day=864e5;
 const lo={today:s0,'7':s0-6*day,'30':s0-29*day,year:new Date(d.getFullYear(),0,1).getTime()}[F.range];
 if(lo!==undefined&&t<lo)return false;if(F.from&&t<new Date(F.from+'T00:00:00').getTime())return false;
 if(F.to&&t>=new Date(F.to+'T00:00:00').getTime()+day)return false;return true}
const sortF=(a,b)=>F.sort=='old'?a.updated-b.updated:F.sort=='title'?ttl(a).localeCompare(ttl(b),'pt-BR'):F.sort=='created'?b.created-a.created:b.updated-a.updated;
function fpHTML(){const t={};notes.filter(n=>!n.trash).forEach(n=>n.tags.forEach(x=>t[x]=(t[x]||0)+1));
 const c=(k,x,l,on)=>`<button class="fc" data-f="${k}" data-x="${esc(x)}" aria-pressed="${on}">${l}</button>`;
 const tg=Object.keys(t).sort().map(x=>c('tag',x,'#'+esc(x)+' '+t[x],F.tags.includes(x))).join('')||'<span class="m">nenhuma tag ainda</span>';
 return `<div class="fp"><div class="m">tags (todas as marcadas)</div><div class="fr">${tg}</div>
 <div class="m">período</div><div class="fr">${[['any','Tudo'],['today','Hoje'],['7','7 dias'],['30','30 dias'],['year','Este ano']].map(([v,l])=>c('range',v,l,F.range==v&&!F.from&&!F.to)).join('')}</div>
 <div class="fr" style="margin-top:6px"><label class="m">de<input class="fdi" id="fd1" inputmode="numeric" maxlength="10" placeholder="dd/mm/aaaa" aria-label="Data inicial" value="${isoToBr(F.from)}"></label><label class="m">até<input class="fdi" id="fd2" inputmode="numeric" maxlength="10" placeholder="dd/mm/aaaa" aria-label="Data final" value="${isoToBr(F.to)}"></label></div>
 <div class="m">data considerada</div><div class="fr">${c('by','updated','Edição',F.by=='updated')}${c('by','created','Criação',F.by=='created')}</div>
 <div class="m">mostrar</div><div class="fr">${c('fav','','Favoritas',F.fav)}${c('un','','Sem tags',F.un)}</div>
 <div class="m">ordem</div><div class="fr">${[['updated','Recentes'],['old','Antigas'],['created','Criação'],['title','Título']].map(([v,l])=>c('sort',v,l,F.sort==v)).join('')}</div>
 <div class="fr" style="margin-top:12px"><button class="gh" data-f="clear" data-x="">Limpar filtros</button></div></div>`}
$('#lp').addEventListener('click',e=>{const b=e.target.closest('[data-f]');if(!b)return;const k=b.dataset.f,v=b.dataset.x;
 if(k=='open')fOpen=!fOpen;else if(k=='tag'){F.tags=F.tags.includes(v)?F.tags.filter(x=>x!=v):[...F.tags,v];F.un=false}
 else if(k=='range'){F.range=v;F.from=F.to=''}else if(k=='by')F.by=v;else if(k=='fav')F.fav=!F.fav;
 else if(k=='un'){F.un=!F.un;if(F.un)F.tags=[]}else if(k=='sort')F.sort=v;else if(k=='clear')F=F0();
 renderNav();renderList()});
$('#lp').addEventListener('input',e=>{const t=e.target;if(t.id!='fd1'&&t.id!='fd2')return;const d=t.value.replace(/\D/g,'').slice(0,8);t.value=d.length>4?d.slice(0,2)+'/'+d.slice(2,4)+'/'+d.slice(4):d.length>2?d.slice(0,2)+'/'+d.slice(2):d;
 const k=t.id=='fd1'?'from':'to',iso=t.value?brIso(t.value):'';if(iso===null||iso===F[k])return;F[k]=iso;F.range='any';const id=t.id;renderList();const n=$('#'+id);if(n){n.focus();n.setSelectionRange(n.value.length,n.value.length)}});
