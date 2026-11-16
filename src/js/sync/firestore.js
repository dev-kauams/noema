/* Cliente REST do Cloud Firestore: codifica/decodifica valores e faz gravação em lote e consulta incremental.
   Estrutura no banco:  users/{uid}/notes/{noteId}   e   users/{uid}/meta/profile   (regras em firebase/firestore.rules). */
const fsDocs=()=>`projects/${NOEMA_CFG.firebase.projectId}/databases/(default)/documents`;
// JS -> valor tipado do Firestore
const fsEnc=v=>v===null||v===undefined?{nullValue:null}:typeof v=='boolean'?{booleanValue:v}:typeof v=='number'?{integerValue:String(Math.round(v))}:Array.isArray(v)?{arrayValue:{values:v.map(fsEnc)}}:{stringValue:String(v)};
// valor tipado -> JS
const fsDec=f=>f.stringValue!==undefined?f.stringValue:f.integerValue!==undefined?+f.integerValue:f.doubleValue!==undefined?f.doubleValue:f.booleanValue!==undefined?f.booleanValue:f.arrayValue?(f.arrayValue.values||[]).map(fsDec):null;
const fsFields=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,fsEnc(v)]));
const fsObj=d=>Object.fromEntries(Object.entries(d.fields||{}).map(([k,v])=>[k,fsDec(v)]));
async function fsCall(path,opt){const tok=await freshToken();
 const r=await fetch(`${NOEMA_CFG.firestoreBase}/${fsDocs()}${path}`,{...opt,headers:{'Authorization':'Bearer '+tok,'Content-Type':'application/json'}});
 const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error((j.error&&(j.error.status||j.error.message))||'HTTP '+r.status);e.status=r.status;throw e}return j}
// Grava (substitui) vários documentos de uma vez: items = [[coleção, id, objeto]].
const fsCommit=(uid,items)=>fsCall(':commit',{method:'POST',body:JSON.stringify({writes:items.map(([col,id,obj])=>({update:{name:`${fsDocs()}/users/${uid}/${col}/${id}`,fields:fsFields(obj)}}))})});
// Notas alteradas depois de `since` (campo updated), em ordem crescente, de 200 em 200.
async function fsChanged(uid,since){const out=[];let s=since;
 for(;;){const j=await fsCall(`/users/${uid}:runQuery`,{method:'POST',body:JSON.stringify({structuredQuery:{from:[{collectionId:'notes'}],where:{fieldFilter:{field:{fieldPath:'updated'},op:'GREATER_THAN',value:{integerValue:String(s)}}},orderBy:[{field:{fieldPath:'updated'},direction:'ASCENDING'}],limit:200}})});
  const docs=j.filter(x=>x.document).map(x=>fsObj(x.document));out.push(...docs);if(docs.length<200)return out;s=docs[docs.length-1].updated}}
// Perfil da conta (ou null se ainda não existe).
async function fsGetProfile(uid){try{return fsObj(await fsCall(`/users/${uid}/meta/profile`,{method:'GET'}))}catch(e){if(e.status==404)return null;throw e}}
