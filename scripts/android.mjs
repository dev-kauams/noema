// Prepara a pasta que o Capacitor empacota no APK: gera o build e copia para dist-web/index.html.
// Depois: npx cap add android (1ª vez) e npx cap sync android. Passo a passo em docs/README.md, seção Android.
import { copyFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, [join(raiz, 'scripts/build.mjs')], { stdio: 'inherit' });
mkdirSync(join(raiz, 'dist-web'), { recursive: true });
copyFileSync(join(raiz, 'dist/noema.html'), join(raiz, 'dist-web/index.html'));
console.log('dist-web/index.html pronto. Próximo: npx cap sync android');
