## Home gráfica e espaços

**Espaços** são contextos dentro do mesmo perfil (Escola, Trabalho, Pessoal, ou os seus). Ficam em `prof.spaces`; cada nota guarda o **nome** do espaço em `note.space`. Renomear atualiza todas as notas do espaço; remover **não apaga** notas (elas voltam para "Sem espaço"). A remoção pede um segundo clique ("Confirmar remoção").

**Home (`renderHome`)** é calculada só dos dados reais:

- **Blocos por espaço:** total de notas e 14 barras com a atividade dos últimos 14 dias. A altura de cada barra é `4 + round(v / máximo × 26)` px.
- **Mapa de calor:** 98 dias (14 semanas) em colunas de 7 linhas. Preenche-se com células invisíveis até o primeiro dia cair no dia da semana certo (`getDay()`); a opacidade é `0,28 + 0,72 × v / máximo` (ou `0,08` se não houve edição).
- **Atenção:** só existe a data da **última edição** de cada nota, então o mapa subestima a atividade passada. O rótulo da tela diz "notas editadas por dia".
- **Recentes:** 5 últimas notas fora de arquivo/inbox, respeitando o espaço escolhido.
- **Saudação (`hiHTML`):** "Bom dia/tarde/noite" por horário, mais os dias que faltam para o aniversário (ou parabéns no dia).

<!-- codigo: src/js/ui/home.js -->

<!-- codigo: src/js/ui/spaces.js -->
