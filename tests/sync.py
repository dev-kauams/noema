"""Testa conta e sincronização contra o servidor de mentira (tests/mock-firebase.mjs), com dois "aparelhos".
Uso: python3 tests/sync.py"""
import json, pathlib, subprocess, sys, urllib.request
from playwright.sync_api import sync_playwright

raiz = pathlib.Path(__file__).parent.parent
srv = subprocess.Popen(["node", str(raiz / "tests/mock-firebase.mjs")], stdout=subprocess.PIPE, text=True)
porta = json.loads(srv.stdout.readline())["port"]
base = f"http://127.0.0.1:{porta}"
CFG = {"firebase": {"apiKey": "k", "projectId": "test"}, "authBase": base + "/identitytoolkit/v1", "tokenBase": base + "/securetoken/v1", "firestoreBase": base + "/v1"}
GOOGLE = "window.Capacitor={Plugins:{FirebaseAuthentication:{signInWithGoogle:async()=>({credential:{idToken:'gtok1'}})}}}"
erros = []

def docs(): return json.load(urllib.request.urlopen(base + "/debug/docs"))
def titulos(): return sorted(d["title"]["stringValue"] for k, d in docs().items() if "/notes/" in k and not d["deleted"]["booleanValue"])
def novo(b, google=False):
    ctx = b.new_context(viewport={"width": 1280, "height": 800}); ctx.add_init_script(f"window.NOEMA_CONFIG={json.dumps(CFG)};" + (GOOGLE if google else ""))
    pg = ctx.new_page(); pg.set_default_timeout(8000); pg.on("pageerror", lambda e: erros.append(str(e))); pg.goto((raiz / "dist/noema.html").as_uri()); return ctx, pg
def email(pg, mail, senha, criar=False):
    try:
        pg.click("#oem"); pg.fill("#oi", mail); pg.press("#oi", "Enter")
        if criar: pg.click("#otg")
        pg.fill("#oi", senha); pg.press("#oi", "Enter")
    except Exception:
        print("DIAG:", pg.evaluate("(()=>{const i=document.querySelector('#oi'),r=i.getBoundingClientRect(),e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return JSON.stringify({dlg:[...document.querySelectorAll('dialog[open]')].map(d=>d.id),box:[r.x,r.y,r.width,r.height],top:e&&(e.id||e.className||e.tagName),vis:getComputedStyle(i).visibility,ob:getComputedStyle(document.querySelector('#ob')).visibility,val:i.value,mode:obMode})})()")); raise
def tela(pg, texto): pg.wait_for_function("t=>{const q=document.querySelector('#ov .oq');return q&&q.textContent.toLowerCase().includes(t)}", arg=texto)
def perfil(pg, nome, sobrenome):
    tela(pg, "chamar")
    pg.fill("#oi", nome); pg.press("#oi", "Enter"); tela(pg, "sobrenome"); pg.fill("#oi", sobrenome); pg.press("#oi", "Enter"); tela(pg, "aniversário")
    pg.fill("#dd1", "07"); pg.fill("#dd2", "03"); pg.fill("#dd3", "1999"); pg.press("#dd3", "Enter"); pg.click("#oen"); pg.wait_for_selector("#hm .tile")
def sincronizado(pg): pg.evaluate("syncNow()"); pg.wait_for_function("SYNC.state=='idle'&&pendingCount()==0")
def salvo(pg): pg.wait_for_function("document.querySelector('#st')&&document.querySelector('#st').textContent.startsWith('Salvo')")

