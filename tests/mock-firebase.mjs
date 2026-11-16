// Servidor de mentira que imita as partes do Firebase Auth e do Firestore usadas pelo NOEMA (REST).
// Serve para testar a sincronização sem internet e sem conta real. Uso: node tests/mock-firebase.mjs   (imprime {"port":N})
import http from 'node:http';

const users = new Map(), byEmail = new Map(), tokens = new Map(), refresh = new Map(), docs = new Map();
let seq = 0;
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization,content-type', 'access-control-allow-methods': 'GET,POST,OPTIONS' };
const send = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json', ...CORS }); res.end(JSON.stringify(obj)); };
const erro = (res, msg, code = 400) => send(res, code, { error: { code, message: msg, status: msg } });

function emitir(uid, email) {
  const id = `id-${uid}-${++seq}`, rf = `rf-${uid}-${seq}`;
  tokens.set(id, uid); refresh.set(rf, uid);
  return { idToken: id, refreshToken: rf, expiresIn: '3600', localId: uid, email };
}
function criar(email, password) {
  const uid = 'u' + (users.size + 1);
  users.set(uid, { email, password }); byEmail.set(email, uid); return uid;
}

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  let raw = ''; req.on('data', (c) => (raw += c));
  req.on('end', () => {
    const url = new URL(req.url, 'http://x'), p = decodeURIComponent(url.pathname);
    if (p === '/debug/docs') return send(res, 200, Object.fromEntries(docs));
    const body = raw && raw.startsWith('{') ? JSON.parse(raw) : {};
    // ---- Authentication ----
    if (p.endsWith('/accounts:signUp')) {
      if (byEmail.has(body.email)) return erro(res, 'EMAIL_EXISTS');
      if ((body.password || '').length < 6) return erro(res, 'WEAK_PASSWORD : Password should be at least 6 characters');
      return send(res, 200, emitir(criar(body.email, body.password), body.email));
    }
    if (p.endsWith('/accounts:signInWithPassword')) {
      const uid = byEmail.get(body.email);
      if (!uid || users.get(uid).password !== body.password) return erro(res, 'INVALID_LOGIN_CREDENTIALS');
      return send(res, 200, emitir(uid, body.email));
    }
    if (p.endsWith('/accounts:signInWithIdp')) {
      const tok = /(?:id_token|access_token)=([^&]+)/.exec(body.postBody || '')?.[1];
      if (!tok) return erro(res, 'INVALID_IDP_RESPONSE');
      const email = `google-${tok}@example.com`;
      return send(res, 200, { ...emitir(byEmail.get(email) || criar(email, null), email), federatedId: 'google.com' });
    }
    if (p.endsWith('/accounts:sendOobCode')) return send(res, 200, { email: body.email });
    if (p.endsWith('/securetoken/v1/token')) {
      const uid = refresh.get(new URLSearchParams(raw).get('refresh_token'));
      if (!uid) return erro(res, 'INVALID_REFRESH_TOKEN');
      const t = emitir(uid, users.get(uid).email);
      return send(res, 200, { id_token: t.idToken, refresh_token: t.refreshToken, user_id: uid, expires_in: '3600' });
    }
    // ---- Firestore (aplica a mesma regra de segurança: só o dono lê e escreve) ----
    const m = /^\/v1\/projects\/[^/]+\/databases\/\(default\)\/documents(.*)$/.exec(p);
    if (m) {
      const uid = tokens.get((req.headers.authorization || '').replace('Bearer ', ''));
      if (!uid) return erro(res, 'UNAUTHENTICATED', 401);
      const alvo = m[1];
      if (alvo === ':commit') {
        for (const w of body.writes) if (!/\/documents\/users\/([^/]+)\//.exec(w.update.name)?.[1]?.startsWith(uid) || !w.update.name.includes(`/users/${uid}/`)) return erro(res, 'PERMISSION_DENIED', 403);
        for (const w of body.writes) docs.set(w.update.name.split('/documents/')[1], w.update.fields);
        return send(res, 200, { writeResults: body.writes.map(() => ({})) });
      }
      const q = /^\/users\/([^/:]+):runQuery$/.exec(alvo);
      if (q) {
        if (q[1] !== uid) return erro(res, 'PERMISSION_DENIED', 403);
        const since = +body.structuredQuery.where.fieldFilter.value.integerValue;
        const lista = [...docs].filter(([k, f]) => k.startsWith(`users/${uid}/notes/`) && +f.updated.integerValue > since)
          .sort((a, b) => a[1].updated.integerValue - b[1].updated.integerValue).slice(0, body.structuredQuery.limit)
          .map(([k, fields]) => ({ document: { name: `x/documents/${k}`, fields } }));
        return send(res, 200, lista.length ? lista : [{ readTime: new Date().toISOString() }]);
      }
      const g = /^\/users\/([^/]+)\/meta\/profile$/.exec(alvo);
      if (g) {
        if (g[1] !== uid) return erro(res, 'PERMISSION_DENIED', 403);
        const f = docs.get(`users/${uid}/meta/profile`);
        return f ? send(res, 200, { name: p, fields: f }) : erro(res, 'NOT_FOUND', 404);
      }
    }
    erro(res, 'NOT_FOUND', 404);
  });
}).listen(+process.argv[2] || 0, '127.0.0.1', function () { console.log(JSON.stringify({ port: this.address().port })); });
