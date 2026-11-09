/* IA leve: painel com resumo curto e sugestão de tags dos resultados recentes. */

function renderAi(){
  const H=$('#hm');
  if(!H)return;
  const recent=[...notes].filter(n=>!n.trash).sort((a,b)=>b.updated-a.updated).slice(0,5);
  H.innerHTML=`<section class="ai-panel"><div class="ai-head"><div><span class="eyebrow">assistente leve</span><h1>IA</h1></div></div><div class="ai-grid">${recent.map(aiCard).join('')||'<div class="m">Nenhuma nota ainda.</div>'}</div><div class="ai-actions"><button class="gh" id="ai-refresh">Atualizar prévias</button></div></section>`;
  const r=$('#ai-refresh');if(r)r.onclick=renderAi;
}

function aiCard(n){
  const s=aiSummarize(n);
  const tags=aiTagSuggestions(n).map(t=>`<span class="ai-tag">${esc(t)}</span>`).join('');
  return `<article class="ai-card"><h2>${esc(n.title||'Sem título')}</h2><p class="ai-summary">${esc(s)}</p><div class="ai-meta">${n.space||'Sem espaço'} · ${new Date(n.updated).toLocaleDateString('pt-BR')}</div><div class="ai-tags">${tags||'<span class="m">sem sugestão</span>'}</div></article>`;
}
