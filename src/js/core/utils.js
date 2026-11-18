/* Funções puras e helpers de DOM: seletor, escape de HTML, sanitização, datas. */
// Atalhos de DOM: $ = querySelector, $$ = querySelectorAll (já como array).
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
// Escapa HTML antes de pôr texto do usuário em innerHTML (evita XSS).
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// Id estável e único de cada registro.
const uid=()=>(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));
const hm=()=>new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
// Sanitizador: remove script/style/iframe e atributos on*/javascript: do HTML salvo ou importado.
function clean(h){const t=document.createElement('template');t.innerHTML=h||'';t.content.querySelectorAll('script,style,iframe,object,embed,link,meta,form').forEach(e=>e.remove());
 t.content.querySelectorAll('*').forEach(e=>[...e.attributes].forEach(a=>{if(/^on/i.test(a.name)||/javascript:/i.test(a.value))e.removeAttribute(a.name)}));return t.innerHTML}
// Data local de hoje em AAAA-MM-DD.
const ymd=()=>{const t=new Date();return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0')};
const isoToBr=s=>s?s.split('-').reverse().join('/'):'';
// Converte dd/mm/aaaa em AAAA-MM-DD validando o calendário (31/02 é recusado).
const brIso=s=>{const m=/^(\d\d)\/(\d\d)\/(\d{4})$/.exec(s);if(!m)return null;const d=new Date(+m[3],+m[2]-1,+m[1]);return d.getFullYear()==+m[3]&&d.getMonth()==+m[2]-1&&d.getDate()==+m[1]?`${m[3]}-${m[2]}-${m[1]}`:null};
