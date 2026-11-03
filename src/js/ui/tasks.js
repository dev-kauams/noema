/* Painel de tarefas: criação, edição, status, favoritos e filtro local. */
let taskQ = "",
  taskStatus = "all",
  taskEdit = null;
const taskStatusLabel = {
  todo: "A fazer",
  doing: "Em andamento",
  done: "Concluída",
};
function renderTasks() {
  const H = $("#hm");
  if (!H) return;
  const rows = tasks
    .filter((t) => matchT(t, taskQ, taskStatus))
    .sort(
      (a, b) =>
        (a.status == "done") - (b.status == "done") || b.updated - a.updated,
    );
  const edit = taskEdit && tasks.find((t) => t.id == taskEdit);
  const form = edit
    ? `<input id="task-title" value="${esc(edit.title)}" placeholder="Título da tarefa" aria-label="Título da tarefa"><textarea id="task-body" placeholder="Detalhes" aria-label="Detalhes">${esc(edit.body)}</textarea><div class="task-fields"><select id="task-status" aria-label="Status">${Object.entries(
        taskStatusLabel,
      )
        .map(
          ([k, v]) =>
            `<option value="${k}" ${edit.status == k ? "selected" : ""}>${v}</option>`,
        )
        .join(
          "",
        )}</select><input id="task-due" type="date" value="${esc(edit.due)}" aria-label="Prazo"><button class="gh" id="task-save">Salvar</button><button class="gh" id="task-cancel">Cancelar</button></div>`
    : `<input id="task-title" placeholder="Nova tarefa" aria-label="Título da tarefa"><textarea id="task-body" placeholder="Detalhes (opcional)" aria-label="Detalhes"></textarea><div class="task-fields"><select id="task-status" aria-label="Status">${Object.entries(
        taskStatusLabel,
      )
        .map(([k, v]) => `<option value="${k}">${v}</option>`)
        .join(
          "",
        )}</select><input id="task-due" type="date" aria-label="Prazo"><button class="gh" id="task-save">Adicionar</button></div>`;
  H.innerHTML = `<section class="tasks-panel"><div class="tasks-head"><div><div class="m">organização</div><h1>Tarefas</h1></div><span class="m" role="status">${rows.length} ${rows.length == 1 ? "tarefa" : "tarefas"}</span></div><div class="task-form">${form}</div><div class="task-tools"><input id="task-query" type="search" value="${esc(taskQ)}" placeholder="Filtrar tarefas" aria-label="Filtrar tarefas"><select id="task-filter" aria-label="Filtrar por status"><option value="all" ${taskStatus == "all" ? "selected" : ""}>Todos os status</option>${Object.entries(
    taskStatusLabel,
  )
    .map(
      ([k, v]) =>
        `<option value="${k}" ${taskStatus == k ? "selected" : ""}>${v}</option>`,
    )
    .join(
      "",
    )}</select></div><div class="task-list">${rows.length ? rows.map(taskRow).join("") : '<div class="empty">Nenhuma tarefa neste filtro.</div>'}</div></section>`;
  const ql = $("#task-query");
  ql.oninput = (e) => {
    taskQ = e.target.value;
    renderTasks();
    $("#task-query").focus();
    $("#task-query").setSelectionRange(taskQ.length, taskQ.length);
  };
  $("#task-filter").onchange = (e) => {
    taskStatus = e.target.value;
    renderTasks();
  };
  $("#task-save").onclick = saveTaskForm;
  $("#task-cancel")?.addEventListener("click", () => {
    taskEdit = null;
    renderTasks();
  });
}
function taskRow(t) {
  return `<article class="task-row ${t.status == "done" ? "is-done" : ""}" data-task="${t.id}"><button class="task-check" data-task-action="status" aria-label="Marcar como ${t.status == "done" ? "a fazer" : "concluída"}" aria-pressed="${t.status == "done"}">${t.status == "done" ? "✓" : ""}</button><div class="task-copy"><button class="task-title" data-task-action="edit">${esc(t.title || "Sem título")}</button>${t.body ? `<p>${esc(t.body)}</p>` : ""}<div class="m">${taskStatusLabel[t.status]}${t.due ? " · prazo " + isoToBr(t.due) : ""}</div></div><button class="task-fav" data-task-action="fav" aria-label="${t.fav ? "Remover dos favoritos" : "Favoritar"}">${t.fav ? "★" : "☆"}</button><button class="task-remove" data-task-action="remove" aria-label="Excluir tarefa">×</button></article>`;
}
async function saveTaskForm() {
  const title = $("#task-title").value.trim();
  if (!title) {
    $("#task-title").focus();
    return;
  }
  const old = taskEdit && tasks.find((t) => t.id == taskEdit),
    t = old || taskMk({});
  Object.assign(t, {
    title,
    body: $("#task-body").value.trim(),
    status: $("#task-status").value,
    due: $("#task-due").value,
    updated: Date.now(),
  });
  if (await taskSave(t)) {
    if (!old) tasks.push(t);
    taskEdit = null;
    renderNav();
    renderTasks();
  }
}
$("#hm").addEventListener("click", async (e) => {
  if (view != "tasks") return;
  const b = e.target.closest("[data-task-action]");
  if (!b) return;
  const t = tasks.find((x) => x.id == b.closest("[data-task]")?.dataset.task);
  if (!t) return;
  const a = b.dataset.taskAction;
  if (a == "edit") {
    taskEdit = t.id;
    return renderTasks();
  }
  if (a == "status") {
    t.status =
      t.status == "done" ? "todo" : t.status == "todo" ? "doing" : "done";
  }
  if (a == "fav") t.fav = !t.fav;
  if (a == "remove") {
    if (!confirm("Excluir esta tarefa?")) return;
    await taskRemove(t.id);
    tasks = tasks.filter((x) => x.id != t.id);
    if (taskEdit == t.id) taskEdit = null;
    renderNav();
    return renderTasks();
  }
  t.updated = Date.now();
  await taskSave(t);
  renderNav();
  renderTasks();
});
