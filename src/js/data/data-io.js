/* Backup: exportar e importar JSON com validação. */
function openData(txt,msg){$('#dt').value=txt;$('#dm').textContent=msg||'';$('#dd').showModal();$('#dt').select()}
$('#xj').onclick=()=>{$('#dt').value=JSON.stringify({app:'noema',v:2,notes},null,1);$('#dm').textContent=notes.length+' notas. Copie e guarde em um arquivo.';$('#dt').select()};
$('#xc').onclick=()=>$('#dd').close();
$('#ij').onclick=async()=>{let ok=0,bad=0;try{const j=JSON.parse($('#dt').value);if(!j||j.app!='noema'||!Array.isArray(j.notes))throw 0;
 for(const r of j.notes){if(!r||typeof r.id!='string'||typeof r.body!='string'||!Array.isArray(r.tags)){bad++;continue}const n=mk({...r,html:clean(r.html),dirty:true});const i=notes.findIndex(x=>x.id==n.id);if(i>=0)notes[i]=n;else notes.push(n);if(await save(n))ok++;else bad++}
 $('#dm').textContent=`Importadas: ${ok}. Com erro: ${bad}. Nada foi apagado.`;renderNav();renderList()}catch(e){$('#dm').textContent='JSON inválido: use um arquivo gerado pelo NOEMA.'}};
