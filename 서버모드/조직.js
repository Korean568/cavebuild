// 🪖 조직 (팀 계급) 모드 — CAVEBUILD 서버용 .js 모드
// 팀 계급 (아래 → 위): 시민 · 경찰(CP) · 군사(CM) · 군사경찰(CMP) · 장교(CMO) · 교육부(TMC) · MP사령부(CMP 사령부) · 교육사령부(TMC 사령부) · 총사령부(Owner)
//   처음엔 누구나 시민 · 위 계급이 아래 계급 사람을 배정 · 진급 · 강등해요 (내 계급보다 아래로만) · 총사령부는 서버를 만든 사람(Owner)
//   머리 위 닉네임에 [팀] + 팀 색, 기지 · 집합, 훈련 · 임무, 같은 팀끼리도 때릴 수 있음
// 멀티플레이에서는 방장 게임이 조직 정보를 저장하고(세계에 저장됨), 친구들의 명령은 방장에게 신호로 보내요.
//
// 명령어 (누구나):  /조직 (내 팀) · /조직 목록 · /조직 탈퇴 (시민으로) · /기지
// 명령어 (위 계급 · OP): /team 팀 @닉 (순서 상관없음, = /조직 배정) · /진급 @닉 · /강등 @닉 · /조직 추방 @닉 (시민으로)
// 명령어 (장교(CMO) 이상 · OP): /기지 설정 · /집합 (내 계급 이하 모두) · /훈련 사격 · /훈련 체력 · /임무 내용 · /임무 완료 @닉 · /임무 취소
// 📝 고소:           범죄를 당하면 피해자 이름으로 자동 고소 → 지명수배 · /고소 (목록) · /고소 취소 [@닉] · /고소 @닉 [1|2] 사유
// 🚨 지명수배:       /수배 (목록) · /감옥 (수감자) — 누구나 · 수배 중인 사람에게만 수배 음악 「추격」 (★ 등급이 높을수록 격해짐)
//   경찰 쪽 팀 (경찰 · 군사경찰 · 장교 · MP사령부 · 총사령부): /체포 @닉 [벌금|징역|15|20]
//   경찰 쪽 장교 이상 · OP:  /수배 @닉 등급 사유 · /수배 해제 @닉 · /감옥 설정 · /석방 @닉

const TEAMS = [ // 아래 → 위 (계급 순서)
  { key: '시민', short: '시민', ico: '🙂', color: '#e0e0e0' },
  { key: '경찰', short: 'CP', ico: '🚓', color: '#4aa8ff' },
  { key: '군사', short: 'CM', ico: '🪖', color: '#7ec850' },
  { key: '군사경찰', short: 'CMP', ico: '🛡', color: '#fbbf24' },
  { key: '장교', short: 'CMO', ico: '🎖', color: '#c084fc' },
  { key: '교육부', short: 'TMC', ico: '📘', color: '#4ade80' },
  { key: 'MP사령부', short: 'CMP 사령부', ico: '⚜', color: '#f59e0b' },
  { key: '교육사령부', short: 'TMC 사령부', ico: '⭐', color: '#22c55e' },
  { key: '총사령부', short: 'Owner', ico: '👑', color: '#ff5a5a' },
];
const ORGS = Object.fromEntries(TEAMS.map((t, i) => [t.key, { ...t, lv: i, full: t.short }]));
const TOP = TEAMS.length - 1, OFFICER_LV = 4; // 총사령부 · 장교(CMO)부터 지휘
const OLDTEAM = { '무법자': '시민', 'CP': '경찰', 'TMC': '교육부', 'CMP': '군사경찰', 'CP 사령부': 'MP사령부', 'TMC 사령부': '교육사령부', 'CMP 사령부': 'MP사령부' }; // 예전 조직 이름 → 새 팀
const norm = (s) => String(s || '').replace(/[\s()]/g, '').toLowerCase();
const findOrg = (s) => { const k = norm(s); const t = TEAMS.find((t) => norm(t.key) === k || norm(t.short) === k || norm(t.key + t.short) === k); return t ? t.key : null; };
const ownerNick = () => (CB.owner && CB.owner()) || '';
function teamOf(nick) { // 그 사람의 팀 (서버를 만든 사람 · 운영자 = 총사령부 · 없으면 시민)
  if (nick && (nick === ownerNick() || nick === '운영자')) return '총사령부';
  const x = S.m[nick]; if (!x) return '시민';
  return ORGS[x.o] ? x.o : (OLDTEAM[x.o] || '시민');
}
const lvOf = (nick) => ORGS[teamOf(nick)].lv;
const tagOf = (o) => (ORGS[o].key === ORGS[o].short ? o : `${o}(${ORGS[o].short})`); // 경찰(CP)

// ── 🚨 지명수배 ──
// 범죄를 하면 머리 위에 「지명수배 ★ 등급」이 떠요. 경찰 쪽 조직(CP · CMP · 각 사령부)이나 OP가 /체포 해서 처벌하면 지워져요.
//   ★     1등급 질서위반 — 부적절한 말 (아래 BADWORDS) · 경찰이 /수배 로 올린 부적절한 행동       → 벌금 1 케이브코인
//   ★★    2등급 경범죄   — 폭행 (먼저 맞지 않았는데 때림) · 도둑질 (남이 놓은 상자를 부숨)       → 벌금 10 케이브코인 또는 징역 10분
//   ★★★   3등급 중범죄   — 경찰 쪽 조직원 폭행                                                  → 징역 15분 또는 징역 20분
//   ★★★★  4등급 무단사살 — 플레이어를 쓰러뜨림 (정당방위 · 경찰이 수배자를 쓰러뜨린 건 빼고)        → 징역 30분
//   ★★★★★ 5등급 대학살   — 5분 안에 3명 이상 쓰러뜨림                                            → 징역 1시간
const LAW = ['경찰', '군사경찰', '장교', 'MP사령부', '총사령부'];
const GRADE = { 1: '질서위반', 2: '경범죄', 3: '중범죄', 4: '무단사살', 5: '대학살' };
const BADWORDS = ['시발', '씨발', 'ㅅㅂ', 'ㅆㅂ', '병신', 'ㅂㅅ', '개새', '좆', '지랄', '꺼져', '닥쳐', 'fuck', 'shit', 'bitch'];
const stars = (n) => '★'.repeat(n);
const CHEST = 48; // 상자 블록

