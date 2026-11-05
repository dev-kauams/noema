const graphData = () => {
  const nodes = [
    ...notes.filter((note) => !note.trash).map((note) => ({
      id: `note:${note.id}`,
      ref: note.id,
      kind: "note",
      title: ttl(note),
    })),
    ...tasks.map((task) => ({
      id: `task:${task.id}`,
      ref: task.id,
      kind: "task",
      title: task.title || "Tarefa sem título",
    })),
  ];
  const edges = [];
  notes.filter((note) => !note.trash).forEach((note) => {
    [...(note.body || "").matchAll(/\[\[([^\]\n]+)\]\]/g)].forEach((match) => {
      const target = notes.find(
        (candidate) => !candidate.trash && candidate.title.toLowerCase() == match[1].trim().toLowerCase(),
      );
      if (target) edges.push({ from: `note:${note.id}`, to: `note:${target.id}` });
    });
  });
  tasks.forEach((task) => {
    const dependencies = Array.isArray(task.dependsOn) ? task.dependsOn : [];
    dependencies.forEach((id) => {
      if (tasks.some((candidate) => candidate.id == id)) edges.push({ from: `task:${task.id}`, to: `task:${id}` });
    });
  });
  return { nodes, edges };
};