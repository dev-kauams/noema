## Build, verificação e testes

**`index.html`** é a entrada de desenvolvimento: carrega os 12 CSS e os 23 JS na ordem certa. **`npm run build`** lê esse arquivo e embute cada `<link>`/`<script>` local, gerando **um único arquivo** (`dist/noema.html`) que funciona sem servidor e é o que se publica.

**`npm run check`** garante, sem dependências: todo arquivo citado existe, nenhum arquivo de `src/` está órfão, cada `.js` compila e **nenhuma função/const de nível superior é declarada duas vezes** (em scripts clássicos isso sobrescreveria em silêncio).

**Como a refatoração foi validada.** O projeto nasceu de um arquivo único. Para provar que dividir e consolidar o CSS não mudou nada, um navegador real (Chromium) abriu o original e o projeto, percorreu o app (perfil, home, nota, formatação, seletor de cor, dados, paleta, filtros, espaços, Zen, hover) em telas de 390 a 1600 px nos dois temas, e comparou **todas as propriedades computadas de todos os elementos**. Única diferença: o modo Zen aberto a partir da Início, que antes mostrava tela em branco (um conflito de ordem na cascata) e agora mostra o editor.

**`tests/sync.py`** (com `tests/mock-firebase.mjs`) valida conta e sincronização; **`tests/smoke.py`** repete o fluxo principal e confere a persistência: cria perfil, cria nota, formata, espera o indicador mostrar "Salvo" (de verdade), recarrega a página e confirma que perfil e nota continuam lá.

### Limitações conhecidas

- A conta e a sincronização dependem de um projeto Firebase que **você** cria (veja a seção Conta); sem ele, os dados ficam só neste aparelho. O backup em JSON leva as notas, mas não o perfil nem a lista de espaços.
- Calendário, grafo, canvas e IA do plano original ainda não existem. As visões de tarefas
  e lembretes foram adicionadas nas Fases 1 e 2; sua validação comportamental depende do
  Playwright disponível no ambiente de testes.
- O editor usa `execCommand` (obsoleto, mas funcional); trocar por um editor de blocos seria o próximo passo natural.
- O mapa de calor usa só a data da última edição.
- Dependência externa: GSAP (CDN) e Google Fonts; sem eles o app funciona, só sem animação e com fonte do sistema.

### Código literal da automação e do teste

<!-- codigo: index.html -->

<!-- codigo: scripts/build.mjs -->

<!-- codigo: scripts/check.mjs -->

<!-- codigo: scripts/docs.mjs -->

<!-- codigo: tests/smoke.py -->

<!-- codigo: package.json -->
