// 🪖 조직 (팀) 모드 — CAVEBUILD 서버용 .js 모드
// 조직: 무법자 · CP · TMC · CMP · CP 사령부 · TMC 사령부 · CMP 사령부
// 계급 · 진급 · 강등, 머리 위 닉네임에 [조직 계급] + 조직 색, 기지 · 집합, 훈련 · 임무, 같은 조직끼리도 때릴 수 있음
// 멀티플레이에서는 방장 게임이 조직 정보를 저장하고(세계에 저장됨), 친구들의 명령은 방장에게 신호로 보내요.
//
// 명령어 (누구나):  /조직 · /조직 목록 · /조직 가입 이름 · /조직 탈퇴 · /기지
// 명령어 (장교 · OP): /조직 배정 @닉 이름 · /조직 추방 @닉 · /진급 @닉 · /강등 @닉
//                    /기지 설정 · /집합 · /훈련 사격 · /훈련 체력 · /임무 내용 · /임무 완료 @닉 · /임무 취소
// 📝 고소:           범죄를 당하면 피해자 이름으로 자동 고소 → 지명수배 · /고소 (목록) · /고소 취소 [@닉] · /고소 @닉 [1|2] 사유
// 🚨 지명수배:       /수배 (목록) · /감옥 (수감자) — 누구나
//   경찰 쪽 조직:     /체포 @닉 [벌금|징역|15|20]
//   경찰 쪽 장교·OP:  /수배 @닉 등급 사유 · /수배 해제 @닉 · /감옥 설정 · /석방 @닉
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

// ── 🚨 지명수배 ──
// 범죄를 하면 머리 위에 「지명수배 ★ 등급」이 떠요. 경찰 쪽 조직(CP · CMP · 각 사령부)이나 OP가 /체포 해서 처벌하면 지워져요.
//   ★     1등급 질서위반 — 부적절한 말 (아래 BADWORDS) · 경찰이 /수배 로 올린 부적절한 행동       → 벌금 1 케이브코인
//   ★★    2등급 경범죄   — 폭행 (먼저 맞지 않았는데 때림) · 도둑질 (남이 놓은 상자를 부숨)       → 벌금 10 케이브코인 또는 징역 10분
//   ★★★   3등급 중범죄   — 경찰 쪽 조직원 폭행                                                  → 징역 15분 또는 징역 20분
//   ★★★★  4등급 무단사살 — 플레이어를 쓰러뜨림 (정당방위 · 경찰이 수배자를 쓰러뜨린 건 빼고)        → 징역 30분
//   ★★★★★ 5등급 대학살   — 5분 안에 3명 이상 쓰러뜨림                                            → 징역 1시간
const LAW = ['CP', 'CMP', 'CP 사령부', 'CMP 사령부'];
const GRADE = { 1: '질서위반', 2: '경범죄', 3: '중범죄', 4: '무단사살', 5: '대학살' };
const BADWORDS = ['시발', '씨발', 'ㅅㅂ', 'ㅆㅂ', '병신', 'ㅂㅅ', '개새', '좆', '지랄', '꺼져', '닥쳐', 'fuck', 'shit', 'bitch'];
const stars = (n) => '★'.repeat(n);
const CHEST = 48; // 상자 블록

// ── 저장된 조직 정보 (방장 세계에 저장 · 친구들에게 저절로 맞춰짐) ──
const load = () => { const s = CB.load('org') || {}; return { m: s.m || {}, base: s.base || {}, mission: s.mission || {}, pts: s.pts || {}, train: s.train || null, w: s.w || {}, jail: s.jail || {}, jailPos: s.jailPos || null, owner: s.owner || {}, fine: s.fine || {}, suit: s.suit || [] }; };
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
const isLaw = (nick) => !!S.m[nick] && LAW.includes(S.m[nick].o);
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
  CB.say(`⛓ ${nick} 님 징역 ${min}분 (${why})${S.jailPos ? '' : ' · 감옥이 없어서 지금 자리에 갇혀요 (경찰 장교가 /감옥 설정)'}`);
}
function askFine(nick, n, why) {
  S.fine[nick] = { n, why }; save();
  if (nick === me()) payMine({ n, why }); else CB.send('org-fine', { to: nick, n, why });
  CB.say(`💸 ${nick} 님 벌금 ${n} 케이브코인 (${why})`);
}
function payMine(v) { CB.payFine(v.n, v.why).then((r) => req(r && r.ok ? 'paid' : 'unpaid')).catch(() => req('unpaid')); }
function apply(op, a, from, fromOp, fromDiscord) {
  a = a || {};
  const F = S.m[from];
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
      if (!(fromOp || (isLaw(from) && isOfficer(F)))) return tell(from, '수배는 경찰 쪽 장교나 OP만 내릴 수 있어요');
      const lv = Math.max(1, Math.min(5, Math.floor(+a.lv) || 1));
      if (!who) return tell(from, '/수배 @닉 등급(1~5) 사유');
      const W = S.w[who];
      if (W && W.lv >= lv) return tell(from, '이미 그보다 높은 등급으로 수배 중이에요');
      return crime(who, lv, String(a.why || '부적절한 행동').slice(0, 40), from);
    }
    case 'unwanted': {
      if (!(fromOp || (isLaw(from) && isOfficer(F)))) return tell(from, '수배 해제는 경찰 쪽 장교나 OP만 할 수 있어요');
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
      if (!(fromOp || isLaw(from))) return tell(from, '체포는 경찰 쪽 조직(CP · CMP · 사령부)이나 OP만 할 수 있어요');
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
      if (!(fromOp || (isLaw(from) && isOfficer(F)))) return tell(from, '감옥은 경찰 쪽 장교나 OP만 정할 수 있어요');
      S.jailPos = { x: +a.x, y: +a.y, z: +a.z }; save();
      return CB.say('⛓ 감옥 자리를 정했어요');
    }
    case 'release': {
      if (!(fromOp || (isLaw(from) && isOfficer(F)))) return tell(from, '석방은 경찰 쪽 장교나 OP만 할 수 있어요');
      if (!S.jail[who]) return tell(from, '그 사람은 수감 중이 아니에요');
      delete S.jail[who]; save(); return CB.say(`🔓 ${who} 님 석방 (${from})`);
    }
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
CB.command('체포','/체포 @닉 [벌금|징역|15|20] — 지명수배자 처벌 (경찰 쪽 조직 · OP)', (a) => req('arrest', { who: a[0], how: a[1] }), { everyone: true });
CB.command('감옥', '/감옥 설정 — 감옥 자리 정하기 (경찰 장교 · OP) · /감옥 — 수감자 목록', (a, c) => {
  if (a[0] === '설정') return req('jailpos', pos());
  const L = Object.entries(S.jail);
  if (!L.length) return c.say('지금 수감 중인 사람이 없어요');
  for (const [n, s] of L) c.say(`⛓ ${n} · 남은 시간 ${Math.ceil(s / 60)}분`);
}, { everyone: true });
CB.command('석방', '/석방 @닉 (경찰 장교 · OP)', (a) => req('release', { who: a[0] }), { everyone: true });

