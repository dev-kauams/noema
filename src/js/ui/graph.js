let graphZoom = 1;

const renderGraph = () => {
  const { nodes, edges } = graphData();
  const width = 900;
  const height = Math.max(360, Math.ceil(nodes.length / 4) * 150);
  const positions = Object.fromEntries(nodes.map((node, index) => [
    node.id,
    { x: 120 + (index % 4) * 220, y: 80 + Math.floor(index / 4) * 130 },
  ]));
  const lines = edges.map((edge) => {
    const from = positions[edge.from];
    const to = positions[edge.to];
    return from && to ? `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" />` : "";
  }).join("");
  const points = nodes.map((node) => {
    const point = positions[node.id];
    return `<g class="graph-node ${node.kind}" data-graph-node="${node.id}" transform="translate(${point.x} ${point.y})"><circle r="24"></circle><text y="43" text-anchor="middle">${esc(node.title.slice(0, 24))}</text></g>`;
  }).join("");
  $("#hm").innerHTML = `<section class="graph-panel"><header class="graph-head"><div><span class="eyebrow">conexões</span><h1>Grafo</h1></div><div class="graph-actions"><button class="gh" data-graph-zoom="out" aria-label="Diminuir zoom">−</button><button class="gh" data-graph-zoom="reset">100%</button><button class="gh" data-graph-zoom="in" aria-label="Aumentar zoom">+</button></div></header>${nodes.length ? `<div class="graph-stage"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Relações entre notas e tarefas"><g transform="scale(${graphZoom})"><g class="graph-edges">${lines}</g>${points}</g></svg></div>` : '<p class="m">Crie notas ou tarefas para visualizar relações.</p>'}</section>`;
};

$("#hm").addEventListener("click", (event) => {
  const zoom = event.target.closest("[data-graph-zoom]")?.dataset.graphZoom;
  if (zoom) {
    graphZoom = zoom == "reset" ? 1 : Math.max(0.7, Math.min(1.6, graphZoom + (zoom == "in" ? 0.15 : -0.15)));
    renderGraph();
    return;
  }
  const node = event.target.closest("[data-graph-node]");
  if (!node) return;
  const [kind, id] = node.dataset.graphNode.split(":");
  if (kind == "note") openN(id);
  else {
    view = "tasks";
    document.body.classList.add("home", "tasks");
    renderNav();
    renderTasks();
  }
});