"""Valida a exportação (PDF, TXT, JSON) com uma nota cheia de formatação. Uso: python3 tests/export.py
Requer: playwright (Chromium) e pypdf."""
import base64, json, pathlib, subprocess, sys, tempfile
from playwright.sync_api import sync_playwright
from pypdf import PdfReader

pagina = (pathlib.Path(__file__).parent.parent / "dist/noema.html").resolve().as_uri()
HTML = ('<h1>Mecânica</h1><p>Texto normal, <b>negrito</b>, <i>itálico</i>, <u>sublinhado</u>, '
        '<span style="color: rgb(217, 70, 62);">vermelho</span>, <span style="background-color: rgba(255, 200, 0, 0.42);">grifado</span> e '
        '<span style="font-size: 27px;">grande</span>.</p><ul><li>item um</li><li>item <b>dois</b></li></ul><h2>Tópico</h2>'
        + ''.join(f'<p>Parágrafo {i} com bastante texto para forçar a quebra de linha e a mudança de página no PDF exportado.</p>' for i in range(60)))
out = pathlib.Path(tempfile.mkdtemp())
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={"width": 1280, "height": 800}).new_page(); erros = []
    pg.on("pageerror", lambda e: erros.append(str(e))); pg.goto(pagina)
    pg.fill("#oi", "Ana"); pg.press("#oi", "Enter"); pg.fill("#oi", "Souza"); pg.press("#oi", "Enter"); pg.press("#dd1", "Enter"); pg.click("#oen"); pg.wait_for_selector("#hm .tile")
    pg.keyboard.press("Alt+n"); pg.fill("#ti", "Prova de Física")
    pg.evaluate("h=>{cur.html=h;cur.body=h.replace(/<[^>]+>/g,' ');cur.tags=['escola','prova'];cur.space='Escola'}", HTML)
    pdf = pg.evaluate("()=>btoa(String.fromCharCode(...exportPDF(cur)))")
    js = pg.evaluate("()=>exportJSON(cur)"); txt = pg.evaluate("()=>exportTXT(cur)")
    pg.click("#bo"); pg.click("[data-a=exp]"); pg.wait_for_selector("#xd[open]"); b.close()
(out / "nota.pdf").write_bytes(base64.b64decode(pdf)); r = PdfReader(out / "nota.pdf")
assert len(r.pages) >= 2, "deveria paginar"
for i, pgn in enumerate(r.pages):
    t = pgn.extract_text()
    assert "NOEMA" in t and "@dev-kauams" in t and "Autor: Ana Souza" in t, f"cabeçalho/rodapé ausentes na página {i+1}"
    assert f"Página {i+1} de {len(r.pages)}" in t
assert "Mecânica" in r.pages[0].extract_text() and r.metadata.author == "Ana Souza"
d = json.loads(js); runs = [x for b in d["blocks"] for x in b["runs"]]
get = lambda s: next(x for x in runs if x["text"].strip(" ,.") == s)
assert get("negrito")["bold"] and get("itálico")["italic"] and get("sublinhado")["underline"]
assert get("vermelho")["color"] == "#d9463e" and get("grifado")["background"] == "#ffc800" and get("grande")["fontSizePx"] == 27
assert d["author"] == "Ana Souza" and d["credit"] == "@dev-kauams" and d["blocks"][0]["type"] == "chapter"
for m in ("**negrito**", "_itálico_", "__sublinhado__", "{cor:#d9463e}vermelho{/cor}", "==grifado==", "CAPÍTULO 1."):
    assert m in txt, m
subprocess.run(["pdftoppm", "-png", "-r", "70", "-f", "1", "-l", "1", str(out / "nota.pdf"), str(out / "pagina")], check=True)
print("ok:", len(r.pages), "páginas;", "JSON e TXT com toda a formatação;", "PNG em", out)
if erros: print("erros JS:", erros); sys.exit(1)