// ── ⛓ 감옥 차원: 이 모드를 깔면 「감옥」 차원이 생겨요 ──
// 가운데 복도 양쪽으로 감방이 늘어선 어두운 감옥 · 벽 · 철창은 부술 수 없어요 · 몹이 안 생겨요
// 징역을 받으면 감옥 차원의 감방으로 끌려가고, 형기가 끝나면 원래 있던 곳으로 돌아와요
// /감옥 설정 으로 다른 자리(감옥 차원 안이든 프론티어든)를 감옥으로 정할 수도 있어요 · /감옥 가기 · /감옥 나가기 (경찰 쪽 · OP)
const JAIL_WALL = CB.block({ key: 'jail_wall', name: '감옥 벽', hard: -1, paint: (u, v, x, y) => { const m = (y % 8 === 0) || ((x + (Math.floor(y / 8) % 2) * 8) % 16 === 0), k = 0.85 + 0.15 * Math.sin(x * 7.1 + y * 3.3); return m ? [52, 52, 58] : [96 * k, 96 * k, 104 * k]; } });
const JAIL_BARS = CB.block({ key: 'jail_bars', name: '감옥 철창', hard: -1, paint: (u, v, x, y) => (x % 5 < 2 || y < 2 || y > 13) ? [58, 60, 68] : [22, 22, 26] });
const LAMP = CB.id('등불') || 0;
const CELLS_Z = 6, HALF = 42; // 감방 폭 · 감옥 길이(반)
CB.dim('감옥', {
  name: '감옥', bg: [0.05, 0.05, 0.07], fog: [6, 34], light: 0.5, day: 0.4, caveB: 0.25, stars: 0, noMobs: true, spawn: { x: 0.5, y: 11, z: 0.5 },
  gen: new Function('data', 'cx', 'cz', `const W=${JAIL_WALL},B=${JAIL_BARS},L=${LAMP},I=(x,y,z)=>(y*16+z)*16+x;
    for(let z=0;z<16;z++)for(let x=0;x<16;x++){const wx=cx*16+x,wz=cz*16+z,ax=Math.abs(wx),az=Math.abs(wz);
      for(let y=0;y<=10;y++)data[I(x,y,z)]=W;
      if(ax>12||az>${HALF}){for(let y=11;y<=20;y++)data[I(x,y,z)]=W;continue;}
      data[I(x,15,z)]=(ax===0&&((wz%6)+6)%6===0&&L)?L:W;for(let y=16;y<=20;y++)data[I(x,y,z)]=W;
      if(ax===12||az===${HALF}){for(let y=11;y<=14;y++)data[I(x,y,z)]=W;continue;}
      if(ax>=3){const edge=((wz%${CELLS_Z})+${CELLS_Z})%${CELLS_Z}===0;
        if(edge){for(let y=11;y<=14;y++)data[I(x,y,z)]=W;}
        else if(ax===3){for(let y=11;y<=13;y++)data[I(x,y,z)]=B;data[I(x,14,z)]=W;}
        else{data[I(x,14,z)]=(ax===8&&((wz%${CELLS_Z})+${CELLS_Z})%${CELLS_Z}===3&&L)?L:W;}}}`),
});
// 감방 자리: 수감자마다 다른 칸 (오른쪽 · 왼쪽 번갈아)
function cellOf(nick) { const L = Object.keys(S.jail).sort(), i = Math.max(0, L.indexOf(nick)); const row = Math.floor(i / 2) % Math.floor(HALF * 2 / CELLS_Z - 1); return { dim: '감옥', x: (i % 2 ? -7.5 : 7.5), y: 11, z: -HALF + CELLS_Z * (row + 1) - CELLS_Z / 2 + 0.5 }; }

// ── 저장된 조직 정보 (방장 세계에 저장 · 친구들에게 저절로 맞춰짐) ──
const load = () => { const s = CB.load('org') || {}; return { m: s.m || {}, base: s.base || {}, mission: s.mission || {}, pts: s.pts || {}, train: s.train || null, w: s.w || {}, jail: s.jail || {}, jailPos: s.jailPos || null, owner: s.owner || {}, fine: s.fine || {}, suit: s.suit || [] }; };
let S = load();
const save = () => CB.save('org', S);
const me = () => CB.me();
const mine = () => ({ o: teamOf(me()), p: (S.m[me()] || {}).p || 0 }); // 누구나 팀이 있어요 (처음엔 시민)
const isOfficer = (nick) => lvOf(nick) >= OFFICER_LV; // 장교(CMO) 이상
// 지휘할 수 있나: 내 계급이 그 사람보다 높아야 (OP는 언제나)
const commands = (from, who, op) => op || lvOf(from) > lvOf(who);

// 혼자만 보는 안내 (4초)
let noteT = 0;
const esc = (s) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
function note(t) { CB.hud('orgmsg', '<b>' + esc(t) + '</b>'); noteT = 4; }

