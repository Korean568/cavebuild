// 🪖 조직 (팀) 모드 — CAVEBUILD 서버용 .js 모드
// 조직: 무법자 · CP · TMC · CMP · CP 사령부 · TMC 사령부 · CMP 사령부
// 계급 · 진급 · 강등, 머리 위 닉네임에 [조직 계급] + 조직 색, 기지 · 집합, 훈련 · 임무, 같은 조직끼리도 때릴 수 있음
// 멀티플레이에서는 방장 게임이 조직 정보를 저장하고(세계에 저장됨), 친구들의 명령은 방장에게 신호로 보내요.
//
// 명령어 (누구나):  /조직 · /조직 목록 · /조직 가입 이름 · /조직 탈퇴 · /기지
// 명령어 (장교 · OP): /조직 배정 @닉 이름 · /조직 추방 @닉 · /진급 @닉 · /강등 @닉
//                    /기지 설정 · /집합 · /훈련 사격 · /훈련 체력 · /임무 내용 · /임무 완료 @닉 · /임무 취소
// 장교: 계급표의 위쪽 (군: 소위부터 · 경찰: 경정부터 · 무법자: 간부부터). 사령부 장교는 아래 조직(예: CMP 사령부 → CMP)도 지휘해요.
// CMP 사령부는 우리 디스코드 서버에 들어와 있어야 가입할 수 있어요 (겜벗에서 「디스코드로 확인하고 받기」를 한 계정).
// CP 사령부 · TMC 사령부는 OP나 그 사령부 장교가 /조직 배정 해 줘야 들어가요.

const ARMY = ['이병', '일병', '상병', '병장', '하사', '중사', '상사', '소위', '중위', '대위', '소령', '중령', '대령', '준장', '소장', '중장', '대장'];
const POLICE = ['순경', '경장', '경사', '경위', '경감', '경정', '총경', '경무관', '치안감', '치안정감', '치안총감'];
const OUTLAW = ['떠돌이', '졸개', '행동대원', '간부', '부두목', '두목'];
const ORGS = {
  '무법자':     { ico: '🏴', color: '#ff5a4a', full: '무법자', ranks: OUTLAW },
  'CP':         { ico: '🚓', color: '#4aa8ff', full: '경찰', ranks: POLICE },
  'TMC':        { ico: '🎖', color: '#4ade80', full: '교육사령관', ranks: ARMY },
  'CMP':        { ico: '🛡', color: '#fbbf24', full: '군사경찰', ranks: ARMY },
  'CP 사령부':  { ico: '🚨', color: '#2f7cf6', full: '경찰 사령부', ranks: POLICE, sub: 'CP' },
  'TMC 사령부': { ico: '⭐', color: '#22c55e', full: '교육사령부', ranks: ARMY, sub: 'TMC' },
  'CMP 사령부': { ico: '⚜', color: '#f59e0b', full: '군사경찰 사령부', ranks: ARMY, sub: 'CMP', discord: true },
};
const PTS_PER_RANK = 20;          // 점수 20점마다 한 계급 저절로 진급 (장교 바로 아래까지)
const officerAt = (o) => Math.ceil(ORGS[o].ranks.length * 0.4);
const findOrg = (s) => { const k = String(s || '').replace(/\s/g, '').toLowerCase(); return Object.keys(ORGS).find((o) => o.replace(/\s/g, '').toLowerCase() === k) || null; };

// ── 저장된 조직 정보 (방장 세계에 저장 · 친구들에게 저절로 맞춰짐) ──
const load = () => { const s = CB.load('org') || {}; return { m: s.m || {}, base: s.base || {}, mission: s.mission || {}, pts: s.pts || {}, train: s.train || null }; };
let S = load();
const save = () => CB.save('org', S);
const me = () => CB.me();
const mine = () => S.m[me()] || null;
const rankName = (x) => (x ? ORGS[x.o].ranks[Math.min(x.r, ORGS[x.o].ranks.length - 1)] : '');
const isOfficer = (x) => !!x && x.r >= officerAt(x.o);
// 지휘할 수 있나: 같은 조직이면서 계급이 더 높거나, 그 조직의 사령부 장교
function commands(a, b, op) {
  if (op) return true;
  if (!a || !b || !isOfficer(a)) return false;
  if (a.o === b.o) return a.r > b.r;
  return ORGS[a.o].sub === b.o;
}

