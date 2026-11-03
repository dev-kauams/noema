/* Camada de persistência: IndexedDB com promessas. */
// Abre o banco 'noema' (object store 'notes'). Rejeita se o navegador não oferecer IndexedDB.
const openDB = () =>
  new Promise((res, rej) => {
    try {
      const r = indexedDB.open("noema", 3);
      r.onupgradeneeded = () => {
        if (!r.result.objectStoreNames.contains("notes"))
          r.result.createObjectStore("notes", { keyPath: "id" });
        if (!r.result.objectStoreNames.contains("tasks"))
          r.result.createObjectStore("tasks", { keyPath: "id" });
        if (!r.result.objectStoreNames.contains("reminders"))
          r.result.createObjectStore("reminders", { keyPath: "id" });
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) {
      rej(e);
    }
  });
// Executa uma operação numa transação; sem banco devolve vazio (modo só memória).
const tx = (m, f, sn = "notes") =>
  db
    ? new Promise((res, rej) => {
        const t = db.transaction(sn, m);
        const r = f(t.objectStore(sn));
        t.oncomplete = () => res(r && r.result);
        t.onerror = t.onabort = () => rej(t.error);
      })
    : Promise.resolve([]);
// Gravar e remover: só resolvem no 'oncomplete' da transação, ou seja, quando realmente persistiu.
// Esvazia o banco local (usado ao sair da conta apagando os dados do aparelho).
const clearAll = () =>
  db
    ? new Promise((res, rej) => {
        const t = db.transaction(["notes", "tasks", "reminders"], "readwrite");
        ["notes", "tasks", "reminders"].forEach((n) =>
          t.objectStore(n).clear(),
        );
        t.oncomplete = () => res(true);
        t.onerror = t.onabort = () => rej(t.error);
      })
    : Promise.resolve(true);
const put = (n) => tx("readwrite", (s) => s.put(n)),
  rm = (id) => tx("readwrite", (s) => s.delete(id)),
  getAll = () => tx("readonly", (s) => s.getAll());
// Salva e devolve true/false; nunca lança erro.
const save = async (n) => {
  try {
    await put(n);
    return true;
  } catch (e) {
    return false;
  }
};
