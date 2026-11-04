# 🛡 검문: 클라우드 Claude가 claude/ 브랜치에 올린 수정을 메인 브랜치의 이 코드로 검사하고, 통과한 것만 배포
# 브랜치의 코드는 절대 실행하지 않음 (글자로만 읽음 · 문법 검사도 컴파일만) → 브랜치에서 검문을 고쳐도 소용없음
import os, re, subprocess, sys, tempfile

ALLOWED = {'index.html', '서버모드/조직.js'}
MAX_LINES, MAX_GROW, DEPLOY_CAP = 40, 6000, 3
DRY = os.environ.get('GUARD_DRY') == '1'
# 추가된 줄에서 늘어나면 안 되는 것 (원래 있던 긴 줄을 고쳐도 걸리지 않게 개수로 비교)
FORBIDDEN = ['fetch(', 'XMLHttpRequest', 'WebSocket', 'sendBeacon', 'EventSource', 'eval(', 'new Function', 'import(', 'importScripts',
             '<script', '<iframe', '<embed', '<object', 'document.cookie', 'document.write', 'localStorage', 'sessionStorage', 'indexedDB',
             'accToken', 'token', 'password', 'http://', 'https://', '//cdn', 'atob(', 'btoa(', 'fromCharCode', 'innerHTML', 'outerHTML', 'insertAdjacentHTML',
             'navigator.', 'location.', 'window[', 'globalThis', 'createElement', 'setAttribute', 'onerror', 'onload', 'crypto.', 'wdSend', 'WD_URL', 'MP_RELAY', 'ACCOUNT_API', 'cbApi']
ODD = [r'\\x[0-9a-fA-F]{2}', r'\\u[0-9a-fA-F]{4}', r'[A-Za-z0-9+/=]{100,}']


def run(*a, check=True, inp=None):
    r = subprocess.run(a, capture_output=True, input=inp)
    if check and r.returncode:
        raise RuntimeError(' '.join(a[:3]) + ': ' + r.stderr.decode('utf-8', 'replace')[:300])
    return r.stdout.decode('utf-8', 'replace')


def inspect(branch):
    """문제 목록을 돌려줌 (비어 있으면 통과)."""
    bad = []
    ref = 'origin/' + branch
    base = run('git', 'merge-base', 'origin/main', ref).strip()
    names = [n for n in run('git', '-c', 'core.quotepath=off', 'diff', '--name-only', base, ref).splitlines() if n]
    if not names:
        return ['바뀐 파일이 없어요']
    for n in names:
        if n not in ALLOWED:
            bad.append('허용되지 않은 파일: ' + n[:80])
    if bad:
        return bad
    diff = run('git', 'diff', '--no-color', '--unified=0', base, ref, '--', *names)
    add = [l[1:] for l in diff.splitlines() if l.startswith('+') and not l.startswith('+++')]
    rem = [l[1:] for l in diff.splitlines() if l.startswith('-') and not l.startswith('---')]
    if len(add) > MAX_LINES or len(rem) > MAX_LINES:
        bad.append(f'바뀐 줄이 너무 많아요 (+{len(add)} -{len(rem)}, 한도 {MAX_LINES})')
    grow = sum(map(len, add)) - sum(map(len, rem))
    if grow > MAX_GROW:
        bad.append(f'코드가 너무 많이 늘었어요 ({grow}자, 한도 {MAX_GROW})')
    a, r = '\n'.join(add), '\n'.join(rem)
    for t in FORBIDDEN:
        if a.count(t) > r.count(t):
            bad.append('금지된 코드가 늘었어요: ' + t)
    for p in ODD:
        if len(re.findall(p, a)) > len(re.findall(p, r)):
            bad.append('숨긴 글자처럼 보이는 코드가 늘었어요: ' + p)
    live = open('index.html', encoding='utf-8').read()
    m = int(re.search(r'🆕 v26\.(\d+)', live).group(1))
    with tempfile.TemporaryDirectory() as d:
        gp, mp, jp, wp = d + '/g.html', d + '/m.js', d + '/all.js', d + '/mod.js'
        game = subprocess.run(['git', 'show', ref + ':index.html'], capture_output=True).stdout
        mod = subprocess.run(['git', 'show', ref + ':서버모드/조직.js'], capture_output=True).stdout
        open(gp, 'wb').write(game)
        open(mp, 'wb').write(mod)
        open(wp, 'wb').write(mod)
        text = game.decode('utf-8', 'replace')
        tags = re.findall(r'🆕 v26\.(\d+)', text)
        if tags != [str(m + 1)] * 2:
            bad.append(f'업데이트 목록은 🆕 v26.{m + 1} 두 곳(한국어 · 영어)만 있어야 해요')
        s = subprocess.run(['node', '.github/scripts/syntax_check.js', gp, mp, jp], capture_output=True, text=True)
        if s.returncode:
            bad.append('문법 오류: ' + s.stdout[:200])
        else:
            for f in (jp, wp):
                e = subprocess.run(['npx', '--yes', 'eslint@8', '--no-eslintrc', '-c', '.github/scripts/eslint.json', '--format', 'unix', f], capture_output=True, text=True)
                if e.returncode:
                    bad.append('없는 이름을 쓰는 코드: ' + re.sub(r'/[^ ]*/', '', e.stdout)[:300])
    since = run('git', 'log', 'origin/main', '--since=24 hours ago', '--grep=자동 수리', '--format=%h').split()
    if len(since) >= DEPLOY_CAP:
        bad.append(f'24시간 자동 배포 한도({DEPLOY_CAP}번)를 넘었어요')
    return bad


