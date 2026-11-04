/* Estado global do app (variáveis de módulo compartilhadas). */
// Estado global: notas em memória, visão atual, nota aberta, busca e controle do autosave (timer, ver, saved).
let db = null,
  notes = [],
  view = "home",
  cur = null,
  q = "",
  tagF = null,
  timer = 0,
  ver = 0,
  saved = 0,
  delArm = false,
  pIdx = 0,
  lastR = null,
  shown = [];
const VIEWS = [
  ["inbox", "Inbox"],
  ["all", "Notas"],
  ["fav", "Favoritas"],
  ["archive", "Arquivo"],
  ["trash", "Lixeira"],
  ["tasks", "Tarefas"],
  ["reminders", "Lembretes"],
  ["calendar", "Calendário"],
];
let prof = null,
  obTmp = {},
  obDone = false,
  obEdit = false,
  lastEd = null;
let SP = null;
