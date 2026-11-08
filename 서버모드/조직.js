// 🪖 조직 (팀 계급) 모드 — CAVEBUILD 서버용 .js 모드
// 팀 계급 (아래 → 위): 시민 · 경찰(CP) · 육군(Soldier) · 의무병(Medic) · 군사경찰(CMP) · 특수임무대(SWAT) · 장교(Officer) · 교육사(TMC) · MP사령관(CMPO) · 교육사령관(TMCO) · 부사령관(Staff) · 총사령관(Owner)
//   CLKKY ARMY 조직 구성: 의무병은 메디킷으로 치료 (사람을 치면 +8 · 우클릭하면 나 +6) · 특수임무대는 ★★★ 진압 (수갑 · 체포 가능) · 장교는 육군 · 의무병 관리 · 군사경찰은 MP사령관 지휘
//   처음엔 누구나 시민 · 위 계급이 아래 계급 사람을 배정 · 진급 · 강등해요 (내 계급보다 아래로만) · 총사령관은 서버를 만든 사람(Owner)
//   머리 위 닉네임에 [팀] + 팀 색, 기지 · 집합, 훈련 · 임무, 같은 팀끼리도 때릴 수 있음
// 멀티플레이에서는 방장 게임이 조직 정보를 저장하고(세계에 저장됨), 친구들의 명령은 방장에게 신호로 보내요.
//
// 🎒 팀이 되면 기본 장비를 받아요 (KITS) · 총사령관(Owner)은 OP · 고소 · 수배 안 됨
// 🏴 불법 거래 상인 (NPC): 밤에만 나와서 시민 · 무법자에게 동전으로 무기를 팔아요 · 쓰러지면 다음 날 밤에 (/상인 · /상인 설정)
// 🌙 생활규칙: 밤에는 경찰은 경찰서 구역, 군대는 군부대 안 (군대는 /외출 허가면 예외) · 밖에 60초 넘게 있으면 수갑대상
// 🏙 모드를 깔면 부활 자리 근처 빈 땅에 도시 · 🚓 경찰서 · 🪖 군부대가 저절로 생겨요 (/도시 · OP는 /도시 짓기)
// 🎖 전역: 입대소 안의 전역 상담원 (OP · 소령 · 장교 이상은 /조직 탈퇴도) · 🏖 휴가: 입대소 안의 휴가 상담원 (10 · 30분, 끝나고 1시간 뒤 다시) → 돌아오면 정문 안쪽의 복귀 상담원에게 신고 (안 하면 시간이 끝날 때 수갑대상) · 무단탈영: 군부대 정문의 빨간 선을 넘어 걸어 나가거나 군부대 안에서 /집 가기 (★★★ · 무법자)
// 🪪 외출: 장교(Officer) 이상이 /외출 @닉 [분] 으로 허가하면 군부대를 나가도 무단탈영이 아니에요 · 군부대로 돌아오면 외출 끝 · 시간을 넘기면 무단탈영 · /외출 취소 @닉
// 🏰 도시 둘레에 성벽 (동 · 남 · 북 성문 · 성문 밖 길)
// 🪖 입대: 시민이 입대소 · 경찰서의 상담원에게 우클릭 → 「네」 · 시민이 입대 없이 군부대에 들어가면 🏴 무법자 · 경찰 · 군대는 무법자가 안 되고 지명수배만
// 📝 진급: 교육사(TMC) 이상이 /시험 열기 @닉 (10분) → 군대 팀은 /시험 사격 · /시험 점프 를 둘 다 통과해야 /진급 (진급마다 다시 · OP는 시험 없이)
// 🚨 무단 팀 변경: 허락 없이 내 팀을 바꾸려 하면 (/team 팀 · /조직 가입) 수갑대상
// 명령어 (누구나):  /조직 (내 팀) · /조직 목록 · /조직 탈퇴 (시민으로 · 군대는 전역) · /기지 · /장비 · /상인
// 명령어 (장교(Officer) 이상 · OP): /team 팀 @닉 (순서 상관없음, = /조직 배정) · /진급 @닉 · /강등 @닉 · /조직 추방 @닉 (시민으로) · /석방 @닉
// 명령어 (장교(Officer) 이상 · OP): /기지 설정 · /집합 (내 계급 이하 모두) · /훈련 사격 · /훈련 체력 · /임무 내용 · /임무 완료 @닉 · /임무 취소
// 📝 고소:           범죄를 당하면 피해자 이름으로 자동 고소 → 지명수배 · /고소 (목록) · /고소 취소 [@닉] · /고소 @닉 [1|2] 사유
// 👮 팀은 복장과 머리 위 닉네임 색으로 알아봐요 · 머리 위: 닉네임 → 계급 → 지명수배 (수갑대상 · ★★ · ★★★)
// 🚨 지명수배:       /수배 (목록) · /감옥 (수감자) — 누구나 · 수배 중인 사람에게만 수배 음악 「추격」 (가장 긴장되는 곡 하나)
//   🔗 체포는 수갑으로: 경찰 쪽 팀 (경찰 · 군사경찰 · 장교 · MP사령관 · 총사령관)이 수배자 · 무법자를 수갑으로 치면 체포 (벌금 · 징역)
//   경찰 쪽 장교 이상 · OP:  /수배 @닉 등급 사유 · /수배 해제 @닉 · /감옥 설정 · /석방 @닉
// 🏴 무법자: 시민이 지명수배 3등급 범죄를 저지르면 (무단사살 · 무기로 협박 · 군부대 침입 등) 무법자 팀이 돼요 · 수갑대상 · ★★는 시민 그대로 · 수갑으로 잡히기 전엔 팀을 못 바꿔요
// ⛓ 죄수: 감옥에 있는 동안은 죄수 팀 · 형기를 마치거나 벌금을 내면 시민으로 돌아가요
// 🏦 은행: 도시 동쪽 은행원에게 우클릭 · /은행 (잔액) · /은행 입금 · 출금 (은행 안에서) · /은행 송금 @닉 개수 · 화폐는 인게임 동전
// 💼 직업: 직업소개소 상담원에게 우클릭 · /직업 · 시민만 (경찰 · 군대는 팀 월급) · 번 돈과 월급은 통장으로 (10분마다)

const TEAMS = [ // 아래 → 위 (계급 순서)
  { key: '시민', short: '시민', ico: '🙂', color: '#e0e0e0' },
  { key: '경찰', short: 'CP', ico: '🚓', color: '#4aa8ff' },
  { key: '육군', short: 'Soldier', ico: '🪖', color: '#7ec850' },
  { key: '해군', short: 'Navy', ico: '⚓', color: '#5b8def' },
  { key: '공군', short: 'Air Force', ico: '✈', color: '#8ec5ff' },
  { key: '해병대', short: 'Marines', ico: '🦅', color: '#e84a4a' },
  { key: '의무병', short: 'Medic', ico: '⛑', color: '#ff7a8a' },
  { key: '군사경찰', short: 'CMP', ico: '🛡', color: '#fbbf24' },
  { key: '특수임무대', short: 'SWAT', ico: '🎯', color: '#9ca3af' },
  { key: '장교', short: 'Officer', ico: '🎖', color: '#c084fc' },
  { key: '교육사', short: 'TMC', ico: '📘', color: '#4ade80' },
  { key: 'MP사령관', short: 'CMPO', ico: '⚜', color: '#f59e0b' },
  { key: '교육사령관', short: 'TMCO', ico: '⭐', color: '#22c55e' },
  { key: '부사령관', short: 'Staff', ico: '🎗', color: '#e5e7eb' },
  { key: '총사령관', short: 'Owner', ico: '👑', color: '#ff5a5a' },
];
const ORGS = Object.fromEntries(TEAMS.map((t, i) => [t.key, { ...t, lv: i, full: t.short }]));
ORGS['해군'].lv = ORGS['공군'].lv = ORGS['해병대'].lv = ORGS['육군'].lv; // 🪖 CLKKY ARMY 1사단 육군 · ⚓ 2사단 해군 · ✈ 3사단 공군 · 🦅 4사단 해병대는 같은 단계 (서로 지휘 못 함)
const DIVS = { '육군': '1사단', '해군': '2사단', '공군': '3사단', '해병대': '4사단', '군사경찰': '5사단' }; // ⛓ 5사단 = 교도소 (교도관: 군사경찰 · 경찰)
const OUTLAW = '무법자', PRISONER = '죄수'; // 계급표 밖의 팀 (배정 · 진급 안 됨)
ORGS[OUTLAW] = { key: OUTLAW, short: OUTLAW, ico: '🏴', color: '#ff4040', lv: 0, full: OUTLAW, special: 1 };
ORGS[PRISONER] = { key: PRISONER, short: PRISONER, ico: '⛓', color: '#ff9a3a', lv: 0, full: PRISONER, special: 1 };
const TOP = TEAMS.length - 1, OFFICER_LV = TEAMS.findIndex((t) => t.key === '장교'); // 총사령관 · 장교(Officer)부터 지휘
const OLDTEAM = { 'CP': '경찰', 'TMC': '교육사', 'CMP': '군사경찰', 'CP 사령부': 'MP사령관', 'TMC 사령부': '교육사령관', 'CMP 사령부': 'MP사령관', '군사': '육군', 'CM': '육군', 'CMO': '장교', '교육부': '교육사', 'MP사령부': 'MP사령관', '교육사령부': '교육사령관', '총사령부': '총사령관' }; // 예전 조직 이름 → 새 팀
const norm = (s) => String(s || '').replace(/[\s()]/g, '').toLowerCase();
const findOrg = (s) => { const k = norm(s); const t = TEAMS.find((t) => norm(t.key) === k || norm(t.short) === k || norm(t.key + t.short) === k); return t ? t.key : null; };
const ownerNick = () => (CB.owner && CB.owner()) || '';
function teamOf(nick) { // 그 사람의 팀 (서버를 만든 사람 · 운영자 = 총사령관 · 없으면 시민)
  if (nick && (nick === ownerNick() || nick === '운영자')) { const y = S.m[nick]; return y && y.self && ORGS[y.o] && !ORGS[y.o].special ? y.o : '총사령관'; } // Owner가 /team 팀 으로 잠깐 다른 팀이 됨 (/team 총사령관 으로 돌아옴)
  if (S.jail && S.jail[nick] > 0) return PRISONER; // ⛓ 감옥에 있는 동안은 죄수
  const x = S.m[nick]; if (!x) return '시민';
  return ORGS[x.o] ? x.o : (OLDTEAM[x.o] || '시민');
}
const lvOf = (nick) => ORGS[teamOf(nick)].lv;
const locked = (nick) => { const t = teamOf(nick); return t === OUTLAW || t === PRISONER; }; // 🏴 무법자 · ⛓ 죄수는 팀을 못 바꿈 (수갑으로 잡혀야)
const GUNS = ['권총', '돌격소총', '저격소총'];
// 🎒 팀 기본 장비: 그 팀이 되면 받아요 (없는 것만) · /장비 로 잃어버린 것 다시 받기 (5분에 한 번)
const KITS = {
  '경찰': ['권총', '테이저건'],
  '육군': ['권총', '돌격소총'],
  '해군': ['권총', '돌격소총'],
  '공군': ['권총', '돌격소총'],
  '해병대': ['권총', '돌격소총'],
  '의무병': ['메디킷', '권총'],
  '군사경찰': ['권총', '돌격소총', '수갑', '테이저건'],
  '특수임무대': ['돌격소총', '권총', '수갑', '테이저건'],
  '장교': ['권총', '블랙 다이아몬드 검', '수갑'],
  '교육사': ['권총', '돌격소총', '수갑'],
  'MP사령관': ['저격소총', '돌격소총', '권총', '수갑', '블랙 다이아몬드 검', '테이저건'],
  '교육사령관': ['저격소총', '돌격소총', '권총', '수갑', '블랙 다이아몬드 검'],
  '부사령관': ['저격소총', '돌격소총', '권총', '수갑', '블랙 다이아몬드 검', '테이저건'],
};
// 👮 팀 복장 (팀은 복장과 머리 위 닉네임 색으로 알아봐요): top 웃옷 · bottom 바지 · hat 모자 · badge 배지 색
const OUTFITS = {
  // style: 게임이 그리는 진짜 같은 복장 (디지털 무늬 전투복 · 경찰 근무복 · 완장 · 방탄모 · 조끼 …) · 나머지는 style 을 모르는 옛 게임용
  '경찰': { style: 'police', top: 0x2f7d77, bottom: 0x1d2742, hat: 'cap', hatC: 0x1d2742, badge: 0xf2c418 },
  '육군': { style: 'army', top: 0x55663a, bottom: 0x47512f, hat: 'helmet', hatC: 0x4f5a34 }, // 🎖 정복 (게임이 그림 · 계급마다 소매 금줄)
  '해군': { style: 'navy', top: 0x1a2238, bottom: 0x1a2238, hat: 'cap', hatC: 0xf4f4f4 }, // 해군 감색 정복 · 흰 정모
  '공군': { style: 'airforce', top: 0x4a6283, bottom: 0x4a6283, hat: 'cap', hatC: 0x4a6283 }, // 공군 청회색 정복
  '해병대': { style: 'marine', top: 0x2e3a26, bottom: 0x2e3a26, hat: 'cap', hatC: 0x2e3a26 }, // 해병대 정복 · 팔각모 · 빨간 명찰
  '의무병': { style: 'medic', top: 0x55663a, bottom: 0x47512f, hat: 'helmet', hatC: 0xeeeeee, badge: 0xe02828 }, // + 적십자 완장 · 방탄모 적십자
  '군사경찰': { style: 'mp', top: 0x55663a, bottom: 0x47512f, hat: 'helmet', hatC: 0x1a1a1a, badge: 0xfbbf24 }, // + 검은 MP 헬멧 · MP 완장
  '특수임무대': { style: 'swat', top: 0x15161a, bottom: 0x101114, hat: 'helmet', hatC: 0x0c0c0e, badge: 0x9ca3af }, // 검은 전술복 · 방탄조끼 · 방탄 헬멧 · 장갑
  '장교': { style: 'officer', top: 0x3d4a2a, bottom: 0x2f3824, hat: 'cap', hatC: 0x3d4a2a, badge: 0xf2c418 }, // 전투복 · 전투모 · 계급장
  '교육사': { style: 'tmc', top: 0x2f6a3a, bottom: 0x2a3a26, hat: 'beret', hatC: 0x1f4a2a, badge: 0x4ade80 }, // 조교 모자 · 선글라스 · 조교 완장
  'MP사령관': { style: 'mpcmd', top: 0x2a2f22, bottom: 0x1e2219, hat: 'beret', hatC: 0x9a1a1a, badge: 0xf59e0b }, // 검은 베레모 · MP 완장
  '교육사령관': { style: 'tmccmd', top: 0x24502c, bottom: 0x1e2c1c, hat: 'beret', hatC: 0x0f3a1a, badge: 0xf2c418 }, // 녹색 베레모
  '부사령관': { style: 'staff', top: 0x3b4630, bottom: 0x3b4630, hat: 'cap', hatC: 0x3b4630, badge: 0xc0c6d0 }, // 근무복 · 정모 (은장)
  '총사령관': { style: 'owner', top: 0x1b2033, bottom: 0x1b2033, hat: 'cap', hatC: 0x1b2033, badge: 0xffd040 }, // 예복 · 정모 금줄 · 금줄 견장 · 훈장
  '무법자': { style: 'outlaw', top: 0x262626, bottom: 0x3a2e24, hat: 'bandana', hatC: 0xb02020 }, // 검은 후드 · 빨간 복면
  '죄수': { style: 'prisoner', top: 0xe06a1a, bottom: 0xe06a1a }, // 주황 수의 · 수감 표시
};
const KIT_MAGS = 3; // 총이 있는 장비는 탄창도 3개
const tagOf = (o) => (ORGS[o].key === ORGS[o].short ? o : `${o}(${ORGS[o].short})`); // 경찰(CP)
const CITY_NAME = 'CLKKY CITY', ARMY_NAME = 'CLKKY ARMY', POLICE_NAME = 'CLKKY POLICE';
const orgNameOf = (o) => (ARMY.includes(o) ? ARMY_NAME + (DIVS[o] ? ' ' + DIVS[o] : '') : o === '경찰' ? POLICE_NAME : ''); // 그 팀이 속한 조직 이름 (CLKKY ARMY 1사단 · 2사단 · 3사단)

// ── 🏦 화폐 · 💼 직업 ──
const COIN = '동전', JOB_SALARY = 2, JOB_CAP = 20; // 직업 월급 (10분마다) · 일해서 버는 돈은 1분에 이만큼까지
const JOBS = {
  광부: { ico: '⛏', d: '광석을 캐면 동전을 받아요 (비싼 광석일수록 많이)' },
  벌목꾼: { ico: '🪓', d: '원목 3개를 캘 때마다 동전 1개' },
  농부: { ico: '🌾', d: '쌀 · 사과 · 호박을 직업소개소에 납품해요' },
  어부: { ico: '🎣', d: '낚은 생선을 직업소개소에 납품해요' },
  요리사: { ico: '🍳', d: '만든 요리를 직업소개소에 납품해요 (어려운 요리일수록 비싸게)' },
  사냥꾼: { ico: '🏹', d: '몹을 잡을 때마다 동전 1개' },
  건축가: { ico: '🧱', d: '블록 30개를 놓을 때마다 동전 1개' },
  배달부: { ico: '📦', d: '화면에 뜬 곳까지 가면 동전 (멀수록 많이)' },
  의사: { ico: '🩺', d: '/치료 @닉 — 곁에 있는 사람을 치료하면 동전 2개 (20초에 한 번)' },
  기자: { ico: '📰', d: '/뉴스 내용 — 모두에게 소식을 전하면 동전 2개 (3분에 한 번)' },
};
const ORE_PAY = { '석탄 광석': 1, '구리 광석': 1, '철 광석': 2, '금 광석': 3, '수정 광석': 3, '다이아몬드 광석': 5, '티타늄 광석': 5, '에너지 스톤 광석': 6, '우라늄 광석': 6, '라듐 광석': 6, '폴로늄 광석': 6, '플루토늄 광석': 6, '별의 힘 광석': 10 };
const SELL = { // 납품 값 (한 개당 동전)
  농부: [['쌀', 1], ['사과', 1], ['호박', 2]],
  어부: [['생선', 1], ['구운 생선', 2]],
  요리사: [['구운 고기', 1], ['구운 생선', 1], ['스테이크', 2], ['사과 수프', 2], ['사과 셔벗', 2], ['카라멜 사과', 2], ['고기 수프', 3], ['고기 계란 볶음', 3], ['생선 수프', 3], ['떡국', 3], ['사과 파이', 3]],
};

// ── 🚨 지명수배 ──
// 범죄를 하면 머리 위 닉네임 · 계급 밑에 지명수배가 떠요 (최대 3등급). 경찰 쪽 팀이 수갑으로 잡으면(체포) 처벌받고 지워져요.
//   1등급 「수갑대상」     경범죄   — 부적절한 말 (아래 BADWORDS) · 폭행 (먼저 맞지 않았는데 때림) · 도둑질 (남의 상자를 부숨) → 벌금 동전 10개 (가방 → 통장 순서로 · 못 내면 징역 10분)
//   2등급 「지명수배 ★★」  중범죄   — 경찰 쪽 팀원 폭행 · 불법 무기 소지 (시민이 총을 가짐)                                  → 징역 15분
//   3등급 「지명수배 ★★★」 중대범죄 — 무단사살 (정당방위 · 경찰이 수배자를 쓰러뜨린 건 빼고) · 대학살 · 무단탈영 (군대) · 무기로 협박 → 징역 30분
const LAW = ['경찰', '군사경찰', '특수임무대', '장교', 'MP사령관', '부사령관', '총사령관'];
const ARMY = ['육군', '해군', '공군', '해병대', '의무병', '군사경찰', '특수임무대', '장교', '교육사', 'MP사령관', '교육사령관', '부사령관', '총사령관']; // 군대 (총사령관 포함) (/조직 탈퇴 = 전역 · 군부대 밖으로 나가면 무단탈영)
// 🎖 군사계급 (CLKKY ARMY 계급 구성 · 부서와 따로): 군대 팀원마다 하나 · /진급 · /강등 으로 올리고 내림 · 부서 이동은 /team · 전역하면 처음부터
//   대장(General)은 총사령관(Owner)만 · 진급으로는 대령(Colonel)까지
//   군대가 아닌 사람: 이등병(디스코드 서버 가입자는 무조건) · 멤버(겜벗 공식 커뮤니티 CLKKY CITY 가입) · 게스트(미가입) · 수감자(감옥) · 탈옥수 · 사형수(밴 예정) — /계급 @닉 상태 (OP)
const RANKS = ['이등병', '일등병', '상등병', '병장', '하사', '중사', '상사', '원사', '소위', '중위', '대위', '소령', '중령', '대령', '대장'];
const RANK_EN = { 이등병: 'Private', 일등병: 'Private First Class', 상등병: 'Corporal', 병장: 'Sergeant', 하사: 'Staff Sergeant', 중사: 'Sergeant First Class', 상사: 'Master Sergeant', 원사: 'Sergeant Major', 소위: 'Second Lieutenant', 중위: 'First Lieutenant', 대위: 'Captain', 소령: 'Major', 중령: 'Lieutenant Colonel', 대령: 'Colonel', 대장: 'General', 멤버: 'Member', 게스트: 'Guest', 수감자: 'Prisoner', 탈옥수: 'Escaped Prisoner', 사형수: 'Death row inmate' };
const STATUS = ['멤버', '게스트', '탈옥수', '사형수']; // OP가 정하는 상태 (수감자는 감옥에 있으면 저절로)
const RANK_MAX = RANKS.length - 2;
const GRADE = { 1: '경범죄', 2: '중범죄', 3: '중대범죄' }, WMAX = 3;
const BADWORDS = ['시발', '씨발', 'ㅅㅂ', 'ㅆㅂ', '병신', 'ㅂㅅ', '개새', '좆', '지랄', '꺼져', '닥쳐', 'fuck', 'shit', 'bitch'];
const stars = (n) => (n >= 3 ? '지명수배 ★★★' : n === 2 ? '지명수배 ★★' : '수갑대상'); // 머리 위 · 안내판에 뜨는 말
const CHEST = 48; // 상자 블록

// ── ⛓ 감옥 차원: 이 모드를 깔면 「감옥」 차원이 생겨요 ──
// 가운데 복도 양쪽으로 감방이 늘어선 어두운 감옥 · 벽 · 철창은 부술 수 없어요 · 몹이 안 생겨요
// 징역을 받으면 감옥 차원의 감방으로 끌려가고, 형기가 끝나면 원래 있던 곳으로 돌아와요
// /감옥 설정 으로 다른 자리(감옥 차원 안이든 프론티어든)를 감옥으로 정할 수도 있어요 · /감옥 가기 · /감옥 나가기 (경찰 쪽 · OP)
const JAIL_WALL = CB.block({ id: 1900, key: 'jail_wall', name: '감옥 벽', hard: -1, paint: (u, v, x, y) => { const m = (y % 8 === 0) || ((x + (Math.floor(y / 8) % 2) * 8) % 16 === 0), k = 0.85 + 0.15 * Math.sin(x * 7.1 + y * 3.3); return m ? [52, 52, 58] : [96 * k, 96 * k, 104 * k]; } });
const JAIL_BARS = CB.block({ id: 1901, key: 'jail_bars', name: '감옥 철창', hard: -1, see: true, paint: (u, v, x, y) => (x % 5 < 2 || y < 2 || y > 13) ? [58, 60, 68] : null }); // 쇠창살 사이는 뚫려 있어서 빛이 들어요
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
function cellOf(nick) { const L = Object.keys(S.jail).sort(), i = Math.max(0, L.indexOf(nick));
  if (S.annex && S.town) return { dim: 'over', x: S.town.x - 161 + (i % 4) * 4 + 0.5, y: S.town.y, z: S.town.z - 18 + 0.5 }; // ⛓ 기지가 있으면 프론티어의 5사단 교도소 감방 4칸
  const row = Math.floor(i / 2) % Math.floor(HALF * 2 / CELLS_Z - 1); return { dim: '감옥', x: (i % 2 ? -7.5 : 7.5), y: 11, z: -HALF + CELLS_Z * (row + 1) - CELLS_Z / 2 + 0.5 }; }