def flag(branch, sha, reasons):
    title = f'[guard] {branch[:60]} {sha[:7]}'
    old = run('gh', 'issue', 'list', '--state', 'all', '--label', 'watchdog-guard', '--limit', '100', '--json', 'title')
    if title in old:
        return
    body = '자동 수리가 검문을 통과하지 못해서 배포하지 않았어요.\n\n' + '\n'.join('- ' + x.replace('`', "'") for x in reasons)
    run('gh', 'issue', 'create', '--title', title, '--body', body, '--label', 'watchdog-guard,needs-human')


def deploy(branch):
    m = int(re.search(r'🆕 v26\.(\d+)', open('index.html', encoding='utf-8').read()).group(1))
    run('git', 'config', 'user.name', 'github-actions[bot]')
    run('git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com')
    run('git', 'merge', '--squash', 'origin/' + branch)
    run('python3', '.github/scripts/build_copies.py', str(m))
    run('git', 'add', '-A')
    run('git', 'commit', '-m', f'v26.{m + 1} 🤖 자동 수리 (검문 통과: {branch[:60]})\n\nCo-Authored-By: Claude <noreply@anthropic.com>')
    run('git', 'push', 'origin', 'HEAD:main')
    run('git', 'push', 'origin', '--delete', branch, check=False)
    run('gh', 'api', '-X', 'POST', 'repos/' + os.environ['GITHUB_REPOSITORY'] + '/pages/builds', check=False)
    code = re.search(r'[ES]-[0-9A-Z+]{1,10}', branch)
    if code:
        L = run('gh', 'issue', 'list', '--state', 'open', '--label', 'auto-fix', '--search', code.group(0) + ' in:title', '--json', 'number')
        for n in re.findall(r'"number":(\d+)', L):
            run('gh', 'issue', 'close', n, '--comment', f'v26.{m + 1} 로 자동 수리했어요.', check=False)


def main():
    run('git', 'fetch', 'origin', '+refs/heads/claude/*:refs/remotes/origin/claude/*', check=False)
    L = run('git', 'for-each-ref', '--format=%(refname:strip=3) %(objectname)', 'refs/remotes/origin/claude/').splitlines()
    print('claude/ 브랜치', len(L), '개')
    for line in L:
        if line.count(' ') != 1:
            continue
        branch, sha = line.split(' ')
        branch = 'claude/' + branch if not branch.startswith('claude/') else branch
        bad = inspect(branch)
        print(branch, '→', '통과' if not bad else bad)
        if bad:
            flag(branch, sha, bad)
        elif not DRY:
            deploy(branch)
            break  # 한 번 실행에 배포 1번까지


if __name__ == '__main__':
    try:
        main()
    except RuntimeError as e:
        sys.exit(str(e))
