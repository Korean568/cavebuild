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
const CHUNK = 32000;      // 저장소 한 칸에 넣는 글자 수
const SEND_CHUNK = 250000; // 저장된 세계를 보낼 때 한 번에 보내는 글자 수
const cors = { 'access-control-allow-origin': '*', 'content-type': 'application/json; charset=utf-8' };

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
    this.ready = state.blockConcurrencyWhile(async () => { this.meta = (await state.storage.get('meta')) || null; if (this.meta) this.pub = this.meta.pub; });
  }
  lobby(del) { // 로비에 이 방을 올리거나 내림
    if (!this.code) return;
    const L = this.env.LOBBY.get(this.env.LOBBY.idFromName('lobby'));
    const persist = !!(this.meta && this.meta.persist);
    const body = del || !this.pub || (!this.host && !persist) ? { code: this.code, del: 1 } : { code: this.code, ...this.pub, n: this.host ? this.guests.size + 1 : 0, max: MAX_GUESTS + 1, persist: persist ? 1 : 0 };
    this.lobbyT = Date.now();
    return L.fetch('https://lobby/set', { method: 'POST', body: JSON.stringify(body) }).catch(() => {});
  }
  async saveMeta() { if (this.meta) await this.state.storage.put('meta', this.meta); }
  async wipe() { // 🗑 공개 서버 지우기
    this.meta = null; this.pub = null;
    await this.state.storage.deleteAll();
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
    if (url.pathname.endsWith('/del')) { // 🗑 만든 사람만 지움
      const b = await req.json().catch(() => ({}));
      if (!this.meta || !this.meta.persist) return new Response(JSON.stringify({ ok: true }), { headers: cors });
      if (!b.key || b.key !== this.meta.key) return new Response(JSON.stringify({ error: '서버를 만든 사람만 지울 수 있어요' }), { status: 403, headers: cors });
      await this.wipe();
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
          if (q('pub') === '1') this.pub = { name: q('name').slice(0, 30), nick: q('nick').slice(0, 16), mode: q('mode').slice(0, 20) };
          if (q('persist') === '1' && this.pub && q('key').length >= 16) { this.meta = { persist: true, key: q('key').slice(0, 64), pub: this.pub, wn: 0, t: Date.now() }; await this.saveMeta(); }
        } else if (q('nick')) { this.pub = { ...this.meta.pub, nick: q('nick').slice(0, 16) }; } // 지금 방장 이름으로 목록에 보임
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
            try { const o = JSON.parse(ev.data.slice(4)); this.pub = o && o.on ? { name: String(o.name || '').slice(0, 30), nick: String(o.nick || '').slice(0, 16), mode: String(o.mode || '').slice(0, 20) } : null; } catch (e) {}
            if (this.meta && this.meta.persist && this.pub) { this.meta.pub = this.pub; await this.saveMeta(); }
            this.lobby();
            return;
          }
          const i = ev.data.indexOf('|');
          if (i < 0) { if (this.pub && Date.now() - this.lobbyT > 60000) this.lobby(); return; } // 핑 · 1분마다 로비에 살아 있다고 알림
          const g = this.guests.get(ev.data.slice(0, i));
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
        ws.addEventListener('message', (ev) => {
          if (typeof ev.data !== 'string' || ev.data === 'p') return; // 핑
          if (this.host) try { this.host.send(id + '|' + ev.data); } catch (e) {}
        });
        const left = () => {
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
    this.ready = state.blockConcurrencyWhile(async () => { const m = (await state.storage.get('persist')) || {}; for (const k in m) this.rooms.set(k, m[k]); });
  }
  async keep() { const o = {}; for (const [k, r] of this.rooms) if (r.persist) o[k] = r; await this.state.storage.put('persist', o); }
  async fetch(req) {
    await this.ready;
    const url = new URL(req.url);
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
      L.push({ code: r.code, name: r.name, nick: r.nick, mode: r.mode, n: r.persist && now - r.t > 180000 ? 0 : r.n, max: r.max, persist: r.persist ? 1 : 0 });
    }
    L.sort((a, b) => b.n - a.n || b.persist - a.persist);
    return new Response(JSON.stringify(L.slice(0, 50)), { headers: cors });
  }
}

export default {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;
    if (req.method === 'OPTIONS') return new Response(null, { headers: { ...cors, 'access-control-allow-methods': 'GET, POST', 'access-control-allow-headers': 'content-type' } });
    if (path === '/rooms') return env.LOBBY.get(env.LOBBY.idFromName('lobby')).fetch('https://lobby/list');
    const m = path.match(/^\/room\/([A-Z0-9]{6})(\/del)?$/);
    if (!m) return new Response('CAVEBUILD multiplayer relay', { headers: { 'access-control-allow-origin': '*' } });
    return env.ROOM.get(env.ROOM.idFromName(m[1])).fetch(req);
  },
};
