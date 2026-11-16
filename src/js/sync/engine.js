/* Motor de sincronização. Regra: ganha a edição mais recente de cada nota (campo updated).
   Para não perder trabalho, se a nota mudou nos dois lados, a versão local vira uma "(cópia local)".
   Local: IndexedDB (fonte da verdade offline). Nuvem: Firestore. Cada nota tem `dirty` = ainda não enviada. */
const SYNC={state:'off',last:0,err:'',busy:false,timer:0,soon:0};
const skey=k=>'noema-'+k+'-'+(SES?SES.uid:'');       // chaves por conta: cursor de leitura e exclusões pendentes
const defaultSpaces=()=>['Escola','Trabalho','Pessoal'];
// Quantas alterações ainda não chegaram à nuvem (notas, exclusões e perfil).
const pendingCount=()=>SES?notes.filter(n=>n.dirty).length+lsGet(skey('tombs'),[]).length+(prof&&prof.dirty?1:0):0;
function syncStatus(st,err){SYNC.state=st;SYNC.err=err||'';paintSync();if(typeof renderSettings=='function'&&$('#sg')&&$('#sg').open)renderSettings()}
const hhmm=t=>new Date(t).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
const syncText=()=>({off:'Conectando…',idle:'Sincronizado'+(SYNC.last?' às '+hhmm(SYNC.last):'')+'.',busy:'Sincronizando…',offline:'Offline: '+pendingCount()+' alteração(ões) aguardando envio.',error:'Erro ao sincronizar: '+SYNC.err})[SYNC.state];
function paintSync(){const t=$('#sy');if(t)t.textContent=!SES?'só neste aparelho':({idle:'nuvem: sincronizado',busy:'nuvem: sincronizando…',offline:'nuvem: offline',error:'nuvem: erro',off:'nuvem: conectando…'})[SYNC.state]}
// Agenda uma sincronização (debounce); chamado após cada edição salva.
function syncSoon(ms){if(!SES)return;clearTimeout(SYNC.soon);SYNC.soon=setTimeout(syncNow,ms===undefined?2500:ms)}
const noteDoc=n=>({id:n.id,title:n.title,body:n.body,html:n.html,space:n.space,tags:n.tags,fav:n.fav,arch:n.arch,trash:n.trash,inbox:n.inbox,created:n.created,updated:n.updated,deleted:false});
// Exclusão definitiva vira "lápide" na nuvem, para os outros aparelhos também apagarem.
function syncTomb(id){if(!SES)return;const k=skey('tombs');lsSet(k,[...lsGet(k,[]),{id,t:Date.now()}]);syncSoon()}
// Traz da nuvem o que mudou desde o último cursor.
async function syncPull(){let changed=false;const since=lsGet(skey('pull'),0),rem=await fsChanged(SES.uid,since);let mx=since;
 for(const r of rem){mx=Math.max(mx,r.updated||0);const i=notes.findIndex(n=>n.id==r.id),l=notes[i];
  if(r.deleted){if(l&&!l.dirty){notes.splice(i,1);await rm(l.id).catch(()=>{});if(cur&&cur.id==l.id){cur=null;document.body.classList.remove('ed')}changed=true}continue}
  if(l&&(l.updated>=r.updated||(cur&&cur.id==l.id&&ver!=saved)))continue;     // local mais novo, ou o usuário está digitando nela
  if(l&&l.dirty&&(l.html!==r.html||l.title!==r.title)){const c=mk({...l,id:uid(),title:ttl(l)+' (cópia local)',updated:Date.now()});notes.push(c);await save(c)}
  const n=mk({...r,html:clean(r.html||''),dirty:false});delete n.deleted;if(i>=0)notes[i]=n;else notes.push(n);await save(n);if(cur&&cur.id==n.id){cur=n;renderEd()}changed=true}
 lsSet(skey('pull'),mx);
 const rp=await fsGetProfile(SES.uid);
 if(rp&&rp.name&&(rp.updated||0)>((prof&&prof.updated)||0)&&!(prof&&prof.dirty)){prof={...(prof||{}),name:rp.name,last:rp.last||'',bday:rp.bday||'',spaces:rp.spaces&&rp.spaces.length?rp.spaces:defaultSpaces(),updated:rp.updated,dirty:false};persistProf(true);paintProf();changed=true}
 return changed}
