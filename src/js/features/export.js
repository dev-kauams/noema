/* Exportar a nota atual em PDF, TXT, JSON ou Markdown, preservando TODA a formatação
   (negrito, itálico, sublinhado, tachado, cor, grifo, tamanho, capítulos, tópicos, listas). */

// converte qualquer cor CSS (rgb, rgba, hex, nome) em { hex, rgb:[r,g,b], a }
let xcCtx=null;
function xColor(c){const m=/^rgba?\(([^)]+)\)$/.exec(c.trim());   // caminho exato: o navegador normaliza style.color para rgb()/rgba()
 if(m){const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number),rgb=p.slice(0,3).map(v=>Math.round(v)),a=p.length>3?p[3]:1;
  return{hex:'#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join(''),rgb,a:Math.round(a*100)/100}}
 if(!xcCtx){const k=document.createElement('canvas');k.width=k.height=1;xcCtx=k.getContext('2d',{willReadFrequently:true})}
 xcCtx.clearRect(0,0,1,1);xcCtx.fillStyle='#000';xcCtx.fillStyle=c;xcCtx.fillRect(0,0,1,1);const d=xcCtx.getImageData(0,0,1,1).data,a=d[3]/255;
 // getImageData devolve o pixel já multiplicado pelo alfa; desfaz para recuperar a cor pura
 const rgb=a?[0,1,2].map(i=>Math.min(255,Math.round(d[i]/a))):[0,0,0];
 return{hex:'#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join(''),rgb,a:Math.round(a*100)/100}}
// mistura a cor com o branco do papel (o PDF usa o grifo já "pré-misturado")
const xOnWhite=c=>c.rgb.map(v=>Math.round(v*c.a+255*(1-c.a)));

// HTML da nota -> blocos [{type, num?, n?, ordered?, runs:[{text, bold, italic, underline, strike, color, background, fontSize}]}]
function noteBlocks(n){
 const t=document.createElement('template');
 t.innerHTML=clean(n.html||esc(n.body).split('\n').map(l=>'<p>'+l+'</p>').join(''));
 const blocks=[];let h1=0;
 const inline=(node,st,out)=>{
  if(node.nodeType==3){const tx=node.textContent.replace(/\u00a0/g,' ');if(tx)out.push({...st,text:tx});return}
  if(node.nodeType!=1)return;
  const tg=node.tagName;if(tg=='BR'){out.push({...st,text:'\n'});return}
  const s={...st},c=node.style;
  if(tg=='B'||tg=='STRONG')s.bold=true;if(tg=='I'||tg=='EM')s.italic=true;if(tg=='U')s.underline=true;if(tg=='S'||tg=='STRIKE'||tg=='DEL')s.strike=true;
  if(c){if(c.color)s.color=xColor(c.color);if(c.backgroundColor&&c.backgroundColor!='transparent')s.background=xColor(c.backgroundColor);
   if(c.fontWeight=='bold'||+c.fontWeight>=600)s.bold=true;if(c.fontStyle=='italic')s.italic=true;
   const td=c.textDecorationLine||c.textDecoration||'';if(/underline/.test(td))s.underline=true;if(/line-through/.test(td))s.strike=true;
   if(/px$/.test(c.fontSize))s.fontSize=parseFloat(c.fontSize)}
  node.childNodes.forEach(k=>inline(k,s,out))};
 const runs=node=>{const out=[];node.childNodes.forEach(k=>inline(k,{},out));return out};
 t.content.childNodes.forEach(node=>{
  if(node.nodeType==3){if(node.textContent.trim())blocks.push({type:'p',runs:[{text:node.textContent}]});return}
  const tg=node.tagName;
  if(tg=='H1')blocks.push({type:'h1',num:++h1,runs:runs(node)});
  else if(tg=='H2')blocks.push({type:'h2',runs:runs(node)});
  else if(tg=='H3')blocks.push({type:'h3',runs:runs(node)});
  else if(tg=='UL'||tg=='OL')[...node.children].forEach((li,i)=>blocks.push({type:'li',ordered:tg=='OL',n:i+1,runs:runs(li)}));
  else blocks.push({type:'p',runs:runs(node)})});
 return blocks}

// ---------- JSON: cada trecho com todas as suas propriedades de formatação ----------
const xRun=r=>({text:r.text,bold:!!r.bold,italic:!!r.italic,underline:!!r.underline,strike:!!r.strike,
 color:r.color?r.color.hex:null,background:r.background?r.background.hex:null,backgroundAlpha:r.background?r.background.a:null,fontSizePx:r.fontSize||null});
function exportJSON(n){return JSON.stringify({app:'NOEMA',format:'noema-note',version:1,exportedAt:new Date().toISOString(),author:fullName()||null,credit:'@dev-kauams',
 note:{id:n.id,title:n.title,space:n.space,tags:n.tags,favorite:n.fav,archived:n.arch,trashed:n.trash,inbox:n.inbox,createdAt:new Date(n.created).toISOString(),updatedAt:new Date(n.updated).toISOString()},
 blocks:noteBlocks(n).map(b=>({type:{h1:'chapter',h2:'topic',h3:'subtopic',li:'list-item',p:'paragraph'}[b.type],...(b.num?{number:b.num}:{}),...(b.type=='li'?{ordered:b.ordered,index:b.n}:{}),runs:b.runs.map(xRun)})),
 text:n.body,html:n.html},null,2)}

// ---------- TXT: texto legível com marcas inline para a formatação ----------
function xMark(r){let t=r.text;
 if(r.bold)t='**'+t+'**';if(r.italic)t='_'+t+'_';if(r.strike)t='~~'+t+'~~';if(r.underline)t='__'+t+'__';
 if(r.background)t='=='+t+'==';if(r.fontSize)t='{tam:'+r.fontSize+'px}'+t+'{/tam}';if(r.color)t='{cor:'+r.color.hex+'}'+t+'{/cor}';return t}
function exportTXT(n){const meta=xMeta(n),L=[];
 L.push('NOEMA · nota exportada','Autor: '+(fullName()||'—')+' · @dev-kauams','',ttl(n).toUpperCase(),...meta,'',
  'Legenda: **negrito** _itálico_ __sublinhado__ ~~tachado~~ ==grifado== {cor:#hex}texto{/cor} {tam:Npx}texto{/tam}','-'.repeat(60),'');
 for(const b of noteBlocks(n)){const s=b.runs.map(xMark).join('');
  if(b.type=='h1')L.push('','CAPÍTULO '+b.num+'. '+s,'');else if(b.type=='h2')L.push('','TÓPICO: '+s);else if(b.type=='h3')L.push('','SUBTÓPICO: '+s);
  else if(b.type=='li')L.push((b.ordered?b.n+'. ':'- ')+s);else L.push(s)}
 return L.join('\n')+'\n'}
const xDate=t=>new Date(t).toLocaleDateString('pt-BR');
function xMeta(n){return[n.space?'Espaço: '+n.space:'',n.tags.length?'Tags: '+n.tags.map(t=>'#'+t).join(' '):'','Criada em '+xDate(n.created)+' · editada em '+xDate(n.updated)].filter(Boolean)}

// ---------- PDF ----------
function exportPDF(n){
 const blocks=noteBlocks(n).map(b=>({...b,runs:b.runs.map(r=>({...r,color:r.color&&r.color.rgb,background:r.background&&xOnWhite(r.background)}))}));
 return pdfBuild({app:'NOEMA',author:fullName(),handle:'@dev-kauams',title:ttl(n),meta:xMeta(n),blocks})}

// ---------- entrega do arquivo ----------
const xSlug=s=>(s||'nota').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'nota';
const X_FMT={pdf:{ext:'pdf',mime:'application/pdf',make:exportPDF},txt:{ext:'txt',mime:'text/plain',make:exportTXT},json:{ext:'json',mime:'application/json',make:exportJSON},md:{ext:'md',mime:'text/markdown',make:n=>toMd(n)}};
// 1) recurso "downloads" do claude.ai (página publicada); 2) download normal do navegador (arquivo aberto no computador)
// Base64 de texto (UTF-8) ou de bytes: o Android precisa disso para gravar o arquivo.
const xB64=d=>{if(typeof d=='string')return btoa(unescape(encodeURIComponent(d)));let s='';for(let i=0;i<d.length;i+=8192)s+=String.fromCharCode(...d.subarray(i,i+8192));return btoa(s)};
async function xSave(filename,data,mime){
 const nat=window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()&&Capacitor.Plugins;   // app Android (Capacitor)
 if(nat&&nat.Filesystem&&nat.Share){const f=await nat.Filesystem.writeFile({path:filename,data:xB64(data),directory:'CACHE'});await nat.Share.share({title:filename,url:f.uri,dialogTitle:'Salvar ou compartilhar'});return 'compartilhado'}
 let dl=null;try{dl=window.claude&&claude.use?await claude.use('downloads'):null}catch(e){}
 if(dl){await dl.save({filename,data});return 'salvo'}
 if(window.claude&&claude.use)return 'indisponivel';
 const url=URL.createObjectURL(new Blob([data],{type:mime})),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);return 'baixado'}
async function openExport(){if(!cur)return;await flush();$('#xs').textContent='';$('#xd').showModal()}
async function doExport(fmt){const f=X_FMT[fmt],n=cur,st=$('#xs');if(!f||!n)return;
 try{st.textContent='Gerando '+f.ext.toUpperCase()+'…';const data=f.make(n),name=xSlug(n.title)+'.'+f.ext;
  const r=await xSave(name,data,f.mime);
  if(r=='indisponivel'){if(fmt=='pdf'){st.textContent='O download de PDF não está disponível dentro desta visualização. Abra o arquivo noema.html no computador.'}else{$('#xd').close();openData(data,'Texto exportado. Copie e salve como '+name)}return}
  st.textContent=(r=='salvo'?'Arquivo salvo: ':r=='compartilhado'?'Menu de compartilhar aberto: ':'Download iniciado: ')+name+(fmt=='pdf'&&pdfLost?` (${pdfLost} caractere(s) fora do alfabeto latino viraram "?")`:'')}
 catch(e){st.textContent=e&&e.code=='declined'?'Você cancelou o salvamento.':'Não foi possível exportar: '+((e&&e.message)||e)}}
$('#xd').addEventListener('click',e=>{const b=e.target.closest('[data-fmt]');if(b)doExport(b.dataset.fmt);if(e.target.id=='xcl')$('#xd').close()});
