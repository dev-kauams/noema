# Tarefas

A visão **Tarefas** organiza ações independentes das notas, com armazenamento local em IndexedDB.

## Dados

`src/js/data/tasks.js` mantém a store `tasks` na base `noema`. Cada tarefa possui título, detalhes, status (`todo`, `doing` ou `done`), favorito, prazo e datas de criação/alteração. A camada expõe carregamento, persistência, remoção e o filtro `matchT`.

A abertura da base foi atualizada para a versão 2. A migração cria a store de tarefas sem alterar a store existente de notas.

## Interface

A entrada **Tarefas** aparece na navegação lateral e abre o painel principal. O painel permite:

- criar tarefa com título, detalhes, status e prazo;
- editar qualquer campo;
- alternar o status entre a fazer, em andamento e concluída;
- favoritar e excluir;
- filtrar por texto ou status.

As tarefas continuam disponíveis depois de recarregar a aplicação quando o navegador oferece IndexedDB. Sem essa API, o restante do aplicativo mantém o comportamento de memória já existente.

## Validação

- `npm run check` passa sem arquivos órfãos, erros de sintaxe ou duplicatas globais.
- `npm run build` gera `dist/noema.html`.
- Os testes de navegador permanecem pendentes neste ambiente enquanto o módulo Python `playwright` não estiver instalado.
