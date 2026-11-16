/* Entrada na conta e criação de perfil, em telas cheias, passo a passo.
   Telas: auth -> email -> pass (conta)  |  name -> last -> bday (perfil)  |  done. */
const OBP={name:{q:'Como devemos te chamar?',h:'Seu primeiro nome.',p:'Nome',ac:'given-name',max:40},
 last:{q:'E o seu sobrenome?',h:'Aparece como autor nas notas que você exporta.',p:'Sobrenome',ac:'family-name',max:60},
 bday:{q:'Quando é o seu aniversário?',h:'Só para te cumprimentar. Pode pular.',opt:1}};
const PSTEPS=['name','last','bday'];
const words=s=>s.split(' ').map(w=>`<span class="ow"><span class="oc">${esc(w)}</span></span>`).join(' ');
let obMode='new',obPw='signin';   // 'new' = primeiro acesso | 'link' = entrar numa conta a partir das Configurações
// Abre o overlay. Com sincronização configurada e sem conta, começa pela escolha de entrada.
function runOb(mode){obMode=mode||'new';obEdit=obMode=='link';obDone=false;obPw='signin';
 obTmp={name:prof&&prof.name||'',last:prof&&prof.last||'',bday:prof&&prof.bday||'',email:''};
 document.body.classList.add('onb');$('#app').inert=true;const o=$('#ob');o.hidden=false;o.style.cssText='';
 if(obEdit&&anim())gsap.fromTo(o,{opacity:0},{opacity:1,duration:.5});$('#ov').innerHTML='';
 obGo(syncOn()&&!SES?'auth':'name')}
// Mostra uma tela: a anterior sai para cima, as palavras da pergunta sobem de uma máscara, a linha do campo se desenha.
function obShow(html,bind){const ov=$('#ov'),old=ov.firstChild;
 const build=()=>{ov.innerHTML=html;if(bind)bind(ov.firstChild);fitOb();document.fonts&&document.fonts.ready.then(fitOb);
  const f=$('#dd1')||$('#oi')||$('#oen')||$('#oem')||$('#ov .obtn');if(f)f.focus({preventScroll:true});
  if(anim())gsap.timeline().from('.oc',{yPercent:115,duration:1,stagger:.07,ease:'power4.out'}).from('.oline',{scaleX:0,duration:1.1,ease:'expo.out'},.25).from('#ov .m,#ov .oin,#ov .oact,#ov .oopts,#ov .oerr',{opacity:0,y:14,duration:.7,stagger:.08,ease:'power3.out',clearProps:'transform,opacity'},.35)};
 if(old&&anim())gsap.to(old,{y:-30,opacity:0,duration:.4,ease:'power2.in',onComplete:build});else build()}
const obErr=t=>{const e=$('#ov .oerr');if(e)e.textContent=t};
const obBusy=(on,label)=>$$('#ov .obtn,#ov .gh').forEach(b=>{b.disabled=on;if(b.classList.contains('obtn')&&label&&on){b.dataset.t=b.textContent;b.textContent=label}else if(b.dataset.t){b.textContent=b.dataset.t}});
// Formulário de uma pergunta com um campo. cfg: { n, total, q, h, type, ph, ac, max, value, extra, back, onSubmit }
function obForm(c){obShow(`<form class="ovw" novalidate><span class="m">${c.n}</span><label class="oq" for="oi">${words(c.q)}</label><div class="oiw">${c.field||`<input id="oi" class="oin" type="${c.type||'text'}" placeholder="${c.ph||''}" autocomplete="${c.ac||'off'}" ${c.max?`maxlength="${c.max}"`:''}>`}<i class="oline"></i></div><p class="m">${esc(c.h)}</p><p class="oerr" role="alert"></p><div class="oact"><button class="obtn" type="submit">${c.ok||'Continuar'}</button>${c.extra||''}${c.back?'<button type="button" class="gh" id="obk">Voltar</button>':''}</div></form>`,f=>{
  const inp=$('#oi');if(c.value!==undefined)inp.value=c.value;if(c.init)c.init(inp);
  f.onsubmit=async e=>{e.preventDefault();obErr('');await c.onSubmit(inp.value,inp)};
  const bk=$('#obk');if(bk)bk.onclick=()=>c.back(inp.value);c.bind&&c.bind(f,inp)})}
