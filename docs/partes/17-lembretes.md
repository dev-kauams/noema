# Lembretes

A visão **Lembretes** registra avisos locais vinculados a uma data, com prioridade e estado ativo.

## Dados

`src/js/data/reminders.js` mantém a store `reminders` na base `noema`. A migração IndexedDB para a versão 3 cria essa store sem alterar notas ou tarefas. Cada registro possui título, detalhes, data, prioridade (`low`, `normal` ou `high`) e estado `active`.

## Interface

O painel permite criar e editar lembretes, filtrar por texto e prioridade, e visualizar os registros agrupados por data. O botão **Descartar** desativa o lembrete sem apagar seu histórico; a opção **descartados** permite restaurá-lo.

## Validação

- `npm run check` valida a ordem dos scripts, sintaxe e ausência de declarações globais duplicadas.
- `npm run build` gera `dist/noema.html`.
- A persistência depende do IndexedDB disponível no navegador.
