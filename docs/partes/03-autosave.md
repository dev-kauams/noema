## Salvamento automático

O indicador **nunca mente**: "Salvo" só aparece depois que a transação do IndexedDB termina (`oncomplete`). Estados: *Alterações locais…* → *Salvando…* → *Salvo às HH:MM* (ou *Falha ao salvar*). Cada edição incrementa `ver`; ao terminar de gravar, `flush` compara a versão que gravou (`v`) com a atual. Se o usuário continuou digitando, **não** mostra "Salvo".

```mermaid
sequenceDiagram
  participant U as Usuário
  participant E as onEdit
  participant T as touch
  participant F as flush
  participant DB as IndexedDB
  U->>E: digita
  E->>T: ver++ (v1)
  T->>T: agenda flush em 500 ms (debounce)
  U->>E: digita de novo
  E->>T: ver++ (v2), reinicia o timer
  T->>F: após 500 ms sem digitar
  F->>DB: put(nota)  [v = 2]
  DB-->>F: oncomplete
  F->>F: v == ver ? "Salvo" : continua em "Alterações locais"
```

Ao trocar de nota, `openN` e `newNote` chamam `flush()` antes, e `beforeunload` tenta gravar a pendência.

<!-- codigo: src/js/data/autosave.js -->
