/* Gerador de PDF próprio, sem bibliotecas: PDF 1.4, fontes padrão Helvetica (4 estilos), codificação WinAnsi.
   Entrada: { app, author, handle, title, meta[], blocks[] } (blocos vêm de noteBlocks em export.js). Saída: Uint8Array. */
const PDF_W=595.28,PDF_H=841.89,PDF_M=60;
const PDF_WIN={'€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159};
let pdfLost=0,pdfCtx=null;
// números curtos no PDF (2 casas) e escape de texto
const pdfF=n=>String(Math.round(n*100)/100);
const pdfEsc=s=>s.replace(/[\\()]/g,'\\$&');
const pdfRG=c=>c.map(v=>pdfF(v/255)).join(' ');
// converte para WinAnsi; o que não existe nessa tabela (emoji, CJK...) vira '?' e é contado em pdfLost
function pdfLatin(s){let o='';for(const ch of s){const c=ch.codePointAt(0);
 if(c==160)o+=' ';else if(c==9)o+='    ';else if(c==10||c==13)continue;else if(c>=32&&c<127||c>=161&&c<=255)o+=ch;else if(PDF_WIN[ch])o+=String.fromCharCode(PDF_WIN[ch]);else{o+='?';pdfLost++}}return o}
// largura de texto: Arial/Helvetica têm as mesmas métricas; mede-se num canvas a 100px e escala-se
function pdfMeasure(t,size,b,i){if(!pdfCtx)pdfCtx=document.createElement('canvas').getContext('2d');
 pdfCtx.font=(i?'italic ':'')+(b?'bold ':'')+'100px Arial, Helvetica, sans-serif';return pdfCtx.measureText(t).width*size/100}
// quebra de linha: transforma runs (trechos com estilo) em linhas que cabem em `avail` pontos
function pdfLines(runs,base,avail,boldAll,col0){
 const tk=[];
 for(const r of runs){const size=base*(r.fontSize&&!boldAll?r.fontSize/18:1),b=boldAll||r.bold,it=!!r.italic;
  for(const p of String(r.text).split(/(\n|\s+)/)){if(p==='')continue;
   if(p=='\n'){tk.push({br:1});continue}
   const sp=/^\s+$/.test(p),t=sp?' ':pdfLatin(p);
   tk.push({t,sp,size,b,i:it,u:r.underline,s:r.strike,col:r.color||col0,bg:r.background,w:pdfMeasure(t,size,b,it)})}}
 const lines=[];let L={tk:[],w:0};
 const push=()=>{while(L.tk.length&&L.tk[L.tk.length-1].sp)L.w-=L.tk.pop().w;lines.push(L);L={tk:[],w:0}};
 for(const k of tk){if(k.br){push();continue}
  if(k.sp&&!L.tk.length)continue;
  if(!k.sp&&L.w+k.w>avail&&L.tk.length)push();
  if(!k.sp&&k.w>avail){let s=[...k.t];   // palavra maior que a linha: quebra por caracteres
   while(s.length){let n=s.length;while(n>1&&pdfMeasure(s.slice(0,n).join(''),k.size,k.b,k.i)>avail-L.w)n--;
    const part=s.splice(0,n).join(''),w=pdfMeasure(part,k.size,k.b,k.i);L.tk.push({...k,t:part,w});L.w+=w;if(s.length)push()}continue}
  L.tk.push(k);L.w+=k.w}
 push();return lines}
// desenha uma linha: fundo (grifo), texto, sublinhado e tachado, trecho a trecho
function pdfDrawLine(L,x,base){let o='';
 for(const k of L.tk){
  if(k.bg)o+=`${pdfRG(k.bg)} rg ${pdfF(x)} ${pdfF(base-k.size*.25)} ${pdfF(k.w)} ${pdfF(k.size*1.2)} re f\n`;
  if(!k.sp&&k.t)o+=`BT /F${1+(k.b?1:0)+(k.i?2:0)} ${pdfF(k.size)} Tf ${pdfRG(k.col)} rg ${pdfF(x)} ${pdfF(base)} Td (${pdfEsc(k.t)}) Tj ET\n`;
  for(const [on,dy] of [[k.u,-k.size*.12],[k.s,k.size*.3]])if(on&&!k.sp)o+=`${pdfRG(k.col)} RG ${pdfF(k.size*.06)} w ${pdfF(x)} ${pdfF(base+dy)} m ${pdfF(x+k.w)} ${pdfF(base+dy)} l S\n`;
  x+=k.w}
 return o}
function pdfBuild(d){
 pdfLost=0;const TXT=[26,26,26],GRY=[120,120,120],pages=[],top=PDF_H-96,bot=86,W=PDF_W-2*PDF_M;let y=top;
 const np=()=>{pages.push('');y=top};np();
 // um bloco = vários parágrafos visuais; `ind` recuo, `before/after` espaços, `lead` marcador (• ou 1.)
 const block=(runs,o)=>{const base=o.size,ind=o.ind||0,lines=pdfLines(runs,base,W-ind,o.bold,o.col||TXT);
  if(!lines.length)lines.push({tk:[],w:0});
  y-=o.before||0;
  lines.forEach((L,n)=>{const ms=Math.max(base,...L.tk.map(k=>k.size)),lh=ms*1.4;
   if(y-lh<bot){np()}
   const bl=y-ms*.95;
   if(n==0&&o.lead)pages[pages.length-1]+=pdfDrawLine({tk:[{t:pdfLatin(o.lead),size:base,b:o.bold,i:false,col:o.col||TXT,w:0}]},PDF_M+ind-16,bl);
   pages[pages.length-1]+=pdfDrawLine(L,PDF_M+ind,bl);y-=lh});
  y-=o.after||0};
 block([{text:d.title||'Sem título'}],{size:26,bold:true,after:4});
 for(const m of d.meta)block([{text:m,color:GRY}],{size:9.5,after:1});
 pages[0]+=`0.5 w 0.8 G ${pdfF(PDF_M)} ${pdfF(y-6)} m ${pdfF(PDF_W-PDF_M)} ${pdfF(y-6)} l S\n`;y-=14;
 for(const b of d.blocks){
  if(b.type=='h1')block([{text:b.num+'. '},...b.runs],{size:20,bold:true,before:16,after:6});
  else if(b.type=='h2')block(b.runs,{size:15,bold:true,before:10,after:4});
  else if(b.type=='h3')block(b.runs,{size:12.5,bold:true,before:8,after:3});
  else if(b.type=='li')block(b.runs,{size:11,ind:20,lead:b.ordered?b.n+'.':'•',after:3});
  else block(b.runs,{size:11,after:6})}
 // 2ª passada: cabeçalho e rodapé em todas as páginas (só agora se sabe o total)
 const N=pages.length,when=new Date().toLocaleDateString('pt-BR'),author='Autor: '+pdfLatin(d.author||'—'),handle=pdfLatin(d.handle),right=x=>PDF_W-PDF_M-x;
 const hf=i=>{const w1=pdfMeasure('Exportado em '+when,9,0,0),w2=pdfMeasure(author,9,0,0),pg=`Página ${i} de ${N}`,w3=pdfMeasure(pg,9,0,0);
  return `BT /F2 12 Tf 0.1 0.1 0.1 rg 3 Tc ${pdfF(PDF_M)} ${pdfF(PDF_H-50)} Td (${pdfEsc(pdfLatin(d.app))}) Tj 0 Tc ET\n`
  +`BT /F1 9 Tf 0.47 0.47 0.47 rg ${pdfF(right(w1))} ${pdfF(PDF_H-49)} Td (Exportado em ${when}) Tj ET\n`
  +`0.7 w 0.1 G ${pdfF(PDF_M)} ${pdfF(PDF_H-62)} m ${pdfF(PDF_W-PDF_M)} ${pdfF(PDF_H-62)} l S\n0.5 w 0.8 G ${pdfF(PDF_M)} 64 m ${pdfF(PDF_W-PDF_M)} 64 l S\n`
  +`BT /F2 9 Tf 0.1 0.1 0.1 rg ${pdfF(PDF_M)} 46 Td (${pdfEsc(handle)}) Tj ET\n`
  +`BT /F1 9 Tf 0.1 0.1 0.1 rg ${pdfF((PDF_W-w2)/2)} 46 Td (${pdfEsc(author)}) Tj ET\n`
  +`BT /F1 9 Tf 0.47 0.47 0.47 rg ${pdfF(right(w3))} 46 Td (${pdfEsc(pdfLatin(pg))}) Tj ET\n`};
 // objetos do arquivo: 1 catálogo, 2 páginas, 3-6 fontes, 7 informações, depois (página, conteúdo) por página
 const o=['%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'],off=[];let len=o[0].length;
 const add=(id,body)=>{off[id]=len;const s=`${id} 0 obj\n${body}\nendobj\n`;o.push(s);len+=s.length};
 add(1,'<< /Type /Catalog /Pages 2 0 R >>');
 add(2,`<< /Type /Pages /Count ${N} /Kids [${pages.map((_,k)=>`${8+2*k} 0 R`).join(' ')}] >>`);
 ['Helvetica','Helvetica-Bold','Helvetica-Oblique','Helvetica-BoldOblique'].forEach((f,k)=>add(3+k,`<< /Type /Font /Subtype /Type1 /BaseFont /${f} /Encoding /WinAnsiEncoding >>`));
 const t=new Date(),p2=v=>String(v).padStart(2,'0');
 add(7,`<< /Title (${pdfEsc(pdfLatin(d.title||''))}) /Author (${pdfEsc(pdfLatin(d.author||''))}) /Creator (${pdfEsc(pdfLatin(d.app))}) /Producer (${pdfEsc(pdfLatin(d.app))}) /CreationDate (D:${t.getFullYear()}${p2(t.getMonth()+1)}${p2(t.getDate())}${p2(t.getHours())}${p2(t.getMinutes())}${p2(t.getSeconds())}) >>`);
 pages.forEach((c,k)=>{const s=c+hf(k+1);
  add(8+2*k,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_W} ${PDF_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >> >> /Contents ${9+2*k} 0 R >>`);
  add(9+2*k,`<< /Length ${s.length} >>\nstream\n${s}\nendstream`)});
 let x=`xref\n0 ${8+2*N}\n0000000000 65535 f \n`;for(let i=1;i<8+2*N;i++)x+=String(off[i]).padStart(10,'0')+' 00000 n \n';
 x+=`trailer\n<< /Size ${8+2*N} /Root 1 0 R /Info 7 0 R >>\nstartxref\n${len}\n%%EOF\n`;
 const all=o.join('')+x,u=new Uint8Array(all.length);for(let i=0;i<all.length;i++)u[i]=all.charCodeAt(i)&255;return u}
