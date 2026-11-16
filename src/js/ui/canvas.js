let sketchCanvas = null;
let sketchContext = null;
let sketchDrawing = false;
let sketchColor = "#222222";
let sketchWidth = 4;

const openCanvas = () => {
  if (!$("#sketch")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<dialog id="sketch" aria-label="Canvas de rascunho"><form method="dialog" class="sketch-modal"><header><h2>Rascunho</h2><button class="gh" value="cancel" aria-label="Fechar">×</button></header><div class="sketch-tools"><label>Cor <input id="sketch-color" type="color" value="${sketchColor}"></label><label>Largura <input id="sketch-width" type="range" min="1" max="28" value="${sketchWidth}"></label><button class="gh" type="button" id="sketch-clear">Limpar</button><button class="gh" type="button" id="sketch-print">Exportar</button></div><canvas id="sketch-board" width="1000" height="600"></canvas></form></dialog>`,
    );
    sketchCanvas = $("#sketch-board");
    sketchContext = sketchCanvas.getContext("2d");
    sketchContext.lineCap = "round";
    sketchCanvas.addEventListener("pointerdown", (event) => {
      sketchDrawing = true;
      sketchCanvas.setPointerCapture(event.pointerId);
      sketchContext.beginPath();
      sketchContext.moveTo(event.offsetX, event.offsetY);
    });
    sketchCanvas.addEventListener("pointermove", (event) => {
      if (!sketchDrawing) return;
      sketchContext.strokeStyle = sketchColor;
      sketchContext.lineWidth = sketchWidth;
      sketchContext.lineTo(event.offsetX, event.offsetY);
      sketchContext.stroke();
    });
    sketchCanvas.addEventListener("pointerup", () => {
      sketchDrawing = false;
    });
    $("#sketch-color").oninput = (event) => {
      sketchColor = event.target.value;
    };
    $("#sketch-width").oninput = (event) => {
      sketchWidth = +event.target.value;
    };
    $("#sketch-clear").onclick = () =>
      sketchContext.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
    $("#sketch-print").onclick = () => {
      const printWindow = open("", "_blank");
      printWindow.document.write(
        `<img src="${sketchCanvas.toDataURL("image/png")}" style="max-width:100%">`,
      );
      printWindow.print();
    };
  }
  $("#sketch").showModal();
};