// ── 저장된 조직 정보 (방장 세계에 저장 · 친구들에게 저절로 맞춰짐) ──
const migTeams = (o) => { if (o) for (const k in o) if (!ORGS[k] && OLDTEAM[k]) { const n = OLDTEAM[k]; o[n] = typeof o[n] === 'number' && typeof o[k] === 'number' ? o[n] + o[k] : o[n] != null ? o[n] : o[k]; delete o[k]; } return o; }; // 예전 팀 이름(군사 · 교육부 …)으로 저장된 점수 · 기지 · 임무 → 새 이름
const load = () => { const s = CB.load('org') || {}; return { m: s.m || {}, base: migTeams(s.base) || {}, mission: migTeams(s.mission) || {}, pts: migTeams(s.pts) || {}, train: s.train || null, w: s.w || {}, jail: s.jail || {}, jailPos: s.jailPos || null, owner: s.owner || {}, fine: s.fine || {}, suit: s.suit || [], kitT: s.kitT || {}, dealer: s.dealer || null, dealerSet: !!s.dealerSet, town: s.town || null, townV: s.townV || 0, houses: s.houses || null, leave: s.leave || {}, exam: s.exam || {}, gates: s.gates || {}, dealerDead: !!s.dealerDead, village: s.village || null, bank: s.bank || {}, job: s.job || {}, annex: s.annex || null, st: s.st || {}, dc: s.dc || {}, cm: s.cm || {}, vacT: s.vacT || {}, exo: s.exo || {} }; };
let S = load();
const save = () => CB.save('org', S);
const me = () => CB.me();
const mine = () => ({ o: teamOf(me()), p: (S.m[me()] || {}).p || 0 }); // 누구나 팀이 있어요 (처음엔 시민)
const isOfficer = (nick) => lvOf(nick) >= OFFICER_LV; // 장교(Officer) 이상
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
const hasRank = (o) => ARMY.includes(o) || o === '총사령관';
const MAJOR = RANKS.indexOf('소령'), TMC_LV = TEAMS.findIndex((t) => t.key === '교육사');
const examOpen = (nick) => { const O = S.exo[nick]; return O && O.t > Date.now() ? O : null; }; // 📝 교육사(TMC) 이상이 열어 준 진급 시험 (10분)
const canSelf = (nick) => nick === ownerNick() || nick === '운영자' || lvOf(nick) >= OFFICER_LV || mrOf(nick) >= MAJOR || !!(S.m[nick] && S.m[nick].sw);
function mrOf(nick) { const o = teamOf(nick); if (nick && (nick === ownerNick() || nick === '운영자') && (o === '총사령관' || ARMY.includes(o))) return RANKS.length - 1; if (!hasRank(o)) return -1; const x = S.m[nick]; return Math.max(0, Math.min(RANK_MAX, (x && x.mr) | 0)); } // 군사계급 번호 (-1 = 없음)
function rankOf(nick) { // 머리 위 · 안내판에 뜨는 계급: 수감자 → 사형수 · 탈옥수 → 군사계급 → 멤버 · 게스트
  if (S.jail && S.jail[nick] > 0) return '수감자';
  const st = S.st[nick]; if (st === '사형수' || st === '탈옥수') return st;
  const i = mrOf(nick); if (i >= 0) return RANKS[i];
  if (S.dc[nick]) return RANKS[0]; // 💬 디스코드 서버 가입자는 무조건 이등병 (군대가 아니어도)
  return st === '멤버' || S.cm[nick] ? '멤버' : '게스트'; // 🏙 겜벗 공식 커뮤니티 가입 → 멤버 · 아니면 게스트
}
function setTeam(nick, o) { if (!ARMY.includes(o)) { delete S.leave[nick]; if (S.m[nick]) delete S.m[nick].mr; } if (S.m[nick]) { delete S.m[nick].sw; delete S.m[nick].self; } const x = S.m[nick]; if (o === '시민') { if (x) { x.o = '시민'; } else return; } else if (x) x.o = o; else S.m[nick] = { o, r: 0, p: 0 }; }
// 📝 고소: 범죄를 당한 사람 이름으로 고소가 자동으로 들어가요 → 고소 중 가장 높은 등급이 지명수배 등급
//    피해자는 /고소 취소 (@닉) 로 취소할 수 있고, 남은 고소가 없으면 지명수배가 풀려요. 피해자가 따로 없는 범죄(욕설)는 「서버」 고소
function rewanted(nick) {
  const L = S.suit.filter((c) => c.who === nick);
  if (!L.length) { delete S.w[nick]; return; }
  const top = L.reduce((a, b) => (b.lv > a.lv ? b : a));
  S.w[nick] = { lv: teamOf(nick) === OUTLAW ? WMAX : Math.min(WMAX, top.lv), why: `${top.why} · 고소: ${[...new Set(L.map((c) => c.by))].join(', ')}`, t: top.t };
}
function crime(nick, lv, why, victim) {
  if (!nick || nick === ownerNick()) return; // 총사령관(Owner)은 고소 · 수배 안 됨
  lv = Math.max(1, Math.min(WMAX, lv | 0));
  const by = victim || '서버', before = (S.w[nick] || {}).lv || 0;
  const old = S.suit.find((c) => c.who === nick && c.by === by);
  if (old && old.lv >= lv) return;
  if (old) Object.assign(old, { lv, why, t: Date.now() }); else S.suit.push({ who: nick, by, lv, why, t: Date.now() });
  if (teamOf(nick) === '시민' && lv >= WMAX) { setTeam(nick, OUTLAW); CB.say(`🏴 ${nick} 님이 무법자가 됐어요! (${why}) · 경찰이 수갑으로 잡기 전엔 팀을 바꿀 수 없어요`); } // 시민이 3등급 범죄 → 무법자 (1 · 2등급은 시민 그대로 지명수배만 · 경찰 · 군대는 지명수배만)
  rewanted(nick);
  save();
  if (by !== '서버') tell(by, `📝 ${nick} 님을 자동으로 고소했어요 (${why}) · 취소하려면 /고소 취소 @${nick}`);
  if (S.w[nick].lv > before) CB.say(`🚨 ${by === '서버' ? '' : by + ' 님이 '}${nick} 님을 고소 · ${stars(S.w[nick].lv)} · ${GRADE[S.w[nick].lv]} (${why})`);
}
function clearSuits(nick) { S.suit = S.suit.filter((c) => c.who !== nick); delete S.w[nick]; }
function toJail(nick, min, why) {
  S.jail[nick] = min * 60; clearSuits(nick); delete S.fine[nick]; if (S.m[nick] && S.m[nick].o === OUTLAW) S.m[nick].o = '시민'; save(); // 감옥에선 죄수 · 나오면 시민
  CB.send('org-jail', { to: nick });
  CB.say(`⛓ ${nick} 님 징역 ${min}분 (${why}) · ${S.jailPos ? '감옥으로' : S.annex ? `${ARMY_NAME} 5사단 교도소로` : '감옥 차원의 감방으로'} 끌려가요`);
}
function askFine(nick, n, why) {
  S.fine[nick] = { n, why }; save();
  if (nick === me()) payMine({ n, why }); else CB.send('org-fine', { to: nick, n, why });
  CB.say(`💸 ${nick} 님 벌금 동전 ${n}개 (${why})`);
}
// 💸 벌금: 가방의 동전을 먼저 내고 → 모자라면 방장이 통장에서 뺌 → 그래도 모자라면 돌려주고 징역
function payMine(v) { const n = Math.min(CB.has(COIN) || 0, v.n | 0), got = n > 0 && CB.take(COIN, n); req('fine-pay', { n: got ? n : 0 }); }
const bal = (n) => S.bank[n] || 0;
const jobOf = (n) => (teamOf(n) === '시민' ? S.job[n] || '' : ''); // 직업은 시민만 (경찰 · 군대는 팀 월급)
function cashTo(n, v) { if (n === me()) CB.give(COIN, v); else CB.send('org-cash', { to: n, n: v }); }
const jobCap = {}, healT = {}, newsT = {};
function jobEarn(n, v) { // 일해서 번 돈 → 통장 (1분 한도)
  const old = jobCap[n], c = old && Date.now() - old.t < 60000 ? old : (jobCap[n] = { t: Date.now(), c: 0 });
  v = Math.min(v | 0, JOB_CAP - c.c);
  if (v <= 0) return;
  c.c += v; S.bank[n] = bal(n) + v; save();
  tell(n, `${(JOBS[jobOf(n)] || { ico: '🪙' }).ico} 동전 +${v} · 통장 ${bal(n)}개`);
}
function desert(nick, why) { crime(nick, 3, why); } // 🪖 무단탈영: ★★★ (군대는 무법자가 되지 않고 지명수배만)
const mmss = (s) => `${Math.floor(s / 60)}분 ${s % 60}초`;
// 👮 체포 (수갑): 수갑대상 → 벌금 10 (못 내면 징역 10분) · ★★ → 징역 15분 · ★★★ → 징역 30분 · 수배 없는 무법자는 징역 10분
function arrest(who, by) {
  const W = S.w[who], lv = W ? Math.min(WMAX, W.lv) : 0, why = `${W ? GRADE[lv] : '무법자'} · ${by} 체포`;
  CB.say(`👮🔗 ${by} 님이 수갑으로 ${who} 님을 체포했어요 (${W ? stars(lv) : '🏴 무법자'})`);
  if (!W) return toJail(who, 10, why);
  if (lv === 1) return askFine(who, 10, why);
  if (lv === 2) return toJail(who, 15, why);
  return toJail(who, 30, why);
}
// 🎒 장비 주기: 방장이 그 사람 게임에 신호 → 그 사람 가방에 없는 것만 들어감
function giveKit(o) {
  const L = KITS[o]; if (!L) return;
  const got = [];
  for (const n of L) if (!CB.has(n) && CB.give(n, 1)) got.push(n);
  if (L.some((n) => /총/.test(n)) && CB.has('탄창') < KIT_MAGS) { CB.give('탄창', KIT_MAGS - CB.has('탄창')); got.push('탄창'); }
  note(got.length ? `🎒 ${tagOf(o)} 장비: ${got.join(' · ')}` : '🎒 장비가 이미 다 있어요');
}
function sendKit(n) { const o = teamOf(n); if (!KITS[o]) return; if (n === me()) giveKit(o); else CB.send('org-kit', { to: n, o }); }
function apply(op, a, from, fromOp, fromDiscord) {
  a = a || {};
  fromOp = fromOp || (!!from && from === ownerNick()); // 총사령관(Owner)은 OP
  const Fo = teamOf(from), off = fromOp || isOfficer(from); // 내 팀 · 장교(Officer) 이상이나 OP
  const who = String(a.who || '').replace(/^@/, '');
  switch (op) {
    case 'own': S.owner[a.key] = from; return save();
    case 'unown': if (S.owner[a.key] === from) { delete S.owner[a.key]; save(); } return;
    case 'theft': {
      const o = S.owner[a.key];
      if (!o || o === from) return;
      delete S.owner[a.key]; save();
      return crime(from, 1, `${o} 님의 상자를 부숨 · 도둑질`, o);
    }
    case 'wanted': {
      if (!(fromOp || (isLaw(from) && isOfficer(from)))) return tell(from, '수배는 장교(Officer) · MP사령관 · 총사령관나 OP만 내릴 수 있어요');
      const lv = Math.max(1, Math.min(WMAX, Math.floor(+a.lv) || 1));
      if (!who) return tell(from, '/수배 @닉 등급(1 수갑대상 · 2 ★★ · 3 ★★★) 사유');
      if (who === ownerNick()) return tell(from, '총사령관(Owner)은 수배할 수 없어요');
      const W = S.w[who];
      if (W && W.lv >= lv) return tell(from, '이미 그보다 높은 등급으로 수배 중이에요');
      return crime(who, lv, String(a.why || '부적절한 행동').slice(0, 40), from);
    }
    case 'unwanted': {
      if (!(fromOp || (isLaw(from) && isOfficer(from)))) return tell(from, '수배 해제는 장교(Officer) · MP사령관 · 총사령관나 OP만 할 수 있어요');
      if (!S.w[who]) return tell(from, '그 사람은 수배 중이 아니에요');
      clearSuits(who); save(); return CB.say(`${who} 님의 지명수배 · 고소가 모두 풀렸어요 (${from})`);
    }
    case 'sue': {
      // 📝 직접 고소: 부적절한 행동 등 (1 · 2등급까지)
      if (!who || who === from) return tell(from, '/고소 @닉 [1|2] 사유');
      if (who === ownerNick()) return tell(from, '총사령관(Owner)은 고소할 수 없어요');
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
    case 'cuffed': { // 🔗 수갑으로 체포: 수갑이 채워진 사람(from)의 게임이 알려 줌 · 채운 사람(a.by)이 경찰 쪽 팀이고 수배자 · 무법자면 체포
      const by = String(a.by || '');
      if (!by || by === from || S.jail[from]) return;
      if (!(isLaw(by) || CB.opOf(by))) return;
      if (!S.w[from] && teamOf(from) !== OUTLAW) return;
      return arrest(from, by);
    }
    case 'fine-pay': { // 💸 가방에서 낸 만큼(a.n)을 빼고 나머지는 통장에서
      const F = S.fine[from], paid = Math.max(0, a.n | 0);
      if (!F) { if (paid) cashTo(from, paid); return; }
      const need = Math.max(0, F.n - paid);
      if (need > bal(from)) { if (paid) cashTo(from, paid); return toJail(from, 10, '벌금을 내지 못함'); }
      if (need) S.bank[from] = bal(from) - need;
      delete S.fine[from]; clearSuits(from); if (S.m[from] && S.m[from].o === OUTLAW) S.m[from].o = '시민'; save();
      return CB.say(`✅ ${from} 님이 벌금 동전 ${F.n}개를 냈어요${need ? ` (통장에서 ${need}개)` : ''} · 지명수배 해제`);
    }
    case 'bank-in': { // 🏦 동전은 낸 사람 게임에서 이미 가방에서 뺐음
      const n = Math.max(0, a.n | 0); if (!n) return;
      S.bank[from] = bal(from) + n; save();
      return tell(from, `🏦 동전 ${n}개 입금 · 통장 ${bal(from)}개`);
    }
    case 'bank-out': {
      const n = Math.max(0, a.n | 0);
      if (!n) return tell(from, '🏦 출금할 돈이 없어요');
      if (bal(from) < n) return tell(from, `🏦 잔액이 모자라요 (통장 ${bal(from)}개)`);
      S.bank[from] = bal(from) - n; save(); cashTo(from, n);
      return tell(from, `🏦 동전 ${n}개 출금 · 통장 ${bal(from)}개`);
    }
    case 'bank-send': {
      const n = Math.max(0, a.n | 0);
      if (!who || who === from || !n) return tell(from, '/은행 송금 @닉 개수');
      if (!CB.players().includes(who) && S.bank[who] == null && !S.m[who]) return tell(from, `🏦 ${who} 님을 찾을 수 없어요`);
      if (bal(from) < n) return tell(from, `🏦 잔액이 모자라요 (통장 ${bal(from)}개)`);
      S.bank[from] = bal(from) - n; S.bank[who] = bal(who) + n; save();
      tell(who, `🏦 ${from} 님이 동전 ${n}개를 보냈어요 · 통장 ${bal(who)}개`);
      return tell(from, `🏦 ${who} 님에게 동전 ${n}개를 보냈어요 · 통장 ${bal(from)}개`);
    }
    case 'job-set': {
      const j = String(a.j || '');
      if (Fo !== '시민') return tell(from, Fo === OUTLAW || Fo === PRISONER ? `💼 ${tagOf(Fo)}는 직업을 가질 수 없어요` : `💼 ${tagOf(Fo)}는 팀 월급을 받아요 · 직업은 시민만`);
      if (!j) { if (!S.job[from]) return tell(from, '💼 지금 직업이 없어요'); delete S.job[from]; save(); return tell(from, '💼 일을 그만뒀어요'); }
      if (!JOBS[j]) return tell(from, '💼 그런 직업은 없어요 · /직업 목록');
      if (S.w[from]) return tell(from, '💼 지명수배 중에는 취직할 수 없어요');
      S.job[from] = j; save();
      return CB.say(`${JOBS[j].ico} ${from} 님이 ${j} 일을 시작했어요!`);
    }
    case 'job-pay': { // 광부 · 벌목꾼 · 건축가 · 배달부: 그 사람 게임이 일한 만큼 알려 줌
      if (!['광부', '벌목꾼', '건축가', '배달부'].includes(jobOf(from))) return;
      return jobEarn(from, Math.min(a.n | 0, 12));
    }
    case 'job-sell': { // 납품: 물건은 그 사람 게임에서 이미 가방에서 뺐음
      const n = Math.min(Math.max(0, a.n | 0), 200);
      if (!n || !SELL[jobOf(from)]) return;
      S.bank[from] = bal(from) + n; save();
      return tell(from, `📦 납품 완료 · 동전 +${n} · 통장 ${bal(from)}개`);
    }
    case 'job-heal': {
      if (teamOf(from) === '의무병') return tell(from, '⛑ 의무병은 메디킷을 들고 치료할 사람을 치세요 (우클릭하면 나를 치료 · 메디킷이 없으면 /장비)');
      if (jobOf(from) !== '의사') return tell(from, '🩺 /치료 는 의사(직업)만 할 수 있어요 · /직업');
      if (!who || who === from || !CB.players().includes(who)) return tell(from, '/치료 @닉 (접속 중인 다른 사람)');
      const A = CB.playerPos(from), B = CB.playerPos(who);
      if (!A || !B || Math.hypot(A.x - B.x, A.z - B.z) > 6) return tell(from, `🩺 ${who} 님 곁으로 가야 해요`);
      const left = 20 - (Date.now() - (healT[from] || 0)) / 1000;
      if (left > 0) return tell(from, `🩺 ${Math.ceil(left)}초 뒤에 다시 치료할 수 있어요`);
      healT[from] = Date.now();
      if (who === me()) healMe(from); else CB.send('org-heal', { to: who, by: from });
      return jobEarn(from, 2);
    }
    case 'job-news': {
      if (jobOf(from) !== '기자') return tell(from, '📰 뉴스는 기자만 전할 수 있어요 · /직업');
      const text = String(a.text || '').trim().slice(0, 60);
      if (!text) return tell(from, '/뉴스 내용');
      const left = 180 - (Date.now() - (newsT[from] || 0)) / 1000;
      if (left > 0) return tell(from, `📰 ${Math.ceil(left)}초 뒤에 다시 전할 수 있어요`);
      newsT[from] = Date.now();
      CB.say(`📰 ${from}: ${text}`);
      return jobEarn(from, 2);
    }
    case 'jailpos': {
      if (!(fromOp || (isLaw(from) && isOfficer(from)))) return tell(from, '감옥은 장교(Officer) · MP사령관 · 총사령관나 OP만 정할 수 있어요');
      if (a.reset) { S.jailPos = null; save(); return CB.say('⛓ 감옥 자리를 「감옥 차원의 감방」으로 되돌렸어요'); }
      S.jailPos = { x: +a.x, y: +a.y, z: +a.z, dim: String(a.dim || 'over') }; save();
      return CB.say(`⛓ 감옥 자리를 정했어요 (${a.dim === '감옥' ? '감옥 차원' : '이 자리'})`);
    }
    case 'self': { // 🔁 내 팀 마음대로 바꾸기: 소령 이상 · 장교(Officer) 부서 이상 · Owner (한 번 바꾼 사람은 다시 바꿀 수 있어요)
      const o = findOrg(a.o);
      if (!o) return tell(from, '그런 팀이 없어요 · ' + TEAMS.map((t) => t.key).join(' · '));
      if (o === teamOf(from)) return tell(from, `이미 ${tagOf(o)}이에요`);
      if (o === '시민' && !fromOp && !canSelf(from)) return apply('leave', {}, from, fromOp, fromDiscord); // 시민으로 = 탈퇴 (군대는 전역소로 안내)
      if (!canSelf(from) && !fromOp) { crime(from, 1, '무단 팀 변경'); save(); return tell(from, `🚨 무단 팀 변경 → 수갑대상 · 내 팀을 직접 바꾸는 건 ${RANKS[MAJOR]} 이상 · 장교(Officer) 이상 · Owner만 할 수 있어요`); }
      if (locked(from) && !fromOp) return tell(from, `${tagOf(teamOf(from))}는 팀을 바꿀 수 없어요`);
      const isOwner = from === ownerNick() || from === '운영자';
      if (o === '총사령관' && !isOwner) return tell(from, '총사령관(Owner)은 서버를 만든 사람만 될 수 있어요');
      const x = S.m[from] || (S.m[from] = { o: '시민', r: 0, p: 0 });
      if (o === '총사령관') delete x.self; else { x.o = o; x.self = 1; } // 군사계급(mr)은 그대로 둠 (군대로 돌아오면 다시 보임)
      x.sw = 1; if (!ARMY.includes(o)) delete S.leave[from];
      if (KITS[o] && Date.now() - (S.kitT[from] || 0) >= 300000) { S.kitT[from] = Date.now(); sendKit(from); } // 팀을 오가며 장비를 계속 받지 않게 (/장비 와 같은 5분)
      save();
      return CB.say(`🔁 ${from} 님이 팀을 바꿨어요 → ${ORGS[o].ico} ${tagOf(o)}`);
    }
    case 'dc': { // 🎖 디스코드 서버 가입(→ 이등병) · 겜벗 공식 커뮤니티 가입(→ 멤버) 여부 (내 게임이 알려 줌)
      if (!from) return;
      if (fromDiscord) S.dc[from] = 1; else delete S.dc[from];
      if (a.c) S.cm[from] = 1; else delete S.cm[from]; // 🏙 겜벗 공식 커뮤니티 가입 → 멤버
      return save();
    }
    case 'status': { // 🎖 /계급 @닉 상태: 멤버 · 게스트 · 탈옥수 · 사형수 (OP)
      const s = String(a.s || '');
      if (!fromOp) return tell(from, '상태 계급(멤버 · 게스트 · 탈옥수 · 사형수)은 OP만 정할 수 있어요');
      if (!who || !STATUS.includes(s)) return tell(from, '/계급 @닉 ' + STATUS.join('|'));
      if (who === ownerNick()) return tell(from, `${who} 님은 총사령관 · 대장이에요`);
      if (s === '게스트') delete S.st[who]; else S.st[who] = s; save();
      return CB.say(`🎖 ${who} 님 → ${s}(${RANK_EN[s]}) (${from})`);
    }
    case 'release': {
      if (!off) return tell(from, '석방은 장교(Officer) 이상이나 OP만 할 수 있어요');
      if (!S.jail[who]) return tell(from, '그 사람은 수감 중이 아니에요');
      delete S.jail[who]; save(); return CB.say(`🔓 ${who} 님 석방 (${from})`);
    }
    case 'join': { // 스스로는 시민으로만 (다른 팀은 위 계급이 /team 으로 배정)
      const o = findOrg(a.o);
      if (!o) return tell(from, '그런 팀이 없어요 · /조직 목록');
      if (locked(from) && !fromOp) return tell(from, `${tagOf(teamOf(from))}는 팀을 바꿀 수 없어요 (경찰에게 수갑으로 잡혀 죗값을 치러야 해요)`);
      if (o === teamOf(from)) return tell(from, `이미 ${tagOf(o)}이에요`);
      if (o === '시민' && ARMY.includes(teamOf(from)) && !fromOp && !canSelf(from)) return tell(from, '🎖 전역은 입대소 안의 전역 상담원에게 우클릭해서 해요 (군부대 정문 옆)');
      if (o !== '시민' && !fromOp && canSelf(from)) return apply('self', { o }, from, fromOp, fromDiscord); // 소령 · 장교 이상 · Owner 는 마음대로
      if (o !== '시민' && !fromOp) { crime(from, 1, '무단 팀 변경'); save(); return tell(from, `🚨 무단 팀 변경 → 수갑대상 · ${tagOf(o)}은(는) 더 높은 계급이 /team ${o} @${from} 로 배정해 줘야 들어가요`); }
      if (o === '총사령관') return tell(from, '총사령관(Owner)은 서버를 만든 사람이에요');
      setTeam(from, o); save();
      return CB.say(`${ORGS[o].ico} ${from} 님 → ${tagOf(o)}`);
    }
    case 'leave': {
      if (Fo === '시민') return tell(from, '이미 시민이에요');
      if (locked(from) && !fromOp) return tell(from, `${tagOf(Fo)}는 팀을 바꿀 수 없어요 (경찰에게 수갑으로 잡혀 죗값을 치러야 해요)`);
      if (Fo === '총사령관') return tell(from, '총사령관(Owner)은 서버를 만든 사람이라 나갈 수 없어요');
      if (from === ownerNick() || from === '운영자') { setTeam(from, '시민'); save(); return CB.say(`👑 ${from} 님이 ${tagOf(Fo)}에서 나와 총사령관으로 돌아왔어요`); } // Owner가 /team 으로 잠깐 다른 팀이었음
      if (ARMY.includes(Fo) && !fromOp && !canSelf(from)) return tell(from, '🎖 전역은 입대소 안의 전역 상담원에게 우클릭해서 해요 (군부대 정문 옆)');
      setTeam(from, '시민'); save();
      return CB.say(ARMY.includes(Fo) ? `🎖 ${from} 님이 ${tagOf(Fo)}에서 전역해 시민이 됐어요` : `${from} 님이 ${tagOf(Fo)}에서 나와 시민이 됐어요`);
    }
    case 'assign': {
      const o = findOrg(a.o);
      if (!o || !who) return tell(from, '/team 팀 @닉 · 팀: ' + TEAMS.map((t) => t.key).join(' · '));
      if (o === '총사령관') return tell(from, '총사령관(Owner)은 서버를 만든 사람이라 배정할 수 없어요');
      if (who === ownerNick()) return tell(from, `${who} 님은 총사령관(Owner)이에요`);
      if (locked(who) && !fromOp) return tell(from, `${who} 님은 ${tagOf(teamOf(who))}라서 팀을 바꿀 수 없어요 (수갑으로 잡아야 해요)`);
      const myLv = lvOf(from);
      if (!off) return tell(from, '배정(임용)은 장교(Officer) 이상이나 OP만 할 수 있어요');
      if (!fromOp && teamOf(who) === '시민') return tell(from, `${who} 님은 시민이에요 · 입대소나 경찰서의 상담원에게 직접 가야 해요`);
      if (!fromOp && !(myLv > ORGS[o].lv && myLv > lvOf(who))) return tell(from, `배정할 권한이 없어요 (내 계급 ${tagOf(Fo)}보다 아래 팀으로, 나보다 아래 계급인 사람만)`);
      setTeam(who, o); save(); sendKit(who);
      return CB.say(`${ORGS[o].ico} ${who} 님이 ${tagOf(o)}에 배정됐어요 (${from})`);
    }
    case 'kick': {
      const To = teamOf(who);
      if (!who || To === '시민') return tell(from, '그 사람은 이미 시민이에요');
      if (locked(who) && !fromOp) return tell(from, `${who} 님은 ${tagOf(To)}라서 팀을 바꿀 수 없어요 (수갑으로 잡아야 해요)`);
      if (!off || !commands(from, who, fromOp) || who === ownerNick()) return tell(from, '그 사람을 추방할 권한이 없어요 (장교(Officer) 이상 · 나보다 아래 계급만)');
      setTeam(who, '시민'); save(); return CB.say(`${who} 님이 ${tagOf(To)}에서 추방돼 시민이 됐어요`);
    }
    case 'promote': case 'demote': {
      if (!who) return tell(from, `/${op === 'promote' ? '진급' : '강등'} @닉`);
      if (who === ownerNick()) return tell(from, `${who} 님은 총사령관(Owner)이에요`);
      if (locked(who)) return tell(from, `${who} 님은 ${tagOf(teamOf(who))}라서 진급 · 강등할 수 없어요`);
      const To = teamOf(who);
      if (!hasRank(To)) return tell(from, `${who} 님은 ${tagOf(To)}라서 군사계급이 없어요 (군대 팀만) · 부서를 바꾸려면 /team 부서 @${who}`);
      const cur = mrOf(who), nl = cur + (op === 'promote' ? 1 : -1);
      if (nl < 0) return tell(from, `이미 가장 낮은 계급(${RANKS[0]})이에요`);
      if (nl > RANK_MAX) return tell(from, `${RANKS[RANK_MAX]}이(가) 진급으로 오를 수 있는 가장 높은 계급이에요 (${RANKS[RANKS.length - 1]}은 총사령관)`);
      if (!off) return tell(from, `${op === 'promote' ? '진급' : '강등'}은 장교(Officer) 이상이나 OP만 할 수 있어요`);
      const ok = fromOp || lvOf(from) > lvOf(who) || mrOf(from) > Math.max(cur, nl);
      if (!ok) return tell(from, '그 계급으로 바꿀 권한이 없어요 (나보다 아래 부서이거나, 내 군사계급보다 낮게만)');
      if (op === 'promote' && !fromOp) {
        const E = S.exam[who];
        if (ARMY.includes(teamOf(who)) && !(E && E.shoot && E.jump)) { tell(who, '📝 진급하려면 /시험 사격 · /시험 점프 를 통과해야 해요'); return tell(from, `${who} 님은 아직 진급 시험을 통과하지 못했어요 (${E && E.shoot ? '사격 ✅' : '사격 ❌'} · ${E && E.jump ? '점프 ✅' : '점프 ❌'})`); }
      }
      if (op === 'promote') { delete S.exam[who]; delete S.exo[who]; } // 시험은 진급마다 다시 (다시 열어 줘야)
      (S.m[who] || (S.m[who] = { o: To, r: 0, p: 0 })).mr = nl; save();
      return CB.say(`${op === 'promote' ? '⬆ 진급' : '⬇ 강등'}: ${who} 님 → 🎖 ${RANKS[nl]} (${ORGS[To].ico} ${tagOf(To)})`);
    }
    case 'base': { // 내 팀 기지 (/기지 설정 팀이름 → 내 아래 팀 기지)
      if (!off) return tell(from, '기지는 장교(Officer) 이상이나 OP만 정할 수 있어요');
      const o = (a.o && findOrg(a.o)) || Fo;
      if (!fromOp && ORGS[o].lv > ORGS[Fo].lv) return tell(from, '내 계급보다 위 팀의 기지는 못 정해요');
      S.base[o] = { x: +a.x, y: +a.y, z: +a.z }; save();
      return CB.say(`🏕 ${tagOf(o)} 기지가 정해졌어요 · ${o}은(는) 죽으면 기지에서 부활해요`);
    }
    case 'gather': {
      if (!off) return tell(from, '집합은 장교(Officer) 이상이나 OP만 할 수 있어요');
      const g = { lv: fromOp ? TOP : lvOf(from), x: +a.x, y: +a.y, z: +a.z, by: from };
      CB.send('org-go', g); goIfMine(g);
      return CB.say(`📯 ${from} ${tagOf(Fo)}: ${fromOp ? '모든 팀' : '경찰(CP) ~ ' + tagOf(Fo)} 집합!`);
    }
    case 'train': {
      if (!off) return tell(from, '훈련은 장교(Officer) 이상이나 OP만 열 수 있어요');
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
      if (!off) return tell(from, '임무는 장교(Officer) 이상이나 OP만 줄 수 있어요');
      S.mission[Fo] = String(a.text || '').slice(0, 80); save();
      return CB.say(`📋 ${tagOf(Fo)} 임무 (경찰(CP) ~ ${tagOf(Fo)}): ${S.mission[Fo]}`);
    }
    case 'mission-done': {
      if (!off || !who) return tell(from, '/임무 완료 @닉 (장교(Officer) 이상 · OP)');
      if (!fromOp && lvOf(who) > lvOf(from)) return tell(from, '나보다 높은 계급의 임무는 완료 처리할 수 없어요');
      addPts(who, 10); delete S.mission[Fo]; save();
      return CB.say(`✅ ${who} 님 임무 완료! +10점`);
    }
    case 'dealer-dead': { // 🏴 상인이 쓰러짐 → 다음 날 밤까지 안 나옴
      if (!S.dealerDead) { S.dealerDead = true; save(); }
      return;
    }
    case 'curfew': { // 🌙 생활규칙 위반: 밤에 숙소 밖 → 수갑대상
      if ((Fo !== '경찰' && !ARMY.includes(Fo)) || fromOp) return;
      return crime(from, 1, '생활규칙 위반 (밤에 숙소 밖)');
    }
    case 'desert': { // 🪖 군부대 밖으로 나감 → 무단탈영 (★★★ · 무법자)
      if (!ARMY.includes(Fo) || fromOp) return;
      if (S.leave[from]) { // 🪪 외출 허가가 있으면 무단탈영이 아님
        if (!S.leave[from].out) { const vac = S.leave[from].vac; S.leave[from].out = true; save(); tell(from, vac ? '🏖 휴가로 군부대를 나왔어요 · 군부대로 돌아오면 휴가가 끝나요' : '🪪 외출 허가로 군부대를 나왔어요 · 군부대로 돌아오면 외출이 끝나요'); }
        return;
      }
      return desert(from, `무단탈영 (${tagOf(Fo)})`);
    }
    case 'pass': case 'pass-cancel': { // 🪪 외출 허가 · 취소: 장교(Officer) 이상이 나보다 아래 계급에게 (OP는 누구나)
      if (!off) return tell(from, '외출 허가는 장교(Officer) 이상이나 OP만 할 수 있어요');
      if (!who) return tell(from, op === 'pass' ? '/외출 @닉' : '/외출 취소 @닉');
      if (!ARMY.includes(teamOf(who))) return tell(from, `${who} 님은 군대 쪽 팀이 아니에요`);
      if (!fromOp && lvOf(from) <= lvOf(who)) return tell(from, '나보다 아래 계급만 허가하거나 취소할 수 있어요');
      if (op === 'pass') {
        if (S.leave[who]) return tell(from, `${who} 님은 이미 외출 허가가 있어요`);
        const min = Math.max(1, Math.min(60, Math.floor(+a.min) || 10));
        S.leave[who] = { by: from, out: false, sec: min * 60 }; save();
        tell(who, `🪪 ${from} 님이 외출을 ${min}분 허가했어요 · 시간 안에 돌아오지 않으면 무단탈영이에요`);
        return CB.say(`🪪 ${from} 님이 ${who} 님의 외출을 ${min}분 허가했어요`);
      }
      const P = S.leave[who];
      if (!P) return tell(from, `${who} 님은 외출 허가가 없어요`);
      if (P.out) { // 이미 나가 있으면 바로 탈영으로 몰지 않고 1분 안에 복귀
        P.sec = Math.min(P.sec == null ? 60 : P.sec, 60); save();
        tell(who, `🪪 ${from} 님이 외출을 취소했어요 · 1분 안에 군부대로 돌아오세요`);
        return CB.say(`🪪 ${from} 님이 ${who} 님에게 복귀 명령을 내렸어요 (1분)`);
      }
      delete S.leave[who]; save();
      tell(who, `🪪 ${from} 님이 외출 허가를 취소했어요`);
      return CB.say(`🪪 ${from} 님이 ${who} 님의 외출 허가를 취소했어요`);
    }
    case 'pass-back': { // 🪖 외출 나갔다가 군부대로 돌아옴 → 외출 끝
      if (!S.leave[from] || !S.leave[from].out) return;
      const vac = S.leave[from].vac; if (vac) S.vacT[from] = Date.now();
      delete S.leave[from]; save();
      return tell(from, `🪖 군부대로 복귀했어요 · ${vac ? '휴가가' : '외출이'} 끝났어요`);
    }
    case 'vac-back': { // 🪖 복귀 상담원에게 휴가 복귀 신고 → 휴가 끝
      const L = S.leave[from];
      if (!L || !L.vac) return tell(from, '지금은 휴가 중이 아니에요');
      delete S.leave[from]; S.vacT[from] = Date.now(); save();
      return CB.say(`🪖 ${from} 님이 휴가에서 복귀했어요 (복귀 상담원)`);
    }
    case 'discharge': { // 🎖 전역소에서 전역 (군대 → 시민)
      if (!ARMY.includes(Fo)) return tell(from, '군대 팀만 전역할 수 있어요');
      if (S.w[from] && !fromOp) return tell(from, '지명수배 중에는 전역할 수 없어요');
      setTeam(from, '시민'); save();
      if (from === ownerNick() || from === '운영자') return CB.say(`👑 ${from} 님이 ${tagOf(Fo)}에서 나와 총사령관으로 돌아왔어요`); // Owner가 /team 으로 잠깐 군대였음
      return CB.say(`🎖 ${from} 님이 ${tagOf(Fo)}에서 전역해 시민이 됐어요`);
    }
    case 'vacation': { // 🏖 휴가상담소: 스스로 휴가 (10 · 30분) · 끝나고 1시간 뒤에 다시
      if (!ARMY.includes(Fo)) return tell(from, '군대 팀만 휴가를 신청할 수 있어요');
      if (S.w[from]) return tell(from, '지명수배 중에는 휴가를 갈 수 없어요');
      if (S.leave[from]) return tell(from, '이미 휴가 · 외출 중이에요');
      if (!fromOp && (S.vacT[from] || 0) + VAC_GAP > Date.now()) return tell(from, '휴가는 끝나고 1시간 뒤에 다시 신청할 수 있어요');
      const min = +a.min === 30 ? 30 : 10;
      S.leave[from] = { by: '휴가상담소', out: false, sec: min * 60, vac: 1 }; save();
      return CB.say(`🏖 ${from} 님이 ${min}분 휴가를 떠나요 (휴가상담소)`);
    }
    case 'enlist': { // 🪖 상담원에게 「네」: 시민 → 군사 · 경찰
      const o = ['경찰', '해군', '공군', '해병대'].includes(a.o) ? a.o : '육군';
      if (Fo !== '시민') return tell(from, `이미 ${tagOf(Fo)}이에요`);
      if (S.w[from]) return tell(from, '지명수배 중에는 입대할 수 없어요');
      setTeam(from, o); delete S.job[from]; save(); sendKit(from);
      return CB.say(`${ORGS[o].ico} ${from} 님이 ${orgNameOf(o)} ${tagOf(o)}에 ${o === '경찰' ? '임용' : '입대'}했어요!`);
    }
    case 'trespass': { // 🏴 시민이 입대 없이 군부대에 들어옴
      if (Fo !== '시민' || fromOp) return;
      return crime(from, 3, '군부대 무단 침입');
    }
    case 'examopen': { // 📝 진급 시험 열기 · 닫기: 교육사(TMC) 이상 · OP
      if (!fromOp && lvOf(from) < TMC_LV) return tell(from, '📝 진급 시험은 교육사(TMC) 이상이나 OP만 열 수 있어요');
      if (!who) return tell(from, '/시험 열기 @닉 · /시험 닫기 @닉');
      if (a.close) { delete S.exo[who]; save(); return tell(from, `📝 ${who} 님의 진급 시험을 닫았어요`); }
      if (!ARMY.includes(teamOf(who))) return tell(from, `📝 ${who} 님은 군대 쪽 팀이 아니라서 진급 시험을 볼 수 없어요`);
      S.exo[who] = { by: from, t: Date.now() + 600000 }; save();
      tell(who, `📝 ${from} 님이 진급 시험을 열었어요 · 10분 안에 군부대에서 /시험 사격 · /시험 점프`);
      return tell(from, `📝 ${who} 님의 진급 시험을 열었어요 (10분)`);
    }
    case 'exam': { // 📝 진급 시험 통과 (사격 · 점프) · 교육사(TMC) 이상이 열어 준 시험만
      if (!ARMY.includes(Fo) || (a.kind !== 'shoot' && a.kind !== 'jump')) return;
      if (!examOpen(from)) return tell(from, '📝 시험이 닫혀 있어요 · 교육사(TMC) 이상이 /시험 열기 @닉 으로 열어 줘야 해요');
      const E = S.exam[from] || (S.exam[from] = {});
      E[a.kind] = 1; save();
      tell(from, `📝 ${a.kind === 'shoot' ? '사격' : '점프'} 시험 합격!${E.shoot && E.jump ? ' · 이제 장교(Officer) 이상이 /진급 시켜 줄 수 있어요' : ` · ${a.kind === 'shoot' ? '/시험 점프' : '/시험 사격'} 도 통과해야 해요`}`);
      if (E.shoot && E.jump) CB.say(`📝 ${from} 님이 진급 시험을 통과했어요!`);
      return;
    }
    case 'threat': { // 🔫 총으로 2초 넘게 사람을 겨눔 → 무기로 협박 (★★★) · 수배자 · 무법자를 겨눈 건 괜찮음
      if (!who || who === from || S.w[who] || teamOf(who) === OUTLAW) return;
      return crime(from, 3, `무기로 협박 · ${who} 님`, who);
    }
    case 'gun': { // 🏴 시민이 총을 가짐 → 불법 무기 소지 (무법자)
      if (teamOf(from) !== '시민') return;
      return crime(from, 2, '불법 무기 소지');
    }
    case 'rekit': { // 🎒 /장비: 잃어버린 장비 다시 받기 (5분에 한 번)
      if (!KITS[Fo]) return tell(from, Fo === '총사령관' ? '총사령관(Owner)은 OP라서 /give 로 받으면 돼요' : '시민은 기본 장비가 없어요 · 🕶 불법 거래 상인에게 사요');
      const t = S.kitT[from] || 0, left = 300 - (Date.now() - t) / 1000;
      if (left > 0 && !fromOp) return tell(from, `🎒 장비는 5분에 한 번 받을 수 있어요 (${Math.ceil(left)}초 남음)`);
      S.kitT[from] = Date.now(); save(); return sendKit(from);
    }
    case 'dealer': { // 🕶 불법 거래 상인 자리 정하기 (OP)
      if (!fromOp) return tell(from, '상인 자리는 OP(총사령관)만 정할 수 있어요');
      S.dealer = { x: +a.x, y: +a.y, z: +a.z, dim: String(a.dim || 'over') }; S.dealerSet = true; save();
      return CB.say('🕶 불법 거래 상인이 자리를 옮겼어요… 어딘가로');
    }
    case 'house-buy': { // 🏠 동전은 산 사람 게임에서 먼저 냄 → 못 사면 돌려줌
      const h = (S.houses || [])[(a.n | 0) - 1], refund = () => { if (from === me()) CB.give('동전', HOUSE_PRICE); else CB.send('org-refund', { to: from, n: HOUSE_PRICE }); };
      if (!h || h.owner || myHouse(from)) { refund(); return tell(from, !h ? '그런 집이 없어요' : h.owner ? `이미 ${h.owner} 님이 산 집이에요 · 동전을 돌려드렸어요` : '집은 한 채만 살 수 있어요 · 동전을 돌려드렸어요'); }
      h.owner = from; save(); houseMark(h, true);
      return CB.say(`🏠 ${from} 님이 ${h.n}번 집을 샀어요!`);
    }
    case 'house-sell': {
      const h = a.n && fromOp ? (S.houses || [])[(a.n | 0) - 1] : myHouse(from);
      if (!h || !h.owner) return tell(from, '팔 집이 없어요');
      const was = h.owner; h.owner = null; save(); houseMark(h, false);
      if (was === from) { if (from === me()) CB.give('동전', HOUSE_PRICE / 2); else CB.send('org-refund', { to: from, n: HOUSE_PRICE / 2 }); }
      return CB.say(`🏠 ${h.n}번 집이 다시 매물로 나왔어요${was === from ? ` (${from} 님이 팔았어요 · 동전 ${HOUSE_PRICE / 2}개 돌려받음)` : ` (OP가 ${was} 님의 집을 비웠어요)`}`);
    }
    case 'town': { // 🏙 /도시 짓기: 지금 자리에 도시 · 경찰서 · 군부대 (OP)
      if (!fromOp) return tell(from, '도시는 OP(총사령관)만 지을 수 있어요');
      const err = buildTown({ x: Math.floor(+a.x), z: Math.floor(+a.z) }, Math.floor(+a.y));
      if (err) return tell(from, '🏙 ' + err);
      return;
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
  if (g.by !== me() && inTrain(me(), g)) { inBaseP = null; CB.tp(g.x, g.y + 0.2, g.z); note(`📯 ${g.by} 님의 집합 명령으로 이동했어요`); }
}
CB.on('msg', (k, v, from) => {
  if (k === 'org' && CB.isHost()) apply(v.op, v.a, from, CB.opOf(from), !!v.d);
  else if (k === 'org-go') goIfMine(v);
  else if (k === 'org-msg' && v.to === me()) note(v.m);
  else if (k === 'org-fine' && v.to === me()) payMine(v);
  else if (k === 'org-jail' && v.to === me()) note('⛓ 감옥에 갇혔어요');
  else if (k === 'org-kit' && v.to === me()) giveKit(v.o);
  else if (k === 'org-refund' && v.to === me()) { CB.give('동전', v.n | 0); note(`🪙 동전 ${v.n | 0}개를 돌려받았어요`); }
  else if (k === 'org-cash' && v.to === me()) CB.give(COIN, v.n | 0);
  else if (k === 'org-heal' && v.to === me()) healMe(v.by);
  else if (k === 'org-mark') setMark(v);
});
function healMe(by) { const P = CB.player && CB.player(); if (!P || P.dead) return; P.hp = Math.max(P.hp, Math.min(20, P.hp + 8)); note(`🩺 ${by} 님이 치료해 줬어요`); }

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
  if (isLaw(v)) crime(a, 2, `경찰 쪽 팀원 ${v} 님 폭행`, v); // 중범죄
  else crime(a, 1, `${v} 님 폭행`, v); // 경범죄
});
CB.on('pdeath', (v) => {
  if (!CB.isHost()) return;
  const L = lastHit[v], now = Date.now();
  if (!L || now - L.t > 10000 || L.by === v) return;
  const k = L.by;
  delete lastHit[v];
  if (isLaw(k) && ((S.w[v] || {}).lv >= 2 || teamOf(v) === OUTLAW)) return; // 경찰이 ★★ 이상 수배자 · 무법자를 쓰러뜨림
  if (hitBy[k] && hitBy[k][v] && now - hitBy[k][v] < 30000) return;      // 쓰러진 사람이 먼저 때렸으면 정당방위
  const K = (kills[k] = (kills[k] || []).filter((t) => now - t < 300000));
  K.push(now);
  if (K.length >= 3) crime(k, 3, `대학살 · 5분 안에 ${K.length}명을 쓰러뜨림`, v);
  else crime(k, 3, `무단사살 · ${v} 님을 쓰러뜨림`, v);
});
// 상자 주인 · 도둑질 (부순 사람의 게임이 방장에게 알림)
const bkey = (x, y, z) => `${x},${y},${z}`;
CB.on('place', (x, y, z, id) => { if (id === CHEST) req('own', { key: bkey(x, y, z) }); });
CB.on('break', (x, y, z, id) => {
  if (id !== CHEST) return;
  const k = bkey(x, y, z), o = S.owner[k];
  if (o && o !== me()) req('theft', { key: k }); else if (o) req('unown', { key: k });
});
// 💼 일해서 벌기 (내 게임이 방장에게 알림 · 크리에이티브 · 내가 놓은 블록을 다시 캔 건 빼고)
const creative = () => { const w = CB.world && CB.world(); return !!w && w.mode === 'creative'; };
const myPlaced = new Set();
let jobN = 0;
CB.on('place', (x, y, z) => {
  if (creative()) return;
  if (myPlaced.size > 4000) myPlaced.clear();
  myPlaced.add(bkey(x, y, z));
  if (jobOf(me()) === '건축가' && ++jobN >= 30) { jobN = 0; req('job-pay', { n: 1 }); }
});
CB.on('break', (x, y, z, id) => {
  if (myPlaced.delete(bkey(x, y, z)) || creative()) return;
  const j = jobOf(me());
  if (j === '광부') { for (const name in ORE_PAY) if (CB.id(name) === id) { req('job-pay', { n: ORE_PAY[name] }); break; } }
  else if (j === '벌목꾼' && id === CB.id('원목') && ++jobN >= 3) { jobN = 0; req('job-pay', { n: 1 }); }
});
CB.on('kill', (m) => { // 사냥꾼 (몹은 방장 게임에서 쓰러짐)
  if (!CB.isHost() || !m.byPlayer || m.orgTarget || m.kind === 'villager' || /^mod_org/.test(m.kind || '')) return;
  const who = m.byNick || me();
  if (jobOf(who) === '사냥꾼') jobEarn(who, 1);
});

// 훈련 표적 (가만히 서 있음) · 맞혀서 쓰러뜨리면 그 사람에게 1점
CB.mob('org_target', { name: '🎯 훈련 표적', hp: 6, color: 0xd8b070, head: 0xffffff, ai: (m) => { m.vel.x = m.vel.z = 0; } });
CB.on('kill', (m) => {
  if (!CB.isHost() || !m.orgTarget) return;
  const T = S.train, who = m.byNick || me();
  if (!T || Date.now() > T.until || !inTrain(who, T)) return;
  addPts(who, 1); save();
});

// ── 🏴 불법 거래 상인 (무법자 팀 NPC): 밤에만 나와서 시민 · 무법자에게 무기를 팔아요 · 동전으로 ──
// 자리: OP가 /상인 설정 (안 정하면 세계 부활 자리 근처) · 각자 게임에서 가까이 가면 나타나요
const DEALER = 'org_dealer', DEALER_K = 'mod_' + DEALER, DEALER_HP = 40;
const nightNow = () => { const w = CB.world && CB.world(); return !!w && Math.sin(w.time * Math.PI * 2) < -0.05; }; // 🌙 게임의 밤 판정과 같음
const tradeIf = (name) => CB.id(name);
CB.mob(DEALER, {
  name: '🏴 불법 거래 상인', hp: DEALER_HP, color: 0x262626, head: 0xb02020, eyes: 0xffffff,
  ai: (m) => { m.vel.x = m.vel.z = 0; m.face = true; if (m.orgHome && Math.hypot(m.pos.x - m.orgHome.x, m.pos.z - m.orgHome.z) > 0.5) { m.pos.x = m.orgHome.x; m.pos.z = m.orgHome.z; } },
  onDeath: () => req('dealer-dead'), // 쓰러지면 다음 날 밤에 다시 나옴
  trades: [
    { give: [[tradeIf('동전'), 8]], get: [tradeIf('권총'), 1] },
    { give: [[tradeIf('동전'), 16]], get: [tradeIf('돌격소총'), 1] },
    { give: [[tradeIf('동전'), 30]], get: [tradeIf('저격소총'), 1] },
    { give: [[tradeIf('동전'), 2]], get: [tradeIf('탄창'), 2] },
    { give: [[tradeIf('동전'), 1]], get: [tradeIf('총알'), 16] },
    { give: [[tradeIf('동전'), 12]], get: [tradeIf('블랙 다이아몬드 검'), 1] },
  ].filter((t) => t.give[0][0] && t.get[0]),
  canTrade: () => teamOf(me()) === '시민' || teamOf(me()) === OUTLAW,
  noTrade: '…경찰이랑 군인한텐 안 팔아',
});
// ── 🪖 입대 상담원 · 🚓 경찰 상담원: 우클릭 → 「입대하시겠어요?」 → 네 ──
const RECRUITERS = {
  org_rec_army: { o: '육군', name: '🪖 입대 상담원', dx: -20, dz: 11, color: 0x55663a, q: `🪖 <b>${ARMY_NAME} 입대 상담원</b><br><br>입대하시겠어요?`, tag: '#7ec850' },
  org_discharge: { name: '🎖 전역 상담원', dx: -20, dz: 9, color: 0x3d4a2a, tag: '#c8d8a0', talk: () => dischargeDialog() }, // 입대소 안 (입대 상담원 양옆)
  org_vacation: { name: '🏖 휴가 상담원', dx: -20, dz: 13, color: 0x2f6a5a, tag: '#7ae0c0', talk: () => vacationDialog() },
  org_return: { name: '🪖 복귀 상담원', dx: -25, dz: 4, color: 0x55663a, tag: '#a8e070', talk: () => returnDialog() }, // 군부대 정문 바로 안쪽 (길 옆)
  org_rec_police: { o: '경찰', name: '🚓 경찰 상담원', dx: 25, dz: 10, color: 0x1f3a7a, q: `🚓 <b>${POLICE_NAME} 상담원</b><br><br>경찰에 지원하시겠어요?`, tag: '#4aa8ff' },
  org_banker: { name: '🏦 은행원', dx: 41, dz: -10, color: 0x2a2f45, tag: '#ffd040', talk: () => bankDialog() },
  org_jobs: { name: '💼 직업 상담원', dx: 41, dz: 18, color: 0x2a6a7a, tag: '#7ad0e0', talk: () => jobDialog() },
};
for (const k in RECRUITERS) {
  const R = RECRUITERS[k];
  CB.mob(k, {
    name: R.name, hp: 9999, color: R.color, head: 0xd8a07c,
    ai: (m) => { m.vel.x = m.vel.z = 0; m.face = true; if (m.orgHome && Math.hypot(m.pos.x - m.orgHome.x, m.pos.z - m.orgHome.z) > 0.5) { m.pos.x = m.orgHome.x; m.pos.z = m.orgHome.z; } },
    talk: () => {
      if (R.talk) return R.talk();
      const t = teamOf(me());
      if (t !== '시민') return note(t === OUTLAW || t === PRISONER ? `${R.name}: ${tagOf(t)}는 받아 줄 수 없어요` : `${R.name}: 이미 ${tagOf(t)}이시네요`);
      if (S.w[me()]) return note(`${R.name}: 지명수배 중에는 안 돼요`);
      if (R.o === '육군') return CB.dialog(`🪖 <b>${ARMY_NAME} 입대 상담원</b><br><br>어느 사단에 입대하시겠어요?`, [['🪖 1사단 육군', () => req('enlist', { o: '육군' })], ['⚓ 2사단 해군', () => req('enlist', { o: '해군' })], ['✈ 3사단 공군', () => req('enlist', { o: '공군' })], ['🦅 4사단 해병대', () => req('enlist', { o: '해병대' })], ['아니요']]);
      CB.dialog(R.q, [['네', () => req('enlist', { o: R.o })], ['아니요']]);
    },
  });
}
// 🎖 전역소 · 🏖 휴가상담소 (입대소 안): 전역은 여기서만 (OP는 /조직 탈퇴도) · 휴가는 10분 · 30분, 끝나고 1시간 뒤에 다시
const VAC_GAP = 3600000;
let vacNoteT = 0;
function returnDialog() { // 🪖 복귀 상담원 (정문 안쪽): 휴가 복귀 신고 → 휴가 끝
  const L = S.leave[me()];
  if (!ARMY.includes(teamOf(me()))) return note('🪖 복귀 상담원: 군대 팀만 복귀 신고를 해요');
  if (!L || !L.vac) return note('🪖 복귀 상담원: 지금은 휴가 중이 아니에요');
  CB.dialog(`🪖 <b>${ARMY_NAME} 복귀 상담원</b><br><br>휴가에서 복귀하셨나요? 남은 시간 ${mmss(L.sec || 0)}<br><small>신고하면 휴가가 끝나고, 1시간 뒤에 다시 휴가를 갈 수 있어요</small>`, [['복귀 신고', () => req('vac-back')], ['아니요']]);
}
function dischargeDialog() {
  const t = teamOf(me());
  if (!ARMY.includes(t)) return note('🎖 전역 상담원: 군대 팀만 전역할 수 있어요');
  if (S.w[me()]) return note('🎖 전역 상담원: 지명수배 중에는 전역할 수 없어요');
  CB.dialog(`🎖 <b>${ARMY_NAME} 전역 상담원</b><br><br>${esc(tagOf(t))} · ${esc(rankOf(me()))}<br>전역하시겠어요? 시민이 되고 군사계급이 사라져요.`, [['전역하기', () => req('discharge')], ['아니요']]);
}
function vacationDialog() {
  const t = teamOf(me()), L = S.leave[me()];
  if (!ARMY.includes(t)) return note('🏖 휴가 상담원: 군대 팀만 휴가를 신청할 수 있어요');
  if (L) return note(`🏖 휴가 상담원: 이미 ${L.vac ? '휴가' : '외출'} 중이에요 · 남은 시간 ${mmss(L.sec || 0)} · 군부대로 돌아오면 끝나요`);
  const left = (S.vacT[me()] || 0) + VAC_GAP - Date.now();
  if (left > 0) return note(`🏖 휴가 상담원: 휴가는 끝나고 1시간 뒤에 다시 신청할 수 있어요 (${Math.ceil(left / 60000)}분 남음)`);
  CB.dialog(`🏖 <b>${ARMY_NAME} 휴가 상담원</b><br><br>휴가를 신청하시겠어요?<br><small>휴가 동안은 군부대를 나가도 무단탈영이 아니에요 · 돌아오면 정문 안쪽의 복귀 상담원에게 신고 · 시간 안에 못 돌아오면 무단탈영</small>`, [['10분 휴가', () => req('vacation', { min: 10 })], ['30분 휴가', () => req('vacation', { min: 30 })], ['아니요']]);
}
// 🏦 은행 · 💼 직업소개소 대화창 (대화창 버튼에서 새 대화창을 열 땐 먼저 닫히는 걸 기다림)
const nextDlg = (f) => () => { setTimeout(f, 30); };
function bankIn(n) {
  n = Math.min(n | 0, CB.has(COIN) || 0);
  if (n <= 0) return note('🪙 가진 동전이 없어요');
  if (CB.take(COIN, n)) req('bank-in', { n });
}
function bankDialog() {
  const b = bal(me()), c = CB.has(COIN) || 0;
  CB.dialog(`🏦 <b>은행원</b><br><br>어서 오세요! 통장 <b>${b}</b>개 · 가방 <b>${c}</b>개<br><small>벌금은 가방 → 통장 순서로 나가요 · /은행 송금 @닉 개수</small>`, [['전부 입금', () => bankIn(c)], ['10개 입금', () => bankIn(10)], ['10개 출금', () => req('bank-out', { n: 10 })], ['전부 출금', () => req('bank-out', { n: b })], ['닫기']]);
}
function jobInfo(n) {
  const J = JOBS[n];
  CB.dialog(`${J.ico} <b>${n}</b><br><br>${J.d}<br>월급: 10분마다 동전 ${JOB_SALARY}개 (통장으로)`, [['이 일 하기', () => req('job-set', { j: n })], ['뒤로', nextDlg(jobDialog)]]);
}
function jobSell() {
  const j = jobOf(me()), L = SELL[j];
  if (!L) return note('📦 납품은 농부 · 어부 · 요리사만 해요');
  let coins = 0, items = 0;
  for (const [name, price] of L) {
    if (!CB.id(name)) continue;
    const n = Math.min(CB.has(name) || 0, 64 - items);
    if (n > 0 && CB.take(name, n)) { coins += n * price; items += n; }
  }
  if (!coins) return note(`📦 납품할 게 없어요 (${L.map((x) => x[0]).join(' · ')})`);
  req('job-sell', { n: coins });
}
function jobDialog() {
  const t = teamOf(me()), j = jobOf(me());
  if (t !== '시민') return note(t === OUTLAW || t === PRISONER ? `💼 ${tagOf(t)}는 직업을 가질 수 없어요` : `💼 ${tagOf(t)}는 팀 월급을 받아요 · 직업은 시민만`);
  const B = [];
  if (SELL[j]) B.push(['📦 납품하기', jobSell]);
  for (const n in JOBS) if (n !== j) B.push([`${JOBS[n].ico} ${n}`, nextDlg(() => jobInfo(n))]);
  if (j) B.push(['그만두기', () => req('job-set', { j: '' })]);
  B.push(['닫기']);
  CB.dialog(`💼 <b>직업소개소</b><br><br>${j ? `지금 직업: <b>${JOBS[j].ico} ${j}</b>` : '어떤 일을 해 보시겠어요?'}`, B);
}
// 📦 배달부: 도시 안 목적지까지 가면 동전 · 다음 일감은 5초 뒤
let DEL = null, delWait = 0;
function deliverySpots() {
  const T = S.town, L = [['경찰서 앞', 28, 3], ['음식점 앞', 41, 3], ['은행 앞', 41, -3], ['직업소개소 앞', 40, 13], ['입대소 앞', -16, 11], ['도시 한가운데', 0, 0]];
  const out = L.map(([n, dx, dz]) => ({ n, x: T.x + dx + 0.5, z: T.z + dz + 0.5 }));
  for (const h of S.houses || []) out.push({ n: `${h.n}번 집`, x: h.door.x, z: h.door.z });
  return out;
}
function deliveryTick() {
  if (jobOf(me()) !== '배달부' || !S.town || CB.dimNow() !== 'over') { DEL = null; return; }
  const p = pos();
  if (!DEL) {
    if (delWait > 0) { delWait--; return; }
    const L = deliverySpots().filter((q) => Math.hypot(q.x - p.x, q.z - p.z) > 15);
    if (L.length) { const q = L[Math.floor(Math.random() * L.length)]; DEL = { ...q, far: Math.hypot(q.x - p.x, q.z - p.z) }; }
    return;
  }
  if (Math.hypot(DEL.x - p.x, DEL.z - p.z) < 4) { req('job-pay', { n: Math.max(1, Math.min(4, Math.round(DEL.far / 25))) }); DEL = null; delWait = 5; }
}
function npcNear(x, z) { // NPC가 있어야 하나: 방장 게임은 누구든 60칸 안에 있으면 (친구 곁의 NPC를 지우지 않게) · 친구 게임은 나만 봄
  const L = CB.isHost() && CB.playerPos ? CB.players().map((n) => CB.playerPos(n)) : [pos()];
  return L.some((q) => q && Math.hypot(q.x - x, q.z - z) < 60);
}
function signTick() { // 🪧 큰 글씨 간판 (건물 위에 떠서 멀리서도 보임)
  const T = S.town; if (!T || !CB.bigSign) return;
  CB.bigSign('org_city', CITY_NAME, T.x + 0.5, T.y + 13, T.z + 0.5, { bg: '#14325a', w: 20 });
  CB.bigSign('org_army', ARMY_NAME, T.x - 21.5, T.y + 10, T.z + 0.5, { bg: '#3d4a2a', w: 16 });
  CB.bigSign('org_recruit', `${ARMY_NAME} 입대 · 전역 · 휴가`, T.x - 19.5, T.y + 7, T.z + 11.5, { bg: '#3d4a2a', w: 18 });
  CB.bigSign('org_police', `${POLICE_NAME} 경찰서`, T.x + 28.5, T.y + 12, T.z + 11.5, { bg: '#1f3a7a', w: 24 });
  CB.bigSign('org_food', '음식점', T.x + 41.5, T.y + 9, T.z + 8.5, { bg: '#a8421a', w: 12 });
  CB.bigSign('org_bank', '🏦 은행', T.x + 41.5, T.y + 9, T.z - 7.5, { bg: '#8a6a10', w: 12 });
  CB.bigSign('org_jobs', '💼 직업소개소', T.x + 41.5, T.y + 9, T.z + 17.5, { bg: '#2a6a7a', w: 14 });
  if (S.annex) { // 🪖 기지 간판
    CB.bigSign('anx_gate', `${ARMY_NAME} 기지`, T.x - 47.5, T.y + 9, T.z + 0.5, { bg: '#3d4a2a', w: 18 });
    ANX.forEach(([n, ax, az, bx, bz, h, kind], i) => CB.bigSign('anx' + i, n, T.x + ((ax + bx) >> 1) + 1, T.y + h + 3, T.z + ((az + bz) >> 1) + 0.5, { bg: kind === 'med' || kind === 'surg' ? '#b02020' : kind === 'jail' ? '#444' : '#3d4a2a', w: Math.min(18, 6 + n.length) }));
    ANX_OPEN.forEach(([n, x, z], i) => CB.bigSign('anxo' + i, n, T.x + x + 0.5, T.y + 6, T.z + z + 0.5, { bg: '#3d4a2a', w: 12 }));
  }
  if (S.village) CB.bigSign('org_food2', '음식점', T.x + S.village.fx, T.y + 9, T.z + S.village.s * S.village.fd, { bg: '#a8421a', w: 12 });
}
function recruiterTick() { // 상담원이 제자리에 서 있게 (내 게임에 한 명씩)
  const T = S.town; if (!T || CB.dimNow() !== 'over') return;
  for (const k in RECRUITERS) {
    const R = RECRUITERS[k], x = T.x + R.dx + 0.5, z = T.z + R.dz + 0.5, near = npcNear(x, z);
    const L = CB.mobs().filter((m) => m.kind === 'mod_' + k && !m.dead);
    for (const m of L) { if (!near || m !== L[0]) m.remove(); else { m.orgHome = { x, z }; if (CB.mobTag) CB.mobTag(m, R.name, R.tag); } }
    if (near && !L.length && CB.loaded(x, z)) { const m = CB.spawn(k, x, T.y + 0.1, z); if (m) m.orgHome = { x, z }; }
  }
}
// ── 📝 진급 시험: 군부대 안에서 /시험 사격 · /시험 점프 (둘 다 통과해야 /진급) ──
const EX_TARGETS = [-29, -27, -25], EX_JUMP = [[-43, 1], [-41, 2], [-39, 3], [-36, 3], [-34, 4], [-31, 3], [-28, 2]]; // 점프맵 기둥 [x, 높이] (걸어서도 건널 수 있게: 올라갈 땐 한 칸 · 평지 · 내리막은 두 칸 간격)
let EX = null; // 내 게임에서 치르는 중인 시험
function examEnd(ok, msg) { const k = EX && EX.kind; EX = null; note(msg); if (ok) req('exam', { kind: k }); }
function examStart(kind, c) {
  const T = S.town, t = teamOf(me());
  if (!T) return c.say('📝 아직 군부대가 없어요');
  if (!ARMY.includes(t)) return c.say('📝 진급 시험은 군대 쪽 팀만 볼 수 있어요');
  if (!examOpen(me())) return c.say('📝 진급 시험은 교육사(TMC) 이상이 /시험 열기 @닉 으로 열어 줘야 볼 수 있어요 (10분 동안)');
  if (EX) return c.say('📝 이미 시험 중이에요');
  const p = pos(), dx = Math.floor(p.x) - T.x, dz = Math.floor(p.z) - T.z;
  if (!(dx >= -46 && dx <= -22 && Math.abs(dz) <= 22)) return c.say('📝 시험은 군부대 안에서만 볼 수 있어요');
  if (kind === 'shoot') {
    if (!GUNS.some((g) => CB.has(g) > 0)) return c.say('📝 사격 시험은 총이 있어야 해요 · /장비');
    EX = { kind, sec: 40, hits: 0, t: Math.floor(Math.random() * 3) };
    CB.tp(T.x - 26.5, T.y + 0.2, T.z - 5.5);
    return c.say('🎯 사격 시험: 40초 안에 안내판에 나온 과녁을 5번 맞혀요');
  }
  EX = { kind, sec: 60, up: false };
  CB.tp(T.x - 43.5, T.y + 0.2, T.z + 4);
  c.say('🦘 점프 시험: 60초 안에 기둥을 밟고 끝의 금 블록까지 가요 · 땅에 떨어지면 실패');
}
function examTick() {
  if (!EX) return;
  const T = S.town, p = pos();
  if (!T || !ARMY.includes(teamOf(me()))) { EX = null; return; }
  if (--EX.sec <= 0) return examEnd(false, `📝 시간 초과 · ${EX.kind === 'shoot' ? '/시험 사격' : '/시험 점프'} 로 다시 해요`);
  if (EX.kind === 'jump') {
    const h = p.y - T.y;
    if (h >= 0.9) EX.up = true;
    if (EX.up && h < 0.5) return examEnd(false, '🦘 떨어졌어요 · /시험 점프 로 다시 해요');
    const G0 = EX_JUMP[EX_JUMP.length - 1];
    if (Math.floor(p.x) - T.x === G0[0] && (Math.floor(p.z) - T.z === 3 || Math.floor(p.z) - T.z === 4) && h >= G0[1] - 0.1) return examEnd(true, '🦘 점프 시험 통과!');
  }
}
CB.on('shot', (x, y, z, id) => {
  if (!EX || EX.kind !== 'shoot' || id !== T_TARGET) return;
  const T = S.town; if (!T || x !== T.x + EX_TARGETS[EX.t] || z !== T.z - 18) return;
  if (++EX.hits >= 5) return examEnd(true, '🎯 사격 시험 통과!');
  EX.t = (EX.t + 1 + Math.floor(Math.random() * 2)) % 3;
});
CB.command('시험', '/시험 — 내 진급 시험 결과 · /시험 사격 · /시험 점프 (군부대 안 · 시험이 열려 있을 때) · /시험 열기 @닉 (교육사(TMC) 이상 · OP)', (a, c) => {
  if (a[0] === '열기' || a[0] === '닫기') return req('examopen', { who: a[1], close: a[0] === '닫기' ? 1 : 0 });
  if (a[0] === '사격') return examStart('shoot', c);
  if (a[0] === '점프') return examStart('jump', c);
  const E = S.exam[me()] || {}, O = examOpen(me());
  c.say(`📝 진급 시험: 사격 ${E.shoot ? '✅' : '❌'} · 점프 ${E.jump ? '✅' : '❌'} · ${O ? `${O.by} 님이 열어 줌 (${Math.ceil((O.t - Date.now()) / 60000)}분 남음) · /시험 사격 · /시험 점프` : '시험이 닫혀 있어요 (교육사(TMC) 이상이 /시험 열기 @닉)'}`);
}, { everyone: true });
function dealerSpot() {
  if (S.dealer) return S.dealer;
  if (!CB.ground || !CB.spawnPos) return null;
  const sp = CB.spawnPos();
  for (const [dx, dz] of [[9, 6], [6, 9], [-9, 6], [6, -9], [12, 0], [0, 12], [-12, 0], [0, -12]]) { // 부활 자리 근처 땅 (나무 · 물 위는 건너뜀)
    const x = Math.floor(sp.x) + dx + 0.5, z = Math.floor(sp.z) + dz + 0.5, y = CB.ground(x, z);
    if (y != null) return { x, y, z, dim: 'over' };
  }
  return null;
}
let dealerT = 0;
function dealerTick() { // 가까이 있으면 상인이 서 있게 (내 게임에 하나만)
  const D = dealerSpot(); if (!D) return;
  if (!S.dealer && CB.isHost()) { S.dealer = D; save(); } // 처음 정한 자리를 저장 (모두 같은 자리)
  if (CB.dimNow() !== (D.dim || 'over')) return;
  const night = nightNow();
  if (!night && S.dealerDead && CB.isHost()) { S.dealerDead = false; save(); }
  const near = night && !S.dealerDead && npcNear(D.x, D.z); // 🌙 밤에만 · 쓰러졌으면 다음 날 밤에
  const L = CB.mobs().filter((m) => m.kind === DEALER_K && !m.dead);
  for (const m of L) { if (!near || m !== L[0]) m.remove(); else { m.orgHome = { x: D.x, z: D.z }; if (m.hp > DEALER_HP) m.hp = DEALER_HP; if (CB.mobTag) CB.mobTag(m, '🏴 불법 거래 상인', '#ff4040'); } }
  if (near && !CB.mobs().some((m) => m.kind === DEALER_K && !m.dead)) { const m = CB.spawn(DEALER, D.x, D.y + 0.1, D.z); if (m) m.orgHome = { x: D.x, z: D.z }; }
}

// ── 🏙 도시 · 🚓 경찰서 · 🪖 군부대: 모드를 깔면 부활 자리 근처 빈 땅에 저절로 지어요 (방장 게임이 한 번만) ──
// 사람이 블록을 많이 바꾼 땅은 피해요 · OP는 /도시 짓기 로 지금 자리에 새로 지을 수 있어요
// 가운데가 도시 (네거리 · 빌딩 4채 · 가로등 · 태극기), 동쪽이 경찰서 (유치장 · 주차장), 서쪽이 군부대 (담 · 망루 · 막사 · 사령부 · 헬기장 · 사격장)
const BLK = (name, alt) => CB.id(name) || (alt && CB.id(alt)) || CB.id('돌') || 1;
const T_CONC = CB.block({ id: 1902, key: 'town_concrete', name: '콘크리트', paint: (u, v, x, y) => { const k = 0.9 + 0.1 * Math.sin(x * 12.9 + y * 7.7) * Math.cos(x * 3.1 - y * 5.3); return [150 * k, 150 * k, 154 * k]; } });
const T_WHITE = CB.block({ id: 1903, key: 'town_white', name: '흰 벽', paint: (u, v, x, y) => { const k = 0.94 + 0.06 * Math.sin(x * 9.1 + y * 4.7); return [232 * k, 230 * k, 224 * k]; } });
const T_POLICE = CB.block({ id: 1904, key: 'town_police', name: '경찰서 벽', paint: (u, v, x, y) => { const k = 0.92 + 0.08 * Math.sin(x * 5.3 + y * 8.1); return [30 * k, 60 * k, 140 * k]; } });
const T_STRIPE = CB.block({ id: 1905, key: 'town_stripe', name: '경찰 줄무늬', paint: (u, v, x, y) => (((x >> 2) + (y >> 3)) % 2 ? [240, 240, 240] : [30, 70, 180]) });
const T_BADGE = CB.block({ id: 1906, key: 'town_badge', name: '경찰 마크', paint: (u, v, x, y) => { const dx = x - 7.5, dy = y - 7.5, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx); return r < 3.4 + 2 * Math.cos(5 * a - Math.PI / 2) ? [250, 200, 40] : r < 7.4 ? [20, 40, 110] : [30, 60, 140]; } });
const T_CAMO = CB.block({ id: 1907, key: 'town_camo', name: '위장 벽', paint: (u, v, x, y) => { const n = Math.sin(x * 0.9 + Math.sin(y * 0.7) * 2) + Math.cos(y * 0.8 + Math.sin(x * 0.6) * 2); return n > 0.8 ? [60, 52, 34] : n > -0.2 ? [88, 104, 56] : n > -1 ? [120, 116, 80] : [52, 70, 40]; } });
const T_ARMY = CB.block({ id: 1908, key: 'town_army', name: '군대 마크', paint: (u, v, x, y) => { const dx = x - 7.5, dy = y - 7.5, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx); return r < 3.4 + 2 * Math.cos(5 * a - Math.PI / 2) ? [235, 235, 220] : [70, 84, 44]; } });
const T_SAND = CB.block({ id: 1909, key: 'town_sandbag', name: '모래주머니', paint: (u, v, x, y) => { const row = y >> 2, e = (((x + (row % 2) * 4) % 8) === 0) || y % 4 === 0; return e ? [120, 100, 64] : [178, 156, 108]; } });
const T_LINE = CB.block({ id: 1910, key: 'town_line', name: '도로 선', paint: () => [235, 235, 225] });
const T_TARGET = CB.block({ id: 1911, key: 'town_target', name: '과녁', paint: (u, v, x, y) => { const r = Math.hypot(x - 7.5, y - 7.5); return r < 2 ? [220, 30, 30] : r < 4 ? [240, 240, 240] : r < 6 ? [220, 30, 30] : [240, 240, 240]; } });
const TOWN_X = 46, TOWN_Z = 24; // 동서 ±46칸 · 남북 ±24칸
const LAD_W = 44, LAD_E = 45, LAD_N = 46, LAD_S = 47; // 🪜 사다리 블록 (붙은 벽: 서 · 동 · 북(-z) · 남(+z))
const TOWN_V = 7; // 도시 판 번호 — 2 이전은 같은 자리에 새로 지음 (사다리 · 고정 블록 번호) · 2 ~ 6은 없는 것만 더함 (탈영선 · 성벽 · 입대소 · 점프맵 · 음식점 · 은행 · 직업소개소)
const VIL_D = 34; // 🏘 도시 옆 마을 깊이 (성문 밖 34칸)
// 🪖 CLKKY ARMY 기지 (서쪽 성벽 밖으로 넓힘): x -166 ~ -47 · z -56 ~ 56 (도시 가운데 기준) · 서쪽 성벽 가운데에 기지 문
const ANX_X1 = -166, ANX_Z = 56;
const inBaseD = (dx, dz) => (dx >= -46 && dx <= -22 && Math.abs(dz) <= 22) || (!!S.annex && dx >= ANX_X1 && dx <= -46 && Math.abs(dz) <= ANX_Z); // 군부대 안 (도시 안 본부 + 바깥 기지)
const T_DESERT = CB.block({ id: 1914, key: 'town_desert', name: '탈영선', paint: (u, v, x, y) => (((x + y) >> 2) % 2 ? [235, 225, 60] : [205, 30, 30]) });
function wallPlan(C, G) { // 🏰 성벽: 도시 · 경찰서 · 군부대 둘레 (높이 7칸 · 톱니 · 모서리 탑 · 동 · 남 · 북 성문 · 올라가는 사다리)
  const L = [], BR = BLK('돌벽돌'), LAMPB = BLK('등불'), put = (x, y, z, id) => L.push([C.x + x, G + y, C.z + z, id]);
  const gate = (x, z) => (x === TOWN_X && Math.abs(z) <= 2) || (Math.abs(z) === TOWN_Z && Math.abs(x) <= 2);
  for (let x = -TOWN_X; x <= TOWN_X; x++) for (let z = -TOWN_Z; z <= TOWN_Z; z++) {
    if (Math.abs(x) !== TOWN_X && Math.abs(z) !== TOWN_Z) continue;
    for (let y = 0; y <= 6; y++) put(x, y, z, gate(x, z) && y <= 4 ? 0 : BR);
    if ((x + z) % 2 === 0) put(x, 7, z, BR);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { // 모서리 탑
    for (let i = 0; i <= 2; i++) for (let j = 0; j <= 2; j++) for (let y = 0; y <= 9; y++) put(sx * (TOWN_X - i), y, sz * (TOWN_Z - j), BR);
    put(sx * (TOWN_X - 1), 10, sz * (TOWN_Z - 1), LAMPB);
  }
  for (const [x, z] of [[TOWN_X, -3], [TOWN_X, 3], [-3, TOWN_Z], [3, TOWN_Z], [-3, -TOWN_Z], [3, -TOWN_Z]]) put(x, 8, z, LAMPB); // 성문 등불
  for (let y = 0; y <= 6; y++) { put(TOWN_X - 1, y, 4, LAD_E); put(4, y, TOWN_Z - 1, LAD_S); put(4, y, 1 - TOWN_Z, LAD_N); } // 🪜 성벽 위로
  return L;
}
function campPlan(C, G) { // 🪖 입대소 (정문 옆 · 군부대 밖) · 🦘 점프 시험장 (연병장 북쪽)
  const L = [], WALL = BLK('돌벽돌'), PLANK = BLK('판자'), LAMPB = BLK('등불'), GOLD = BLK('금 블록'), put = (x, y, z, id) => L.push([C.x + x, G + y, C.z + z, id]);
  for (let x = -21; x <= -18; x++) for (let z = 8; z <= 14; z++) {
    put(x, -1, z, PLANK); put(x, 4, z, T_CAMO);
    for (let y = 0; y <= 3; y++) put(x, y, z, x === -21 || x === -18 || z === 8 || z === 14 ? WALL : 0);
  }
  for (let z = 10; z <= 11; z++) for (let y = 0; y <= 2; y++) put(-18, y, z, 0); // 문 (도시 쪽)
  put(-18, 3, 10, T_ARMY); put(-18, 3, 11, T_ARMY); put(-20, 3, 9, LAMPB); put(-19, 3, 13, LAMPB);
  EX_JUMP.forEach(([x, h], i) => { for (const z of [3, 4]) for (let y = 0; y < h; y++) put(x, y, z, i === EX_JUMP.length - 1 && y === h - 1 ? GOLD : T_CONC); });
  return L;
}
function foodPlan(C, G) { // 🍳 도시 음식점 (큰길 동쪽 · 문은 큰길 쪽) · 뒤쪽 조리대 · 상자 · 가스레인지
  const L = [], WALL = BLK('돌벽돌'), PLANK = BLK('판자'), GLASS = BLK('유리'), LAMPB = BLK('등불'), STOVE = BLK('가스레인지', '판자'), put = (x, y, z, id) => L.push([C.x + x, G + y, C.z + z, id]);
  for (let x = 38; x <= 44; x++) for (let z = 5; z <= 11; z++) {
    put(x, -1, z, PLANK); put(x, 4, z, T_CONC);
    const edge = x === 38 || x === 44 || z === 5 || z === 11, corner = (x === 38 || x === 44) && (z === 5 || z === 11);
    for (let y = 0; y <= 3; y++) put(x, y, z, !edge ? 0 : !corner && y === 2 ? GLASS : T_WHITE);
  }
  for (let y = 0; y <= 2; y++) put(41, y, 5, 0);
  for (let x = 39; x <= 43; x++) put(x, 0, 10, PLANK);
  put(41, 0, 10, CHEST); put(39, 0, 10, STOVE); put(41, 3, 8, LAMPB);
  return L;
}
const T_BANK = CB.block({ id: 1915, key: 'town_bank', name: '은행 벽', paint: (u, v, x, y) => { const k = 0.93 + 0.07 * Math.sin(x * 6.1 + y * 3.7); return [214 * k, 196 * k, 150 * k]; } });
function bankPlan(C, G) { // 🏦 은행 (큰길 북쪽 · 문은 큰길 쪽) · 💼 직업소개소 (음식점 남쪽 · 문은 음식점 쪽)
  const L = [], PLANK = BLK('판자'), GLASS = BLK('유리'), LAMPB = BLK('등불'), GOLD = BLK('금 블록'), IRON = BLK('철 블록'), SHELF = BLK('책장', '판자'), put = (x, y, z, id) => L.push([C.x + x, G + y, C.z + z, id]);
  const room = (z1, z2, wall, roof) => {
    for (let x = 38; x <= 44; x++) for (let z = z1; z <= z2; z++) {
      put(x, -1, z, PLANK); put(x, 4, z, roof);
      const edge = x === 38 || x === 44 || z === z1 || z === z2, corner = (x === 38 || x === 44) && (z === z1 || z === z2);
      for (let y = 0; y <= 3; y++) put(x, y, z, !edge ? 0 : !corner && y === 2 ? GLASS : wall);
    }
    put(41, 3, (z1 + z2) >> 1, LAMPB);
  };
  room(-11, -5, T_BANK, GOLD);
  for (let y = 0; y <= 2; y++) put(41, y, -5, 0);
  for (let x = 39; x <= 43; x++) put(x, 0, -8, PLANK); // 창구
  for (let y = 0; y <= 1; y++) { put(39, y, -10, IRON); put(43, y, -10, IRON); } // 금고
  put(39, 2, -10, GOLD); put(43, 2, -10, GOLD);
  room(14, 20, T_WHITE, T_CONC);
  for (let y = 0; y <= 2; y++) put(41, y, 14, 0);
  for (let x = 39; x <= 43; x++) put(x, 0, 17, PLANK); // 상담 창구
  for (let y = 0; y <= 1; y++) { put(39, y, 19, SHELF); put(43, y, 19, SHELF); }
  return L;
}
function cookbookIn(x, y, z) { const id = CB.id('요리 가이드북'); if (CB.fillChest && id) CB.fillChest(x, y, z, [[id, 1]]); }
function spawnVillager(prof, x, y, z) { // 주민: 직업을 정해서 (6 = 요리사)
  try { if (prof != null) VPROF = prof; const m = CB.spawn('villager', x, y, z); if (m) m.home = { x, z }; return m; } catch (e) { console.warn(e); return null; }
}
function cityFoodDone(C, G) { cookbookIn(C.x + 41, G, C.z + 10); spawnVillager(6, C.x + 41.5, G + 0.1, C.z + 8.5); }
function villageSite(C) { // 🏘 북문 · 남문 밖 중 물이 적은 쪽 (땅이 다 불러와진 쪽만)
  let best = null;
  for (const s of [1, -1]) {
    let ok = true, wet = 0, n = 0;
    for (let x = C.x - 22; x <= C.x + 22 + 15 && ok; x += 16) for (let d = TOWN_Z + 1; d <= TOWN_Z + VIL_D + 15 && ok; d += 16) if (!CB.loaded(Math.min(x, C.x + 22), C.z + s * Math.min(d, TOWN_Z + VIL_D))) ok = false;
    if (!ok) continue;
    for (let x = C.x - 22; x <= C.x + 22; x += 6) for (let d = TOWN_Z + 1; d <= TOWN_Z + VIL_D; d += 6) { const g = groundAt(x, C.z + s * d); n++; if (g && g.wet) wet++; }
    if (wet / n <= 0.3) return s;
    if (best == null || wet / n < best.w) best = { s, w: wet / n };
  }
  return best ? best.s : null;
}
function buildVillage(C, G, s) { // 🏘 성문 바로 밖 마을: 길 양쪽에 집 5채 · 음식점 · 가로등 · 주민
  const L = [], GRASS = BLK('잔디 블록'), ROAD = BLK('도로', '돌'), PLANK = BLK('판자'), LOG = BLK('원목', '판자'), BRICK = BLK('돌벽돌'), GLASS = BLK('유리'), LAMPB = BLK('등불'), IRON = BLK('철 블록'), BED = BLK('침대', '판자'), DIRT = BLK('흙'), STOVE = BLK('가스레인지', '판자');
  const put = (x, y, d, id) => L.push([C.x + x, G + y, C.z + s * d, id]);
  const soft = new Set([0, CB.id('물'), CB.id('나뭇잎'), CB.id('원목'), CB.id('용암')].filter((v) => v != null));
  const D0 = TOWN_Z + 1, D1 = TOWN_Z + VIL_D;
  for (let x = -22; x <= 22; x++) for (let d = D0; d <= D1; d++) {
    put(x, -1, d, Math.abs(x) <= 2 ? ROAD : GRASS);
    for (let y = 0; y <= 12; y++) put(x, y, d, 0);
    for (let y = G - 2; y > G - 18; y--) { if (!soft.has(CB.getBlock(C.x + x, y, C.z + s * d))) break; L.push([C.x + x, y, C.z + s * d, DIRT]); }
  }
  for (let d = D0; d <= D1; d++) if (d % 4 < 2) put(0, -1, d, T_LINE);
  const house = (x0, d0, food) => {
    const wall = food ? T_WHITE : PLANK, doorX = x0 < 0 ? x0 + 6 : x0, backX = x0 < 0 ? x0 + 1 : x0 + 5, mid = d0 + 3;
    for (let x = x0; x <= x0 + 6; x++) for (let d = d0; d <= d0 + 6; d++) {
      put(x, -1, d, PLANK);
      const ex = x === x0 || x === x0 + 6, ed = d === d0 || d === d0 + 6;
      if (ex || ed) for (let y = 0; y <= 3; y++) put(x, y, d, ex && ed ? LOG : y === 2 && (food || (ex && d === mid) || (ed && x === x0 + 3)) ? GLASS : wall);
      put(x, 4, d, BRICK);
      if (x > x0 && x < x0 + 6 && d > d0 && d < d0 + 6) put(x, 5, d, BRICK);
    }
    for (let y = 0; y <= 1; y++) put(doorX, y, mid, 0);
    put(x0 + 3, 3, mid, LAMPB);
    if (food) { for (let d = d0 + 1; d <= d0 + 5; d++) put(backX, 0, d, PLANK); put(backX, 0, mid, CHEST); put(backX, 0, d0 + 1, STOVE); }
    else put(backX, 0, d0 + 1, BED);
  };
  const HS = [[-13, D0 + 3], [7, D0 + 3], [-13, D0 + 13], [7, D0 + 13], [7, D0 + 23]];
  HS.forEach(([x, d]) => house(x, d, false));
  const FD = [-13, D0 + 23]; house(FD[0], FD[1], true);
  for (const d of [D0 + 1, D0 + 11, D0 + 21, D0 + 31]) for (const x of [-4, 4]) { for (let y = 0; y <= 2; y++) put(x, y, d, IRON); put(x, 3, d, LAMPB); }
  CB.setBlocks(L);
  const chestX = C.x + FD[0] + 1, chestZ = C.z + s * (FD[1] + 3);
  cookbookIn(chestX, G, chestZ);
  spawnVillager(6, C.x + FD[0] + 3.5, G + 0.1, C.z + s * (FD[1] + 3) + 0.5);
  spawnVillager(1, C.x + HS[0][0] + 3.5, G + 0.1, C.z + s * (HS[0][1] + 3) + 0.5);
  for (let i = 1; i < HS.length; i++) spawnVillager(i - 1 === 1 ? 2 : i - 1, C.x + HS[i][0] + 3.5, G + 0.1, C.z + s * (HS[i][1] + 3) + 0.5);
  S.village = { s, fx: FD[0] + 3.5, fd: FD[1] + 3.5 };
  S.gates[s > 0 ? 1 : 2] = 0; save();
  CB.say('🏘 도시 옆에 마을이 생겼어요!');
}
function gatePlan(C, G, i) { // 🏰 성문 밖 길: 땅 높이까지 한 칸씩 이어서 성벽 · 절벽에 막히지 않게 (언덕은 깎고 물 위는 다리) · 땅이 아직 안 불러와졌으면 null
  const L = [], ROAD = BLK('도로', '돌'), DIRT = BLK('흙'), [ax, az, from0] = [[1, 0, TOWN_X], [0, 1, TOWN_Z], [0, -1, TOWN_Z]][i], from = from0 + (az && S.village && S.village.s === az ? VIL_D : 0);
  for (let k = 1; k <= 24; k++) if (!CB.loaded(C.x + ax * (from + k), C.z + az * (from + k))) return null;
  {
    let cur = G - 1;
    for (let k = 1; k <= 24; k++) {
      const cx = C.x + ax * (from + k), cz = C.z + az * (from + k);
      const g = groundAt(cx, cz), want = g && !g.wet ? g.y - 1 : cur;
      if (want > cur) cur++; else if (want < cur) cur--;
      for (let w = -2; w <= 2; w++) {
        const x = cx + (az ? w : 0), z = cz + (ax ? w : 0);
        L.push([x, cur, z, ROAD], [x, cur - 1, z, DIRT]);
        for (let y = cur + 1; y <= cur + 6; y++) L.push([x, y, z, 0]);
      }
      if (k >= 3 && g && !g.wet && cur === want) break;
    }
  }
  return L;
}
function townPlan(C, G) {
  const W = new Map(), AIR = 0;
  const GRASS = BLK('잔디 블록'), ROAD = BLK('도로', '돌'), GLASS = BLK('유리'), WIN = BLK('빛나는 창', '유리'), BRICK = BLK('돌벽돌'), PLANK = BLK('판자');
  const LAMPB = BLK('등불'), IRON = BLK('철 블록'), FLAG = BLK('태극기', '흰 벽'), BED = BLK('침대', '판자'), SHELF = BLK('책장', '판자'), BOARD = BLK('칠판', '돌'), TILE = BLK('실험실 타일', '흰 벽');
  const put = (dx, dy, dz, id) => { const x = C.x + dx, y = G + dy, z = C.z + dz; W.set(x + ',' + y + ',' + z, [x, y, z, id]); };
  const box = (x1, y1, z1, x2, y2, z2, id) => { for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++) put(x, y, z, id); };
  const ring = (x1, z1, x2, z2, y1, y2, id) => { box(x1, y1, z1, x2, y2, z1, id); box(x1, y1, z2, x2, y2, z2, id); box(x1, y1, z1, x1, y2, z2, id); box(x2, y1, z1, x2, y2, z2, id); };
  const lampPost = (dx, dz) => { box(dx, 0, dz, dx, 2, dz, IRON); put(dx, 3, dz, LAMPB); };
  // 땅 고르기: 잔디 한 줄 · 위는 비움
  box(-TOWN_X, -1, -TOWN_Z, TOWN_X, -1, TOWN_Z, GRASS);
  box(-TOWN_X, 0, -TOWN_Z, TOWN_X, 22, TOWN_Z, AIR);
  // 🛣 큰길 (동서) · 가운데 점선
  box(-TOWN_X, -1, -2, TOWN_X, -1, 2, ROAD);
  for (let dx = -TOWN_X; dx <= TOWN_X; dx++) if (((dx % 4) + 4) % 4 < 2) put(dx, -1, 0, T_LINE);
  // 🏙 도시: 보도 · 남북 길 · 빌딩 4채 · 가로등 · 태극기
  box(-17, -1, -TOWN_Z, 17, -1, TOWN_Z, T_CONC);
  box(-TOWN_X, -1, -2, TOWN_X, -1, 2, ROAD);
  box(-2, -1, -TOWN_Z, 2, -1, TOWN_Z, ROAD);
  for (let dz = -TOWN_Z; dz <= TOWN_Z; dz++) if (Math.abs(dz) > 2 && ((dz % 4) + 4) % 4 < 2) put(0, -1, dz, T_LINE);
  for (let dx = -16; dx <= 16; dx++) if (Math.abs(dx) > 2 && ((dx % 4) + 4) % 4 < 2) put(dx, -1, 0, T_LINE);
  const tower = (sx, sz, h, wall) => {
    const ax = Math.min(sx * 5, sx * 14), bx = Math.max(sx * 5, sx * 14), az = Math.min(sz * 5, sz * 14), bz = Math.max(sz * 5, sz * 14);
    box(ax, -1, az, bx, -1, bz, PLANK);
    for (let y = 0; y < h; y++) for (let x = ax; x <= bx; x++) for (let z = az; z <= bz; z++) {
      if (x !== ax && x !== bx && z !== az && z !== bz) continue;
      const corner = (x === ax || x === bx) && (z === az || z === bz), f = y % 4;
      put(x, y, z, !corner && (f === 1 || f === 2) && (x + z) % 3 !== 0 ? ((y >> 2) % 2 ? WIN : GLASS) : wall);
    }
    for (let y = 4; y < h; y += 4) box(ax + 1, y, az + 1, bx - 1, y, bz - 1, PLANK);
    for (let y = 3; y < h; y += 4) put((ax + bx) >> 1, y, (az + bz) >> 1, LAMPB);
    box(ax, h, az, bx, h, bz, T_CONC); put((ax + bx) >> 1, h + 1, (az + bz) >> 1, LAMPB);
    const dz = sz > 0 ? az : bz, mx = (ax + bx) >> 1; box(mx, 0, dz, mx + 1, 2, dz, AIR); // 큰길 쪽 문
    const lz = sz > 0 ? az + 1 : bz - 1; box(ax + 1, 0, lz, ax + 1, h, lz, LAD_W); // 🪜 구석 사다리: 층마다 · 옥상까지
  };
  tower(1, 1, 16, T_WHITE); tower(-1, 1, 12, BRICK); tower(1, -1, 20, T_CONC); tower(-1, -1, 8, T_WHITE);
  for (const d of [-14, -8, 8, 14]) { lampPost(d, 3); lampPost(d, -3); lampPost(3, d); lampPost(-3, d); }
  box(4, 0, -4, 4, 5, -4, IRON); put(4, 6, -4, FLAG);
  box(-17, 0, -22, -15, 0, -21, PLANK); put(-17, 1, -22, PLANK); // 🕶 뒷골목 (불법 거래 상인 자리)
  // 🚓 경찰서 (동쪽 · 큰길 북쪽): 파란 벽 · 줄무늬 · 마크 · 접수대 · 유치장 3칸 · 주차장
  box(20, -1, 3, 36, -1, 4, T_CONC);
  box(21, -1, 5, 35, -1, 17, TILE);
  for (let y = 0; y <= 5; y++) for (let x = 21; x <= 35; x++) for (let z = 5; z <= 17; z++) {
    if (x !== 21 && x !== 35 && z !== 5 && z !== 17) continue;
    const corner = (x === 21 || x === 35) && (z === 5 || z === 17);
    put(x, y, z, y === 3 ? T_STRIPE : !corner && (y === 1 || y === 2) && x % 3 !== 0 && z % 3 !== 0 ? GLASS : T_POLICE);
  }
  box(21, 6, 5, 35, 6, 17, T_CONC); ring(21, 5, 35, 17, 7, 7, T_WHITE);
  for (const [x, z] of [[21, 5], [35, 5], [21, 17], [35, 17]]) put(x, 8, z, LAMPB);
  box(27, 0, 5, 29, 2, 5, AIR); put(28, 4, 5, T_BADGE); put(27, 4, 5, T_STRIPE); put(29, 4, 5, T_STRIPE);
  box(23, 0, 9, 33, 0, 9, PLANK); put(28, 0, 9, AIR); // 접수대
  box(22, 0, 12, 34, 2, 12, JAIL_BARS); box(25, 0, 13, 25, 2, 16, IRON); box(29, 0, 13, 29, 2, 16, IRON); // 유치장 (부술 수 없는 철창)
  put(23, 0, 16, BED); put(27, 0, 16, BED); put(32, 0, 16, BED);
  put(24, 5, 8, LAMPB); put(32, 5, 8, LAMPB); put(28, 5, 14, LAMPB);
  box(22, 0, 6, 22, 6, 6, LAD_W); // 🪜 옥상 사다리
  box(21, -1, -5, 35, -1, -16, ROAD);
  for (let x = 21; x <= 36; x += 3) box(x, -1, -9, x, -1, -14, T_LINE);
  lampPost(20, -5); lampPost(36, -5); lampPost(20, -16); lampPost(36, -16);
  // 🪖 군부대 (서쪽): 담 · 정문 · 망루 4개 · 막사 · 사령부 · 헬기장 · 사격장 · 태극기
  box(-45, -1, -21, -23, -1, 21, GRASS); box(-45, -1, -2, -23, -1, 2, ROAD);
  ring(-46, -22, -22, 22, 0, 3, T_CAMO); ring(-46, -22, -22, 22, 4, 4, T_CONC);
  box(-22, -1, -2, -22, -1, 2, T_DESERT); box(-22, 0, -2, -22, 4, 2, AIR); box(-22, 0, -3, -22, 5, -3, T_CONC); box(-22, 0, 3, -22, 5, 3, T_CONC); put(-22, 6, -3, LAMPB); put(-22, 6, 3, LAMPB);
  box(-20, 0, -6, -20, 1, -4, T_SAND); box(-20, 0, 4, -20, 1, 6, T_SAND);
  for (const [x, z] of [[-45, -21], [-45, 21], [-23, -21], [-23, 21]]) {
    box(x - 1, 0, z - 1, x + 1, 6, z + 1, T_CONC); box(x - 2, 7, z - 2, x + 2, 7, z + 2, PLANK);
    ring(x - 2, z - 2, x + 2, z + 2, 8, 8, T_SAND); put(x, 8, z, LAMPB);
    const s = z < 0 ? 1 : -1; box(x, 0, z + 2 * s, x, 8, z + 2 * s, s > 0 ? LAD_N : LAD_S); // 🪜 망루 사다리 (부대 안쪽)
  }
  box(-44, -1, 6, -34, -1, 18, PLANK); // 막사
  for (let y = 0; y <= 4; y++) for (let x = -44; x <= -34; x++) for (let z = 6; z <= 18; z++) {
    if (x !== -44 && x !== -34 && z !== 6 && z !== 18) continue;
    put(x, y, z, y === 2 && (x + z) % 2 === 0 && !((x === -44 || x === -34) && (z === 6 || z === 18)) ? GLASS : T_CAMO);
  }
  box(-44, 5, 6, -34, 5, 18, T_CONC); box(-40, 0, 6, -38, 2, 6, AIR);
  for (const z of [9, 11, 13, 15, 17]) { put(-43, 0, z, BED); put(-35, 0, z, BED); }
  put(-39, 4, 10, LAMPB); put(-39, 4, 15, LAMPB);
  box(-31, -1, 7, -24, -1, 15, T_CONC); box(-30, -1, 9, -30, -1, 13, T_LINE); box(-26, -1, 9, -26, -1, 13, T_LINE); box(-30, -1, 11, -26, -1, 11, T_LINE); // 헬기장 H
  for (const [x, z] of [[-31, 7], [-24, 7], [-31, 15], [-24, 15]]) put(x, 0, z, LAMPB);
  box(-44, -1, -18, -33, -1, -7, TILE); // 사령부
  for (let y = 0; y <= 6; y++) for (let x = -44; x <= -33; x++) for (let z = -18; z <= -7; z++) {
    if (x !== -44 && x !== -33 && z !== -18 && z !== -7) continue;
    const corner = (x === -44 || x === -33) && (z === -18 || z === -7);
    put(x, y, z, y === 3 ? T_CAMO : !corner && (y === 1 || y === 2 || y === 4 || y === 5) && (x + z) % 3 !== 0 ? GLASS : T_CONC);
  }
  box(-44, 7, -18, -33, 7, -7, T_CAMO); box(-40, 0, -7, -38, 2, -7, AIR); put(-39, 4, -7, T_ARMY);
  box(-40, 1, -18, -37, 2, -18, BOARD); box(-43, 0, -16, -43, 1, -9, SHELF); box(-41, 0, -13, -36, 0, -13, PLANK);
  put(-41, 6, -10, LAMPB); put(-36, 6, -15, LAMPB);
  box(-43, 0, -8, -43, 7, -8, LAD_W); // 🪜 사령부 옥상 사다리
  box(-36, 0, -5, -36, 5, -5, IRON); put(-36, 6, -5, FLAG);
  box(-30, 0, -8, -24, 0, -8, T_SAND); box(-30, 0, -20, -24, 2, -20, T_SAND); // 사격장: 사대 · 뒤쪽 흙벽
  for (const x of [-29, -27, -25]) { put(x, 0, -18, PLANK); put(x, 1, -18, T_TARGET); }
  return [...W.values()];
}
// 🏠 집: 도시 남북 끝에 7채 · 인게임 동전으로 사요 (/집 사기) · 산 집은 주인 · OP만 부수거나 놓을 수 있어요
const T_SALE = CB.block({ id: 1912, key: 'town_sale', name: '매물 표시', paint: (u, v, x, y) => { const roof = y >= 3 && y <= 7 && Math.abs(x - 7.5) <= y - 2.5, body = y >= 8 && y <= 13 && x >= 4 && x <= 11, door = y >= 10 && y <= 13 && x >= 7 && x <= 8; return door ? [30, 110, 50] : roof || body ? [250, 250, 240] : [40, 160, 70]; } });
const T_SOLD = CB.block({ id: 1913, key: 'town_sold', name: '내 집 표시', paint: (u, v, x, y) => { const roof = y >= 3 && y <= 7 && Math.abs(x - 7.5) <= y - 2.5, body = y >= 8 && y <= 13 && x >= 4 && x <= 11, door = y >= 10 && y <= 13 && x >= 7 && x <= 8; return door ? [140, 40, 40] : roof || body ? [250, 230, 200] : [190, 60, 50]; } });
const HOUSE_PRICE = 20; // 인게임 동전
const HOUSE_SLOTS = [[-16, 1], [-9, 1], [4, 1], [11, 1], [-9, -1], [4, -1], [11, -1]]; // [서쪽 x, 북(1)/남(-1)] · 남서쪽은 뒷골목
function housePlan(C, G) {
  const L = [], H = [], AIR = 0;
  const PLANK = BLK('판자'), BRICK = BLK('돌벽돌'), LOG = BLK('원목', '판자'), GLASS = BLK('유리'), BED = BLK('침대', '판자'), BENCH = BLK('작업대', '판자'), LAMPB = BLK('등불');
  const put = (x, y, z, id) => L.push([C.x + x, G + y, C.z + z, id]);
  const box = (x1, y1, z1, x2, y2, z2, id) => { for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++) put(x, y, z, id); };
  HOUSE_SLOTS.forEach(([ax, sz], i) => {
    const bx = ax + 5, az = sz > 0 ? 17 : -22, bz = az + 5, front = sz > 0 ? az : bz, back = sz > 0 ? bz : az, mx = ax + 2, wall = [BRICK, PLANK, T_WHITE][i % 3];
    box(ax, -1, az, bx, -1, bz, PLANK); box(ax, 0, az, bx, 5, bz, AIR);
    for (let y = 0; y <= 3; y++) for (let x = ax; x <= bx; x++) for (let z = az; z <= bz; z++) {
      if (x !== ax && x !== bx && z !== az && z !== bz) continue;
      const corner = (x === ax || x === bx) && (z === az || z === bz), win = (y === 1 || y === 2) && !corner && ((x === ax || x === bx) ? (z === az + 2 || z === az + 3) : (z === back && (x === ax + 2 || x === ax + 3)));
      put(x, y, z, corner ? LOG : win ? GLASS : wall);
    }
    box(ax, 4, az, bx, 4, bz, BRICK); box(ax + 1, 5, az + 1, bx - 1, 5, bz - 1, PLANK);
    box(mx, 0, front, mx, 1, front, AIR); put(mx, 2, front, T_SALE); // 문 · 매물 표시
    put(ax + 1, 0, back - sz, BED); put(bx - 1, 0, back - sz, CHEST); put(bx - 1, 0, front + sz, BENCH); put(mx, 3, (az + bz) >> 1, LAMPB);
    H.push({ n: i + 1, x1: C.x + ax, x2: C.x + bx, z1: C.z + az, z2: C.z + bz, y: G, mark: [C.x + mx, G + 2, C.z + front], door: { x: C.x + mx + 0.5, y: G, z: C.z + front - sz + 0.5 }, owner: null });
  });
  return { L, H };
}
function buildHouses(C, G) { // 다시 지어도 집주인은 그대로
  const P = housePlan(C, G), old = S.houses || [];
  P.H.forEach((h, i) => { if (old[i] && old[i].owner) { h.owner = old[i].owner; P.L.push([...h.mark, T_SOLD]); } });
  CB.setBlocks(P.L);
  S.houses = P.H; save();
}
function setMark(v) { if (CB.setBlocks && CB.loaded(v.x, v.z)) CB.setBlocks([[v.x, v.y, v.z, v.sold ? T_SOLD : T_SALE]]); }
function houseMark(h, sold) { const v = { x: h.mark[0], y: h.mark[1], z: h.mark[2], sold: sold ? 1 : 0 }; setMark(v); CB.send('org-mark', v); } // 문 위 표시: 초록(매물) ↔ 빨강(주인 있음)
const houseAt = (x, y, z) => (S.houses || []).find((h) => x >= h.x1 && x <= h.x2 && z >= h.z1 && z <= h.z2 && y >= h.y - 1 && y <= h.y + 6);
const myHouse = (n) => (S.houses || []).find((h) => h.owner === n);
CB.guard && CB.guard((kind, x, y, z) => { // 남의 집 · 아직 안 팔린 집은 주인 · OP만
  const h = houseAt(x, y, z);
  if (!h || h.owner === me() || CB.isOp()) return '';
  return h.owner ? `${h.owner} 님의 집이에요` : `${h.n}번 집은 아직 안 팔렸어요 · /집 사기 ${h.n} (동전 ${HOUSE_PRICE}개)`;
});
function groundAt(x, z) { // 나무는 건너뛰고 땅 높이 · 물이면 wet
  const W = CB.id('물'), soft = new Set([0, CB.id('나뭇잎'), CB.id('원목')].filter((v) => v != null));
  for (let y = 100; y > 0; y--) { const b = CB.getBlock(x, y, z); if (b == null || b < 0) return null; if (soft.has(b)) continue; return { y: y + 1, wet: b === W }; }
  return null;
}
function townSite() { // 빈 땅 찾기: 부활 자리 둘레 후보 중 다 불러와졌고 · 사람이 거의 안 바꾼 곳 · 물이 가장 적은 곳 (섬이면 물을 메워서라도)
  const sp = CB.spawnPos(), sx = Math.floor(sp.x), sz = Math.floor(sp.z);
  let best = null, waiting = false;
  for (const [ox, oz] of [[0, 46], [0, -46], [46, 46], [-46, 46], [46, -46], [-46, -46], [0, 96], [0, -96], [100, 0], [-100, 0]]) {
    const cx = sx + ox, cz = sz + oz;
    let ok = true;
    for (let x = cx - TOWN_X; x <= cx + TOWN_X + 15 && ok; x += 16) for (let z = cz - TOWN_Z; z <= cz + TOWN_Z + 15 && ok; z += 16) if (!CB.loaded(Math.min(x, cx + TOWN_X), Math.min(z, cz + TOWN_Z))) ok = false;
    if (!ok) { if (!ox && Math.abs(oz) <= 46) waiting = true; continue; } // 가장 가까운 두 후보(남 · 북)만 기다림
    if (CB.edited(cx - TOWN_X, cz - TOWN_Z, cx + TOWN_X, cz + TOWN_Z) > 60) continue;
    const H = [];
    let wet = 0, n = 0;
    for (let x = cx - TOWN_X; x <= cx + TOWN_X; x += 6) for (let z = cz - TOWN_Z; z <= cz + TOWN_Z; z += 6) { const g = groundAt(x, z); if (!g) continue; n++; if (g.wet) wet++; H.push(g.y); }
    if (!n) continue;
    H.sort((a, b) => a - b);
    const site = { x: cx, z: cz, y: H[H.length >> 1], wet: wet / n };
    if (site.wet <= 0.3) return site;
    if (!best || site.wet < best.wet) best = site;
  }
  return waiting ? null : best; // 가까운 후보가 아직 안 불러와졌으면 기다림
}
function buildTown(C, G) {
  if (!CB.setBlocks || !CB.loaded) return '이 게임 버전에서는 건물을 지을 수 없어요 (새로고침)';
  for (let x = C.x - TOWN_X; x <= C.x + TOWN_X + 15; x += 16) for (let z = C.z - TOWN_Z; z <= C.z + TOWN_Z + 15; z += 16) if (!CB.loaded(Math.min(x, C.x + TOWN_X), Math.min(z, C.z + TOWN_Z))) return '아직 그 땅이 다 불러와지지 않았어요 (방장 게임 근처여야 해요)';
  const L = townPlan(C, G), DIRT = BLK('흙'), soft = new Set([0, CB.id('물'), CB.id('나뭇잎'), CB.id('원목'), CB.id('용암')].filter((v) => v != null));
  for (let dx = -TOWN_X; dx <= TOWN_X; dx++) for (let dz = -TOWN_Z; dz <= TOWN_Z; dz++) for (let y = G - 2; y > G - 18; y--) { // 아래 빈 곳 · 물은 흙으로 메움
    if (!soft.has(CB.getBlock(C.x + dx, y, C.z + dz))) break;
    L.push([C.x + dx, y, C.z + dz, DIRT]);
  }
  L.push(...wallPlan(C, G), ...campPlan(C, G), ...foodPlan(C, G), ...bankPlan(C, G));
  CB.setBlocks(L);
  cityFoodDone(C, G);
  const again =!!(S.town && S.town.x === C.x && S.town.z === C.z);
  buildHouses(C, G);
  S.town = { x: C.x, y: G, z: C.z }; S.townV = TOWN_V;
  CB.setSpawn(C.x + 0.5, G + 0.1, C.z + 0.5); // 🏙 스폰 = 도시 한가운데
  const at = (dx, dz) => ({ x: C.x + dx + 0.5, y: G, z: C.z + dz + 0.5 });
  const B = { '경찰': at(28, 7), '육군': at(-30, 0), '의무병': at(-30, 0), '군사경찰': at(-30, 0), '특수임무대': at(-30, 0), '장교': at(-39, -10), '교육사': at(-39, -10), 'MP사령관': at(-39, -10), '교육사령관': at(-39, -10), '부사령관': at(-39, -10), '총사령관': at(-39, -10) };
  for (const o in B) if (!S.base[o]) S.base[o] = B[o];
  if (!S.dealerSet) S.dealer = { ...at(-16, -20), dim: 'over' };
  save();
  CB.say(again ? '🏙 도시를 새로 고쳤어요 (🪜 건물마다 위층 · 옥상 사다리)' : '🏙 도시 · 🚓 경찰서 · 🪖 군부대가 생겼어요! /도시 로 위치를 볼 수 있어요');
  return '';
}
// ── 🪖 CLKKY ARMY 기지 (서쪽 성벽 밖 · 120×112칸): 생활관 · 회의실 · 의료센터 · 교도소 · 총기 교체소 · 교육소 · 긴급 집합소 · 헬기장 · 구급차 ──
const T_NAVY = CB.block({ id: 1916, key: 'army_navy', name: '해군 벽', paint: (u, v, x, y) => { const k = 0.92 + 0.08 * Math.sin(x * 5.1 + y * 7.3); return y === 0 || y === 15 ? [230, 230, 230] : [26 * k, 38 * k, 72 * k]; } });
const T_AIRF = CB.block({ id: 1917, key: 'army_airforce', name: '공군 벽', paint: (u, v, x, y) => { const k = 0.93 + 0.07 * Math.sin(x * 6.7 + y * 4.1); return [96 * k, 124 * k, 160 * k]; } });
const T_REDX = CB.block({ id: 1918, key: 'army_redcross', name: '적십자 표시', paint: (u, v, x, y) => ((x >= 6 && x <= 9 && y >= 2 && y <= 13) || (y >= 6 && y <= 9 && x >= 2 && x <= 13) ? [214, 30, 30] : [244, 244, 244]) });
const T_SIREN = CB.block({ id: 1919, key: 'army_siren', name: '경광등', glow: true, light: true, paint: (u, v, x, y) => (x < 8 ? [240, 40, 40] : [40, 90, 240]) });
const ANX = [ // [이름, x1, z1, x2, z2, 높이, 종류, 벽] · 북쪽(z<0) 건물은 문이 남쪽(+z) · 남쪽 건물은 문이 북쪽(-z)
  ['🪖 육군 생활관 · 1사단', -64, -20, -50, -6, 6, 'bar', 'camo'], ['⚓ 해군 생활관 · 2사단', -82, -20, -68, -6, 6, 'bar', 'navy'], ['✈ 공군 생활관 · 3사단', -100, -20, -86, -6, 6, 'bar', 'air'],
  ['🛡 군사경찰 생활관', -124, -20, -110, -6, 6, 'bar', 'mp'], ['📘 교육부 생활관', -142, -20, -128, -6, 6, 'bar', 'camo'], ['⛓ 5사단 교도소', -163, -21, -146, -6, 6, 'jail', 'iron'],
  ['⚜ 사령관 회의실', -64, -38, -52, -26, 6, 'meet', 'conc'], ['🎖 고위 간부 회의실', -80, -38, -68, -26, 6, 'meet', 'conc'], ['📋 부사관 회의실', -96, -38, -84, -26, 5, 'meet', 'camo'],
  ['🛡 AFMPC 회의실', -122, -38, -110, -26, 6, 'meet', 'mp'], ['🎯 특임대 작전 회의소', -138, -38, -126, -26, 5, 'ops', 'mp'], ['🔫 총기 교체소', -156, -38, -144, -26, 5, 'arms', 'conc'],
  ['📚 교육소', -100, -54, -84, -42, 6, 'class', 'camo'],
  ['🩹 군사경상의료센터', -64, 6, -50, 20, 6, 'med', 'white'], ['🏥 군사중상의료센터', -82, 6, -68, 20, 7, 'med', 'white'], ['🚑 군사권역외상센터', -100, 6, -86, 20, 8, 'med', 'white'],
  ['🩺 군사응급수술센터', -124, 6, -110, 20, 7, 'surg', 'white'], ['♿ 군사재활치료센터', -142, 6, -128, 20, 6, 'med', 'white'],
  ['🦅 해병대 생활관 · 4사단', -124, 26, -110, 40, 6, 'bar', 'marine'],
];
const ANX_OPEN = [['📣 긴급 집합소', -70, -48], ['🚁 헬기장', -121, -48], ['🚑 구급차 주차장', -57, 31], ['🚁 의무 헬기장', -76, 34]]; // 간판만 (건물 없는 곳)
function annexVeh(put, skip, x0, z0, kind) { // 🚑 구급차 · 🚁 헬기: 블록으로 지은 탈것 (엔진을 우클릭하면 타요) · 바퀴 · 받침 밑은 땅을 안 깔아요 (탈것에 땅이 붙지 않게)
  const WH = T_WHITE, GL = BLK('유리'), IRON = BLK('철 블록'), ENG = BLK(kind === 'amb' ? '자동차 엔진' : '비행기 엔진'), WHEEL = BLK('바퀴'), STEER = BLK('핸들'), SEAT = BLK('드라이브 쿠션');
  if (kind === 'amb') { // 길이 7 (x) · 폭 3 (z) · 앞이 +x
    for (const x of [1, 5]) for (const z of [0, 2]) { put(x0 + x, 0, z0 + z, WHEEL); skip(x0 + x, z0 + z); }
    for (let x = 0; x <= 6; x++) for (let z = 0; z <= 2; z++) put(x0 + x, 1, z0 + z, WH);
    for (let x = 0; x <= 4; x++) for (let z = 0; z <= 2; z++) for (let y = 2; y <= 4; y++) put(x0 + x, y, z0 + z, y === 2 && z !== 1 ? T_REDX : WH);
    put(x0 + 2, 3, z0, T_REDX); put(x0 + 2, 3, z0 + 2, T_REDX); put(x0, 3, z0 + 1, GL); put(x0 + 2, 2, z0 + 1, ENG);
    put(x0 + 5, 2, z0 + 1, SEAT); put(x0 + 6, 2, z0 + 1, STEER); for (const z of [0, 2]) { put(x0 + 5, 2, z0 + z, WH); put(x0 + 6, 2, z0 + z, WH); put(x0 + 5, 3, z0 + z, GL); }
    for (let z = 0; z <= 2; z++) { put(x0 + 6, 3, z0 + z, GL); put(x0 + 5, 4, z0 + z, WH); put(x0 + 6, 4, z0 + z, WH); }
    put(x0 + 5, 5, z0, T_SIREN); put(x0 + 5, 5, z0 + 2, T_SIREN);
    return;
  }
  const B = kind === 'medheli' ? WH : T_CAMO; // 🚁 헬기: 몸통 5 · 꼬리 4 · 받침 · 회전날개 (앞이 +x)
  for (let x = 0; x <= 4; x++) for (const z of [0, 2]) { put(x0 + x, 0, z0 + z, IRON); skip(x0 + x, z0 + z); }
  for (let x = 0; x <= 4; x++) for (let z = 0; z <= 2; z++) put(x0 + x, 1, z0 + z, x === 3 && z === 1 ? SEAT : x === 4 && z === 1 ? STEER : B);
  for (let x = 0; x <= 2; x++) for (let z = 0; z <= 2; z++) for (let y = 2; y <= 3; y++) put(x0 + x, y, z0 + z, B);
  put(x0 + 1, 2, z0 + 1, ENG); for (const z of [0, 2]) { put(x0 + 3, 2, z0 + z, B); put(x0 + 4, 2, z0 + z, GL); } put(x0 + 4, 2, z0 + 1, GL);
  for (let x = 3; x <= 4; x++) for (let z = 0; z <= 2; z++) put(x0 + x, 3, z0 + z, GL);
  if (kind === 'medheli') { put(x0 + 1, 2, z0, T_REDX); put(x0 + 1, 2, z0 + 2, T_REDX); }
  for (let x = -4; x <= -1; x++) put(x0 + x, 2, z0 + 1, B); put(x0 - 4, 3, z0 + 1, B); put(x0 - 4, 4, z0 + 1, B); put(x0 - 4, 3, z0 + 2, IRON); // 꼬리 · 꼬리 날개
  put(x0 + 1, 4, z0 + 1, IRON); for (let k = -4; k <= 4; k++) { put(x0 + 1 + k, 5, z0 + 1, IRON); put(x0 + 1, 5, z0 + 1 + k, IRON); } // 회전날개
}
function annexPlan(C, G) {
  const W = new Map(), AIR = 0, noGround = new Set(), x1 = ANX_X1, x2 = -47, Z = ANX_Z;
  const GRASS = BLK('잔디 블록'), ROAD = BLK('도로', '돌'), GLASS = BLK('유리'), PLANK = BLK('판자'), LAMPB = BLK('등불'), IRON = BLK('철 블록'), FLAG = BLK('태극기', '흰 벽');
  const BED = BLK('침대', '판자'), SHELF = BLK('책장', '판자'), BOARD = BLK('칠판', '돌'), TILE = BLK('실험실 타일', '흰 벽');
  const put = (dx, dy, dz, id) => { const x = C.x + dx, y = G + dy, z = C.z + dz; W.set(x + ',' + y + ',' + z, [x, y, z, id]); };
  const box = (ax, ay, az, bx, by, bz, id) => { for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) for (let z = Math.min(az, bz); z <= Math.max(az, bz); z++) put(x, y, z, id); };
  const skip = (dx, dz) => noGround.add(dx + ',' + dz);
  // 땅 고르기 · 담 · 망루 · 길 (탈것 자리는 마지막에 땅을 빼요)
  box(x1, 0, -Z, x2, 16, Z, AIR);
  for (let x = x1; x <= x2; x++) for (let z = -Z; z <= Z; z++) put(x, -1, z, GRASS);
  for (let x = x1; x <= x2; x++) for (let z = -Z; z <= Z; z++) if (x === x1 || x === x2 || Math.abs(z) === Z) { for (let y = 0; y <= 3; y++) put(x, y, z, T_CAMO); put(x, 4, z, T_CONC); }
  box(x2, 0, -2, -46, 4, 2, AIR); box(x2, -1, -2, -46, -1, 2, ROAD); // 🚪 기지 문 (도시 안 본부와 이어짐)
  box(x1 + 1, -1, -2, x2, -1, 2, ROAD); for (let x = x1 + 1; x <= x2; x++) if (((x % 4) + 4) % 4 < 2) put(x, -1, 0, T_LINE); // 큰길 (동서)
  box(-106, -1, -Z + 1, -104, -1, Z - 1, ROAD); // 남북 길
  box(x1 + 1, -1, -24, x2 - 1, -1, -23, ROAD); box(x1 + 1, -1, -41, x2 - 1, -1, -40, ROAD); box(x1 + 1, -1, 23, x2 - 1, -1, 24, ROAD); // 옆길
  for (const [x, z] of [[x1 + 1, -Z + 1], [x1 + 1, Z - 1], [x2 - 1, -Z + 1], [x2 - 1, Z - 1]]) { box(x - 1, 0, z - 1, x + 1, 7, z + 1, T_CONC); box(x - 2, 8, z - 2, x + 2, 8, z + 2, PLANK); put(x, 9, z, LAMPB); } // 망루
  for (let x = x1 + 6; x < x2; x += 12) { box(x, 0, 3, x, 2, 3, IRON); put(x, 3, 3, LAMPB); box(x, 0, -3, x, 2, -3, IRON); put(x, 3, -3, LAMPB); } // 가로등
  // 🏢 건물
  const WALL = { camo: T_CAMO, navy: T_NAVY, air: T_AIRF, marine: T_CAMO, mp: T_CONC, conc: T_CONC, white: T_WHITE, iron: IRON };
  for (const [, ax, az, bx, bz, h, kind, wk] of ANX) {
    const wall = WALL[wk] || T_CONC, med = kind === 'med' || kind === 'surg', door = az < 0 ? bz : az, inw = door === bz ? -1 : 1, mx = (ax + bx) >> 1; // inw: 문에서 안쪽으로 가는 방향
    box(ax, -1, az, bx, -1, bz, med ? TILE : PLANK);
    for (let y = 0; y < h; y++) for (let x = ax; x <= bx; x++) for (let z = az; z <= bz; z++) {
      if (x !== ax && x !== bx && z !== az && z !== bz) continue;
      const corner = (x === ax || x === bx) && (z === az || z === bz);
      put(x, y, z, !corner && (y === 1 || y === 2) && (x + z) % 3 !== 0 && kind !== 'jail' ? GLASS : wk === 'mp' && y === h - 2 ? T_STRIPE : wall);
    }
    box(ax, h, az, bx, h, bz, wk === 'navy' ? T_NAVY : T_CONC); put(mx, h - 1, (az + bz) >> 1, LAMPB); put(mx - 4, h - 1, (az + bz) >> 1, LAMPB); put(mx + 4, h - 1, (az + bz) >> 1, LAMPB);
    box(mx, 0, door, mx + 1, 2, door, AIR); // 문 (길 쪽)
    if (med) { put(mx - 2, 2, door, T_REDX); put(mx + 3, 2, door, T_REDX); put(mx, h, (az + bz) >> 1, T_REDX); }
    if (wk === 'mp') { put(mx - 2, 2, door, T_BADGE); put(mx + 3, 2, door, T_BADGE); }
    if (wk === 'camo' || wk === 'navy' || wk === 'air' || wk === 'marine') { put(mx - 2, 2, door, T_ARMY); put(mx + 3, 2, door, T_ARMY); }
    const back = door === bz ? az : bz;
    const nb = back - inw; // 뒷벽 바로 안쪽
    if (kind === 'bar') for (let x = ax + 1; x <= bx - 1; x += 2) { if (x !== mx && x !== mx + 1) put(x, 0, door + inw, BED); put(x, 0, nb, BED); } // 침대 두 줄
    if (kind === 'bar') { put(ax + 1, 0, (az + bz) >> 1, CHEST); put(bx - 1, 0, (az + bz) >> 1, CHEST); }
    if (kind === 'meet' || kind === 'ops') { box(ax + 3, 0, (az + bz) >> 1, bx - 3, 0, (az + bz) >> 1, PLANK); box(mx - 1, 1, nb, mx + 2, 2, nb, BOARD); put(ax + 1, 0, nb, SHELF); put(bx - 1, 0, nb, SHELF); }
    if (kind === 'ops') put(mx, 1, (az + bz) >> 1, T_TARGET);
    if (kind === 'class') { box(mx - 2, 1, nb, mx + 3, 2, nb, BOARD); for (let k = 3; k < Math.abs(bz - az) - 2; k += 2) for (let x = ax + 2; x <= bx - 2; x += 3) put(x, 0, door + inw * k, PLANK); } // 칠판 · 책상 줄
    if (kind === 'arms') { box(ax + 1, 0, door + inw * 3, bx - 1, 0, door + inw * 3, PLANK); for (let x = ax + 1; x <= bx - 1; x += 2) put(x, 0, nb, CHEST); box(ax + 1, 1, nb, bx - 1, 1, nb, IRON); }
    if (kind === 'med' || kind === 'surg') for (let x = ax + 2; x <= bx - 2; x += 3) { put(x, 0, nb, BED); if (kind === 'surg') put(x, 0, (az + bz) >> 1, T_WHITE); }
    if (kind === 'jail') { for (let x = ax + 1; x <= bx - 1; x++) box(x, 0, az + 6, x, 3, az + 6, JAIL_BARS); for (let x = ax + 4; x < bx; x += 4) box(x, 0, az + 1, x, 3, az + 5, IRON); for (let x = ax + 2; x < bx; x += 4) put(x, 0, az + 2, BED); }
  }
  // 📣 긴급 집합소 · 🚁 헬기장 · 🚑 구급차 주차장 · 🚁 의무 헬기장
  box(-80, -1, -54, -60, -1, -42, T_CONC); box(-72, 0, -53, -68, 0, -52, PLANK); box(-70, 0, -50, -70, 7, -50, IRON); put(-70, 8, -50, FLAG); for (let x = -78; x <= -62; x += 4) box(x, -1, -47, x, -1, -44, T_LINE);
  box(-130, -1, -54, -112, -1, -42, T_CONC); box(-124, -1, -51, -124, -1, -45, T_LINE); box(-118, -1, -51, -118, -1, -45, T_LINE); box(-124, -1, -48, -118, -1, -48, T_LINE);
  box(-64, -1, 26, -50, -1, 38, T_CONC); for (let x = -64; x <= -50; x += 5) box(x, -1, 26, x, -1, 38, T_LINE);
  box(-84, -1, 26, -68, -1, 42, T_CONC); box(-80, -1, 30, -72, -1, 38, T_REDX); box(-79, -1, 31, -73, -1, 37, T_CONC); // 의무 헬기장 (빨간 십자 테)
  annexVeh(put, skip, -63, 28, 'amb'); annexVeh(put, skip, -58, 33, 'amb'); annexVeh(put, skip, -123, -49, 'heli'); annexVeh(put, skip, -77, 33, 'medheli');
  for (const k of noGround) { const [dx, dz] = k.split(',').map(Number); W.delete((C.x + dx) + ',' + (G - 1) + ',' + (C.z + dz)); } // 탈것 밑 땅은 그대로 (땅이 탈것에 붙지 않게)
  return { L: [...W.values()], noGround };
}
function annexReady(C) { for (let x = C.x + ANX_X1; x <= C.x - 47 + 15; x += 16) for (let z = C.z - ANX_Z; z <= C.z + ANX_Z + 15; z += 16) if (!CB.loaded(Math.min(x, C.x - 47), Math.min(z, C.z + ANX_Z))) return false; return true; }
function buildAnnex(C, G) {
  const P = annexPlan(C, G), L = P.L, DIRT = BLK('흙'), soft = new Set([0, CB.id('물'), CB.id('나뭇잎'), CB.id('원목'), CB.id('용암')].filter((v) => v != null));
  for (let dx = ANX_X1; dx <= -47; dx++) for (let dz = -ANX_Z; dz <= ANX_Z; dz++) { if (P.noGround.has(dx + ',' + dz)) continue; for (let y = G - 2; y > G - 18; y--) { if (!soft.has(CB.getBlock(C.x + dx, y, C.z + dz))) break; L.push([C.x + dx, y, C.z + dz, DIRT]); } } // 아래 빈 곳 · 물은 흙으로
  CB.setBlocks(L);
  S.annex = { v: 1 };
  const at = (dx, dz) => ({ x: C.x + dx + 0.5, y: G, z: C.z + dz + 0.5 });
  Object.assign(S.base, { '육군': at(-57, -4), '해군': at(-75, -4), '공군': at(-93, -4), '군사경찰': at(-117, -4), '특수임무대': at(-117, -4), 'MP사령관': at(-117, -4), '장교': at(-135, -4), '교육사': at(-135, -4), '교육사령관': at(-135, -4), '의무병': at(-57, 4), '해병대': at(-117, 25) });
  save();
  CB.say(`🪖 ${ARMY_NAME} 기지가 생겼어요! (서쪽 성벽 밖 · 생활관 · 회의실 · 의료센터 · 교도소 · 헬기 · 구급차) · 🚑 🚁 는 엔진을 우클릭하면 타요`);
}
let townT = 0;
function townTick() { // 방장 게임: 아직 안 지었으면 빈 땅을 찾아 지음 (예전에 지은 도시에 집이 없으면 집만)
  if (!CB.isHost() || !CB.setBlocks || CB.dimNow() !== 'over') return;
  if (S.town) {
    if (S.townV >= 2 && S.townV < TOWN_V) { // 예전 도시 → 없는 것만 더하기 (안쪽에 지은 건 그대로 · 땅이 다 불러와지면)
      for (let x = S.town.x - TOWN_X; x <= S.town.x + TOWN_X + 15; x += 16) for (let z = S.town.z - TOWN_Z; z <= S.town.z + TOWN_Z + 15; z += 16) if (!CB.loaded(Math.min(x, S.town.x + TOWN_X), Math.min(z, S.town.z + TOWN_Z))) return;
      const L = S.townV < 4 ? wallPlan(S.town, S.town.y) : [];
      if (S.townV === 2) for (let dz = -2; dz <= 2; dz++) L.push([S.town.x - 22, S.town.y - 1, S.town.z + dz, T_DESERT]);
      if (S.townV < 5) L.push(...campPlan(S.town, S.town.y));
      const needFood = S.townV < 6; // 음식점이 이미 있으면 다시 안 지음 (요리사가 늘지 않게)
      if (needFood) L.push(...foodPlan(S.town, S.town.y));
      L.push(...bankPlan(S.town, S.town.y));
      CB.setBlocks(L); if (needFood) cityFoodDone(S.town, S.town.y); S.townV = TOWN_V; save();
      CB.say('🏙 도시에 새 건물이 생겼어요 (🏦 은행 · 💼 직업소개소)');
      return;
    }
    if (!S.village && S.townV === TOWN_V) { const s = villageSite(S.town); if (s != null) buildVillage(S.town, S.town.y, s); }
    for (let i = 0; i < 3; i++) if (!S.gates[i] && S.townV === TOWN_V && (i === 0 || S.village)) { // 성문 밖 길: 그쪽 땅이 불러와지면 지음
      const L = gatePlan(S.town, S.town.y, i);
      if (L) { CB.setBlocks(L); S.gates[i] = 1; save(); }
    }
    if (S.townV !== TOWN_V) { buildTown({ x: S.town.x, z: S.town.z }, S.town.y); return; } // 예전 도시 → 같은 자리에 새로 (땅이 다 불러와지면)
    if (!S.annex && S.townV === TOWN_V && annexReady(S.town)) { buildAnnex({ x: S.town.x, z: S.town.z }, S.town.y); return; } // 🪖 기지: 서쪽 땅이 다 불러와지면
    if (!S.houses && CB.loaded(S.town.x - 17, S.town.z - 23) && CB.loaded(S.town.x + 17, S.town.z + 23) && CB.loaded(S.town.x - 17, S.town.z + 23) && CB.loaded(S.town.x + 17, S.town.z - 23)) buildHouses({ x: S.town.x, z: S.town.z }, S.town.y);
    return;
  }
  const site = townSite(); if (!site) return;
  buildTown({ x: site.x, z: site.z }, site.y);
}

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
// 팀 사람들: 서버를 만든 사람(총사령관) + 저장된 사람들
const teamMembers = (o) => { const L = Object.keys(S.m).filter((n) => teamOf(n) === o); const ow = ownerNick(); if (o === '총사령관' && ow && !L.includes(ow)) L.unshift(ow); return L; };
CB.command('team', '/team 팀 @닉 (또는 /team @닉 팀) — 그 사람을 그 팀으로 (나보다 아래 계급 · OP) · /team 팀 — 내 팀 바꾸기 (소령 이상 · 장교 이상 · Owner) · /team — 팀 계급표', (a, c) => {
  if (!a.length) return CB.run('/조직 목록');
  if (!/^@/.test(a[a.length - 1]) && findOrg(a.join(' '))) return req('self', { o: a.join(' ') }); // 닉 없이 팀만 → 내 팀
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
    c.say(`🪖 팀 계급표 (위 → 아래) · ${ARMY_NAME} · ${POLICE_NAME}`);
    for (let i = TOP; i >= 0; i--) { const o = TEAMS[i].key, n = teamMembers(o).length, on = orgNameOf(o); c.say(`${i + 1}. ${ORGS[o].ico} ${on ? on + ' ' : ''}${tagOf(o)}${o === '시민' ? '' : ` · ${n}명`} · 점수 ${S.pts[o] || 0}${i === TOP ? ' · 서버를 만든 사람' : i >= OFFICER_LV ? ' · 지휘' : ''}`); }
    return;
  }
  const x = mine();
  c.say(`${ORGS[x.o].ico} ${tagOf(x.o)} (${ORGS[x.o].special ? (x.o === OUTLAW ? '수갑으로 잡히기 전엔 팀을 못 바꿔요' : '형기를 마치면 시민') : `${ORGS[x.o].lv + 1}/${TEAMS.length}번째 부서`}${rankOf(me()) ? ` · 🎖 군사계급 ${rankOf(me())}` : ''}) · 내 점수 ${x.p || 0} · 팀 점수 ${S.pts[x.o] || 0}`);
  if (x.o !== '시민') c.say('같은 팀: ' + teamMembers(x.o).join(', '));
  else c.say(`${ARMY_NAME}는 군부대 옆 입대소, ${POLICE_NAME}는 경찰서의 상담원에게 우클릭해서 지원해요 · /조직 목록`);
}, { everyone: true });
CB.command('도시', '/도시 — 🏙 도시 · 🚓 경찰서 · 🪖 군부대 위치 · /도시 짓기 (지금 자리에 새로 · OP)', (a, c) => {
  if (a[0] === '짓기') { const p = pos(); return req('town', { x: p.x, y: p.y, z: p.z }); }
  const T = S.town;
  if (!T) return c.say('🏙 아직 도시가 없어요 · 방장이 부활 자리 근처에 있으면 곧 저절로 지어져요 (OP는 /도시 짓기)');
  const f = (dx, dz) => `${T.x + dx}, ${T.y}, ${T.z + dz}`;
  c.say(`🏙 ${CITY_NAME} 한가운데: ${f(0, 0)}`);
  c.say(`🚓 ${POLICE_NAME} 경찰서: ${f(28, 7)} (도시 동쪽) · 🪖 ${ARMY_NAME} 군부대: ${f(-34, 0)} (도시 서쪽)`);
  c.say(`🏦 은행: ${f(41, -8)} · 💼 직업소개소: ${f(41, 17)} (도시 동쪽)`);
  c.say(`🍳 음식점: ${f(41, 8)} (도시 동쪽)${S.village ? ` · 🏘 마을: ${f(0, S.village.s * (TOWN_Z + VIL_D / 2))} (${S.village.s > 0 ? '북문' : '남문'} 밖)` : ''}`);
  c.say(`🪖 입대 상담원: ${f(-20, 11)} · 🎖 전역 상담원: ${f(-20, 9)} · 🏖 휴가 상담원: ${f(-20, 13)} (입대소 · 군부대 정문 옆 건물) · 🪖 복귀 상담원: ${f(-25, 4)} (군부대 정문 안쪽) · 🚓 경찰 상담원: ${f(25, 10)} (경찰서 접수대 뒤)`);
  c.say('🏕 /기지 로 우리 팀 기지(경찰서 · 군부대)로 갈 수 있어요');
}, { everyone: true });
const nearSpot = (dx, dz) => { const T = S.town, p = pos(); return !T || CB.isOp() || (CB.dimNow() === 'over' && Math.hypot(p.x - (T.x + dx), p.z - (T.z + dz)) <= 9); };
CB.command('은행', '/은행 — 🏦 잔액 · /은행 입금 [개수|전부] · /은행 출금 [개수|전부] (은행 안에서) · /은행 송금 @닉 개수', (a, c) => {
  const sub = a[0] || '', b = bal(me());
  if (!sub) return c.say(`🏦 통장 ${b}개 · 가방 ${CB.has(COIN) || 0}개 · 은행은 도시 동쪽 (/도시)`);
  if (sub === '송금') return req('bank-send', { who: a[1], n: Math.floor(+a[2]) || 0 });
  if (sub !== '입금' && sub !== '출금') return c.say('/은행 · /은행 입금 개수 · /은행 출금 개수 · /은행 송금 @닉 개수');
  if (!nearSpot(41.5, -8)) return c.say('🏦 입금 · 출금은 은행 안에서 해요 (/도시)');
  const all = a[1] === '전부', n = Math.floor(+a[1]) || 0;
  if (sub === '입금') return bankIn(all ? CB.has(COIN) : n);
  req('bank-out', { n: all ? b : n });
}, { everyone: true });
CB.command('직업', '/직업 — 💼 내 직업 · /직업 목록 · /직업 선택 이름 · /직업 그만 · /직업 납품 (직업소개소에서)', (a, c) => {
  const sub = a[0] || '', j = jobOf(me());
  if (sub === '목록') { for (const n in JOBS) c.say(`${JOBS[n].ico} ${n}: ${JOBS[n].d}`); return; }
  if (sub === '선택') return req('job-set', { j: a[1] || '-' });
  if (sub === '그만') return req('job-set', { j: '' });
  if (sub === '납품') return nearSpot(41.5, 17.5) ? jobSell() : c.say('📦 납품은 직업소개소에서 해요 (/도시)');
  c.say(j ? `💼 내 직업: ${JOBS[j].ico} ${j} · ${JOBS[j].d}` : '💼 지금 직업이 없어요 · 직업소개소 상담원에게 우클릭하거나 /직업 선택 이름 · /직업 목록');
}, { everyone: true });
CB.command('치료', '/치료 @닉 — 🩺 의사: 곁에 있는 사람 치료 (⛑ 의무병은 메디킷으로)', (a) => req('job-heal', { who: a[0] }), { everyone: true });
CB.command('뉴스', '/뉴스 내용 — 📰 기자: 모두에게 소식 전하기', (a) => req('job-news', { text: a.join(' ') }), { everyone: true });
CB.command('집', `/집 — 🏠 집 목록 · /집 사기 [번호] (동전 ${HOUSE_PRICE}개) · /집 팔기 (동전 ${HOUSE_PRICE / 2}개 돌려받음) · /집 가기 · /집 비우기 번호 (OP)`, (a, c) => {
  const L = S.houses || [], mine0 = myHouse(me());
  if (!L.length) return c.say('🏠 아직 집이 없어요 (도시가 생기면 같이 지어져요)');
  if (a[0] === '사기') {
    if (mine0) return c.say(`🏠 이미 ${mine0.n}번 집이 있어요 · /집 가기`);
    const p = pos(), n = +a[1];
    const h = n ? L[n - 1] : houseAt(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)) || L.filter((q) => !q.owner).sort((q, r) => Math.hypot(q.door.x - p.x, q.door.z - p.z) - Math.hypot(r.door.x - p.x, r.door.z - p.z))[0];
    if (!h) return c.say('🏠 그런 집이 없어요 · /집');
    if (h.owner) return c.say(`🏠 ${h.n}번 집은 이미 ${h.owner} 님의 집이에요`);
    if (!CB.take || !CB.take('동전', HOUSE_PRICE)) return c.say(`🪙 동전이 모자라요 (${HOUSE_PRICE}개 필요 · 지금 ${CB.has('동전')}개) · 주민과 거래해서 모아요`);
    c.say(`🪙 동전 ${HOUSE_PRICE}개를 냈어요 · ${h.n}번 집 사는 중…`);
    return req('house-buy', { n: h.n });
  }
  if (a[0] === '팔기') return mine0 ? req('house-sell') : c.say('🏠 내 집이 없어요');
  if (a[0] === '비우기') return req('house-sell', { n: +a[1] });
  if (a[0] === '가기') { if (!mine0) return c.say('🏠 내 집이 없어요 · /집 사기'); if (inBaseP) req('desert'); inBaseP = null; CB.tp(mine0.door.x, mine0.door.y + 0.2, mine0.door.z); return c.say(`🏠 ${mine0.n}번 집으로 왔어요`); }
  for (const h of L) c.say(`🏠 ${h.n}번 집 (${h.x1}, ${h.z1}) · ${h.owner ? '주인: ' + h.owner : `매물 · 동전 ${HOUSE_PRICE}개`}`);
  c.say(mine0 ? `내 집: ${mine0.n}번 · /집 가기` : '집 앞에서 /집 사기 (또는 /집 사기 번호) · 문 위 초록 표시가 매물이에요');
}, { everyone: true });
CB.command('외출', '/외출 — 외출 허가 목록 · /외출 @닉 [분] (허가 · 기본 10분 · 최대 60분) · /외출 취소 @닉 (장교(Officer) 이상 · 나보다 아래 계급 · OP)', (a, c) => {
  if (a[0] === '취소') return req('pass-cancel', { who: a[1] });
  if (a[0]) return req('pass', { who: a[0], min: a[1] });
  const L = Object.entries(S.leave);
  if (!L.length) return c.say('🪪 지금 외출 허가를 받은 사람이 없어요 · 장교(Officer) 이상이 /외출 @닉 으로 허가해요');
  for (const [n, v] of L) c.say(`🪪 ${n} · ${v.out ? '외출 중' : '허가됨'} · 남은 시간 ${mmss(v.sec || 0)} (${v.by})`);
}, { everyone: true });
CB.command('장비','/장비 — 내 팀 기본 장비 중 없는 것 다시 받기 (5분에 한 번)', () => req('rekit'), { everyone: true });
CB.command('상인', '/상인 — 🕶 불법 거래 상인 위치 · /상인 설정 (지금 자리로 · OP)', (a, c) => {
  if (a[0] === '설정') return req('dealer', { ...pos(), dim: CB.dimNow() });
  const D = dealerSpot();
  if (!D) return c.say('🕶 상인이 어디 있는지 아무도 몰라요…');
  c.say(`🏴 불법 거래 상인: ${Math.round(D.x)}, ${Math.round(D.y)}, ${Math.round(D.z)} 근처 · 🌙 밤에만 나와요 · 시민 · 무법자에게 무기를 팔아요 (동전) · 우클릭으로 거래`);
}, { everyone: true });
CB.command('진급', '/진급 @닉 — 🎖 군사계급 한 단계 위로 (군대 팀 · 장교(Officer) 이상 · OP) · 부서 이동은 /team', (a) => req('promote', { who: a[0] }), { everyone: true });
CB.command('강등', '/강등 @닉 — 🎖 군사계급 한 단계 아래로 (군대 팀 · 장교(Officer) 이상 · OP)', (a) => req('demote', { who: a[0] }), { everyone: true });
CB.command('계급', '/계급 — 🎖 계급표 · 군대 팀원들의 계급 · /계급 @닉 멤버|게스트|탈옥수|사형수 (OP)', (a, c) => {
  if (a[0] && a[1]) return req('status', { who: a[0], s: a[1] });
  const en = (r) => `${r}(${RANK_EN[r]})`;
  c.say(`🎖 ${ARMY_NAME} 계급 (위 → 아래): ` + [...RANKS].reverse().map(en).join(' · '));
  c.say('군대가 아닌 사람: ' + ['멤버', '게스트', '수감자', '탈옥수', '사형수'].map(en).join(' · ') + ' · 💬 디스코드 서버 가입자는 무조건 이등병 · 🏙 멤버 = 겜벗 공식 커뮤니티 CLKKY CITY 가입');
  const L = Object.keys(S.m).filter((n) => ARMY.includes(teamOf(n))).sort((p, q) => mrOf(q) - mrOf(p));
  if (ownerNick()) c.say(`👑 ${ownerNick()} · ${en(RANKS[RANKS.length - 1])} · 총사령관`);
  for (const n of L.slice(0, 30)) c.say(`🎖 ${n} · ${en(rankOf(n))} · ${ORGS[teamOf(n)].ico} ${tagOf(teamOf(n))}`);
  if (!L.length) c.say('아직 군대 팀원이 없어요');
}, { everyone: true });
CB.command('기지', '팀 기지로 이동 · /기지 설정 [팀] (장교(Officer) 이상)', (a, c) => {
  if (a[0] === '설정') return req('base', { ...pos(), o: a.slice(1).join(' ') });
  const x = mine(), b = S.base[x.o];
  if (!b) return c.say('아직 우리 팀 기지가 없어요 (장교(Officer) 이상이 /기지 설정)');
  inBaseP = null; CB.tp(b.x, b.y + 0.2, b.z); c.say('🏕 기지로 이동했어요');
}, { everyone: true });
CB.command('집합', '내 계급 이하 팀(경찰부터) 모두 내 자리로 (장교(Officer) 이상)', () => req('gather', pos()), { everyone: true });
CB.command('훈련', '훈련 열기: /훈련 사격 · /훈련 체력 (장교(Officer) 이상)', (a) => req('train', { kind: a[0], ...pos() }), { everyone: true });
CB.command('임무', '/임무 내용 · /임무 완료 @닉 · /임무 취소 (장교(Officer) 이상)', (a) => {
  if (a[0] === '완료') return req('mission-done', { who: a[1] });
  if (a[0] === '취소') return req('mission-cancel');
  req('mission', { text: a.join(' ') });
}, { everyone: true });

