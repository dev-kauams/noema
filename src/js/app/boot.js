/* Inicialização: carrega dados, perfil, abre a primeira tela. */
function boot() {
  if (prof && prof.name) closeOb();
  else runOb(false);
}
addEventListener("resize", () => {
  if (!$("#ob").hidden) fitOb();
  closeCP();
});
addEventListener("beforeunload", () => {
  if (cur && saved != ver) save(cur);
});
// Nota de boas-vindas (só quando não há nenhuma nota).
async function seedWelcome() {
  if (!db) return;
  const n = mk({
    title: "Bem-vindo ao Noema",
    body: "Capture na Inbox, organize aqui e ligue ideias com [[Nome de outra nota]].",
    html: "<h1>Escreva</h1><p>Capture na Inbox, organize aqui e ligue ideias com [[Nome de outra nota]].</p><h2>Formate</h2><p>Selecione um trecho e use a barra: <b>negrito</b>, <i>itálico</i>, cor e grifo. Sem seleção, cor e tamanho valem para o texto todo.</p>",
  });
  notes.push(n);
  await save(n);
}
// Boot: perfil, tema, banco e notas; depois abre a primeira tela.
(async () => {
  loadProf();
  try {
    const t = localStorage.getItem("noema-theme");
    if (t) document.documentElement.dataset.theme = t;
  } catch (e) {}
  try {
    db = await openDB();
    notes = await getAll();
    await loadTasks();
    await loadReminders();
  } catch (e) {
    db = null;
    tasks = [];
    reminders = [];
  }
  notes.forEach((n) => {
    n.html = clean(n.html || "");
    n.space = n.space || "";
    if (n.dirty === undefined) n.dirty = true;
    if (n.space && prof && prof.spaces && !prof.spaces.includes(n.space))
      prof.spaces.push(n.space);
  });
  if (!notes.length && db && (!syncOn() || (prof && prof.name)))
    await seedWelcome();
  loadSession();
  if (SES) {
    startSync();
    if (prof && prof.name) syncSoon(800);
    else {
      try {
        await afterAuth();
      } catch (e) {}
    }
  }
  renderNav();
  renderList();
  renderEd();
  paintProf();
  paintSync();
  boot();
})();
