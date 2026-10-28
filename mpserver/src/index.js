/* CAVEBUILD 멀티플레이 중계 서버 (Cloudflare Worker + Durable Object)
   방 코드 하나 = 방(Durable Object) 하나. 방장 1명 + 친구 여러 명.
   서버는 내용을 읽지 않고 그대로 전달만 함:
   - 친구 → 방장: "친구번호|내용"
   - 방장 → 친구: 방장이 "친구번호|내용" 으로 보내면 그 친구에게 "내용"만
   - 방장 → 서버: "!pub{...}" 공개 방 정보 바꾸기 (공개 · 비공개 · 이름)
   세계 계산 · 저장은 방장 게임이 함 (서버는 아무것도 저장하지 않음)
   공개 방은 로비(Durable Object 하나)에 이름 · 방장 · 인원만 올림 → GET /rooms 로 목록 */
const MAX_GUESTS = 20;
const cors = { 'access-control-allow-origin': '*', 'content-type': 'application/json; charset=utf-8' };

export class Room {
  constructor(state, env) {
    this.env = env;
    this.host = null;
    this.guests = new Map(); // 번호 → ws
    this.next = 1;
    this.code = '';
    this.pub = null; // 공개 방이면 { name, nick, mode }
    this.lobbyT = 0;
  }
  lobby(del) { // 로비에 이 방을 올리거나 내림
    if (!this.code) return;
    const L = this.env.LOBBY.get(this.env.LOBBY.idFromName('lobby'));
    const body = del || !this.pub || !this.host ? { code: this.code, del: 1 } : { code: this.code, ...this.pub, n: this.guests.size + 1, max: MAX_GUESTS + 1 };
    this.lobbyT = Date.now();
    return L.fetch('https://lobby/set', { method: 'POST', body: JSON.stringify(body) }).catch(() => {});
  }
  async fetch(req) {
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('websocket only', { status: 426 });
    const url = new URL(req.url), role = url.searchParams.get('role');
    this.code = (url.pathname.match(/\/room\/([A-Z0-9]{6})$/) || [])[1] || this.code;
    const [client, ws] = Object.values(new WebSocketPair());
    ws.accept();
    const err = (m) => { try { ws.send(JSON.stringify({ t: '_err', m })); ws.close(1000, m); } catch (e) {} };
    if (role === 'host') {
      if (this.host) err('taken');
      else {
        this.host = ws;
        this.pub = null;
        if (url.searchParams.get('pub') === '1') this.pub = { name: String(url.searchParams.get('name') || '').slice(0, 30), nick: String(url.searchParams.get('nick') || '').slice(0, 16), mode: String(url.searchParams.get('mode') || '').slice(0, 20) };
        ws.send(JSON.stringify({ t: '_ok' }));
        this.lobby();
        ws.addEventListener('message', (ev) => {
          if (typeof ev.data !== 'string') return;
          if (ev.data.startsWith('!pub')) { // 공개 · 비공개 바꾸기
            try { const o = JSON.parse(ev.data.slice(4)); this.pub = o && o.on ? { name: String(o.name || '').slice(0, 30), nick: String(o.nick || '').slice(0, 16), mode: String(o.mode || '').slice(0, 20) } : null; } catch (e) {}
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
          this.lobby(true);
          for (const g of this.guests.values()) try { g.send('{"t":"bye"}'); g.close(1000, 'bye'); } catch (e) {}
          this.guests.clear();
        };
        ws.addEventListener('close', bye);
        ws.addEventListener('error', bye);
      }
    } else {
      if (!this.host) err('none');
      else if (this.guests.size >= MAX_GUESTS) err('full');
      else {
        const id = 'g' + this.next++;
        this.guests.set(id, ws);
        try { this.host.send(id + '|{"t":"_join"}'); } catch (e) {}
        ws.send(JSON.stringify({ t: '_ok' }));
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

export class Lobby { // 공개 방 목록 (3분 동안 소식이 없으면 사라짐)
  constructor(state, env) { this.rooms = new Map(); }
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === 'POST' && url.pathname === '/set') {
      const o = await req.json().catch(() => null);
      if (o && /^[A-Z0-9]{6}$/.test(o.code)) { if (o.del) this.rooms.delete(o.code); else this.rooms.set(o.code, { ...o, t: Date.now() }); }
      return new Response('ok');
    }
    const now = Date.now(), L = [];
    for (const [k, r] of this.rooms) { if (now - r.t > 180000) this.rooms.delete(k); else L.push({ code: r.code, name: r.name, nick: r.nick, mode: r.mode, n: r.n, max: r.max }); }
    L.sort((a, b) => b.n - a.n);
    return new Response(JSON.stringify(L.slice(0, 50)), { headers: cors });
  }
}

export default {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;
    if (path === '/rooms') return env.LOBBY.get(env.LOBBY.idFromName('lobby')).fetch('https://lobby/list');
    const m = path.match(/^\/room\/([A-Z0-9]{6})$/);
    if (!m) return new Response('CAVEBUILD multiplayer relay', { headers: { 'access-control-allow-origin': '*' } });
    return env.ROOM.get(env.ROOM.idFromName(m[1])).fetch(req);
  },
};
