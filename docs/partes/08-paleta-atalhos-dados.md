## Paleta de comandos, atalhos, tema e backup

**Paleta (Ctrl+K).** `cmds()` monta, a cada abertura, os comandos fixos (ir para Início, espaços, nova nota, Zen, tema, animações, dados) **mais uma entrada por nota**; assim a paleta também é a busca universal. Setas navegam, Enter executa, Esc fecha.

**Atalhos globais (`shortcuts.js`).** Ctrl/Cmd+K paleta · Alt+N nova nota · Ctrl/Cmd+. modo Zen · Esc sai do Zen. Todos são ignorados enquanto a criação de perfil está aberta (`body.onb`).

**Tema.** O padrão é **AMOLED** (preto `#000`). O tema claro vive em `:root` e o escuro em `:root:not([data-theme="light"])`; alternar só muda o atributo `data-theme` e guarda em `localStorage`.

**Backup.** Páginas publicadas não podem baixar arquivos por script, então exportar mostra o JSON numa caixa para copiar. Importar valida cada item (`id` string, `body` string, `tags` array), sanitiza o HTML, **nunca apaga nada** (só adiciona ou atualiza pelo `id`) e informa quantos entraram e quantos falharam.

<!-- codigo: src/js/ui/palette.js -->

<!-- codigo: src/js/app/shortcuts.js -->

<!-- codigo: src/js/ui/theme.js -->

<!-- codigo: src/js/data/data-io.js -->