// 혼자만 보는 안내 (4초)
let noteT = 0;
const esc = (s) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
function note(t) { CB.hud('orgmsg', '<b>' + esc(t) + '</b>'); noteT = 4; }

// ── 방장이 처리하는 일 ──
function tell(to, m) { if (to === me()) note(m); else CB.send('org-msg', { to, m }); }
function addPts(nick, n) {
  const x = S.m[nick]; if (!x) return;
  x.p = (x.p || 0) + n; S.pts[x.o] = (S.pts[x.o] || 0) + n;
  const cap = officerAt(x.o) - 1;
  while (x.r < cap && x.p >= (x.r + 1) * PTS_PER_RANK) { x.r++; CB.say(`🎉 ${nick} 님이 ${rankName(x)}(으)로 진급했어요! (${ORGS[x.o].ico} ${x.o})`); }
}
function apply(op, a, from, fromOp, fromDiscord) {
  a = a || {};
  const F = S.m[from];
  const who = String(a.who || '').replace(/^@/, '');
  switch (op) {
    case 'join': {
      const o = findOrg(a.o);
      if (!o) return tell(from, '그런 조직이 없어요 · /조직 목록');
      if (ORGS[o].discord && !fromDiscord && !fromOp) return tell(from, `${o}은(는) 우리 디스코드 서버에 들어와야 가입할 수 있어요 (겜벗에서 「디스코드로 확인하고 받기」)`);
      if (ORGS[o].sub && !ORGS[o].discord && !fromOp) return tell(from, `${o}은(는) OP나 사령부 장교가 /조직 배정 해 줘야 들어갈 수 있어요`);
      S.m[from] = { o, r: 0, p: 0 }; save();
      return CB.say(`${ORGS[o].ico} ${from} 님이 ${o}(${ORGS[o].full})에 들어왔어요`);
    }
    case 'leave': {
      if (!F) return tell(from, '조직에 들어가 있지 않아요');
      delete S.m[from]; save(); return CB.say(`${from} 님이 ${F.o}에서 나갔어요`);
    }
    case 'assign': {
      const o = findOrg(a.o);
      if (!o || !who) return tell(from, '/조직 배정 @닉 조직이름');
      const can = fromOp || (isOfficer(F) && (F.o === o || ORGS[F.o].sub === o));
      if (!can) return tell(from, '그 조직에 배정할 권한이 없어요 (OP나 그 조직 · 사령부 장교만)');
      S.m[who] = { o, r: 0, p: 0 }; save();
      return CB.say(`${ORGS[o].ico} ${who} 님이 ${o}에 배정됐어요 (${from})`);
    }
    case 'kick': {
      const T = S.m[who];
      if (!T) return tell(from, '그 사람은 조직에 없어요');
      if (!commands(F, T, fromOp)) return tell(from, '그 사람을 추방할 권한이 없어요');
      delete S.m[who]; save(); return CB.say(`${who} 님이 ${T.o}에서 추방됐어요`);
    }
    case 'promote': case 'demote': {
      const T = S.m[who];
      if (!T) return tell(from, '그 사람은 조직에 없어요');
      const nr = T.r + (op === 'promote' ? 1 : -1);
      if (nr < 0 || nr >= ORGS[T.o].ranks.length) return tell(from, op === 'promote' ? '이미 가장 높은 계급이에요' : '이미 가장 낮은 계급이에요');
      const ok = fromOp || (commands(F, T, false) && (F.o === T.o ? nr < F.r : nr <= F.r));
      if (!ok) return tell(from, '그 계급으로 바꿀 권한이 없어요 (내 계급보다 높게는 못 올려요)');
      T.r = nr; save();
      return CB.say(`${op === 'promote' ? '⬆ 진급' : '⬇ 강등'}: ${who} 님 → ${rankName(T)} (${ORGS[T.o].ico} ${T.o})`);
    }
    case 'base': {
      if (!F || !(isOfficer(F) || fromOp)) return tell(from, '기지는 장교나 OP만 정할 수 있어요');
      S.base[F.o] = { x: +a.x, y: +a.y, z: +a.z }; save();
      return CB.say(`🏕 ${F.o} 기지가 정해졌어요 · ${F.o}는 죽으면 기지에서 부활해요`);
    }
    case 'gather': {
      if (!F || !(isOfficer(F) || fromOp)) return tell(from, '집합은 장교나 OP만 할 수 있어요');
      const g = { o: F.o, sub: ORGS[F.o].sub || '', x: +a.x, y: +a.y, z: +a.z, by: from };
      CB.send('org-go', g); goIfMine(g);
      return CB.say(`📯 ${from} ${rankName(F)}: ${F.o}${g.sub ? ' · ' + g.sub : ''} 집합!`);
    }
    case 'train': {
      if (!F || !(isOfficer(F) || fromOp)) return tell(from, '훈련은 장교나 OP만 열 수 있어요');
      const kind = a.kind === '체력' ? '체력' : '사격';
      S.train = { o: F.o, kind, until: Date.now() + 90000, done: [] }; save();
      if (kind === '사격') for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2; const t = CB.spawn('org_target', +a.x + Math.cos(ang) * 7, +a.y + 1, +a.z + Math.sin(ang) * 7); if (t) t.orgTarget = F.o; }
      return CB.say(`🎯 ${F.o} 훈련 시작 (${kind}) · 90초! ${kind === '사격' ? '표적을 맞히면 1점' : '200칸을 달리면 5점'}`);
    }
    case 'ran': {
      const T = S.train;
      if (!T || Date.now() > T.until || T.kind !== '체력' || !F || F.o !== T.o || T.done.includes(from)) return;
      T.done.push(from); addPts(from, 5); save();
      return CB.say(`🏃 ${from} 님 체력 훈련 완주! +5점`);
    }
    case 'mission': {
      if (!F || !(isOfficer(F) || fromOp)) return tell(from, '임무는 장교나 OP만 줄 수 있어요');
      S.mission[F.o] = String(a.text || '').slice(0, 80); save();
      return CB.say(`📋 ${F.o} 임무: ${S.mission[F.o]}`);
    }
    case 'mission-done': {
      const T = S.m[who];
      if (!F || !(isOfficer(F) || fromOp) || !T) return tell(from, '/임무 완료 @닉 (장교 · OP)');
      addPts(who, 10); delete S.mission[T.o]; save();
      return CB.say(`✅ ${who} 님 임무 완료! +10점`);
    }
    case 'mission-cancel': {
      if (!F || !(isOfficer(F) || fromOp)) return;
      delete S.mission[F.o]; save(); return CB.say(`${F.o} 임무를 취소했어요`);
    }
  }
}

