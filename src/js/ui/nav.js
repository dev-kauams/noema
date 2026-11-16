/* Navegação: troca de visão, espaços e tags no menu lateral. */
// Troca de visão. A home usa a classe body.home para esconder lista e editor.
function go(v) {
  view = v;
  tagF = null;
  document.body.classList.toggle(
    "home",
    v == "home" ||
      v == "tasks" ||
      v == "reminders" ||
      v == "calendar" ||
      v == "graph",
  );
  document.body.classList.toggle("tasks", v == "tasks");
  document.body.classList.toggle("reminders", v == "reminders");
  document.body.classList.toggle("calendar", v == "calendar");
  document.body.classList.toggle("graph", v == "graph");
  renderNav();
  renderList();
  if (v == "home") renderHome(true);
  else if (v == "tasks") renderTasks();
  else if (v == "reminders") renderReminders();
  else if (v == "calendar") renderCalendar();
  else if (v == "graph") renderGraph();
  else animList();
}
// Desenha o menu: início, espaços (com contagem), visões e tags.
function renderNav() {
  const c = (v) =>
    v == "tasks"
      ? tasks.length
      : v == "reminders"
        ? reminders.filter((r) => r.active).length
        : v == "calendar"
          ? calendarItemsOn(calendarKey(new Date())).length
          : v == "graph"
            ? graphData().nodes.length
            : (() => {
                const o = view;
                view = v;
                const r = notes.filter(inV).length;
                view = o;
                return r;
              })();
  $("#nv").innerHTML =
    navTop() +
    VIEWS.map(
      ([k, l]) =>
        `<button data-v="${k}" aria-current="${view == k}"><span>${l}</span><span class="m">${c(k)}</span></button>`,
    ).join("");
  const t = {};
  notes
    .filter((n) => !n.trash)
    .forEach((n) => n.tags.forEach((x) => (t[x] = (t[x] || 0) + 1)));
  $("#tags").innerHTML =
    Object.keys(t)
      .sort()
      .map(
        (x) =>
          `<button data-t="${esc(x)}" aria-current="${F.tags.includes(x)}"><span>#${esc(x)}</span><span class="m">${t[x]}</span></button>`,
      )
      .join("") || '<div class="m" style="padding:4px 8px">nenhuma</div>';
}
$("#nv").onclick = (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.sp !== undefined) {
    const v = b.dataset.sp;
    if (v == "__m") return openSpaces();
    SP = v == "__none" ? "" : v || null;
    go(view == "home" ? "all" : view);
  } else go(b.dataset.v);
};
$("#tags").onclick = (e) => {
  const b = e.target.closest("button");
  if (b) {
    const x = b.dataset.t;
    F.tags = F.tags.includes(x) ? F.tags.filter((y) => y != x) : [...F.tags, x];
    F.un = false;
    renderNav();
    renderList();
  }
};
$("#bsk").onclick = openCanvas;
function navTop() {
  const sp = (prof && prof.spaces) || [],
    cs = (s) =>
      notes.filter((n) => !n.trash && !n.arch && n.space === s).length,
    un = cs("");
  return (
    `<button data-v="home" aria-current="${view == "home"}"><span>Início</span></button><h3>espaços</h3><button data-sp="" aria-current="${SP === null}"><span>Tudo</span></button>` +
    sp
      .map(
        (s) =>
          `<button data-sp="${esc(s)}" aria-current="${SP === s}"><span>${esc(s)}</span><span class="m">${cs(s)}</span></button>`,
      )
      .join("") +
    (un
      ? `<button data-sp="__none" aria-current="${SP === ""}"><span>Sem espaço</span><span class="m">${un}</span></button>`
      : "") +
    `<button data-sp="__m"><span class="m">gerenciar espaços</span></button><h3>notas</h3>`
  );
}