try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        # 1) aparelho A cria a conta (e-mail), cria o perfil com sobrenome e uma nota
        ctxA, A = novo(b); assert "entrar" in A.inner_text("#ov .oq").lower()
        assert A.is_hidden("#ogo"), "sem Google configurado, o botão não aparece"
        email(A, "ana@exemplo.com", "123", criar=True); assert "6 caracteres" in A.inner_text("#ov .oerr")   # senha fraca recusada
        A.fill("#oi", "segredo1"); A.press("#oi", "Enter"); perfil(A, "Ana", "Souza")
        A.keyboard.press("Alt+n"); A.fill("#ti", "Nota na nuvem"); A.click("#bo"); A.keyboard.type("texto"); salvo(A); sincronizado(A)
        assert "Nota na nuvem" in titulos(), "nota deveria estar na nuvem"
        perfil_nuvem = docs()["users/u1/meta/profile"]; assert perfil_nuvem["last"]["stringValue"] == "Souza", "sobrenome no perfil da conta"
        # 2) aparelho B entra com a mesma conta: pula o perfil e recebe a nota
        ctxB, B = novo(b); email(B, "ana@exemplo.com", "errada"); B.wait_for_function("document.querySelector('#ov .oerr').textContent.includes('incorretos')")
        B.fill("#oi", "segredo1"); B.press("#oi", "Enter"); tela(B, "de volta"); B.click("#oen")
        B.wait_for_function("notes.some(n=>n.title=='Nota na nuvem')&&SYNC.state=='idle'"); assert B.evaluate("prof.name+' '+prof.last") == "Ana Souza"
        # 3) edição em B chega em A
        B.evaluate("openN(notes.find(n=>n.title=='Nota na nuvem').id)"); B.fill("#ti", "Editada no B"); salvo(B); sincronizado(B)
        A.evaluate("syncNow()"); A.wait_for_function("notes.some(n=>n.title=='Editada no B')")
        # 4) offline: a alteração fica pendente e sobe quando a conexão volta
        ctxB.set_offline(True); B.fill("#ti", "Offline B"); salvo(B)
        assert B.evaluate("pendingCount()") >= 1; B.evaluate("syncNow()"); B.wait_for_function("SYNC.state=='offline'")
        ctxB.set_offline(False); sincronizado(B); assert "Offline B" in titulos()
        # 5) conflito: A edita sem conexão, B edita e envia; ao voltar, nada se perde (cópia local)
        A.evaluate("syncNow()"); A.wait_for_function("notes.some(n=>n.title=='Offline B')"); ctxA.set_offline(True)
        A.evaluate("openN(notes.find(n=>n.title=='Offline B').id)"); A.fill("#ti", "Versão de A"); salvo(A)
        B.fill("#ti", "Versão de B"); salvo(B); sincronizado(B); ctxA.set_offline(False); sincronizado(A)
        ts = A.evaluate("notes.map(n=>n.title)"); assert "Versão de B" in ts and "Versão de A (cópia local)" in ts, ts
        # 6) exclusão definitiva se propaga
        B.evaluate("syncNow()"); B.wait_for_function("notes.some(n=>n.title=='Versão de A (cópia local)')")
        B.evaluate("(()=>{const n=notes.find(n=>n.title=='Versão de A (cópia local)');n.trash=true;n.updated=Date.now();n.dirty=true;return save(n)})()")
        B.evaluate("(async()=>{const n=notes.find(n=>n.title=='Versão de A (cópia local)');await rm(n.id);notes=notes.filter(x=>x!=n);syncTomb(n.id)})()"); sincronizado(B)
        A.evaluate("syncNow()"); A.wait_for_function("!notes.some(n=>n.title=='Versão de A (cópia local)')")
        # 7) configurações em modal: tema, animações, perfil e saída
        A.click("#bset"); A.wait_for_selector("#sg[open]"); assert "ana@exemplo.com" in A.inner_text("#sgb")
        A.click("[data-st=theme][data-x=light]"); assert A.evaluate("document.documentElement.dataset.theme") == "light"
        A.fill("#sgn", "Ana Maria"); A.click("[data-st=saveprof]"); sincronizado(A); assert docs()["users/u1/meta/profile"]["name"]["stringValue"] == "Ana Maria"
        A.click("[data-st=logout]"); A.wait_for_selector(".sgx"); A.click("[data-st=out-wipe]"); A.wait_for_selector("#oem")
        assert A.evaluate("notes.length==0&&prof===null&&localStorage.getItem('noema-session')===null"), "sair apagando limpa o aparelho"
        # 8) Google (plugin nativo simulado) e separação entre contas no mesmo aparelho
        ctxC, C = novo(b, google=True); C.click("#ogo"); perfil(C, "Gui", "Lima"); sincronizado(C)
        assert "google-gtok1@example.com" in C.evaluate("SES.email"); gui = C.evaluate("notes.map(n=>n.id)"); assert gui; C.click("#bset"); C.click("[data-st=logout]"); C.click("[data-st=out-keep]")
        C.wait_for_function("SES===null"); C.click("#bset"); C.click("[data-st=login]"); email(C, "ana@exemplo.com", "segredo1"); C.click("#oen")
        C.wait_for_function("SES&&SES.email=='ana@exemplo.com'&&SYNC.state=='idle'"); depois = C.evaluate("notes.map(n=>n.id)"); assert depois and not set(gui) & set(depois), "dados de outra conta foram misturados"
        assert not any(k.startswith("users/u1/") and i in k for k in docs() for i in gui), "notas do Gui subiram para a conta da Ana"
        assert C.evaluate("prof.name")=="Ana Maria"; b.close()
finally:
    srv.terminate()
if erros: print("erros JS:", erros); sys.exit(1)
print("ok: conta por e-mail e Google, perfil com sobrenome, sincronização A<->B, offline, conflito sem perda, exclusão, configurações e troca de conta.")