// ── 명령 보내기: 방장이면 바로, 친구면 방장에게 신호 ──
function req(op, a) {
  if (CB.isHost()) apply(op, a, me(), CB.isOp(), CB.discord());
  else CB.send('org', { op, a, d: CB.discord() ? 1 : 0 });
}
function goIfMine(g) {
  const x = mine();
  if (x && (x.o === g.o || x.o === g.sub)) { CB.tp(g.x, g.y + 0.2, g.z); note(`📯 ${g.by} 님의 집합 명령으로 이동했어요`); }
}
CB.on('msg', (k, v, from) => {
  if (k === 'org' && CB.isHost()) apply(v.op, v.a, from, CB.opOf(from), !!v.d);
  else if (k === 'org-go') goIfMine(v);
  else if (k === 'org-msg' && v.to === me()) note(v.m);
});

// 훈련 표적 (가만히 서 있음) · 맞혀서 쓰러뜨리면 그 사람에게 1점
CB.mob('org_target', { name: '🎯 훈련 표적', hp: 6, color: 0xd8b070, head: 0xffffff, ai: (m) => { m.vel.x = m.vel.z = 0; } });
CB.on('kill', (m) => {
  if (!CB.isHost() || !m.orgTarget) return;
  const T = S.train, who = m.byNick || me();
  if (!T || Date.now() > T.until || !S.m[who]) return;
  addPts(who, 1); save();
});

