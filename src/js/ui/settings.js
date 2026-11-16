/* Configurações em modal: aparência (tema, animações), conta e sincronização, perfil, espaços e dados. */
let sgLogout=false,sgMsg='';
function openSettings(){sgLogout=false;sgMsg='';renderSettings();$('#sg').showModal()}
const sgBtn=(act,val,label,on)=>`<button class="fc" data-st="${act}" data-x="${val}" aria-pressed="${on}">${label}</button>`;
// Caixa de confirmação de saída (nunca sai sem perguntar o que fazer com os dados deste aparelho).
const sgOutBox=()=>{const p=pendingCount();return `<div class="sgx"><p class="sgp">${p?`Há <b>${p}</b> alteração(ões) ainda não enviada(s). Vou tentar enviar antes de sair.`:'Tudo já está sincronizado.'}</p><div class="fr"><button class="gh d" data-st="out-wipe">Sair e apagar dados deste aparelho</button><button class="gh" data-st="out-keep">Sair e manter dados aqui</button><button class="gh" data-st="out-no">Cancelar</button></div><p class="m sgp">Apagar remove as notas só deste aparelho; as da conta continuam na nuvem.</p></div>`};
function renderSettings(){const th=document.documentElement.dataset.theme=='light'?'light':'dark',p=prof||{};let acc;
 if(!syncOn())acc='<p class="m sgp">Sincronização não configurada nesta versão: suas notas ficam só neste aparelho. Para ativar conta Google ou e-mail, configure o Firebase (veja docs/README.md).</p>';
 else if(!SES)acc='<p class="m sgp">Você usa o NOEMA só neste aparelho.</p><div class="fr"><button class="gh" data-st="login">Entrar para sincronizar</button></div>';
 else acc=`<p class="sgp"><b>${esc(SES.email||'conta')}</b><span class="m"> · ${SES.provider=='google'?'Google':'e-mail e senha'}</span></p><p class="m sgp" id="sgs">${esc(syncText())}</p><div class="fr"><button class="gh" data-st="sync">Sincronizar agora</button><button class="gh d" data-st="logout">Sair</button></div>`+(sgLogout?sgOutBox():'');
 $('#sgb').innerHTML=`<section><h3 class="sgt">Aparência</h3><div class="sgr"><span>Tema</span><div class="fr">${sgBtn('theme','dark','AMOLED',th=='dark')}${sgBtn('theme','light','Claro',th=='light')}</div></div><div class="sgr"><span>Animações</span><div class="fr">${sgBtn('motion','on','Sim',motionPref=='on')}${sgBtn('motion','auto','Auto',motionPref=='auto')}${sgBtn('motion','off','Não',motionPref=='off')}</div></div></section>
 <section><h3 class="sgt">Conta</h3>${acc}</section>
 <section><h3 class="sgt">Perfil</h3><div class="sgf"><label class="m">Nome<input id="sgn" maxlength="40" autocomplete="given-name" value="${esc(p.name||'')}"></label><label class="m">Sobrenome<input id="sgl" maxlength="60" autocomplete="family-name" value="${esc(p.last||'')}"></label></div><div class="m" style="margin:12px 0 2px">Aniversário</div>${dtHTML().replace('class="dtf"','class="dtf sgd"').replace('id="oi"','id="sgoi"').replace('id="dd1"','id="sgd1"').replace('id="dd2"','id="sgd2"').replace('id="dd3"','id="sgd3"')}<div class="fr" style="margin-top:10px"><button class="gh" data-st="saveprof">Salvar perfil</button><span class="m" id="sgm" role="status">${esc(sgMsg)}</span></div></section>
 <section><h3 class="sgt">Espaços e dados</h3><div class="fr"><button class="gh" data-st="spaces">Gerenciar espaços</button><button class="gh" data-st="backup">Backup (JSON)</button></div></section>`;
 const h=$('#sgoi');if(h){h.value=p.bday||'';dtInit(h)}}
// Tema: atributo data-theme na raiz (o canvas do fundo observa a mudança).
function sgSaveProfile(){const n=$('#sgn').value.trim(),l=$('#sgl').value.trim(),b=$('#sgoi').value;
 if(!n||!l)return sgMsg='Preencha nome e sobrenome.';
 if($$('#sg .dtf input:not([type=hidden])').some(x=>x.value)&&!b||(b&&(b>ymd()||b<'1900-01-01')))return sgMsg='Data de aniversário inválida.';
 prof={...(prof||{}),name:n,last:l,bday:b};persistProf();paintProf();if(view=='home')renderHome();if(!cur)renderEd();return sgMsg='Perfil salvo.'}
async function sgSignOut(wipe){sgMsg='';$('#sgb').insertAdjacentHTML('afterbegin','<p class="m sgp" role="status">Saindo…</p>');
 await syncNow();
 if(wipe&&pendingCount()){sgLogout=true;renderSettings();$('#sgm').textContent='';return $('#sgb').insertAdjacentHTML('afterbegin','<p class="sgp" style="color:#c0392b" role="alert">Não consegui enviar tudo. Conecte-se à internet ou escolha "manter dados aqui".</p>')}
 await logout(wipe);$('#sg').close();view='home';SP=null;document.body.classList.add('home');
 if(wipe){boot()}else{renderNav();renderList();if(view=='home')renderHome()}}
$('#sgb').addEventListener('click',async e=>{const b=e.target.closest('[data-st]');if(!b)return;const a=b.dataset.st,x=b.dataset.x;
 if(a=='theme')setTheme(x);else if(a=='motion')setMotion(x);
 else if(a=='login'){$('#sg').close();return runOb('link')}
 else if(a=='sync'){syncNow();return}
 else if(a=='logout')sgLogout=true;else if(a=='out-no')sgLogout=false;
 else if(a=='out-keep')return sgSignOut(false);else if(a=='out-wipe')return sgSignOut(true);
 else if(a=='saveprof')sgSaveProfile();
 else if(a=='spaces'){$('#sg').close();return openSpaces()}
 else if(a=='backup'){$('#sg').close();return openData('','Cole um JSON aqui para importar, ou gere o backup.')}
 renderSettings()});
$('#sgx').onclick=()=>$('#sg').close();
$('#bset').onclick=openSettings;
