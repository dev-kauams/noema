/* IA leve e local (sem backend): tokenização, palavras-chave e resumo curto de notas. */

const AI_STOP = new Set([
  "o","a","os","as","e","de","do","da","dos","das","em","no","na","nos","nas",
  "por","para","com","sem","ou","se","que","um","uma","uns","umas","seu","sua",
  "seus","suas","meu","minha","meus","minhas","este","esta","estes","estas",
  "esse","essa","esses","essas","aquele","aquela","aqueles","aquelas","eu",
  "você","vocês","nós","ele","ela","eles","elas","ser","estar","tem","tenho",
  "temos","houve","havia","irá","seria","não","sim","já","mais","menos","muito",
  "bem","mal","pouco","quando","onde","como","por que","qual","quem","há","têm",
  "tem","é","são","era","eram","foi","foram","desde","até","entre","contra","sem",
  "sobre","sob","deste","dessa","destes","dessas"
]);

function aiTokens(text){
  const t=String(text||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]+/g,' ');
  return t.split(/\s+/).map(s=>s.trim()).filter(s=>s.length>2&&!AI_STOP.has(s));
}

function aiKeywords(text,max=8){
  const f={};
  for(const t of aiTokens(text))f[t]=(f[t]||0)+1;
  return Object.entries(f).sort((a,b)=>b[1]-a[1]).slice(0,max).map(e=>e[0]);
}

function aiSummarize(note,maxWords=40){
  const title=note.title||'Sem título';
  const keys=aiKeywords(note.body||'',6).join(', ');
  let frase=title;
  if(keys)frase=title+'. '+title.charAt(0).toUpperCase()+title.slice(1)+': '+keys+'.';
  else frase=title+'.';
  return frase;
}

function aiTagSuggestions(note){
  return aiKeywords(note.title||'',4).concat(aiKeywords(note.body||'',6)).slice(0,6);
}
