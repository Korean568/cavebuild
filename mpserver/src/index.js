/* CAVEBUILD 멀티플레이 중계 서버 (Cloudflare Worker + Durable Object)
   방 코드 하나 = 방(Durable Object) 하나. 방장 1명 + 친구 여러 명.
   서버는 게임 내용을 읽지 않고 그대로 전달만 함:
   - 친구 → 방장: "친구번호|내용"
   - 방장 → 친구: 방장이 "친구번호|내용" 으로 보내면 그 친구에게 "내용"만
   - 방장 → 서버: "!pub{...}" 공개 방 정보 바꾸기 (공개 · 비공개 · 이름)
   🌍 공개 서버 (persist): 방장이 나가도 서버가 꺼지지 않음
   - 방장 게임이 "!sv{s,i,n}\n조각" 으로 세계를 30초마다 올림 → 이 방(Durable Object) 저장소에 보관
   - 방장이 나가거나 끊기면 6초 기다렸다가, 남은 사람 중 한 명에게 {"t":"_promote"} (새 방장) · 나머지는 {"t":"_rehost"} (다시 접속)
   - 아무도 없을 때 들어오는 사람도 {"t":"_promote"} → role=host&resume=1 로 다시 접속 → 저장된 세계를 {"t":"_w",i,n,d} 조각으로 받음
   - 만든 사람(key)만 POST /room/코드/del 로 지울 수 있음 · 지우기 전까지 로비 목록에 남음
   공개 방은 로비(Durable Object 하나)에 이름 · 방장 · 인원을 올림 → GET /rooms 로 목록 */
const MAX_GUESTS = 20;
const KINDS = ['survival', 'pvp', 'build', 'rp']; // 🌐 CAVEBUILD ONLINE 서버 종류: 서바이벌 · PvP 아레나 · 빌드 · 조직 RP
// ⭐ 공식 서버: POST /room/코드/official {name,kind,token} — 어드민 계정으로 로그인한 사람만 (계정 서버에 물어서 확인) · 목록 맨 위에 항상 남음
const ACCOUNT_API = 'https://geulbeot-rho.vercel.app/api/cavebuild';
async function accountOf(token) { // 로그인 열쇠로 계정 서버에 물어서 진짜 계정 확인 (닉네임을 믿지 않음)
  if (typeof token !== 'string' || token.length < 32) return null;
  try { const r = await fetch(ACCOUNT_API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'me', token }) }); const d = await r.json(); return (d && d.user) || null; } catch (e) { return null; }
}
async function isAdminToken(token) {
  if (typeof token !== 'string' || token.length < 32) return false;
  try { const r = await fetch(ACCOUNT_API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'me', token }) }); const d = await r.json(); return !!(d && d.user && d.user.admin); } catch (e) { return false; }
}
const CHUNK = 32000;      // 저장소 한 칸에 넣는 글자 수
const SEND_CHUNK = 250000; // 저장된 세계를 보낼 때 한 번에 보내는 글자 수
const TRASH_MS = 7 * 86400000; // 지운 서버를 되살릴 수 있는 기간
const HOST_ANSWER_MS = 20000; // 친구가 말을 걸었는데 방장이 이만큼 답이 없으면 방장을 내보냄
const cors = { 'access-control-allow-origin': '*', 'content-type': 'application/json; charset=utf-8' };
// 공식 서버 이름의 CAVE (낱말) → CLKKY (CAVE CITY → CLKKY CITY · 게임 이름 CAVEBUILD 는 그대로) · 바뀌면 true
function clkky(p) { if (!p || !p.off || typeof p.name !== 'string' || !/\bCAVE\b/.test(p.name)) return false; p.name = p.name.replace(/\bCAVE\b/g, 'CLKKY'); return true; }

