/* Painel de lembretes: próximos prazos agrupados por data e descartáveis. */
let reminderQ = "",
  reminderPriority = "all",
  reminderEdit = null,
  reminderShowDiscarded = false;
const reminderPriorityLabel = { low: "Baixa", normal: "Normal", high: "Alta" };
function renderReminders() {
  const H = $("#hm");
  if (!H) return;
  const rows = reminders
    .filter((r) =>
      reminderFilter(r, reminderQ, reminderPriority, !reminderShowDiscarded),
    )
    .sort(
      (a, b) =>
        (a.date || "9999").localeCompare(b.date || "9999") ||
        b.updated - a.updated,
    );
  const edit = reminderEdit && reminders.find((r) => r.id == reminderEdit);
  const groups = {};
  rows.forEach((r) => (groups[r.date || "sem-data"] ||= []).push(r));
  H.innerHTML = `<section class="reminders-panel"><div class="reminders-head"><div><div class="m">atenção</div><h1>Lembretes</h1></div><span class="m" role="status">${rows.length} ${rows.length == 1 ? "lembrete" : "lembretes"}</span></div><div class="reminder-form">${reminderForm(edit)}</div><div class="reminder-tools"><input id="reminder-query" type="search" value="${esc(reminderQ)}" placeholder="Filtrar lembretes" aria-label="Filtrar lembretes"><select id="reminder-filter-priority" aria-label="Filtrar por prioridade"><option value="all" ${reminderPriority == "all" ? "selected" : ""}>Todas as prioridades</option>${Object.entries(
    reminderPriorityLabel,
  )
    .map(
      ([k, v]) =>
        `<option value="${k}" ${reminderPriority == k ? "selected" : ""}>${v}</option>`,
    )
    .join(
      "",
    )}</select><label class="reminder-toggle"><input id="reminder-discarded" type="checkbox" ${reminderShowDiscarded ? "checked" : ""}> descartados</label></div><div class="reminder-list">${
    Object.keys(groups).length
      ? Object.entries(groups)
          .map(
            ([date, list]) =>
              `<section class="reminder-day"><h2>${date == "sem-data" ? "Sem data" : esc(reminderDateLabel(date))}</h2>${list.map(reminderRow).join("")}</section>`,
          )
          .join("")
      : '<div class="empty">Nenhum lembrete neste filtro.</div>'
  }</div></section>`;
  const q = $("#reminder-query");
  q.oninput = (e) => {
    reminderQ = e.target.value;
    renderReminders();
    $("#reminder-query").focus();
    $("#reminder-query").setSelectionRange(reminderQ.length, reminderQ.length);
  };
  $("#reminder-filter-priority").onchange = (e) => {
    reminderPriority = e.target.value;
    renderReminders();
  };
  $("#reminder-discarded").onchange = (e) => {
    reminderShowDiscarded = e.target.checked;
    renderReminders();
  };
  $("#reminder-save").onclick = saveReminderForm;
  $("#reminder-cancel")?.addEventListener("click", () => {
    reminderEdit = null;
    renderReminders();
  });
}
function reminderForm(r) {
  const fresh = !r;
  r ||= reminderMk({ date: ymd() });
  return `<input id="reminder-title" value="${fresh ? "" : esc(r.title)}" placeholder="${fresh ? "Novo lembrete" : "Título do lembrete"}" aria-label="Título do lembrete"><textarea id="reminder-body" placeholder="Detalhes (opcional)" aria-label="Detalhes">${fresh ? "" : esc(r.body)}</textarea><div class="reminder-fields"><input id="reminder-date" type="date" value="${esc(r.date)}" aria-label="Data do lembrete"><select id="reminder-form-priority" aria-label="Prioridade">${Object.entries(
    reminderPriorityLabel,
  )
    .map(
      ([k, v]) =>
        `<option value="${k}" ${r.priority == k ? "selected" : ""}>${v}</option>`,
    )
    .join(
      "",
    )}</select><button class="gh" id="reminder-save">${fresh ? "Adicionar" : "Salvar"}</button>${fresh ? "" : '<button class="gh" id="reminder-cancel">Cancelar</button>'}</div>`;
}
function reminderRow(r) {
  return `<article class="reminder-row ${r.active ? "" : "is-discarded"}" data-reminder="${r.id}"><span class="reminder-priority priority-${r.priority}" title="Prioridade ${reminderPriorityLabel[r.priority]}"></span><div class="reminder-copy"><button class="reminder-title" data-reminder-action="edit">${esc(r.title || "Sem título")}</button>${r.body ? `<p>${esc(r.body)}</p>` : ""}<div class="m">${reminderPriorityLabel[r.priority]}${r.active ? "" : " · descartado"}</div></div>${r.active ? '<button class="gh" data-reminder-action="discard">Descartar</button>' : '<button class="gh" data-reminder-action="restore">Restaurar</button>'}</article>`;
}
function reminderDateLabel(date) {
  const d = new Date(`${date}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}
async function saveReminderForm() {
  const title = $("#reminder-title").value.trim();
  if (!title) return $("#reminder-title").focus();
  const old = reminderEdit && reminders.find((r) => r.id == reminderEdit),
    r = old || reminderMk({});
  Object.assign(r, {
    title,
    body: $("#reminder-body").value.trim(),
    date: $("#reminder-date").value,
    priority: $("#reminder-form-priority").value,
    updated: Date.now(),
  });
  if (await reminderSave(r)) {
    if (!old) reminders.push(r);
    reminderEdit = null;
    renderNav();
    renderReminders();
  }
}
$("#hm").addEventListener("click", async (e) => {
  if (view != "reminders") return;
  const b = e.target.closest("[data-reminder-action]");
  if (!b) return;
  const r = reminders.find(
    (x) => x.id == b.closest("[data-reminder]")?.dataset.reminder,
  );
  if (!r) return;
  const a = b.dataset.reminderAction;
  if (a == "edit") {
    reminderEdit = r.id;
    return renderReminders();
  }
  r.active = a == "restore";
  r.updated = Date.now();
  await reminderSave(r);
  renderNav();
  renderReminders();
});