// ── 방장이 처리하는 일 ──
function tell(to, m) { if (to === me()) note(m); else CB.send('org-msg', { to, m }); }
function addPts(nick, n) { // 점수 (팀 점수에도 더해짐)
  const o = teamOf(nick), x = S.m[nick] || (S.m[nick] = { o, r: 0, p: 0 });
  x.p = (x.p || 0) + n; S.pts[o] = (S.pts[o] || 0) + n;
}
const isLaw = (nick) => LAW.includes(teamOf(nick));
const inTrain = (nick, T) => { const l = lvOf(nick); return l > 0 && l <= (T.lv != null ? T.lv : (ORGS[T.o] || { lv: 0 }).lv); }; // 훈련 · 집합: 경찰(CP)부터 연 사람 계급까지
function setTeam(nick, o) { const x = S.m[nick]; if (o === '시민') { if (x) { x.o = '시민'; } else return; } else if (x) x.o = o; else S.m[nick] = { o, r: 0, p: 0 }; }
// 📝 고소: 범죄를 당한 사람 이름으로 고소가 자동으로 들어가요 → 고소 중 가장 높은 등급이 지명수배 등급
//    피해자는 /고소 취소 (@닉) 로 취소할 수 있고, 남은 고소가 없으면 지명수배가 풀려요. 피해자가 따로 없는 범죄(욕설)는 「서버」 고소
function rewanted(nick) {
  const L = S.suit.filter((c) => c.who === nick);
  if (!L.length) { delete S.w[nick]; return; }
  const top = L.reduce((a, b) => (b.lv > a.lv ? b : a));
  S.w[nick] = { lv: top.lv, why: `${top.why} · 고소: ${[...new Set(L.map((c) => c.by))].join(', ')}`, t: top.t };
}
function crime(nick, lv, why, victim) {
  if (!nick) return;
  const by = victim || '서버', before = (S.w[nick] || {}).lv || 0;
  const old = S.suit.find((c) => c.who === nick && c.by === by);
  if (old && old.lv >= lv) return;
  if (old) Object.assign(old, { lv, why, t: Date.now() }); else S.suit.push({ who: nick, by, lv, why, t: Date.now() });
  rewanted(nick); save();
  if (by !== '서버') tell(by, `📝 ${nick} 님을 자동으로 고소했어요 (${why}) · 취소하려면 /고소 취소 @${nick}`);
  if (S.w[nick].lv > before) CB.say(`🚨 ${by === '서버' ? '' : by + ' 님이 '}${nick} 님을 고소 · 지명수배 ${stars(S.w[nick].lv)} ${S.w[nick].lv}등급 ${GRADE[S.w[nick].lv]} (${why})`);
}
function clearSuits(nick) { S.suit = S.suit.filter((c) => c.who !== nick); delete S.w[nick]; }
function toJail(nick, min, why) {
  S.jail[nick] = min * 60; clearSuits(nick); delete S.fine[nick]; save();
  CB.send('org-jail', { to: nick });
  CB.say(`⛓ ${nick} 님 징역 ${min}분 (${why}) · ${S.jailPos ? '감옥으로' : '감옥 차원의 감방으로'} 끌려가요`);
}
function askFine(nick, n, why) {
  S.fine[nick] = { n, why }; save();
  if (nick === me()) payMine({ n, why }); else CB.send('org-fine', { to: nick, n, why });
  CB.say(`💸 ${nick} 님 벌금 ${n} 케이브코인 (${why})`);
}
function payMine(v) { CB.payFine(v.n, v.why).then((r) => req(r && r.ok ? 'paid' : 'unpaid')).catch(() => req('unpaid')); }
function apply(op, a, from, fromOp, fromDiscord) {
  a = a || {};
  const Fo = teamOf(from), off = fromOp || isOfficer(from); // 내 팀 · 장교(CMO) 이상이나 OP
  const who = String(a.who || '').replace(/^@/, '');
  switch (op) {
    case 'own': S.owner[a.key] = from; return save();
    case 'unown': if (S.owner[a.key] === from) { delete S.owner[a.key]; save(); } return;
    case 'theft': {
      const o = S.owner[a.key];
      if (!o || o === from) return;
      delete S.owner[a.key]; save();
      return crime(from, 2, `${o} 님의 상자를 부숨 · 도둑질`, o);
    }
    case 'wanted': {
      if (!(fromOp || (isLaw(from) && isOfficer(from)))) return tell(from, '수배는 장교(CMO) · MP사령부 · 총사령부나 OP만 내릴 수 있어요');
      const lv = Math.max(1, Math.min(5, Math.floor(+a.lv) || 1));
      if (!who) return tell(from, '/수배 @닉 등급(1~5) 사유');
      const W = S.w[who];
      if (W && W.lv >= lv) return tell(from, '이미 그보다 높은 등급으로 수배 중이에요');
      return crime(who, lv, String(a.why || '부적절한 행동').slice(0, 40), from);
    }
    case 'unwanted': {
      if (!(fromOp || (isLaw(from) && isOfficer(from)))) return tell(from, '수배 해제는 장교(CMO) · MP사령부 · 총사령부나 OP만 할 수 있어요');
      if (!S.w[who]) return tell(from, '그 사람은 수배 중이 아니에요');
      clearSuits(who); save(); return CB.say(`${who} 님의 지명수배 · 고소가 모두 풀렸어요 (${from})`);
    }
    case 'sue': {
      // 📝 직접 고소: 부적절한 행동 등 (1 · 2등급까지)
      if (!who || who === from) return tell(from, '/고소 @닉 [1|2] 사유');
      const lv = Math.max(1, Math.min(2, Math.floor(+a.lv) || 1));
      return crime(who, lv, String(a.why || '부적절한 행동').slice(0, 40), from);
    }
    case 'unsue': {
      // 📝 고소 취소: 내가 한 고소 (@닉을 쓰면 그 사람 것만) · OP는 「서버」 고소도
      const L = S.suit.filter((c) => (c.by === from || (fromOp && c.by === '서버')) && (!who || c.who === who));
      if (!L.length) return tell(from, who ? `${who} 님에게 한 고소가 없어요` : '내가 한 고소가 없어요');
      S.suit = S.suit.filter((c) => !L.includes(c));
      for (const n of new Set(L.map((c) => c.who))) rewanted(n);
      save();
      return CB.say(`📝 ${from} 님이 ${[...new Set(L.map((c) => c.who))].join(', ')} 님에 대한 고소를 취소했어요`);
    }
    case 'arrest': {
      if (!(fromOp || isLaw(from))) return tell(from, '체포는 경찰(CP) · 군사경찰(CMP) · 장교(CMO) · MP사령부 · 총사령부나 OP만 할 수 있어요');
      const W = S.w[who];
      if (!W) return tell(from, '그 사람은 지명수배 중이 아니에요 · /수배');
      if (who === from) return tell(from, '자기 자신은 체포할 수 없어요');
      const how = String(a.how || ''), why = `${GRADE[W.lv]} · ${from} 체포`;
      CB.say(`👮 ${from} 님이 ${who} 님을 체포했어요 (지명수배 ${stars(W.lv)})`);
      if (W.lv === 1) return askFine(who, 1, why);
      if (W.lv === 2) return how === '징역' ? toJail(who, 10, why) : askFine(who, 10, why);
      if (W.lv === 3) return toJail(who, how === '20' ? 20 : 15, why);
      return toJail(who, W.lv === 4 ? 30 : 60, why);
    }
    case 'paid': {
      if (!S.fine[from]) return;
      delete S.fine[from]; clearSuits(from); save();
      return CB.say(`✅ ${from} 님이 벌금을 냈어요 · 지명수배 해제`);
    }
    case 'unpaid': {
      if (!S.fine[from]) return;
      return toJail(from, 10, '벌금을 내지 못함');
    }
    case 'jailpos': {
      if (!(fromOp || (isLaw(from) && isOfficer(from)))) return tell(from, '감옥은 장교(CMO) · MP사령부 · 총사령부나 OP만 정할 수 있어요');
      if (a.reset) { S.jailPos = null; save(); return CB.say('⛓ 감옥 자리를 「감옥 차원의 감방」으로 되돌렸어요'); }
      S.jailPos = { x: +a.x, y: +a.y, z: +a.z, dim: String(a.dim || 'over') }; save();
      return CB.say(`⛓ 감옥 자리를 정했어요 (${a.dim === '감옥' ? '감옥 차원' : '이 자리'})`);
    }
    case 'release': {
      if (!(fromOp || (isLaw(from) && isOfficer(from)))) return tell(from, '석방은 장교(CMO) · MP사령부 · 총사령부나 OP만 할 수 있어요');
      if (!S.jail[who]) return tell(from, '그 사람은 수감 중이 아니에요');
      delete S.jail[who]; save(); return CB.say(`🔓 ${who} 님 석방 (${from})`);
    }
    case 'join': { // 스스로는 시민으로만 (다른 팀은 위 계급이 /team 으로 배정)
      const o = findOrg(a.o);
      if (!o) return tell(from, '그런 팀이 없어요 · /조직 목록');
      if (o !== '시민' && !fromOp) return tell(from, `${tagOf(o)}은(는) 더 높은 계급이 /team ${o} @${from} 로 배정해 줘야 들어가요`);
      if (o === '총사령부') return tell(from, '총사령부(Owner)는 서버를 만든 사람이에요');
      setTeam(from, o); save();
      return CB.say(`${ORGS[o].ico} ${from} 님 → ${tagOf(o)}`);
    }
    case 'leave': {
      if (Fo === '시민') return tell(from, '이미 시민이에요');
      if (Fo === '총사령부') return tell(from, '총사령부(Owner)는 서버를 만든 사람이라 나갈 수 없어요');
      setTeam(from, '시민'); save(); return CB.say(`${from} 님이 ${tagOf(Fo)}에서 나와 시민이 됐어요`);
    }
    case 'assign': {
      const o = findOrg(a.o);
      if (!o || !who) return tell(from, '/team 팀 @닉 · 팀: ' + TEAMS.map((t) => t.key).join(' · '));
      if (o === '총사령부') return tell(from, '총사령부(Owner)는 서버를 만든 사람이라 배정할 수 없어요');
      if (who === ownerNick()) return tell(from, `${who} 님은 총사령부(Owner)예요`);
      const myLv = lvOf(from);
      if (!fromOp && !(myLv > ORGS[o].lv && myLv > lvOf(who))) return tell(from, `배정할 권한이 없어요 (내 계급 ${tagOf(Fo)}보다 아래 팀으로, 나보다 아래 계급인 사람만)`);
      setTeam(who, o); save();
      return CB.say(`${ORGS[o].ico} ${who} 님이 ${tagOf(o)}에 배정됐어요 (${from})`);
    }
    case 'kick': {
      const To = teamOf(who);
      if (!who || To === '시민') return tell(from, '그 사람은 이미 시민이에요');
      if (!commands(from, who, fromOp) || who === ownerNick()) return tell(from, '그 사람을 추방할 권한이 없어요 (나보다 아래 계급만)');
      setTeam(who, '시민'); save(); return CB.say(`${who} 님이 ${tagOf(To)}에서 추방돼 시민이 됐어요`);
    }
    case 'promote': case 'demote': {
      if (!who) return tell(from, `/${op === 'promote' ? '진급' : '강등'} @닉`);
      if (who === ownerNick()) return tell(from, `${who} 님은 총사령부(Owner)예요`);
      const cur = lvOf(who), nl = cur + (op === 'promote' ? 1 : -1);
      if (nl < 0) return tell(from, '이미 가장 낮은 계급(시민)이에요');
      if (nl >= TOP) return tell(from, '총사령부(Owner)로는 진급할 수 없어요 · 교육사령부가 가장 높아요');
      const ok = fromOp || (lvOf(from) > cur && lvOf(from) > nl);
      if (!ok) return tell(from, '그 계급으로 바꿀 권한이 없어요 (나보다 아래 계급만, 내 계급보다 높게는 못 올려요)');
      const no = TEAMS[nl].key; setTeam(who, no); save();
      return CB.say(`${op === 'promote' ? '⬆ 진급' : '⬇ 강등'}: ${who} 님 → ${ORGS[no].ico} ${tagOf(no)}`);
    }
    case 'base': { // 내 팀 기지 (/기지 설정 팀이름 → 내 아래 팀 기지)
      if (!off) return tell(from, '기지는 장교(CMO) 이상이나 OP만 정할 수 있어요');
      const o = (a.o && findOrg(a.o)) || Fo;
      if (!fromOp && ORGS[o].lv > ORGS[Fo].lv) return tell(from, '내 계급보다 위 팀의 기지는 못 정해요');
      S.base[o] = { x: +a.x, y: +a.y, z: +a.z }; save();
      return CB.say(`🏕 ${tagOf(o)} 기지가 정해졌어요 · ${o}은(는) 죽으면 기지에서 부활해요`);
    }
    case 'gather': {
      if (!off) return tell(from, '집합은 장교(CMO) 이상이나 OP만 할 수 있어요');
      const g = { lv: fromOp ? TOP : lvOf(from), x: +a.x, y: +a.y, z: +a.z, by: from };
      CB.send('org-go', g); goIfMine(g);
      return CB.say(`📯 ${from} ${tagOf(Fo)}: ${fromOp ? '모든 팀' : '경찰(CP) ~ ' + tagOf(Fo)} 집합!`);
    }
    case 'train': {
      if (!off) return tell(from, '훈련은 장교(CMO) 이상이나 OP만 열 수 있어요');
      const kind = a.kind === '체력' ? '체력' : '사격';
      S.train = { o: Fo, lv: fromOp ? TOP : lvOf(from), kind, until: Date.now() + 90000, done: [] }; save();
      if (kind === '사격') for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2; const t = CB.spawn('org_target', +a.x + Math.cos(ang) * 7, +a.y + 1, +a.z + Math.sin(ang) * 7); if (t) t.orgTarget = Fo; }
      return CB.say(`🎯 ${tagOf(Fo)} 훈련 시작 (${kind}) · 경찰(CP) ~ ${tagOf(Fo)} 참가 · 90초! ${kind === '사격' ? '표적을 맞히면 1점' : '200칸을 달리면 5점'}`);
    }
    case 'ran': {
      const T = S.train;
      if (!T || Date.now() > T.until || T.kind !== '체력' || !inTrain(from, T) || T.done.includes(from)) return;
      T.done.push(from); addPts(from, 5); save();
      return CB.say(`🏃 ${from} 님 체력 훈련 완주! +5점`);
    }
    case 'mission': {
      if (!off) return tell(from, '임무는 장교(CMO) 이상이나 OP만 줄 수 있어요');
      S.mission[Fo] = String(a.text || '').slice(0, 80); save();
      return CB.say(`📋 ${tagOf(Fo)} 임무 (경찰(CP) ~ ${tagOf(Fo)}): ${S.mission[Fo]}`);
    }
    case 'mission-done': {
      if (!off || !who) return tell(from, '/임무 완료 @닉 (장교(CMO) 이상 · OP)');
      if (!fromOp && lvOf(who) > lvOf(from)) return tell(from, '나보다 높은 계급의 임무는 완료 처리할 수 없어요');
      addPts(who, 10); delete S.mission[Fo]; save();
      return CB.say(`✅ ${who} 님 임무 완료! +10점`);
    }
    case 'mission-cancel': {
      if (!off) return;
      delete S.mission[Fo]; save(); return CB.say(`${tagOf(Fo)} 임무를 취소했어요`);
    }
  }
}

