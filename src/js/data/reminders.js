/* Dados dos lembretes: prazos locais, independentes de notas e tarefas. */
let reminders = [];
const reminderMk = (o) => ({
  id: uid(),
  title: "",
  body: "",
  date: ymd(),
  priority: "normal",
  active: true,
  created: Date.now(),
  updated: Date.now(),
  ...o,
});
const reminderGetAll = () => tx("readonly", (s) => s.getAll(), "reminders");
const reminderPut = (r) => tx("readwrite", (s) => s.put(r), "reminders");
const reminderSave = async (r) => {
  try {
    await reminderPut(r);
    return true;
  } catch (e) {
    return false;
  }
};
const reminderFilter = (r, q = "", priority = "all", active = true) => {
  const x = q.trim().toLowerCase();
  return (
    (!active || r.active) &&
    (priority == "all" || r.priority == priority) &&
    (!x || (r.title + " " + r.body).toLowerCase().includes(x))
  );
};
async function loadReminders() {
  try {
    reminders = await reminderGetAll();
    return reminders;
  } catch (e) {
    reminders = [];
    return reminders;
  }
}