// Envia notas sujas, exclusões e o perfil, em lotes de 100. Só limpa `dirty` se a nota não mudou durante o envio.
async function syncPush(){const d=notes.filter(n=>n.dirty),snap=d.map(n=>n.updated),t=lsGet(skey('tombs'),[]);
 const items=[...d.map(n=>['notes',n.id,noteDoc(n)]),...t.map(x=>['notes',x.id,{id:x.id,deleted:true,updated:x.t,created:x.t,title:'',body:'',html:'',space:'',tags:[],fav:false,arch:false,trash:false,inbox:false}])];
 if(prof&&prof.dirty&&prof.name)items.push(['meta','profile',{name:prof.name,last:prof.last||'',bday:prof.bday||'',spaces:prof.spaces||[],updated:prof.updated||Date.now()}]);
 for(let i=0;i<items.length;i+=100)await fsCommit(SES.uid,items.slice(i,i+100));
 for(let k=0;k<d.length;k++)if(d[k].updated===snap[k]){d[k].dirty=false;await save(d[k])}
 if(t.length)lsSet(skey('tombs'),lsGet(skey('tombs'),[]).filter(x=>!t.some(y=>y.id==x.id&&y.t==x.t)));
 if(prof&&prof.dirty){prof.dirty=false;persistProf(true)}}
// Um ciclo completo: traz, depois envia. Nunca roda duas vezes ao mesmo tempo.
async function syncNow(){if(!SES||SYNC.busy)return;if(!navigator.onLine){syncStatus('offline');return}
 SYNC.busy=true;syncStatus('busy');
 try{const ch=await syncPull();await syncPush();SYNC.last=Date.now();syncStatus('idle');if(ch){renderNav();renderList();if(view=='home')renderHome();if(!cur)renderEd()}}
 catch(e){if(!SES)syncStatus('off');else syncStatus(navigator.onLine?'error':'offline',e&&e.message)}
 SYNC.busy=false}
function startSync(){if(!SYNC.timer)SYNC.timer=setInterval(syncNow,60000);if(SYNC.state=='off')syncStatus('off')}
// Apaga as notas e o perfil deste aparelho (a nuvem não é tocada).
async function wipeLocal(uid){notes=[];cur=null;prof=null;
 try{localStorage.removeItem('noema-profile');if(uid)['pull','tombs'].forEach(k=>localStorage.removeItem('noema-'+k+'-'+uid))}catch(e){}
 await clearAll().catch(()=>{});document.body.classList.remove('ed')}
// Depois de entrar: separa contas diferentes no mesmo aparelho, adota o perfil da conta e começa a sincronizar.
// Devolve true se a conta já tinha perfil.
async function afterAuth(){const owner=lsGet('noema-owner',null);
 if(owner&&owner!==SES.uid)await wipeLocal(owner);       // dados de OUTRA conta neste aparelho: nunca misturar
 lsSet('noema-owner',SES.uid);
 const rp=await fsGetProfile(SES.uid);
 if(rp&&rp.name){prof={...(prof||{}),name:rp.name,last:rp.last||'',bday:rp.bday||'',spaces:rp.spaces&&rp.spaces.length?rp.spaces:defaultSpaces(),updated:rp.updated||0,dirty:false};persistProf(true)}
 else if(prof&&prof.name){prof.dirty=true;persistProf(true)}        // perfil local sobe para a conta
 startSync();syncSoon(300);return !!(rp&&rp.name)}
// Sair: opcionalmente apaga os dados deste aparelho.
async function logout(wipe){const uid=SES&&SES.uid;clearTimeout(SYNC.soon);clearInterval(SYNC.timer);SYNC.timer=0;dropSession();
 if(wipe){await wipeLocal(uid);try{localStorage.removeItem('noema-owner')}catch(e){}}
 SYNC.state='off';paintSync()}
addEventListener('online',()=>syncSoon(500));
addEventListener('offline',()=>{if(SES)syncStatus('offline')});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncSoon(500)});
