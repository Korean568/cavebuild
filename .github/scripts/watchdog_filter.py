# 👁 감시 봇 1단계: 서버 보고를 걸러서 GitHub 이슈로 (Claude 사용량 0)
# 보고는 누구나 보낼 수 있어서 믿지 않음. 정해진 오류 문장 · 게임 코드에 실제로 있는 함수만 통과시키고
# 이슈 내용은 이 스크립트가 다시 씀 → 자유 글(명령처럼 쓴 글)은 Claude에게 닿지 않음
import json, re, subprocess, sys, urllib.request
from datetime import datetime, timedelta, timezone

REPORTS = 'https://cavebuild-mp.zombie-killer-match.workers.dev/reports'
WAKE_CAP = 3  # 24시간에 Claude를 깨우는 최대 횟수
ERROR_FORMS = [
    r"Cannot read properties of (undefined|null) \(reading '[\w$]{1,40}'\)",
    r"Cannot set properties of (undefined|null) \(setting '[\w$]{1,40}'\)",
    r"[\w$.]{1,60} is not a function",
    r"[\w$.]{1,60} is not defined",
    r"[\w$.]{1,60} is not iterable",
    r"[\w$.]{1,60} is not a constructor",
    r"Cannot access '[\w$]{1,40}' before initialization",
    r"Assignment to constant variable\.",
    r"Maximum call stack size exceeded",
    r"Invalid array length",
]
MOD_WHERE = ['조직 간판', '조직 NPC', '조직 도시', '조직 로드']
SECTIONS = {'idle', 'player', 'mobs', 'spawn', 'world', 'sky', 'hand+mods', 'chunks', 'render', 'net'}
FRAME = re.compile(r'at (?:([\w$.]{1,60}) \()?([\w?=.%/-]{0,40}):(\d{1,6}):(\d{1,6})\)?')


def gh(*args):
    r = subprocess.run(['gh', *args], capture_output=True, text=True)
    if r.returncode:
        sys.exit('gh 실패: ' + r.stderr[:300])
    return r.stdout


def clean_row(row, game, lines):
    """통과하면 다시 쓴 안전한 내용, 아니면 None."""
    m = re.fullmatch(r'\[(E-[0-9A-F]{4}|S-[A-Z+]{1,10})\] (.{1,240})', str(row.get('m', '')))
    if not m:
        return None
    code, text = m.groups()
    k = row.get('k')
    n = int(row.get('n') or 1)
    mp = row.get('mp') if row.get('mp') in ('solo', 'host', 'guest') else '?'
    sec = row.get('sec') if row.get('sec') in SECTIONS else '?'
    if k == 'stall':
        at = re.fullmatch(r'main thread blocked over 8s, last section ([\w+]{1,10})', text)
        if not at or at.group(1) not in SECTIONS or n < 3:
            return None
        return {'code': code, 'k': k, 'msg': f'8초 넘는 멈춤 (구간 {at.group(1)})', 'n': n, 'mp': mp, 'sec': at.group(1), 'frames': [], 'auto': False}
    where = ''
    if k == 'mod':
        for w in MOD_WHERE:
            if text.startswith(w + ': '):
                where, text = w, text[len(w) + 2:]
                break
        else:
            return None
    elif k != 'error':
        return None
    text = re.sub(r'^(Uncaught )?(TypeError|ReferenceError|RangeError|SyntaxError): ', '', text)
    if not any(re.fullmatch(f, text) for f in ERROR_FORMS):
        return None
    frames = []
    for name, file, line, col in FRAME.findall(str(row.get('s', ''))):
        if int(line) > lines or not (file.startswith('?play') or file.startswith('index.html') or file.startswith('<anonymous>') or 'eval' in file):
            continue
        if name and not re.search(r'\b' + re.escape(name.split('.')[-1]) + r'\b', game):
            continue
        if file.startswith(('?play', 'index.html')):
            frames.append(f"{name or '(이름 없음)'} : 줄 {line}")
    if k == 'error' and not frames:
        return None  # 게임 코드에서 난 오류라는 증거가 없음
    return {'code': code, 'k': k, 'msg': (where + ': ' if where else '') + text, 'n': n, 'mp': mp, 'sec': sec, 'frames': frames[:6], 'auto': True}


def main():
    game = open('index.html', encoding='utf-8').read()
    mod = open('서버모드/조직.js', encoding='utf-8').read()
    ver = re.search(r'🆕 v26\.(\d+)', game).group(1)
    req = urllib.request.Request(REPORTS, headers={'User-Agent': 'cavebuild-watchdog-bot'})
    rows = json.load(urllib.request.urlopen(req, timeout=30))
    rows = [r for r in rows if r.get('v') == '26.' + ver]
    seen = json.loads(gh('issue', 'list', '--state', 'all', '--label', 'watchdog', '--limit', '200', '--json', 'title,createdAt,labels'))
    titles = {i['title'] for i in seen}
    now = datetime.now(timezone.utc)
    wakes = sum(1 for i in seen if any(l['name'] == 'auto-fix' for l in i['labels']) and now - datetime.fromisoformat(i['createdAt'].replace('Z', '+00:00')) < timedelta(hours=24))
    dropped = made = 0
    for row in rows:
        c = clean_row(row, game + mod, game.count('\n') + 3)
        if not c:
            dropped += 1
            continue
        title = f"[watchdog] v26.{ver} {c['code']}"
        if title in titles:
            continue
        auto = c['auto'] and wakes < WAKE_CAP
        labels = ['watchdog', 'auto-fix' if auto else 'needs-human']
        body = '\n'.join([
            '감시 봇이 만든 이슈예요. 아래 내용은 봇이 형식을 검사하고 다시 쓴 거예요.', '',
            f"- 코드: `{c['code']}`", f"- 종류: `{c['k']}`", f"- 오류: `{c['msg']}`", f"- 횟수: {c['n']}",
            f"- 게임 모드: `{c['mp']}`", f"- 구간: `{c['sec']}`", f"- 버전: `v26.{ver}`", '',
            '호출 위치 (index.html):', *[f'- `{x}`' for x in c['frames']], '',
            '자동 수리 대상이에요.' if auto else '사람이 확인해 주세요 (자동 수리 대상이 아니거나 24시간 한도를 넘었어요).',
        ])
        gh('issue', 'create', '--title', title, '--body', body, '--label', ','.join(labels))
        titles.add(title)
        made += 1
        wakes += 1 if auto else 0
    print(f'보고 {len(rows)}건 · 새 이슈 {made}건 · 걸러 냄 {dropped}건 · 24시간 깨움 {wakes}/{WAKE_CAP}')


if __name__ == '__main__':
    main()
