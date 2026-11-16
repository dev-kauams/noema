// Gera docs/README.md juntando os textos de docs/partes/*.md com o CÓDIGO LITERAL dos arquivos.
// Marcador:  <!-- codigo: src/js/ui/editor.js -->   ->  bloco de código com o arquivo inteiro.
// Assim a documentação nunca se afasta do código: rode `npm run docs` depois de qualquer mudança.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const lang = { '.js': 'js', '.css': 'css', '.html': 'html', '.mjs': 'js', '.py': 'python' };
const partes = readdirSync(join(raiz, 'docs/partes')).filter((n) => n.endsWith('.md')).sort();

let corpo = partes.map((n) => readFileSync(join(raiz, 'docs/partes', n), 'utf8').trim()).join('\n\n---\n\n');
let blocos = 0, linhas = 0;
corpo = corpo.replace(/<!-- codigo: (\S+) -->/g, (_, caminho) => {
  const src = readFileSync(join(raiz, caminho), 'utf8').replace(/\n+$/, '');
  blocos++; linhas += src.split('\n').length;
  return `**\`${caminho}\`** (${src.split('\n').length} linhas)\n\n\`\`\`${lang[extname(caminho)] || ''}\n${src}\n\`\`\``;
});

const titulos = [...corpo.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
const ancora = (t) => t.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-');
const indice = titulos.map((t) => `- [${t}](#${ancora(t)})`).join('\n');

const saida = `<!-- ARQUIVO GERADO por scripts/docs.mjs. Edite os textos em docs/partes/ e rode: npm run docs -->\n\n${corpo.replace('<!-- indice -->', indice)}\n`;
writeFileSync(join(raiz, 'docs/README.md'), saida);
console.log(`docs/README.md gerado: ${blocos} blocos de código, ${linhas} linhas de código embutidas.`);
