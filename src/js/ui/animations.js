/* Animações GSAP de entrada de telas, listas e editor. */
function introApp(){if(view=='home')renderHome(true);if(!cur)renderEd();if(!anim())return;gsap.from('nav .logo,#nv button,nav h3,#tags button,nav>button',{y:10,opacity:0,duration:.6,stagger:.03,ease:'power3.out',clearProps:'transform,opacity'});animList()}
function animList(){if(anim())gsap.from('#lp .it',{y:10,opacity:0,duration:.45,stagger:.035,ease:'power2.out',clearProps:'transform,opacity'})}
function animEd(){if(!cur||lastEd==cur.id||!anim())return;lastEd=cur.id;gsap.from('#ed>*:not(.tb)',{y:14,opacity:0,duration:.55,stagger:.05,ease:'power3.out',clearProps:'transform,opacity'})}
function animHi(){if(anim())gsap.from('.hi>*',{y:24,opacity:0,duration:.9,stagger:.1,ease:'power3.out',clearProps:'transform,opacity'})}