export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.host = null;
    this.guests = new Map(); // 번호 → ws
    this.next = 1;
    this.code = '';
    this.pub = null; // 공개 방이면 { name, nick, mode }
    this.lobbyT = 0;
    this.meta = null; // 공개 서버 정보 { persist, key, pub, wn, t }
    this.up = null;   // 올라오는 중인 세계 조각
    this.grace = null; // 방장이 끊긴 뒤 기다리는 중 (그동안 같은 방장만 tok 으로 다시 붙을 수 있음)
    this.hostTok = '';
    this.answered = new Set(); // 방장이 답한 적 있는 친구 번호
    this.dropHost = null;
    this.ready =state.blockConcurrencyWhile(async () => { this.meta = (await state.storage.get('meta')) || null; if (this.meta) { this.pub = this.meta.pub; if (clkky(this.pub)) await state.storage.put('meta', this.meta); } });
  }
  lobby(del) { // 로비에 이 방을 올리거나 내림
    if (!this.code) return;
    const L = this.env.LOBBY.get(this.env.LOBBY.idFromName('lobby'));
    const persist = !!(this.meta && this.meta.persist);
    const body = del || !this.pub || (!this.host && !persist) ? { code: this.code, del: 1 } : { code: this.code, ...this.pub, n: this.host ? this.guests.size + 1 : 0, max: MAX_GUESTS + 1, persist: persist ? 1 : 0, ops: (this.meta && this.meta.ops) || [] };
    this.lobbyT = Date.now();
    return L.fetch('https://lobby/set', { method: 'POST', body: JSON.stringify(body) }).catch(() => {});
  }
  async saveMeta() { if (this.meta) await this.state.storage.put('meta', this.meta); }
  trashLobby(body) { return this.env.LOBBY.get(this.env.LOBBY.idFromName('lobby')).fetch('https://lobby/trash-set', { method: 'POST', body: JSON.stringify(body) }).catch(() => {}); }
  async wipe() { // 🗑 공개 서버 지우기: 7일 동안 휴지통에 (세계 조각은 그대로 · 정보만 옮김) → /restore 로 되살림
    if (this.meta && this.meta.persist) {
      const t = Date.now(), p = this.meta.pub || {};
      await this.state.storage.put('trash', { meta: this.meta, t });
      await this.state.storage.delete('meta');
      await this.trashLobby({ code: this.code, name: p.name || '', off: p.off ? 1 : 0, ops: this.meta.ops || [], t });
    } else await this.state.storage.deleteAll();
    this.meta = null; this.pub = null;
    await this.lobby(true);
    for (const g of this.guests.values()) try { g.send('{"t":"bye"}'); g.close(1000, 'deleted'); } catch (e) {}
    this.guests.clear();
    if (this.host) try { this.host.send('{"t":"_deleted"}'); this.host.close(1000, 'deleted'); } catch (e) {}
    this.host = null;
  }
  async storeWorld(text) { // 세계를 저장소 칸들에 나눠 담음
    const n = Math.ceil(text.length / CHUNK), old = (this.meta && this.meta.wn) || 0;
    for (let i = 0; i < n; i += 100) {
      const o = {};
      for (let j = i; j < Math.min(n, i + 100); j++) o['w' + j] = text.slice(j * CHUNK, (j + 1) * CHUNK);
      await this.state.storage.put(o);
    }
    if (old > n) { const ks = []; for (let j = n; j < old; j++) ks.push('w' + j); for (let i = 0; i < ks.length; i += 100) await this.state.storage.delete(ks.slice(i, i + 100)); }
    this.meta.wn = n; this.meta.t = Date.now();
    await this.saveMeta();
  }
  async sendWorld(ws) { // 저장된 세계를 새 방장에게 보냄
    const n = (this.meta && this.meta.wn) || 0;
    let text = '';
    for (let i = 0; i < n; i += 100) {
      const ks = []; for (let j = i; j < Math.min(n, i + 100); j++) ks.push('w' + j);
      const m = await this.state.storage.get(ks);
      for (const k of ks) text += m.get(k) || '';
    }
    const parts = Math.max(1, Math.ceil(text.length / SEND_CHUNK));
    for (let i = 0; i < parts; i++) ws.send(JSON.stringify({ t: '_w', i, n: text ? parts : 0, d: text.slice(i * SEND_CHUNK, (i + 1) * SEND_CHUNK) }));
  }
  promote() { // 방장이 없어짐 → 남은 사람 중 한 명이 새 방장
    if (this.host) return;
    const L = [...this.guests.values()];
    this.guests.clear();
    L.forEach((g, i) => { try { g.send(i === 0 ? '{"t":"_promote"}' : '{"t":"_rehost"}'); g.close(4001, 'rehost'); } catch (e) {} });
    this.lobby();
  }
  async fetch(req) {
    await this.ready;
    const url = new URL(req.url), role = url.searchParams.get('role');
    this.code = (url.pathname.match(/\/room\/([A-Z0-9]{6})/) || [])[1] || this.code;
    if (url.pathname.endsWith('/official')) { // ⭐ 공식 서버 만들기 · 바꾸기 (어드민 계정만)
      const b = await req.json().catch(() => ({}));
      if (!(await isAdminToken(b.token))) return new Response(JSON.stringify({ error: '공식 서버는 어드민 계정만 만들 수 있어요' }), { status: 403, headers: cors });
      if (b.del) { await this.wipe(); return new Response(JSON.stringify({ ok: true }), { headers: cors }); }
      if (!this.meta) this.meta = { persist: true, key: String(b.key || crypto.randomUUID()), wn: 0, t: Date.now() };
      this.meta.pub = { name: String(b.name || '공식 서버').slice(0, 30), nick: 'CAVEBUILD', mode: 'CAVEBUILD ONLINE', kind: KINDS.includes(b.kind) ? b.kind : 'survival', off: 1 };
      this.meta.persist = true; this.pub = this.meta.pub; await this.saveMeta(); await this.lobby();
      return new Response(JSON.stringify({ ok: true, key: this.meta.key }), { headers: cors });
    }
    if (!this.meta && !url.pathname.endsWith('/restore')) { // 휴지통에서 7일이 지나면 그때 완전히 지움
      const tr = await this.state.storage.get('trash');
      if (tr && Date.now() - tr.t > TRASH_MS) { await this.state.storage.deleteAll(); await this.trashLobby({ code: this.code, del: 1 }); }
    }
    if (url.pathname.endsWith('/restore')) { // ♻ 지운 서버 되살리기: 만든 사람(열쇠) · 그 서버의 OP · 어드민
      const b = await req.json().catch(() => ({}));
      const tr = await this.state.storage.get('trash');
      const no = (m, s) => new Response(JSON.stringify({ error: m }), { status: s, headers: cors });
      if (!tr || Date.now() - tr.t > TRASH_MS) return no('되살릴 수 있는 서버가 없어요 (지운 지 7일이 지났거나 없는 코드예요)', 404);
      if (this.meta) return no('같은 코드의 서버가 이미 있어요', 409);
      let ok = !!b.key && b.key === tr.meta.key;
      if (!ok) { const u = await accountOf(b.token); ok = !!u && (u.admin || (tr.meta.ops || []).includes(String(u.nick).toLowerCase())); }
      if (!ok) return no('서버를 만든 사람 · 그 서버의 OP · 어드민만 되살릴 수 있어요', 403);
      if (b.purge && b.key === tr.meta.key) { await this.state.storage.deleteAll(); await this.trashLobby({ code: this.code, del: 1 }); return new Response(JSON.stringify({ ok: true, purged: 1 }), { headers: cors }); } // 만든 사람만: 휴지통에서도 지움 (시험용)
      this.meta = tr.meta; this.pub = this.meta.pub;
      await this.saveMeta(); await this.state.storage.delete('trash');
      await this.trashLobby({ code: this.code, del: 1 }); await this.lobby();
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (url.pathname.endsWith('/del')) { // 🗑 만든 사람만 지움
      const b = await req.json().catch(() => ({}));
      if (!this.meta || !this.meta.persist) return new Response(JSON.stringify({ ok: true }), { headers: cors });
      let okDel = !!b.key && b.key === this.meta.key;
      if (!okDel) { const u = await accountOf(b.token); okDel = !!u && (u.admin || (this.meta.ops || []).includes(String(u.nick).toLowerCase())); } // 🔑 어드민 · 이 서버의 OP (로그인 계정으로 확인)
      if (!okDel) return new Response(JSON.stringify({ error: '서버를 만든 사람 · OP · 어드민만 지울 수 있어요' }), { status: 403, headers: cors });
      await this.wipe();
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (url.pathname.endsWith('/ops')) { // 🔑 서버 OP 명단: 만든 사람(열쇠 · 계정) · 어드민만 바꿈 → 게임이 아니라 여기 저장된 명단으로 삭제 권한을 확인
      const b = await req.json().catch(() => ({}));
      if (!this.meta || !this.meta.persist) return new Response(JSON.stringify({ error: '공개 서버가 아니에요' }), { status: 404, headers: cors });
      let okOp = !!b.key && b.key === this.meta.key;
      if (!okOp) { const u = await accountOf(b.token); okOp = !!u && (u.admin || (!!this.meta.pub && !this.meta.pub.off && String(u.nick) === this.meta.pub.nick)); }
      if (!okOp) return new Response(JSON.stringify({ error: '만든 사람과 어드민만 OP를 정할 수 있어요' }), { status: 403, headers: cors });
      const n = String(b.n || '').trim().toLowerCase().slice(0, 16);
      if (!n) return new Response(JSON.stringify({ error: '닉네임을 넣어 주세요' }), { status: 400, headers: cors });
      const ops = (this.meta.ops || []).filter((x) => x !== n);
      if (b.on && ops.length < 30) ops.push(n);
      this.meta.ops = ops; await this.saveMeta(); await this.lobby();
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('websocket only', { status: 426 });
    const [client, ws] = Object.values(new WebSocketPair());
    ws.accept();
    const err = (m) => { try { ws.send(JSON.stringify({ t: '_err', m })); ws.close(1000, m); } catch (e) {} };
    const q = (k) => url.searchParams.get(k) || '';
    if (role === 'host') {
      if (this.host) err('taken');
      else if (this.grace && (!this.hostTok || q('tok') !== this.hostTok)) err('wait'); // 끊긴 방장이 다시 붙는 중
      else {
        const persist = !!(this.meta && this.meta.persist);
        if (q('resume') === '1' && !persist) { err('none'); return new Response(null, { status: 101, webSocket: client }); }
        const back = !!this.grace; // 🔁 끊겼던 방장이 다시 붙음 → 친구들은 그대로
        this.host = ws;
        if (this.grace) { clearTimeout(this.grace); this.grace = null; }
        if (!back) this.hostTok = crypto.randomUUID();
        if (back) { /* 공개 · 이름은 그대로 */ }
        else if (!persist) {
          this.pub = null;
          if (q('pub') === '1') this.pub = { name: q('name').slice(0, 30), nick: q('nick').slice(0, 16), mode: q('mode').slice(0, 20), kind: KINDS.includes(q('kind')) ? q('kind') : 'survival' };
          if (q('persist') === '1' && this.pub && q('key').length >= 16) { this.meta = { persist: true, key: q('key').slice(0, 64), pub: this.pub, wn: 0, t: Date.now() }; await this.saveMeta(); }
        } else if (this.meta.pub) { this.pub = this.meta.pub; } // 목록의 방장은 서버를 만든 사람 그대로 (세계를 돌리는 사람이 바뀌어도)
        const P = !!(this.meta && this.meta.persist);
        ws.send(JSON.stringify({ t: '_ok', persist: P ? 1 : 0, pub: this.pub, saved: P ? (this.meta.wn || 0) : 0, tok: this.hostTok, back: back ? 1 : 0, guests: [...this.guests.keys()] }));
        if (q('resume') === '1' && q('local') !== '1') await this.sendWorld(ws);
        this.lobby();
        ws.addEventListener('message', async (ev) => {
          if (typeof ev.data !== 'string' || this.host !== ws) return;
          if (ev.data.startsWith('!sv')) { // 🌍 세계 올리기 (조각)
            const nl = ev.data.indexOf('\n');
            let h; try { h = JSON.parse(ev.data.slice(3, nl)); } catch (e) { return; }
            if (!this.meta || !this.meta.persist || !h || !(h.n > 0) || h.n > 400) return;
            if (!this.up || this.up.s !== h.s) this.up = { s: h.s, n: h.n, parts: [], got: 0 };
            if (this.up.parts[h.i] == null) { this.up.parts[h.i] = ev.data.slice(nl + 1); this.up.got++; }
            if (this.up.got === this.up.n) { const t = this.up.parts.join(''); this.up = null; await this.storeWorld(t); try { ws.send('{"t":"_saved"}'); } catch (e) {} }
            return;
          }
          if (ev.data.startsWith('!pub')) { // 공개 · 비공개 바꾸기
            try { const o = JSON.parse(ev.data.slice(4)), keep = this.pub || (this.meta && this.meta.pub) || {}; this.pub = o && o.on ? { name: String(o.name || '').slice(0, 30), nick: String((this.meta && this.meta.persist && keep.nick && !o.own ? keep.nick : o.nick) || '').slice(0, 16), mode: String(o.mode || '').slice(0, 20), kind: keep.kind || 'survival', ...(keep.off ? { off: 1 } : {}) } : null; } catch (e) {}
            if (this.meta && this.meta.persist && this.pub) { this.meta.pub = this.pub; await this.saveMeta(); }
            this.lobby();
            return;
          }
          const i = ev.data.indexOf('|');
          if (i < 0) { if (this.pub && Date.now() - this.lobbyT > 60000) this.lobby(); return; } // 핑 · 1분마다 로비에 살아 있다고 알림
          const gid = ev.data.slice(0, i), g = this.guests.get(gid);
          this.answered.add(gid);
          if (g) try { g.send(ev.data.slice(i + 1)); } catch (e) {}
        });
        const bye = () => {
          if (this.host !== ws) return;
          this.host = null;
          if (this.meta && this.meta.persist) { // 🌍 공개 서버: 끄지 않고 6초 뒤 새 방장
            this.lobby();
            if (this.grace) clearTimeout(this.grace);
            this.grace = setTimeout(() => { this.grace = null; this.promote(); }, 6000);
            return;
          }
          // 🔁 비공개 · 보통 방: 15초 동안 같은 방장이 다시 붙기를 기다렸다가 닫음
          if (this.grace) clearTimeout(this.grace);
          this.grace = setTimeout(() => {
            this.grace = null;
            if (this.host) return;
            this.lobby(true);
            for (const g of this.guests.values()) try { g.send('{"t":"bye"}'); g.close(1000, 'bye'); } catch (e) {}
            this.guests.clear();
          }, 15000);
        };
        ws.addEventListener('close', bye);
        ws.addEventListener('error', bye);
        // 👻 유령 방장 내보내기: 연결만 살아 있고 답을 안 하면 (세계를 못 열었거나 탭이 멈춤) 방이 묶이지 않게 끊음
        this.dropHost = () => { bye(); try { ws.close(4002, 'no answer'); } catch (e) {} };
      }
    } else {
      const persist = !!(this.meta && this.meta.persist);
      if (!this.host && persist && !this.grace) { try { ws.send('{"t":"_promote"}'); ws.close(4001, 'promote'); } catch (e) {} } // 빈 공개 서버: 들어온 사람이 서버를 켬
      else if (!this.host) err(persist || this.grace ? 'wait' : 'none');
      else if (this.guests.size >= MAX_GUESTS) err('full');
      else {
        const id = 'g' + this.next++;
        this.guests.set(id, ws);
        try { this.host.send(id + '|{"t":"_join"}'); } catch (e) {}
        ws.send(JSON.stringify({ t: '_ok', persist: persist ? 1 : 0 }));
        if (this.pub) this.lobby();
        let askT = null;
        ws.addEventListener('message', (ev) => {
          if (typeof ev.data !== 'string' || ev.data === 'p') return; // 핑
          if (!this.host) return;
          try { this.host.send(id + '|' + ev.data); } catch (e) {}
          if (askT === null) { const h = this.host; askT = setTimeout(() => { if (this.host === h && this.guests.has(id) && !this.answered.has(id) && this.dropHost) this.dropHost(); }, HOST_ANSWER_MS); }
        });
        const left = () => {
          if (askT !== null) clearTimeout(askT);
          this.answered.delete(id);
          if (!this.guests.delete(id)) return;
          if (this.host) try { this.host.send(id + '|{"t":"_leave"}'); } catch (e) {}
          if (this.pub) this.lobby();
        };
        ws.addEventListener('close', left);
        ws.addEventListener('error', left);
      }
    }
    return new Response(null, { status: 101, webSocket: client });
  }
}

export class Lobby { // 공개 방 목록 (보통 방은 3분 동안 소식이 없으면 사라짐 · 🌍 공개 서버는 지우기 전까지 남음)
  constructor(state, env) {
    this.state = state;
    this.rooms = new Map();
    this.trash = new Map(); // 🗑 지운 서버 (7일): 코드 → { code, name, off, ops, t }
    this.ready = state.blockConcurrencyWhile(async () => { const m = (await state.storage.get('persist')) || {}; for (const k in m) { clkky(m[k]); this.rooms.set(k, m[k]); } const t = (await state.storage.get('trash')) || {}; for (const k in t) this.trash.set(k, t[k]); });
  }
  async keep() { const o = {}; for (const [k, r] of this.rooms) if (r.persist) o[k] = r; await this.state.storage.put('persist', o); }
  // 👁 감시 기능 보고 (이 클래스의 'reports' 인스턴스에만 쌓임): 같은 문제는 한 줄에 횟수만 올림 · 닉네임 · IP는 저장 안 함
  async reportAdd(req) {
    // 🛡 한 사람(IP를 해시한 값 · 저장 안 함)이 1시간에 보낼 수 있는 보고 수 제한
    const who = req.headers.get('x-c') || '?', hour = Math.floor(Date.now() / 3600000);
    if (!this.repH || this.repH !== hour) { this.repH = hour; this.repN = new Map(); }
    const sentN = (this.repN.get(who) || 0) + 1;
    this.repN.set(who, sentN);
    if (sentN > 20) return new Response('busy', { status: 429, headers: cors });
    const text = await req.text().catch(() => '');
    if (text.length > 3000) return new Response('too big', { status: 413, headers: cors });
    let b; try { b = JSON.parse(text); } catch (e) { return new Response('bad', { status: 400, headers: cors }); }
    const clean = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]+/g, ' ').slice(0, n);
    const k = ['error', 'stall', 'mod'].includes(b.k) ? b.k : '';
    const v = clean(b.v, 12), m = clean(b.m, 240);
    if (!k || !m || !/^(26\.\d+|test)$/.test(v)) return new Response('bad', { status: 400, headers: cors });
    const sig = (k + '|' + v + '|' + m).slice(0, 300), now = Date.now();
    const all = (await this.state.storage.get('reports')) || {};
    const row = all[sig];
    if (row) { row.n++; row.last = now; }
    else {
      const recent = Object.values(all).filter((r) => now - r.first < 3600000).length;
      if (recent >= 60) return new Response('busy', { status: 429, headers: cors });
      all[sig] = { sig, k, v, m, s: clean(b.s, 700), sec: clean(b.sec, 20), mp: clean(b.mp, 8), ua: clean(b.ua, 16), n: 1, first: now, last: now };
      const keys = Object.keys(all);
      if (keys.length > 200) { keys.sort((a, c) => all[a].last - all[c].last); for (const x of keys.slice(0, keys.length - 200)) delete all[x]; }
    }
    await this.state.storage.put('reports', all);
    return new Response('{"ok":true}', { headers: cors });
  }
  async reportList(url) {
    const since = +url.searchParams.get('since') || 0, all = (await this.state.storage.get('reports')) || {};
    const L = Object.values(all).filter((r) => r.last > since).sort((a, b) => b.last - a.last).slice(0, 50);
    return new Response(JSON.stringify(L), { headers: cors });
  }
  async fetch(req) {
    await this.ready;
    const url = new URL(req.url);
    if (url.pathname === '/report-add') return this.reportAdd(req);
    if (url.pathname === '/report-list') return this.reportList(url);
    if (req.method === 'POST' && url.pathname === '/trash-set') {
      const o = await req.json().catch(() => null);
      if (o && /^[A-Z0-9]{6}$/.test(o.code)) {
        if (o.del) this.trash.delete(o.code);
        else this.trash.set(o.code, { code: o.code, name: String(o.name || '').slice(0, 30), off: o.off ? 1 : 0, ops: Array.isArray(o.ops) ? o.ops.slice(0, 30) : [], t: +o.t || Date.now() });
        await this.state.storage.put('trash', Object.fromEntries(this.trash));
      }
      return new Response('ok');
    }
    if (url.pathname === '/trash-list') {
      const now = Date.now();
      return new Response(JSON.stringify([...this.trash.values()].filter((r) => now - r.t < TRASH_MS).sort((a, b) => b.t - a.t).slice(0, 50)), { headers: cors });
    }
    if (req.method === 'POST' && url.pathname === '/set') {
      const o = await req.json().catch(() => null);
      if (o && /^[A-Z0-9]{6}$/.test(o.code)) {
        const was = this.rooms.get(o.code);
        if (o.del) this.rooms.delete(o.code); else this.rooms.set(o.code, { ...o, t: Date.now() });
        if (o.persist || (was && was.persist)) await this.keep();
      }
      return new Response('ok');
    }
    const now = Date.now(), L = [];
    for (const [k, r] of this.rooms) {
      if (!r.persist && now - r.t > 180000) { this.rooms.delete(k); continue; }
      L.push({ code: r.code, name: r.name, nick: r.nick, mode: r.mode, n: r.persist && now - r.t > 180000 ? 0 : r.n, max: r.max, persist: r.persist ? 1 : 0, kind: r.kind || 'survival', off: r.off ? 1 : 0, ops: r.ops || [] });
    }
    L.sort((a, b) => b.off - a.off || b.n - a.n || b.persist - a.persist); // ⭐ 공식 서버가 맨 위
    return new Response(JSON.stringify(L.slice(0, 50)), { headers: cors });
  }
}