// ── 명령 보내기: 방장이면 바로, 친구면 방장에게 신호 ──
function req(op, a) {
  if (CB.isHost()) apply(op, a, me(), CB.isOp(), CB.discord());
  else CB.send('org', { op, a, d: CB.discord() ? 1 : 0 });
}
function goIfMine(g) {
  if (g.by !== me() && inTrain(me(), g)) { CB.tp(g.x, g.y + 0.2, g.z); note(`📯 ${g.by} 님의 집합 명령으로 이동했어요`); }
}
CB.on('msg', (k, v, from) => {
  if (k === 'org' && CB.isHost()) apply(v.op, v.a, from, CB.opOf(from), !!v.d);
  else if (k === 'org-go') goIfMine(v);
  else if (k === 'org-msg' && v.to === me()) note(v.m);
  else if (k === 'org-fine' && v.to === me()) payMine(v);
  else if (k === 'org-jail' && v.to === me()) note('⛓ 감옥에 갇혔어요');
});

// ── 🚨 범죄 알아채기 (방장 게임) ──
const hitBy = {}, lastHit = {}, kills = {};
CB.on('chat', (n, m) => {
  if (!CB.isHost() || !CB.players().includes(n)) return;
  const t = String(m).toLowerCase().replace(/\s/g, '');
  if (!BADWORDS.some((w) => t.includes(w))) return;
  const vs = (String(m).match(/@([^\s@]+)/g) || []).map((x) => x.slice(1)).filter((x) => x !== n && CB.players().includes(x)); // @닉으로 부른 사람이 피해자
  if (vs.length) for (const v of vs) crime(n, 1, '부적절한 말', v); else crime(n, 1, '부적절한 말');
});
CB.on('pvp', (a, v) => {
  if (!CB.isHost() || a === v) return;
  const now = Date.now();
  lastHit[v] = { by: a, t: now };
  (hitBy[v] || (hitBy[v] = {}))[a] = now;
  const selfDef = hitBy[a] && hitBy[a][v] && now - hitBy[a][v] < 30000; // 먼저 맞았으면 정당방위
  if (isLaw(a) && S.w[v]) return;                                       // 경찰이 수배자를 제압
  if (selfDef) return;
  if (isLaw(v)) crime(a, 3, `경찰 쪽 조직원 ${v} 님 폭행`, v);
  else crime(a, 2, `${v} 님 폭행`, v);
});
CB.on('pdeath', (v) => {
  if (!CB.isHost()) return;
  const L = lastHit[v], now = Date.now();
  if (!L || now - L.t > 10000 || L.by === v) return;
  const k = L.by;
  delete lastHit[v];
  if (isLaw(k) && (S.w[v] || {}).lv >= 3) return;                       // 경찰이 중범죄 이상 수배자를 쓰러뜨림
  if (hitBy[k] && hitBy[k][v] && now - hitBy[k][v] < 30000) return;      // 쓰러진 사람이 먼저 때렸으면 정당방위
  const K = (kills[k] = (kills[k] || []).filter((t) => now - t < 300000));
  K.push(now);
  if (K.length >= 3) crime(k, 5, `5분 안에 ${K.length}명을 쓰러뜨림`, v);
  else crime(k, 4, `${v} 님을 쓰러뜨림`, v);
});
// 상자 주인 · 도둑질 (부순 사람의 게임이 방장에게 알림)
const bkey = (x, y, z) => `${x},${y},${z}`;
CB.on('place', (x, y, z, id) => { if (id === CHEST) req('own', { key: bkey(x, y, z) }); });
CB.on('break', (x, y, z, id) => {
  if (id !== CHEST) return;
  const k = bkey(x, y, z), o = S.owner[k];
  if (o && o !== me()) req('theft', { key: k }); else if (o) req('unown', { key: k });
});