// ── 🚨 수배 · 체포 명령어 ──
CB.command('수배', '지명수배 목록 · /수배 @닉 등급(1 수갑대상 · 2 ★★ · 3 ★★★) 사유 · /수배 해제 @닉 (경찰 쪽 장교 이상 · OP)', (a, c) => {
  if (a[0] === '해제') return req('unwanted', { who: a[1] });
  if (a[0]) return req('wanted', { who: a[0], lv: a[1], why: a.slice(2).join(' ') });
  const L = Object.entries(S.w);
  if (!L.length) return c.say('지금 지명수배된 사람이 없어요');
  for (const [n, W] of L) c.say(`🚨 ${n} · ${stars(W.lv)} · ${GRADE[Math.min(WMAX, W.lv)]} · ${W.why}`);
}, { everyone: true });
CB.command('고소', '/고소 — 내 고소 목록 · /고소 취소 [@닉] · /고소 @닉 [1|2] 사유 (부적절한 행동)', (a, c) => {
  if (a[0] === '취소') return req('unsue', { who: a[1] });
  if (a[0]) return req('sue', { who: a[0], lv: /^[12]$/.test(a[1] || '') ? a[1] : 1, why: a.slice(/^[12]$/.test(a[1] || '') ? 2 : 1).join(' ') });
  const mineL = S.suit.filter((x) => x.by === me()), onMe = S.suit.filter((x) => x.who === me());
  if (!mineL.length && !onMe.length) return c.say('고소한 것도, 고소당한 것도 없어요');
  for (const x of mineL) c.say(`📝 내가 고소: ${x.who} · ${stars(x.lv)} · ${GRADE[Math.min(WMAX, x.lv)]} · ${x.why}  (/고소 취소 @${x.who})`);
  for (const x of onMe) c.say(`⚠ 나를 고소: ${x.by} · ${stars(x.lv)} · ${GRADE[Math.min(WMAX, x.lv)]} · ${x.why}`);
}, { everyone: true });
CB.command('체포', '🔗 체포는 수갑으로 — 경찰 쪽 팀이 수배자 · 무법자를 수갑으로 치면 체포돼요', (a, c) => c.say('🔗 이제 체포는 수갑으로 해요 — 경찰 쪽 팀(경찰 · 군사경찰 · 장교 · MP사령관 · 총사령관)이 수배자나 🏴 무법자를 수갑으로 치면 바로 체포돼요 (벌금 · 징역)'), { everyone: true });
CB.on('cuffed', (by, on) => { if (on) req('cuffed', { by }); }); // 🔗 내가 수갑에 채워짐 → 방장에게 (체포인지 방장이 판단)
CB.command('감옥', '/감옥 — 수감자 목록 · /감옥 설정 (지금 자리를 감옥으로) · /감옥 설정 초기화 · /감옥 가기 · /감옥 나가기', (a, c) => {
  if (a[0] === '설정') return req('jailpos', a[1] === '초기화' ? { reset: 1 } : { ...pos(), dim: CB.dimNow() });
  if (a[0] === '가기' || a[0] === '나가기') {
    if (!(CB.isOp() || isLaw(me()))) return c.say('감옥 차원은 경찰(CP) · 군사경찰(CMP) · 장교(Officer) · MP사령관 · 총사령관나 OP만 드나들 수 있어요');
    if (S.jail[me()]) return c.say('수감 중에는 나갈 수 없어요');
    if (a[0] === '가기' && S.annex && S.town && !S.jailPos) { if (CB.dimNow() !== 'over') CB.goDim('over', S.town.x - 154.5, S.town.y + 0.2, S.town.z - 10.5); else CB.tp(S.town.x - 154.5, S.town.y + 0.2, S.town.z - 10.5); return c.say('⛓ 5사단 교도소 복도로 가요 (교도관: 군사경찰 · 경찰)'); }
    if (a[0] === '가기') { CB.goDim('감옥'); return c.say('⛓ 감옥 차원으로 가요'); }
    if (CB.dimNow() !== '감옥') return c.say('지금 감옥 차원에 있지 않아요');
    CB.goDim('over'); return c.say('프론티어로 돌아가요');
  }
  const L = Object.entries(S.jail);
  if (!L.length) return c.say('지금 수감 중인 사람이 없어요');
  for (const [n, s] of L) c.say(`⛓ ${n} · 남은 시간 ${Math.ceil(s / 60)}분`);
}, { everyone: true });
CB.command('석방', '/석방 @닉 (장교(Officer) 이상 · OP)', (a) => req('release', { who: a[0] }), { everyone: true });

