/* Dados das tarefas: registros separados das notas, na mesma base local. */
let tasks = [];
const taskMk = (o) => ({
  id: uid(),
  title: "",
  body: "",
  status: "todo",
  fav: false,
  due: "",
  created: Date.now(),
  updated: Date.now(),
  ...o,
});
const taskGetAll = () => tx("readonly", (s) => s.getAll(), "tasks");
const taskPut = (t) => tx("readwrite", (s) => s.put(t), "tasks");
const taskDelete = (id) => tx("readwrite", (s) => s.delete(id), "tasks");
const taskSave = async (t) => {
  try {
    await taskPut(t);
    return true;
  } catch (e) {
    return false;
  }
};
const taskRemove = async (id) => {
  try {
    await taskDelete(id);
    return true;
  } catch (e) {
    return false;
  }
};
const matchT = (t, q = "", status = "all") => {
  const x = q.trim().toLowerCase();
  return (
    (status == "all" || t.status == status) &&
    (!x || (t.title + " " + t.body).toLowerCase().includes(x))
  );
};
async function loadTasks() {
  try {
    tasks = await taskGetAll();
    return tasks;
  } catch (e) {
    tasks = [];
    return tasks;
  }
}