// 훈련 표적 (가만히 서 있음) · 맞혀서 쓰러뜨리면 그 사람에게 1점
CB.mob('org_target', { name: '🎯 훈련 표적', hp: 6, color: 0xd8b070, head: 0xffffff, ai: (m) => { m.vel.x = m.vel.z = 0; } });
CB.on('kill', (m) => {
  if (!CB.isHost() || !m.orgTarget) return;
  const T = S.train, who = m.byNick || me();
  if (!T || Date.now() > T.until || !inTrain(who, T)) return;
  addPts(who, 1); save();
});

// ── 명령어 ──
const pos = () => CB.pos();
// 「조직 @닉」 이든 「@닉 조직」 이든 알아들음 (조직 이름에 띄어쓰기가 있어도: CMP 사령부)
function parseTeam(a) {
  if (a.length < 2) return null;
  let o = findOrg(a.slice(0, -1).join(' '));
  if (o) return { o, who: a[a.length - 1] };
  o = findOrg(a.slice(1).join(' '));
  if (o) return { o, who: a[0] };
  return null;
}
// 팀 사람들: 서버를 만든 사람(총사령부) + 저장된 사람들
const teamMembers = (o) => { const L = Object.keys(S.m).filter((n) => teamOf(n) === o); const ow = ownerNick(); if (o === '총사령부' && ow && !L.includes(ow)) L.unshift(ow); return L; };
CB.command('team', '/team 팀 @닉 (또는 /team @닉 팀) — 그 사람을 그 팀으로 (나보다 아래 계급 · OP) · /team — 팀 계급표', (a, c) => {
  if (!a.length) return CB.run('/조직 목록');
  const p = parseTeam(a);
  if (!p) return c.say('/team 팀 @닉 · 팀: ' + TEAMS.map((t) => t.key).join(' · '));
  req('assign', p);
}, { everyone: true });
CB.command('조직', '내 팀 · /조직 목록 (계급표) · /조직 탈퇴 (시민으로) · /조직 배정 · /조직 추방', (a, c) => {
  const sub = a[0] || '';
  if (sub === '가입') return req('join', { o: a.slice(1).join(' ') });
  if (sub === '탈퇴') return req('leave');
  if (sub === '배정') { const p = parseTeam(a.slice(1)); return p ? req('assign', p) : c.say('/조직 배정 @닉 팀 (또는 /조직 배정 팀 @닉)'); }
  if (sub === '추방') return req('kick', { who: a[1] });
  if (sub === '목록') {
    c.say('🪖 팀 계급표 (위 → 아래)');
    for (let i = TOP; i >= 0; i--) { const o = TEAMS[i].key, n = teamMembers(o).length; c.say(`${i + 1}. ${ORGS[o].ico} ${tagOf(o)}${o === '시민' ? '' : ` · ${n}명`} · 점수 ${S.pts[o] || 0}${i === TOP ? ' · 서버를 만든 사람' : i >= OFFICER_LV ? ' · 지휘' : ''}`); }
    return;
  }
  const x = mine();
  c.say(`${ORGS[x.o].ico} ${tagOf(x.o)} (${ORGS[x.o].lv + 1}/${TEAMS.length}번째 계급) · 내 점수 ${x.p || 0} · 팀 점수 ${S.pts[x.o] || 0}`);
  if (x.o !== '시민') c.say('같은 팀: ' + teamMembers(x.o).join(', '));
  else c.say('더 높은 계급이 /team 팀 @닉 으로 배정해 주면 들어가요 · /조직 목록');
}, { everyone: true });
CB.command('진급', '/진급 @닉 — 한 계급 위 팀으로 (나보다 아래 계급 · OP)', (a) => req('promote', { who: a[0] }), { everyone: true });
CB.command('강등', '/강등 @닉 — 한 계급 아래 팀으로 (나보다 아래 계급 · OP)', (a) => req('demote', { who: a[0] }), { everyone: true });
CB.command('기지', '팀 기지로 이동 · /기지 설정 [팀] (장교(CMO) 이상)', (a, c) => {
  if (a[0] === '설정') return req('base', { ...pos(), o: a.slice(1).join(' ') });
  const x = mine(), b = S.base[x.o];
  if (!b) return c.say('아직 우리 팀 기지가 없어요 (장교(CMO) 이상이 /기지 설정)');
  CB.tp(b.x, b.y + 0.2, b.z); c.say('🏕 기지로 이동했어요');
}, { everyone: true });
CB.command('집합', '내 계급 이하 팀(경찰부터) 모두 내 자리로 (장교(CMO) 이상)', () => req('gather', pos()), { everyone: true });
CB.command('훈련', '훈련 열기: /훈련 사격 · /훈련 체력 (장교(CMO) 이상)', (a) => req('train', { kind: a[0], ...pos() }), { everyone: true });
CB.command('임무', '/임무 내용 · /임무 완료 @닉 · /임무 취소 (장교(CMO) 이상)', (a) => {
  if (a[0] === '완료') return req('mission-done', { who: a[1] });
  if (a[0] === '취소') return req('mission-cancel');
  req('mission', { text: a.join(' ') });
}, { everyone: true });