// ── 명령어 ──
const pos = () => CB.pos();
CB.command('조직', '조직 정보 · 가입 · 탈퇴 · 배정 · 추방 (/조직 목록)', (a, c) => {
  const sub = a[0] || '';
  if (sub === '가입') return req('join', { o: a.slice(1).join(' ') });
  if (sub === '탈퇴') return req('leave');
  if (sub === '배정') return req('assign', { who: a[1], o: a.slice(2).join(' ') });
  if (sub === '추방') return req('kick', { who: a[1] });
  if (sub === '목록') {
    for (const o in ORGS) { const n = Object.values(S.m).filter((x) => x.o === o).length; c.say(`${ORGS[o].ico} ${o} (${ORGS[o].full}) · ${n}명 · 점수 ${S.pts[o] || 0}${ORGS[o].discord ? ' · 디스코드 필요' : ORGS[o].sub ? ' · 배정 필요' : ''}`); }
    return;
  }
  const x = mine();
  if (!x) return c.say('조직이 없어요 · /조직 목록 · /조직 가입 이름');
  const members = Object.entries(S.m).filter(([, y]) => y.o === x.o).sort((p, q) => q[1].r - p[1].r).map(([n, y]) => `${rankName(y)} ${n}`).join(', ');
  c.say(`${ORGS[x.o].ico} ${x.o} · ${rankName(x)} · 내 점수 ${x.p || 0} · 조직 점수 ${S.pts[x.o] || 0}`);
  c.say('부대원: ' + members);
}, { everyone: true });
CB.command('진급', '부대원 진급 (장교 · OP)', (a) => req('promote', { who: a[0] }), { everyone: true });
CB.command('강등', '부대원 강등 (장교 · OP)', (a) => req('demote', { who: a[0] }), { everyone: true });
CB.command('기지', '조직 기지로 이동 · /기지 설정 (장교)', (a, c) => {
  if (a[0] === '설정') return req('base', pos());
  const x = mine(), b = x && S.base[x.o];
  if (!b) return c.say('아직 기지가 없어요 (장교가 /기지 설정)');
  CB.tp(b.x, b.y + 0.2, b.z); c.say('🏕 기지로 이동했어요');
}, { everyone: true });
CB.command('집합', '내 조직 (사령부면 아래 조직도) 을 내 자리로 모음 (장교)', () => req('gather', pos()), { everyone: true });
CB.command('훈련', '훈련 열기: /훈련 사격 · /훈련 체력 (장교)', (a) => req('train', { kind: a[0], ...pos() }), { everyone: true });
CB.command('임무', '/임무 내용 · /임무 완료 @닉 · /임무 취소 (장교)', (a) => {
  if (a[0] === '완료') return req('mission-done', { who: a[1] });
  if (a[0] === '취소') return req('mission-cancel');
  req('mission', { text: a.join(' ') });
}, { everyone: true });

// ── 1초마다: 닉네임표 · 안내판 · 기지 부활 자리 · 체력 훈련 거리 ──
let acc = 0, tagged = new Set(), spawnKey = '', ranD = 0, lastP = null, ranSent = '';
CB.onTick((dt) => {
  if (noteT > 0 && (noteT -= dt) <= 0) CB.hud('orgmsg', null);
  const T = S.train, x = mine();
  if (T && x && T.kind === '체력' && T.o === x.o && Date.now() < T.until) {
    const p = pos();
    if (lastP) ranD += Math.hypot(p.x - lastP.x, p.z - lastP.z);
    lastP = p;
    if (ranD >= 200 && ranSent !== String(T.until)) { ranSent = String(T.until); req('ran'); }
  } else { ranD = 0; lastP = null; }
  if ((acc += dt) < 1) return;
  acc = 0;
  S = load();
  const now = new Set();
  for (const [n, y] of Object.entries(S.m)) { CB.tag(n, `[${ORGS[y.o].ico}${y.o} ${rankName(y)}]`, ORGS[y.o].color); now.add(n); }
  for (const n of tagged) if (!now.has(n)) CB.tag(n);
  tagged = now;
  const y = mine();
  if (!y) { CB.hud('org', null); return; }
  const O = ORGS[y.o], b = S.base[y.o], k = b ? JSON.stringify(b) : '';
  if (k && k !== spawnKey) { CB.setSpawn(b.x, b.y + 0.2, b.z); spawnKey = k; }
  let h = `<span style="color:${O.color}">${O.ico} <b>${y.o}</b></span> · ${rankName(y)} · ${y.p || 0}점 · 조직 ${S.pts[y.o] || 0}점`;
  if (S.mission[y.o]) h += `<br>📋 임무: ${esc(S.mission[y.o])}`;
  if (S.train && S.train.o === y.o && Date.now() < S.train.until) h += `<br>🎯 훈련(${S.train.kind}) ${Math.ceil((S.train.until - Date.now()) / 1000)}초` + (S.train.kind === '체력' ? ` · ${Math.min(200, ranD | 0)}/200칸` : '');
  CB.hud('org', h);
});
