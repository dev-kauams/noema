/* Fundo infinito de dobras de seda desenhado em canvas. */
// Fundo infinito: dobras de seda desenhadas numa área rotacionada maior que a tela (sem pontas visíveis).
(function(){const c=$('#sk'),x=c.getContext('2d'),RMq={get matches(){return !motionOn()}};let w=1,h=1,last=0,k=0,P=null;
 const PD={hi:[48,48,53],lo:[2,2,3],rim:.66,rc:'255,255,255'},PL={hi:[218,216,210],lo:[247,246,243],rim:.34,rc:'110,106,98'};
 function draw(ts){if(!P||!(k++%30))P=document.documentElement.dataset.theme=='light'?PL:PD;
  const T=ts/1000,L=Math.hypot(w,h)/2+70,N=Math.max(8,Math.ceil(2*L/130)),sp=2*L/N,st=14;
  x.setTransform(c.width/w,0,0,c.height/h,0,0);x.clearRect(0,0,w,h);x.translate(w/2,h/2);x.rotate(-.42);
  for(let i=-2;i<=N;i++){
   const Y=-L+i*sp,A=sp*(.6+.4*Math.sin(i*.83+1.3)),f1=.0019*(1+.22*Math.sin(i*.61)),f2=.0043*(1+.18*Math.cos(i*.47)),p1=i*.34+T*.21,p2=-i*.52+T*.16,pts=[];
   for(let px=-L;px<=L+st;px+=st)pts.push(px,Y+A*Math.sin(px*f1+p1)+A*.42*Math.sin(px*f2+p2));
   const trace=()=>{x.beginPath();x.moveTo(pts[0],pts[1]);for(let j=2;j<pts.length-2;j+=2)x.quadraticCurveTo(pts[j],pts[j+1],(pts[j]+pts[j+2])/2,(pts[j+1]+pts[j+3])/2);x.lineTo(pts[pts.length-2],pts[pts.length-1])};
   const b=.5+.5*Math.sin(i*.9+.4),cl=P.lo.map((v,n)=>Math.round(v+(P.hi[n]-v)*(.5+.5*b)));
   const g=x.createLinearGradient(0,Y-A,0,Y+A+sp*1.5);g.addColorStop(0,'rgb('+cl+')');g.addColorStop(1,'rgb('+P.lo+')');
   trace();for(let j=pts.length-2;j>=0;j-=2)x.lineTo(pts[j],pts[j+1]+sp*4.2);x.closePath();x.fillStyle=g;x.fill();
   const sg=x.createLinearGradient(-L,0,L,0);for(let s=0;s<=24;s++){const px=-L+s/24*2*L;sg.addColorStop(s/24,'rgba('+P.rc+','+(Math.pow(.5+.5*Math.sin(px*.0026+i*1.1+T*.12),6)*P.rim).toFixed(3)+')')}
   trace();x.strokeStyle=sg;x.lineWidth=1.25;x.stroke()}}
 function rs(){const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.25);w=r.width||innerWidth;h=r.height||innerHeight;c.width=Math.max(1,Math.round(w*d));c.height=Math.max(1,Math.round(h*d));draw(performance.now())}
 const frame=ts=>{if(!document.hidden&&!RMq.matches&&ts-last>=33){last=ts;draw(ts)}requestAnimationFrame(frame)};
 new ResizeObserver(rs).observe(c);addEventListener('resize',rs);addEventListener('orientationchange',()=>setTimeout(rs,200));
 new MutationObserver(()=>{P=null;if(RMq.matches)draw(performance.now())}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 rs();requestAnimationFrame(frame)})();