// ── 🚨 수배 · 체포 명령어 ──
CB.command('수배', '지명수배 목록 · /수배 @닉 등급 사유 · /수배 해제 @닉 (경찰 장교 · OP)', (a, c) => {
  if (a[0] === '해제') return req('unwanted', { who: a[1] });
  if (a[0]) return req('wanted', { who: a[0], lv: a[1], why: a.slice(2).join(' ') });
  const L = Object.entries(S.w);
  if (!L.length) return c.say('지금 지명수배된 사람이 없어요');
  for (const [n, W] of L) c.say(`🚨 ${n} · ${stars(W.lv)} ${W.lv}등급 ${GRADE[W.lv]} · ${W.why}`);
}, { everyone: true });
CB.command('고소', '/고소 — 내 고소 목록 · /고소 취소 [@닉] · /고소 @닉 [1|2] 사유 (부적절한 행동)', (a, c) => {
  if (a[0] === '취소') return req('unsue', { who: a[1] });
  if (a[0]) return req('sue', { who: a[0], lv: /^[12]$/.test(a[1] || '') ? a[1] : 1, why: a.slice(/^[12]$/.test(a[1] || '') ? 2 : 1).join(' ') });
  const mineL = S.suit.filter((x) => x.by === me()), onMe = S.suit.filter((x) => x.who === me());
  if (!mineL.length && !onMe.length) return c.say('고소한 것도, 고소당한 것도 없어요');
  for (const x of mineL) c.say(`📝 내가 고소: ${x.who} · ${stars(x.lv)} ${GRADE[x.lv]} · ${x.why}  (/고소 취소 @${x.who})`);
  for (const x of onMe) c.say(`⚠ 나를 고소: ${x.by} · ${stars(x.lv)} ${GRADE[x.lv]} · ${x.why}`);
}, { everyone: true });
CB.command('체포','/체포 @닉 [벌금|징역|15|20] — 지명수배자 처벌 (경찰 · 군사경찰 · 장교 · MP사령부 · 총사령부 · OP)', (a) => req('arrest', { who: a[0], how: a[1] }), { everyone: true });
CB.command('감옥', '/감옥 — 수감자 목록 · /감옥 설정 (지금 자리를 감옥으로) · /감옥 설정 초기화 · /감옥 가기 · /감옥 나가기', (a, c) => {
  if (a[0] === '설정') return req('jailpos', a[1] === '초기화' ? { reset: 1 } : { ...pos(), dim: CB.dimNow() });
  if (a[0] === '가기' || a[0] === '나가기') {
    if (!(CB.isOp() || isLaw(me()))) return c.say('감옥 차원은 경찰(CP) · 군사경찰(CMP) · 장교(CMO) · MP사령부 · 총사령부나 OP만 드나들 수 있어요');
    if (S.jail[me()]) return c.say('수감 중에는 나갈 수 없어요');
    if (a[0] === '가기') { CB.goDim('감옥'); return c.say('⛓ 감옥 차원으로 가요'); }
    if (CB.dimNow() !== '감옥') return c.say('지금 감옥 차원에 있지 않아요');
    CB.goDim('over'); return c.say('프론티어로 돌아가요');
  }
  const L = Object.entries(S.jail);
  if (!L.length) return c.say('지금 수감 중인 사람이 없어요');
  for (const [n, s] of L) c.say(`⛓ ${n} · 남은 시간 ${Math.ceil(s / 60)}분`);
}, { everyone: true });
CB.command('석방', '/석방 @닉 (경찰 장교 · OP)', (a) => req('release', { who: a[0] }), { everyone: true });