// Roteador das telas.
function obGo(sc,opt){
 if(sc=='auth')return obShow(`<div class="ovw"><span class="m">conta</span><h2 class="oq">${words('Como você quer entrar?')}</h2><p class="m">Entre para sincronizar suas notas entre aparelhos.</p><p class="oerr" role="alert"></p><div class="oopts">${googleAvailable()?'<button class="obtn" id="ogo">Continuar com Google</button>':''}<button class="obtn" id="oem">E-mail e senha</button><button class="gh" id="oloc">${obMode=='link'?'Cancelar':'Usar só neste aparelho'}</button></div></div>`,()=>{
  const g=$('#ogo');if(g)g.onclick=async()=>{obErr('');obBusy(true,'Aguarde…');try{await signInGoogle();await obAfter()}catch(e){obBusy(false);obErr(authMsg(e.message))}};
  $('#oem').onclick=()=>obGo('email');$('#oloc').onclick=()=>{if(obMode=='link'){obDone=true;closeOb()}else obGo('name')}});
 if(sc=='email')return obForm({n:'conta',q:'Qual é o seu e-mail?',h:'Usaremos só para entrar na sua conta.',type:'email',ph:'voce@email.com',ac:'email',value:obTmp.email,back:()=>obGo('auth'),
  onSubmit:v=>{v=v.trim();if(!/^\S+@\S+\.\S+$/.test(v))return obErr('Digite um e-mail válido.');obTmp.email=v;obGo('pass')}});
 if(sc=='pass'){const up=obPw=='signup';return obForm({n:'conta',q:up?'Crie uma senha.':'Digite a sua senha.',h:up?'Mínimo de 6 caracteres.':obTmp.email,type:'password',ac:up?'new-password':'current-password',ok:up?'Criar conta':'Entrar',back:()=>obGo('email'),
  extra:`<button type="button" class="gh" id="otg">${up?'Já tenho conta':'Criar conta'}</button>${up?'':'<button type="button" class="gh" id="ofg">Esqueci a senha</button>'}`,
  bind:(f,inp)=>{$('#otg').onclick=()=>{obPw=up?'signin':'signup';obGo('pass')};const fg=$('#ofg');
   if(fg)fg.onclick=async()=>{try{await resetPassword(obTmp.email);obErr('Enviamos um link para redefinir a senha para '+obTmp.email+'.')}catch(e){obErr(authMsg(e.message))}}},
  onSubmit:async pw=>{if(!pw)return obErr('Digite a senha.');if(up&&pw.length<6)return obErr('A senha precisa ter pelo menos 6 caracteres.');
   obBusy(true,'Aguarde…');try{up?await signUpEmail(obTmp.email,pw):await signInEmail(obTmp.email,pw);await obAfter()}catch(e){obBusy(false);obErr(authMsg(e.message))}}})}
 if(PSTEPS.includes(sc)){const i=PSTEPS.indexOf(sc),p=OBP[sc],n=`0${i+1} / 0${PSTEPS.length}`,next=PSTEPS[i+1]||'done',prev=PSTEPS[i-1]||(syncOn()&&!SES&&obMode=='new'?'auth':null);
  const back=prev?v=>{if(sc!='bday')obTmp[sc]=v.trim();obGo(prev)}:null;
  if(sc=='bday')return obForm({n,q:p.q,h:p.h,field:dtHTML(),value:obTmp.bday,init:dtInit,back,extra:'<button type="button" class="gh" id="osk">Pular</button>',
   bind:()=>{$('#osk').onclick=()=>{obTmp.bday='';obGo('done')}},
   onSubmit:v=>{v=v.trim();if(($$('#ov .dtf input:not([type=hidden])').some(x=>x.value)&&!v)||(v&&(v>ymd()||v<'1900-01-01')))return obErr('Informe uma data válida que não seja no futuro.');obTmp.bday=v;obGo('done')}});
  return obForm({n,q:p.q,h:p.h,ph:p.p,ac:p.ac,max:p.max,value:obTmp[sc],back,onSubmit:v=>{v=v.trim();if(!v||v.length>p.max)return obErr(sc=='name'?'Digite como quer ser chamado, com até 40 letras.':'Digite o sobrenome, com até 60 letras.');obTmp[sc]=v;obGo(next)}})}
 if(sc=='done')return obDoneScreen(opt&&opt.back);
}
// Depois de entrar na conta: conta com perfil vai direto ao app; conta nova segue para o perfil.
async function obAfter(){const has=await afterAuth();paintSync();
 if(has||(obMode=='link'&&prof&&prof.name)){paintProf();obGo('done',{back:true})}else obGo('name')}
// Tela final. Perfil novo é gravado aqui; "back" = conta existente que só precisa entrar.
function obDoneScreen(back){if(!back){prof={...(prof||{}),name:obTmp.name,last:obTmp.last,bday:obTmp.bday,spaces:(prof&&prof.spaces)||defaultSpaces()};persistProf();paintProf();if(!notes.length)seedWelcome()}
 const ok=!!lsGet('noema-profile',null);
 obShow(`<div class="ovw"><span class="m">pronto</span><h2 class="oq" style="margin-block:18px 38px">${words((back?'Bem-vindo de volta, ':'Prazer, ')+prof.name+'.')}</h2><p class="m">${esc(!ok?'Seu navegador bloqueou o armazenamento: o perfil vale só nesta sessão.':SES?'Sincronizando com '+(SES.email||'sua conta')+'.':'Seu espaço está pronto.')}</p><div class="oact"><button class="obtn" id="oen">Entrar</button></div></div>`,()=>{
  $('#oen').onclick=()=>{obDone=true;closeOb()};if(ok)setTimeout(()=>{if(!obDone){obDone=true;closeOb()}},2800)})}
// Cortina: o clip-path sobe e revela o app por baixo.
function closeOb(){const o=$('#ob'),fin=()=>{o.hidden=true;o.style.cssText='';$('#ov').innerHTML='';document.body.classList.remove('onb');$('#app').inert=false;paintProf();renderNav();renderList();introApp()};
 if(anim())gsap.fromTo(o,{clipPath:'inset(0% 0 0% 0)'},{clipPath:'inset(0% 0 100% 0)',duration:.9,ease:'power4.inOut',onComplete:fin});else fin()}
$('#ob').addEventListener('keydown',e=>{if(e.key=='Escape'&&obEdit&&!obDone){obDone=true;closeOb()}});
// Reduz a fonte da pergunta até a maior palavra caber na largura da tela.
function fitOb(){const q=$('#ov .oq');if(!q)return;q.style.fontSize='';let s=parseFloat(getComputedStyle(q).fontSize);while(q.scrollWidth>q.clientWidth+1&&s>22){s-=2;q.style.fontSize=s+'px'}}