// ── 1초마다: 닉네임표 · 안내판 · 기지 부활 자리 · 체력 훈련 거리 · 수배 · 감옥 ──
let saveJailT = 0, jailFrom = null, jailGoT = 0;
let payT = 0, curfewT = 0, baseGrace = 0, saveLeaveT = 0, inBaseP = null, aimN = '', aimS = 0, lastTeam = '', gunRepT = 0, townSpawnK = '', acc = 0, tagged = new Set(), spawnKey = '', ranD = 0, lastP = null, ranSent = '';
let dcT = 5;
CB.onTick((dt) => {
  if (noteT > 0 && (noteT -= dt) <= 0) CB.hud('orgmsg', null);
  if ((dcT -= dt) <= 0) { dcT = 60; const n = me(), cm = !!(CB.community && CB.community()); if (n && (!!S.dc[n] !== !!CB.discord() || !!S.cm[n] !== cm)) req('dc', { c: cm ? 1 : 0 }); } // 🎖 디스코드 서버에 들어와 있으면 멤버 · 아니면 게스트
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
  try { signTick(); } catch (e) { console.warn('조직 간판 오류', e); if (CB.report) CB.report('조직 간판', e); }
  if ((dealerT -= 1) <= 0) { dealerT = 3; try { dealerTick(); recruiterTick(); } catch (e) { console.warn('조직 NPC 오류', e); if (CB.report) CB.report('조직 NPC', e); } }
  examTick();
  deliveryTick();
  if (CB.isHost()) for (const n in S.m) if (S.m[n].o === OUTLAW && !S.jail[n] && !(S.w[n] && S.w[n].lv >= WMAX)) crime(n, WMAX, '🏴 무법자 (자동)'); // 무법자 팀은 언제나 ★★★
  if ((townT -= 1) <= 0) { townT = 5; try { townTick(); } catch (e) { console.warn('도시 짓기 오류', e); if (CB.report) CB.report('조직 도시', e); } }
  // 방장: 접속해 있는 수감자의 남은 시간을 줄임 (나가 있는 동안은 멈춤)
  if (CB.isHost()) {
    const on = CB.players();
    let ch = false;
    for (const n of Object.keys(S.jail)) if (on.includes(n)) { S.jail[n]--; ch = true; if (S.jail[n] <= 0) { delete S.jail[n]; CB.say(`🔓 ${n} 님 형기를 마치고 석방됐어요`); } }
    let lch = false; // 🪪 외출 시간: 접속해 있는 동안만 줄어듦 · 나가 있는데 시간이 끝나면 무단탈영
    for (const n of Object.keys(S.leave)) if (on.includes(n)) {
      const v = S.leave[n]; v.sec = (v.sec == null ? 600 : v.sec) - 1; lch = true;
      if (v.sec === 60 && v.out) tell(n, '⏰ 외출 시간이 1분 남았어요 · 군부대로 돌아오세요');
      if (v.sec > 0) continue;
      delete S.leave[n]; if (v.vac) S.vacT[n] = Date.now(); save();
      const P = CB.playerPos ? CB.playerPos(n) : null, inBase = !!(P && S.town && inBaseD(Math.floor(P.x) - S.town.x, Math.floor(P.z) - S.town.z));
      if (v.out && v.vac && inBase && ARMY.includes(teamOf(n))) crime(n, 1, '휴가 복귀 미신고'); // 돌아왔는데 복귀 상담원에게 신고 안 함 → 수갑대상
      else if (v.out && ARMY.includes(teamOf(n)) && !CB.opOf(n)) desert(n, `무단탈영 (${v.vac ? '휴가' : '외출'} 시간 초과)`); else tell(n, `🪪 ${v.vac ? '휴가' : '외출 허가'} 시간이 끝났어요`);
    }
    if (++payT >= 600) { // 💰 월급 (10분마다 · 접속 중인 사람) → 통장: 경찰 · 군대는 계급만큼 · 시민은 직업이 있으면
      payT = 0;
      for (const n of on) {
        const o = teamOf(n), v = o === OUTLAW || o === PRISONER ? 0 : o === '시민' ? (S.job[n] ? JOB_SALARY : 0) : 3 + ORGS[o].lv;
        if (!v) continue;
        S.bank[n] = bal(n) + v; tell(n, `💰 월급 동전 ${v}개가 통장에 들어왔어요 · 통장 ${bal(n)}개`);
      }
      save();
    }
    if (lch && ++saveLeaveT >= 5) { saveLeaveT = 0; save(); }
    if (ch && (++saveJailT >= 5 || !Object.keys(S.jail).length)) { saveJailT = 0; save(); }
  }
  // 머리 위: 닉네임 (팀 색) → 계급 → 🚨 지명수배 / ⛓ 수감 · 몸에는 팀 복장
  const now = new Set(), names = new Set([...Object.keys(S.m), ...Object.keys(S.w), ...Object.keys(S.jail), ...Object.keys(S.job), ...CB.players(), ...(ownerNick() ? [ownerNick()] : [])]);
  for (const n of names) {
    const o = teamOf(n), y = o !== '시민', W = S.w[n], jb = jobOf(n);
    const sub = S.jail[n] ? '⛓ 수감 중' : W ? '🚨 ' + stars(W.lv) : '';
    const rk = rankOf(n);
    CB.tag(n, '', y ? ORGS[o].color : '#ffffff', { rank: y ? `${ORGS[o].ico} ${tagOf(o)}${rk ? ' · ' + rk : ''}` : jb ? `${JOBS[jb].ico} ${jb} · ${rk}` : rk, rankColor: y ? ORGS[o].color : jb ? '#ffe9a8' : '#cfcfcf', sub, subColor: '#ff4a4a' });
    if (CB.outfit) { const O = OUTFITS[o], r = mrOf(n); CB.outfit(n, O ? { ...O, stripes: r >= 14 ? 3 : r >= 11 ? 2 : r >= 4 ? 1 : 0, div: DIVS[o] || '' } : null); } // 🎖 정복 소매 금줄: 병 0 · 부사관 · 위관 1 · 영관 2 · 장성 3 · 왼팔 사단 마크
    now.add(n);
  }
  for (const n of tagged) if (!now.has(n)) { CB.tag(n); if (CB.outfit) CB.outfit(n, null); }
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
    baseGrace = 20; // 군부대에서 잡혔다 풀려난 사람이 바로 침입으로 잡히지 않게
    note('🔓 풀려났어요 — 원래 있던 곳으로 돌아가요');
  } else if (CB.dimNow() === '감옥' && !(CB.isOp() || isLaw(me())) && (jailGoT -= 1) <= 0) { jailGoT = 4; CB.goDim('over'); } // 수감자가 아닌데 감옥 차원에 있으면 (새로고침 등) 프론티어로
  const y = mine(), W = S.w[me()];
  { // 🏴 시민이 입대 없이 군부대에 들어가면 무법자 (전역 · 강등으로 막 시민이 됐으면 정문 밖으로 내보냄)
    const TW = S.town, p = pos();
    if (baseGrace > 0) baseGrace--;
    if (TW && y.o === '시민' && CB.dimNow() === 'over' && !CB.isOp()) {
      const dx = Math.floor(p.x) - TW.x, dz = Math.floor(p.z) - TW.z, inside = inBaseD(dx, dz);
      if (inside && lastTeam && ARMY.includes(lastTeam)) { inBaseP = null; CB.tp(TW.x - 20 + 0.5, TW.y + 0.2, TW.z + 0.5); note('🎖 전역했어요 · 군부대 밖으로 나왔어요'); }
      else if (inside && baseGrace <= 0) req('trespass');
      else if (!inside && dx >= -21 && dx <= -17 && Math.abs(dz) <= 3) note('⚠ 입대하지 않고 군부대에 들어가면 🏴 무법자가 돼요 · 입대는 옆 건물 상담원에게');
    }
  }
  { // 🪖 무단탈영: 군대 팀이 걸어서 군부대 밖으로 나가면 (정문의 빨간 선) · 순간이동 · OP는 빼고
    const TW = S.town, p = pos();
    if (TW && ARMY.includes(y.o) && CB.dimNow() === 'over' && !CB.isOp()) {
      const dx = Math.floor(p.x) - TW.x, dz = Math.floor(p.z) - TW.z, inside = inBaseD(dx, dz);
      if (inBaseP && !inside && Math.hypot(p.x - inBaseP.x, p.z - inBaseP.z) < 20) req('desert');
      inBaseP = inside ? { x: p.x, z: p.z } : null;
      const pass = S.leave[me()];
      if (inside && pass && pass.out && !pass.vac) req('pass-back');
      if (inside && pass && pass.out && pass.vac && Date.now() > vacNoteT) { vacNoteT = Date.now() + 20000; note('🏖 휴가에서 돌아왔으면 정문 안쪽의 🪖 복귀 상담원에게 신고하세요 (안 하면 휴가 시간이 끝날 때 수갑대상)'); }
      if (inside && !pass && dx >= -26 && Math.abs(dz) <= 5) note('⚠ 앞의 빨간 선을 넘으면 무단탈영이에요 (지명수배 ★★★) · 나가려면 장교의 /외출 허가나 입대소의 휴가 상담원');
    } else inBaseP = null;
  }
  { // 🌙 생활규칙: 밤에는 경찰은 경찰서 구역, 군대는 군부대 안 (군대는 외출 허가가 있으면 예외) · 밖에 60초 넘게 있으면 수갑대상
    const TW = S.town, p = pos(), army = ARMY.includes(y.o);
    if (TW && (army || y.o === '경찰') && nightNow() && CB.dimNow() === 'over' && !CB.isOp() && !S.jail[me()]) {
      const dx = Math.floor(p.x) - TW.x, dz = Math.floor(p.z) - TW.z;
      const home = army ? inBaseD(dx, dz) : dx >= 20 && dx <= 36 && dz >= -17 && dz <= 18;
      if (home || W || (army && S.leave[me()])) curfewT = 0;
      else if (++curfewT <= 60) note(`🌙 생활규칙: 밤에는 ${army ? '군부대' : '경찰서'}로 돌아가야 해요 · ${61 - curfewT}초 뒤 수갑대상`);
      else if (curfewT === 61) req('curfew');
      else if (curfewT > 70) curfewT = 60;
    } else curfewT = 0;
  }
  { // 🔫 총: 팀에서 시민으로 내려오거나 감옥에 가면 총을 반납 · 시민이 총을 가지면 불법 무기 소지 (무법자)
    const t = y.o, hasGun = GUNS.some((g) => CB.has(g) > 0);
    if (hasGun && CB.take && ((t === '시민' && lastTeam && lastTeam !== '시민' && !ORGS[lastTeam].special) || t === PRISONER)) {
      for (const g of GUNS) { const n = CB.has(g); if (n) CB.take(g, n); }
      note(t === PRISONER ? '⛓ 감옥에 들어가며 총을 빼앗겼어요' : '🔫 시민이 되어 총을 반납했어요');
    } else if (hasGun && t === '시민' && lastTeam && (gunRepT -= 1) <= 0) { gunRepT = 10; req('gun'); }
    lastTeam = t;
  }
  if (CB.bgm) CB.bgm(W && !J ? 'wanted' : 'calm', 5); // 🚨 지명수배 중이면 나한테만 수배 음악 (등급과 상관없이 가장 긴장되는 5단계 곡 하나)
  if (CB.aimAt) { const tg = CB.aimAt(); if (tg && tg === aimN) { if (++aimS === 2) req('threat', { who: tg }); } else { aimN = tg; aimS = tg ? 1 : 0; } } // 🔫 총으로 2초 겨누면 무기로 협박
  let h = '';
  {
    const O = ORGS[y.o], hm = myHouse(me()), b = S.base[y.o] || (hm && hm.door), k = b ? JSON.stringify(b) : 'none';
    if (k !== spawnKey) { spawnKey = k; if (CB.setRespawn) CB.setRespawn(b ? b.x : null, b ? b.y + 0.2 : 0, b ? b.z : 0); else if (b) CB.setSpawn(b.x, b.y + 0.2, b.z); } // 부활: 팀 기지 → 내 집 → 도시 한가운데
    if (S.town && townSpawnK !== S.town.x + ',' + S.town.z) { townSpawnK = S.town.x + ',' + S.town.z; CB.setSpawn(S.town.x + 0.5, S.town.y + 0.1, S.town.z + 0.5); } // 🏙 세계 스폰 = 도시 한가운데
    const on = orgNameOf(y.o), jb = jobOf(me());
    const rk = rankOf(me());
    h = `<span style="color:${O.color}">${O.ico} <b>${on ? on + ' ' : ''}${esc(tagOf(y.o))}</b></span>${rk ? ` · 🎖 <b>${rk}</b>` : ''} · ${y.p || 0}점`;
    h += `<br>🏦 통장 ${bal(me())}개${jb ? ` · ${JOBS[jb].ico} ${jb}` : ''}`;
    if (DEL) h += `<br>📦 배달: <b>${esc(DEL.n)}</b> (${Math.round(Math.hypot(DEL.x - pos().x, DEL.z - pos().z))}칸)`;
    if (O.lv > 0) for (const mo in S.mission) if (ORGS[mo] && ORGS[mo].lv >= O.lv) h += `<br>📋 임무 (${esc(mo)}): ${esc(S.mission[mo])}`;
    if (S.train && inTrain(me(), S.train) && Date.now() < S.train.until) h += `<br>🎯 훈련(${S.train.kind}) ${Math.ceil((S.train.until - Date.now()) / 1000)}초` + (S.train.kind === '체력' ? ` · ${Math.min(200, ranD | 0)}/200칸` : '');
  }
  if (EX) h += `${h ? '<br>' : ''}📝 ${EX.kind === 'shoot' ? `🎯 사격 시험 ${EX.hits}/5 · <b>${['왼쪽', '가운데', '오른쪽'][EX.t]} 과녁</b>을 맞혀요` : '🦘 점프 시험'} · ${EX.sec}초`;
  if (S.leave[me()] && ARMY.includes(y.o)) h += `${h ? '<br>' : ''}${S.leave[me()].vac ? '🏖 휴가' : '🪪 외출'} ${S.leave[me()].out ? '중' : '허가됨'} · 남은 시간 ${mmss(S.leave[me()].sec || 0)} (${esc(S.leave[me()].by)})`;
  if (W) h += `${h ? '<br>' : ''}<span style="color:#ff5a5a">🚨 <b>${stars(W.lv)}</b> · ${GRADE[Math.min(WMAX, W.lv)]} (${esc(W.why)})</span>`;
  if (J > 0) h += `${h ? '<br>' : ''}⛓ <b>수감 중</b> · ${Math.floor(J / 60)}분 ${J % 60}초 남음`;
  CB.hud('org', h || null);
});
