/* Paleta de comandos (Ctrl+K) com busca incremental. */
// Comandos da paleta; as notas existentes também entram como comandos.
const cmds=()=>[['Ir para Início','',()=>go('home')],...((prof&&prof.spaces)||[]).map(s=>['Espaço: '+s,'',()=>{SP=s;go(view=='home'?'all':view)}]),['Todos os espaços','',()=>{SP=null;go(view=='home'?'all':view)}],['Gerenciar espaços','',openSpaces],['Nova nota','Alt+N',newNote],['Exportar nota (PDF, TXT, JSON)','',()=>{if(cur)openExport()}],['Modo Zen','Ctrl+.',toggleZen],['Nova captura','',()=>{go('inbox');setTimeout(()=>$('#cap').focus(),0)}],...VIEWS.map(([k,l])=>['Ir para '+l,'',()=>go(k)]),['Configurações','',openSettings],['Alternar animações','',cycleMotion],['Alternar tema','',toggleTheme],['Backup (exportar ou importar JSON)','',()=>openData('','Cole um JSON aqui para importar, ou gere o backup.')],['Sincronizar agora','',()=>syncNow()],
['Resumo com IA','',()=>{view='ai';renderNav();renderAi()}],
 ...notes.filter(n=>!n.trash).map(n=>['Abrir: '+ttl(n),'',()=>{view=n.arch?'archive':n.inbox?'inbox':'all';renderNav();openN(n.id)}])];
function renderPal(){const t=$('#pi').value.toLowerCase();shown=cmds().filter(c=>c[0].toLowerCase().includes(t)).slice(0,9);pIdx=Math.min(pIdx,Math.max(shown.length-1,0));
 $('#pl').innerHTML=shown.map((c,i)=>`<button role="option" data-i="${i}" aria-selected="${i==pIdx}"><span>${esc(c[0])}</span><span class="m">${c[1]}</span></button>`).join('')||'<div class="empty">Nenhum resultado.</div>'}
function runP(i){const c=shown[i];$('#pal').close();if(c)c[2]()}
$('#pi').oninput=()=>{pIdx=0;renderPal()};
$('#pi').onkeydown=e=>{if(e.key=='ArrowDown'){pIdx=Math.min(pIdx+1,shown.length-1);e.preventDefault()}else if(e.key=='ArrowUp'){pIdx=Math.max(pIdx-1,0);e.preventDefault()}else if(e.key=='Enter'){runP(pIdx);return}else return;renderPal()};
$('#pl').onclick=e=>{const b=e.target.closest('button');if(b)runP(+b.dataset.i)};
