/* Itens do calendário derivados dos dados já carregados em memória. */
const calendarKey = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const calendarItemsOn = (dateKey) => [
  ...tasks
    .filter((task) => calendarKey(task.due) == dateKey)
    .map((task) => ({
      id: task.id,
      kind: "task",
      title: task.title || "Tarefa sem título",
      status: task.status,
    })),
  ...notes
    .filter((note) => !note.trash && calendarKey(note.updated || note.created) == dateKey)
    .map((note) => ({
      id: note.id,
      kind: "note",
      title: ttl(note),
    })),
];