/* Perfil do usuário (nome, aniversário, espaços) no localStorage. */
// Lê o perfil; garante a lista padrão de espaços.
function loadProf(){try{prof=JSON.parse(localStorage.getItem('noema-profile'))}catch(e){prof=null}if(prof&&!Array.isArray(prof.spaces))prof.spaces=['Escola','Trabalho','Pessoal']}
function paintProf(){const p=$('#bset');if(p)p.title=prof&&prof.name?'Configurações de '+fullName():'Configurações'}
// Grava o perfil. Sem `keep`, carimba a edição (updated) e marca para envio à conta; com `keep`, só guarda (usado ao receber da nuvem).
const persistProf=keep=>{if(prof&&!keep){prof.updated=Date.now();prof.dirty=true}try{localStorage.setItem('noema-profile',JSON.stringify(prof))}catch(e){}if(!keep&&typeof syncSoon=='function')syncSoon()};
// Nome completo (nome + sobrenome): é o "autor" nas exportações.
const fullName=()=>prof?[prof.name,prof.last].filter(Boolean).join(' '):'';
