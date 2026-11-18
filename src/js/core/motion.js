/* Preferência de movimento: sim / auto / não. Decide se GSAP e o fundo animam. */
// Preferência de movimento: 'on' | 'auto' | 'off'.
let motionPref='on';try{motionPref=localStorage.getItem('noema-motion')||'on'}catch(e){}
// Movimento ligado? 'auto' respeita prefers-reduced-motion do sistema.
const motionOn=()=>motionPref=='on'||(motionPref=='auto'&&!matchMedia('(prefers-reduced-motion:reduce)').matches);
// GSAP só anima se carregou E o movimento está ligado.
const anim=()=>!!window.gsap&&motionOn();
function applyMotion(){document.documentElement.dataset.motion=motionOn()?'on':'off';}
function setMotion(v){motionPref=v;try{localStorage.setItem('noema-motion',v)}catch(e){}applyMotion()}
// Alterna sim -> auto -> não (usado pela paleta).
const cycleMotion=()=>{setMotion(motionPref=='on'?'auto':motionPref=='auto'?'off':'on');if(typeof renderSettings=='function'&&$('#sg').open)renderSettings()};
matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',applyMotion);applyMotion();
