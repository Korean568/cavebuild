/* CAVEBUILD 멀티플레이 중계 서버 (Cloudflare Worker + Durable Object)
   방 코드 하나 = 방(Durable Object) 하나. 방장 1명 + 친구 여러 명.
   서버는 내용을 읽지 않고 그대로 전달만 함:
   - 친구 → 방장: "친구번호|내용"
   - 방장 → 친구: 방장이 "친구번호|내용" 으로 보내면 그 친구에게 "내용"만
   세계 계산 · 저장은 방장 게임이 함 (서버는 아무것도 저장하지 않음) */
const MAX_GUESTS = 20;

export class Room {
  constructor(state, env) {
    this.host = null;
    this.guests = new Map(); // 번호 → ws
    this.next = 1;
  }
  async fetch(req) {
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('websocket only', { status: 426 });
    const role = new URL(req.url).searchParams.get('role');
    const [client, ws] = Object.values(new WebSocketPair());
    ws.accept();
    const err = (m) => { try { ws.send(JSON.stringify({ t: '_err', m })); ws.close(1000, m); } catch (e) {} };
    if (role === 'host') {
      if (this.host) err('taken');
      else {
        this.host = ws;
        ws.send(JSON.stringify({ t: '_ok' }));
        ws.addEventListener('message', (ev) => {
          if (typeof ev.data !== 'string') return;
          const i = ev.data.indexOf('|');
          if (i < 0) return; // 핑
          const g = this.guests.get(ev.data.slice(0, i));
          if (g) try { g.send(ev.data.slice(i + 1)); } catch (e) {}
        });
        const bye = () => {
          if (this.host !== ws) return;
          this.host = null;
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
        ws.addEventListener('message', (ev) => {
          if (typeof ev.data !== 'string' || ev.data === 'p') return; // 핑
          if (this.host) try { this.host.send(id + '|' + ev.data); } catch (e) {}
        });
        const left = () => {
          if (!this.guests.delete(id)) return;
          if (this.host) try { this.host.send(id + '|{"t":"_leave"}'); } catch (e) {}
        };
        ws.addEventListener('close', left);
        ws.addEventListener('error', left);
      }
    }
    return new Response(null, { status: 101, webSocket: client });
  }
}

export default {
  async fetch(req, env) {
    const m = new URL(req.url).pathname.match(/^\/room\/([A-Z0-9]{6})$/);
    if (!m) return new Response('CAVEBUILD multiplayer relay', { headers: { 'access-control-allow-origin': '*' } });
    return env.ROOM.get(env.ROOM.idFromName(m[1])).fetch(req);
  },
};
