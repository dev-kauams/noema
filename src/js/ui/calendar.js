let calendarCursor = new Date();
let calendarSelected = "";

const calendarMonthLabel = (date) =>
  new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);

const renderCalendar = () => {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const today = calendarKey(new Date());
  const selected = calendarSelected || today;
  const cells = [];

  for (let i = 0; i < offset; i += 1) cells.push('<div class="calendar-day is-empty"></div>');
  for (let day = 1; day <= days; day += 1) {
    const key = calendarKey(new Date(year, month, day));
    const items = calendarItemsOn(key);
    cells.push(
      `<button class="calendar-day${key == today ? " is-today" : ""}${key == selected ? " is-selected" : ""}" data-calendar-day="${key}"><b>${day}</b>${items.length ? `<span>${items.length} item${items.length == 1 ? "" : "s"}</span>` : ""}</button>`,
    );
  }

  const selectedItems = calendarItemsOn(selected);
  $("#hm").innerHTML = `<section class="calendar-panel" aria-label="Calendário">
    <header class="calendar-head"><div><span class="eyebrow">agenda</span><h1>${calendarMonthLabel(calendarCursor)}</h1></div>
      <div class="calendar-actions"><button class="gh" data-calendar-nav="prev" aria-label="Mês anterior">←</button><button class="gh" data-calendar-nav="today">Hoje</button><button class="gh" data-calendar-nav="next" aria-label="Próximo mês">→</button></div>
    </header>
    <div class="calendar-weekdays">${["seg", "ter", "qua", "qui", "sex", "sáb", "dom"].map((day) => `<span>${day}</span>`).join("")}</div>
    <div class="calendar-grid">${cells.join("")}</div>
    <section class="calendar-items"><h2>${new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(new Date(`${selected}T12:00:00`))}</h2>${selectedItems.length ? selectedItems.map((item) => `<article class="calendar-item"><span class="calendar-kind">${item.kind == "task" ? "tarefa" : "nota"}</span><strong>${esc(item.title)}</strong></article>`).join("") : '<p class="m">Nenhum item neste dia.</p>'}</section>
  </section>`;
};

$("#hm").onclick = (event) => {
  const day = event.target.closest("[data-calendar-day]");
  if (day) {
    calendarSelected = day.dataset.calendarDay;
    renderCalendar();
    return;
  }
  const action = event.target.closest("[data-calendar-nav]")?.dataset.calendarNav;
  if (!action) return;
  if (action == "today") calendarCursor = new Date();
  else calendarCursor.setMonth(calendarCursor.getMonth() + (action == "next" ? 1 : -1));
  calendarSelected = "";
  renderCalendar();
};