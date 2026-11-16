// Empacota o projeto em UM arquivo HTML autocontido (dist/noema.html).
// Zero dependências: só Node. Lê index.html e embute os <link>/<script> locais, na ordem em que aparecem.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const ler = (p) => readFileSync(join(raiz, p), 'utf8');

let html = ler('index.html');
html = html.replace(/<link rel="stylesheet" href="(src\/[^"]+)">\n?/g, (_, p) => `<style>\n${ler(p)}</style>\n`);
html = html.replace(/<script src="(src\/[^"]+)"><\/script>\n?/g, (_, p) => `<script>\n${ler(p)}</script>\n`);

// Configuração de conta/sincronização: noema.config.json (veja o .example). Sem o arquivo, o app fica 100% local.
const cfgPath = process.env.NOEMA_CONFIG || join(raiz, 'noema.config.json');
const cfg = existsSync(cfgPath) ? JSON.stringify(JSON.parse(readFileSync(cfgPath, 'utf8'))) : null;
html = html.replace('<!-- noema:config -->', cfg ? `<script>window.NOEMA_CONFIG=${cfg.replace(/</g, '\\u003c')}</script>` : '');
console.log(cfg ? 'conta/sincronização: CONFIGURADA' : 'conta/sincronização: não configurada (app local)');

mkdirSync(join(raiz, 'dist'), { recursive: true });
writeFileSync(join(raiz, 'dist/noema.html'), html);
console.log(`dist/noema.html gerado (${(html.length / 1024).toFixed(1)} KB)`);
