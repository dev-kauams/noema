/* Configuração de conta e sincronização (Firebase). Vazio = app 100% local.
   Preencha noema.config.json (modelo: noema.config.example.json); o build injeta window.NOEMA_CONFIG antes deste arquivo. */
const NOEMA_CFG=Object.assign({
 firebase:{apiKey:'',projectId:''},     // Console Firebase > Configurações do projeto (a apiKey do Firebase não é segredo)
 googleWebClientId:'',                  // ID de cliente OAuth do tipo "Web" (login Google no navegador)
 authBase:'https://identitytoolkit.googleapis.com/v1',
 tokenBase:'https://securetoken.googleapis.com/v1',
 firestoreBase:'https://firestore.googleapis.com/v1'   // troque por http://localhost:8080/v1 para usar o emulador
},window.NOEMA_CONFIG||{});
// Há conta e sincronização configuradas nesta versão?
const syncOn=()=>!!(NOEMA_CFG.firebase&&NOEMA_CFG.firebase.apiKey&&NOEMA_CFG.firebase.projectId);
// Leitura/escrita de JSON no localStorage sem lançar erro.
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
