/* Modelo de nota, visibilidade por visão e título de exibição. */
// Fábrica de nota: todo registro nasce com todos os campos.
const mk=o=>({id:uid(),title:'',body:'',html:'',space:'',tags:[],fav:false,arch:false,trash:false,inbox:false,created:Date.now(),updated:Date.now(),dirty:true,...o});
// Regra única de visibilidade: espaço atual + visão (lixeira, arquivo, inbox, favoritas, notas).
function inV(n){if(SP!==null&&n.space!==SP)return false;if(view=='trash')return n.trash;if(n.trash)return false;if(view=='archive')return n.arch;if(n.arch)return false;if(view=='inbox')return n.inbox;if(view=='fav')return n.fav;return !n.inbox}
const ttl=n=>n.title||'Sem título';