export default {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;
    if (req.method === 'OPTIONS') return new Response(null, { headers: { ...cors, 'access-control-allow-methods': 'GET, POST', 'access-control-allow-headers': 'content-type' } });
    if (path === '/rooms') return env.LOBBY.get(env.LOBBY.idFromName('lobby')).fetch('https://lobby/list');
    if (path === '/trash') return env.LOBBY.get(env.LOBBY.idFromName('lobby')).fetch('https://lobby/trash-list');
    if (path === '/report' && req.method === 'POST') {
      const ip = req.headers.get('cf-connecting-ip') || '?';
      const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('cb-report|' + Math.floor(Date.now() / 86400000) + '|' + ip));
      const who = [...new Uint8Array(h).slice(0, 8)].map((b) => b.toString(16).padStart(2, '0')).join('');
      return env.LOBBY.get(env.LOBBY.idFromName('reports')).fetch(new Request('https://lobby/report-add', { method: 'POST', headers: { 'x-c': who }, body: await req.text() }));
    }
    if (path === '/reports') return env.LOBBY.get(env.LOBBY.idFromName('reports')).fetch('https://lobby/report-list' + new URL(req.url).search);
    const m = path.match(/^\/room\/([A-Z0-9]{6})(\/del|\/official|\/ops|\/restore)?$/);
    if (!m) return new Response('CAVEBUILD multiplayer relay', { headers: { 'access-control-allow-origin': '*' } });
    return env.ROOM.get(env.ROOM.idFromName(m[1])).fetch(req);
  },
};
