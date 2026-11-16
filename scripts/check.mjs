// Verificações estáticas, sem dependências:
//  1. todo arquivo referenciado em index.html existe;
//  2. todo arquivo de src/ é referenciado (nada órfão);
//  3. cada .js compila (sintaxe);
//  4. nenhuma função/const de nível superior é declarada duas vezes (scripts clássicos compartilham escopo).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(raiz, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:href|src)="(src\/[^"]+)"/g)].map((m) => m[1]);
const erros = [];

const listar = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? listar(p) : [relative(raiz, p).replaceAll('\\', '/')];
});
const todos = listar(join(raiz, 'src'));

for (const r of refs) if (!todos.includes(r)) erros.push(`referenciado mas inexistente: ${r}`);
for (const t of todos) if (!refs.includes(t)) erros.push(`arquivo órfão (não está no index.html): ${t}`);

const decl = new Map();
for (const r of refs.filter((x) => x.endsWith('.js'))) {
  const src = readFileSync(join(raiz, r), 'utf8');
  try { new vm.Script(src, { filename: r }); } catch (e) { erros.push(`sintaxe em ${r}: ${e.message}`); }
  for (const m of src.matchAll(/^(?:async\s+)?(?:function\s+(\w+)|(?:const|let)\s+(\w+))/gm)) {
    const nome = m[1] || m[2];
    if (decl.has(nome)) erros.push(`'${nome}' declarado em ${decl.get(nome)} e em ${r}`);
    else decl.set(nome, r);
  }
}

if (erros.length) { console.error('FALHOU:\n- ' + erros.join('\n- ')); process.exit(1); }
console.log(`ok: ${refs.length} arquivos referenciados, ${decl.size} declarações de nível superior, sem duplicatas.`);
