/* Autenticação via REST do Firebase Authentication (Identity Toolkit). Sem SDK: só fetch.
   E-mail e senha funcionam em qualquer lugar; Google usa o plugin nativo no Android ou o Google Identity Services no navegador. */
let SES=null;   // sessão: { uid, email, refresh, id, exp, provider }
const AUTH_ERR={EMAIL_EXISTS:'Já existe uma conta com este e-mail. Toque em "Já tenho conta".',INVALID_LOGIN_CREDENTIALS:'E-mail ou senha incorretos.',INVALID_PASSWORD:'E-mail ou senha incorretos.',EMAIL_NOT_FOUND:'E-mail ou senha incorretos.',USER_DISABLED:'Esta conta foi desativada.',TOO_MANY_ATTEMPTS_TRY_LATER:'Muitas tentativas. Tente de novo em alguns minutos.',INVALID_EMAIL:'E-mail inválido.',MISSING_PASSWORD:'Digite a senha.',OPERATION_NOT_ALLOWED:'Este método de login não está ativado no Firebase.',GOOGLE_CANCELLED:'Login com Google cancelado.',GOOGLE_NO_TOKEN:'O Google não devolveu a credencial.'};
// Mensagem em português para um erro técnico.
function authMsg(m){m=String(m||'');if(m.startsWith('WEAK_PASSWORD'))return 'A senha precisa ter pelo menos 6 caracteres.';
 if(/Failed to fetch|NetworkError|Load failed/i.test(m)||!navigator.onLine)return 'Sem conexão com a internet.';
 return AUTH_ERR[m]||AUTH_ERR[m.split(' ')[0]]||'Não foi possível entrar ('+m+').'}
async function authPost(path,body){const r=await fetch(`${NOEMA_CFG.authBase}/${path}?key=${encodeURIComponent(NOEMA_CFG.firebase.apiKey)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.error&&j.error.message)||'HTTP '+r.status);return j}
// Guarda a sessão (no localStorage) com a hora em que o idToken expira.
function setSession(j,provider){SES={uid:j.localId,email:j.email||(SES&&SES.email)||'',refresh:j.refreshToken,id:j.idToken,exp:Date.now()+(+j.expiresIn||3600)*1000,provider};lsSet('noema-session',SES);return SES}
const loadSession=()=>{SES=lsGet('noema-session',null);if(SES&&!SES.uid)SES=null};
function dropSession(){SES=null;try{localStorage.removeItem('noema-session')}catch(e){}}
const signUpEmail=(email,pw)=>authPost('accounts:signUp',{email,password:pw,returnSecureToken:true}).then(j=>setSession(j,'password'));
const signInEmail=(email,pw)=>authPost('accounts:signInWithPassword',{email,password:pw,returnSecureToken:true}).then(j=>setSession(j,'password'));
const resetPassword=email=>authPost('accounts:sendOobCode',{requestType:'PASSWORD_RESET',email});
// Troca a credencial do Google (idToken ou accessToken) por uma sessão do Firebase.
const signInGoogleToken=t=>authPost('accounts:signInWithIdp',{postBody:(t.id?'id_token='+t.id:'access_token='+t.access)+'&providerId=google.com',requestUri:/^https?:/.test(location.origin)?location.origin:'http://localhost',returnIdpCredential:true,returnSecureToken:true}).then(j=>setSession(j,'google'));
// idToken válido: renova com o refreshToken um minuto antes de vencer.
async function freshToken(){if(!SES)throw new Error('SEM_SESSAO');if(Date.now()<SES.exp-60000)return SES.id;
 const r=await fetch(`${NOEMA_CFG.tokenBase}/token?key=${encodeURIComponent(NOEMA_CFG.firebase.apiKey)}`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(SES.refresh)});
 const j=await r.json().catch(()=>({}));
 if(!r.ok){const m=(j.error&&j.error.message)||'HTTP '+r.status;if(/TOKEN_EXPIRED|USER_DISABLED|USER_NOT_FOUND|INVALID_REFRESH_TOKEN/.test(m))dropSession();throw new Error(m)}
 SES={...SES,id:j.id_token,refresh:j.refresh_token||SES.refresh,exp:Date.now()+(+j.expires_in||3600)*1000};lsSet('noema-session',SES);return SES.id}
// ---- Google ----
const nativeGoogle=()=>window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.FirebaseAuthentication;
const googleAvailable=()=>syncOn()&&!!(nativeGoogle()||NOEMA_CFG.googleWebClientId);
const loadGsi=()=>window.google&&google.accounts?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=ok;s.onerror=()=>no(new Error('Failed to fetch'));document.head.appendChild(s)});
async function googleToken(){const P=nativeGoogle();
 if(P){const r=await P.signInWithGoogle({skipNativeAuth:true}),c=r&&r.credential;if(!c||!(c.idToken||c.accessToken))throw new Error('GOOGLE_NO_TOKEN');return c.idToken?{id:c.idToken}:{access:c.accessToken}}
 await loadGsi();
 return new Promise((res,rej)=>google.accounts.oauth2.initTokenClient({client_id:NOEMA_CFG.googleWebClientId,scope:'openid email profile',
  callback:r=>r.access_token?res({access:r.access_token}):rej(new Error('GOOGLE_CANCELLED')),error_callback:()=>rej(new Error('GOOGLE_CANCELLED'))}).requestAccessToken({prompt:'select_account'}))}
const signInGoogle=async()=>signInGoogleToken(await googleToken());