// ── 1초마다: 닉네임표 · 안내판 · 기지 부활 자리 · 체력 훈련 거리 · 수배 · 감옥 ──
let saveJailT = 0, jailHere = null;
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
  // 방장: 접속해 있는 수감자의 남은 시간을 줄임 (나가 있는 동안은 멈춤)
  if (CB.isHost()) {
    const on = CB.players();
    let ch = false;
    for (const n of Object.keys(S.jail)) if (on.includes(n)) { S.jail[n]--; ch = true; if (S.jail[n] <= 0) { delete S.jail[n]; CB.say(`🔓 ${n} 님 형기를 마치고 석방됐어요`); } }
    if (ch && (++saveJailT >= 5 || !Object.keys(S.jail).length)) { saveJailT = 0; save(); }
  }
  // 머리 위: [조직 계급] + 🚨지명수배 ★ n등급 / ⛓수감
  const now = new Set(), names = new Set([...Object.keys(S.m), ...Object.keys(S.w), ...Object.keys(S.jail)]);
  for (const n of names) {
    const y = S.m[n], W = S.w[n];
    let pre = y ? `[${ORGS[y.o].ico}${y.o} ${rankName(y)}]` : '';
    if (W) pre += ` 🚨지명수배 ${stars(W.lv)} ${W.lv}등급`;
    if (S.jail[n]) pre += ' ⛓수감';
    CB.tag(n, pre.trim(), W || S.jail[n] ? '#ff4a4a' : y ? ORGS[y.o].color : '');
    now.add(n);
  }
  for (const n of tagged) if (!now.has(n)) CB.tag(n);
  tagged = now;
  // 내가 수감 중이면 감옥 밖으로 못 나감
  const J = S.jail[me()];
  if (J > 0) {
    const jp = S.jailPos || jailHere || (jailHere = pos()), p = pos(); // 감옥 자리가 없으면 잡힌 자리에 갇힘
    if (Math.hypot(p.x - jp.x, p.z - jp.z) > 5) CB.tp(jp.x, jp.y + 0.2, jp.z);
  } else jailHere = null;
  const y = mine(), W = S.w[me()];
  let h = '';
  if (y) {
    const O = ORGS[y.o], b = S.base[y.o], k = b ? JSON.stringify(b) : '';
    if (k && k !== spawnKey) { CB.setSpawn(b.x, b.y + 0.2, b.z); spawnKey = k; }
    h = `<span style="color:${O.color}">${O.ico} <b>${y.o}</b></span> · ${rankName(y)} · ${y.p || 0}점 · 조직 ${S.pts[y.o] || 0}점`;
    if (S.mission[y.o]) h += `<br>📋 임무: ${esc(S.mission[y.o])}`;
    if (S.train && S.train.o === y.o && Date.now() < S.train.until) h += `<br>🎯 훈련(${S.train.kind}) ${Math.ceil((S.train.until - Date.now()) / 1000)}초` + (S.train.kind === '체력' ? ` · ${Math.min(200, ranD | 0)}/200칸` : '');
  }
  if (W) h += `${h ? '<br>' : ''}<span style="color:#ff5a5a">🚨 <b>지명수배 ${stars(W.lv)} ${W.lv}등급</b> · ${GRADE[W.lv]} (${esc(W.why)})</span>`;
  if (J > 0) h += `${h ? '<br>' : ''}⛓ <b>수감 중</b> · ${Math.floor(J / 60)}분 ${J % 60}초 남음`;
  CB.hud('org', h || null);
});
