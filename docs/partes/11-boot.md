## Inicialização (boot)

```mermaid
sequenceDiagram
  participant P as Página
  participant B as IIFE de boot
  participant DB as IndexedDB
  participant O as Onboarding
  P->>B: scripts carregados (nada rodou ainda além dos listeners)
  B->>B: loadProf(), aplica tema salvo
  B->>DB: openDB() + getAll()
  DB-->>B: notas (ou vazio se bloqueado)
  B->>B: sanitiza html, normaliza espaço, cria nota de boas-vindas se vazio
  B->>B: renderNav/List/Ed, paintProf()
  alt já existe perfil
    B->>O: closeOb() (cortina sobe)
  else primeiro acesso
    B->>O: runOb(false) (telas cheias)
  end
  O-->>P: introApp(): home e animações de entrada
```

Os `<script>` rodam em ordem; quase tudo que executa ao carregar é apenas registrar *listeners*. Só o último arquivo (`boot.js`) inicia o fluxo, quando todas as funções já existem.

<!-- codigo: src/js/app/boot.js -->
