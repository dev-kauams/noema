"""Teste de fumaça (Playwright + Chromium). Uso:  python3 tests/smoke.py
Percorre: criação de perfil -> home -> nota nova -> formatação -> recarregar -> persistência."""
import pathlib, sys
from playwright.sync_api import sync_playwright

pagina = (pathlib.Path(__file__).parent.parent / "dist/noema.html").resolve().as_uri()
erros = []
with sync_playwright() as p:
    nav = p.chromium.launch()
    # O app anima com GSAP; sem prefers-reduced-motion o Chromium headless perde o sincronismo
    # de transição do onboarding (o #dd1 aparece antes de a animação terminar). Reduzir o
    # movimento torna o teste determinístico — é o mesmo que o app respeitar no navegador.
    pg = nav.new_context(
        viewport={"width": 1280, "height": 800}, reduced_motion="reduce"
    ).new_page()
    pg.on("pageerror", lambda e: erros.append(str(e)))
    pg.goto(pagina)
    pg.fill("#oi", "Ana"); pg.press("#oi", "Enter")                       # passo 1: nome
    pg.fill("#oi", "Souza"); pg.press("#oi", "Enter")                     # passo 2: sobrenome
    pg.fill("#dd1", "07"); pg.fill("#dd2", "03"); pg.fill("#dd3", "1999"); pg.press("#dd3", "Enter")  # passo 3: data
    pg.click("#oen"); pg.wait_for_selector("#hm .tile")                   # entra na home
    pg.keyboard.press("Alt+n"); pg.fill("#ti", "Prova de física")         # nota nova
    pg.click("#bo"); pg.keyboard.type("Cinemática"); pg.click(".tb [data-c=h1]")
    pg.wait_for_function("document.querySelector('#st').textContent.startsWith('Salvo')")  # salvo de verdade
    pg.reload(); pg.wait_for_timeout(600)
    assert pg.is_hidden("#ob"), "perfil deveria persistir após recarregar"
    pg.click("#nv [data-v=all]")
    assert "Prova de física" in pg.inner_text("#lp"), "a nota deveria persistir (IndexedDB)"
    pg.click("#bset"); pg.wait_for_selector("#sg[open]")                  # configurações em modal
    pg.click("[data-st=theme][data-x=light]"); assert pg.evaluate("document.documentElement.dataset.theme")=="light"
    pg.click("[data-st=motion][data-x=off]"); assert pg.evaluate("document.documentElement.dataset.motion")=="off"
    assert pg.input_value("#sgl")=="Souza"
    nav.close()
if erros: print("FALHOU:", erros); sys.exit(1)
print("ok: perfil (nome e sobrenome), nota, formatação, persistência e configurações funcionando.")