// ── 1초마다: 닉네임표 · 안내판 · 기지 부활 자리 · 체력 훈련 거리 · 수배 · 감옥 ──
let saveJailT = 0, jailFrom = null, jailGoT = 0;
let acc = 0, tagged = new Set(), spawnKey = '', ranD = 0, lastP = null, ranSent = '';
CB.onTick((dt) => {
  if (noteT > 0 && (noteT -= dt) <= 0) CB.hud('orgmsg', null);
  const T = S.train, x = mine();
  if (T && x && T.kind === '체력' && inTrain(me(), T) && Date.now() < T.until) {
    const p = pos();
    if (lastP) ranD += Math.hypot(p.x - lastP.x, p.z - lastP.z);
    lastP = p;
    if (ranD >= 200 && ranSent !== String(T.until)) { ranSent = String(T.until); req('ran'); }
  } else { ranD = 0; lastP = null; }
  if ((acc += dt) < 1) return;
  acc = 0;
  S = load();
  // 방장: 접속해 있는 수감자의 남은 시간을 줄임 (나가 있는 동안은 멈춤)
  if (CB.isHost()) {
    const on = CB.players();
    let ch = false;
    for (const n of Object.keys(S.jail)) if (on.includes(n)) { S.jail[n]--; ch = true; if (S.jail[n] <= 0) { delete S.jail[n]; CB.say(`🔓 ${n} 님 형기를 마치고 석방됐어요`); } }
    if (ch && (++saveJailT >= 5 || !Object.keys(S.jail).length)) { saveJailT = 0; save(); }
  }
  // 머리 위: [조직 계급] + 🚨지명수배 ★ n등급 / ⛓수감
  const now = new Set(), names = new Set([...Object.keys(S.m), ...Object.keys(S.w), ...Object.keys(S.jail), ...(ownerNick() ? [ownerNick()] : [])]);
  for (const n of names) {
    const o = teamOf(n), y = o !== '시민', W = S.w[n];
    let pre = y ? `[${ORGS[o].ico}${tagOf(o)}]` : '';
    if (W) pre += ` 🚨지명수배 ${stars(W.lv)} ${W.lv}등급`;
    if (S.jail[n]) pre += ' ⛓수감';
    CB.tag(n, pre.trim(), W || S.jail[n] ? '#ff4a4a' : y ? ORGS[o].color : '');
    now.add(n);
  }
  for (const n of tagged) if (!now.has(n)) CB.tag(n);
  tagged = now;
  // 내가 수감 중이면 감옥 밖으로 못 나감
  const J = S.jail[me()];
  if (J > 0) {
    if (!jailFrom) { const p0 = pos(); jailFrom = { dim: CB.dimNow(), x: p0.x, y: p0.y, z: p0.z }; } // 끌려가기 전 자리 (풀려나면 돌아감)
    const jp = S.jailPos || cellOf(me()), jd = jp.dim || 'over', p = pos();
    if (CB.dimNow() !== jd) { if ((jailGoT -= 1) <= 0) { jailGoT = 4; CB.goDim(jd, jp.x, jp.y + 0.2, jp.z); } } // 감옥 차원으로 끌려감
    else if (Math.hypot(p.x - jp.x, p.z - jp.z) > 4 || Math.abs(p.y - jp.y) > 4) CB.tp(jp.x, jp.y + 0.2, jp.z);
  } else if (jailFrom) { // 형기가 끝남 → 원래 자리로
    const f = jailFrom; jailFrom = null; jailGoT = 0;
    if (CB.dimNow() !== f.dim) CB.goDim(f.dim, f.x, f.y + 0.2, f.z); else CB.tp(f.x, f.y + 0.2, f.z);
    note('🔓 풀려났어요 — 원래 있던 곳으로 돌아가요');
  } else if (CB.dimNow() === '감옥' && !(CB.isOp() || isLaw(me())) && (jailGoT -= 1) <= 0) { jailGoT = 4; CB.goDim('over'); } // 수감자가 아닌데 감옥 차원에 있으면 (새로고침 등) 프론티어로
  const y = mine(), W = S.w[me()];
  if (CB.bgm) CB.bgm(W && !J ? 'wanted' : 'calm', W ? W.lv : 0); // 🚨 지명수배 중이면 나한테만 수배 음악 (등급이 높을수록 격해짐)
  let h = '';
  {
    const O = ORGS[y.o], b = S.base[y.o], k = b ? JSON.stringify(b) : '';
    if (k && k !== spawnKey) { CB.setSpawn(b.x, b.y + 0.2, b.z); spawnKey = k; }
    h = `<span style="color:${O.color}">${O.ico} <b>${esc(tagOf(y.o))}</b></span> · ${O.lv + 1}/${TEAMS.length} 계급 · ${y.p || 0}점`;
    if (O.lv > 0) for (const mo in S.mission) if (ORGS[mo] && ORGS[mo].lv >= O.lv) h += `<br>📋 임무 (${esc(mo)}): ${esc(S.mission[mo])}`;
    if (S.train && inTrain(me(), S.train) && Date.now() < S.train.until) h += `<br>🎯 훈련(${S.train.kind}) ${Math.ceil((S.train.until - Date.now()) / 1000)}초` + (S.train.kind === '체력' ? ` · ${Math.min(200, ranD | 0)}/200칸` : '');
  }
  if (W) h += `${h ? '<br>' : ''}<span style="color:#ff5a5a">🚨 <b>지명수배 ${stars(W.lv)} ${W.lv}등급</b> · ${GRADE[W.lv]} (${esc(W.why)})</span>`;
  if (J > 0) h += `${h ? '<br>' : ''}⛓ <b>수감 중</b> · ${Math.floor(J / 60)}분 ${J % 60}초 남음`;
  CB.hud('org', h || null);
});
