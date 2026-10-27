# 옛 버전 주소(versions/v26.N/): 이제 어떤 버전이든 무조건 최신 버전으로 바뀜 (v26.62~)
# 예전 링크 · 즐겨찾기로 들어와도 최신 게임으로 넘어가도록 작은 안내 페이지만 남김
import os,re,shutil,subprocess
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
log=subprocess.run(['git','log','--format=%s'],cwd=ROOT,capture_output=True).stdout.decode('utf-8','replace').splitlines()
vers=sorted({int(m.group(1)) for l in log for m in [re.match(r'v26\.(\d+)\b',l)] if m and not l.startswith('v26.3.0')}|set(range(1,8)))
STUB='''<!doctype html><html><head><meta charset="utf-8"><title>CAVEBUILD</title>
<script>try{sessionStorage.setItem('cb-play','1');}catch(e){}location.replace('../../?play=1');</script></head>
<body style="background:#111;color:#fff;font-family:sans-serif">Loading the latest version… <a href="../../?play=1" style="color:#8cf">CAVEBUILD</a></body></html>
'''
for n in vers:
    d=os.path.join(ROOT,'versions',f'v26.{n}');os.makedirs(d,exist_ok=True)
    open(os.path.join(d,'index.html'),'w',encoding='utf-8',newline='\n').write(STUB)
print('stubs',len(vers))

# 뇌절모드: 같은 게임을 다른 주소(cavebuild/noejeol/)로 (상대 경로는 한 칸 위를 보게)
g=open(os.path.join(ROOT,'index.html'),encoding='utf-8').read()
g=g.replace('<meta charset="utf-8">','<meta charset="utf-8">\n<base href="../">',1)
os.makedirs(os.path.join(ROOT,'noejeol'),exist_ok=True)
open(os.path.join(ROOT,'noejeol','index.html'),'w',encoding='utf-8',newline='\n').write(g)
print('noejeol ok')
# 스피드런 모드: 같은 게임을 cavebuild/speedrun/ 으로 (디버그 화면 · 스톱워치 · 랭킹, 세계는 따로 저장)
os.makedirs(os.path.join(ROOT,'speedrun'),exist_ok=True)
open(os.path.join(ROOT,'speedrun','index.html'),'w',encoding='utf-8',newline='\n').write(g)
print('speedrun ok')
# 할로윈 모드는 이제 cavebuild/할로윈/ — 예전 주소(halloween/)는 새 주소로 넘김
os.makedirs(os.path.join(ROOT,'halloween'),exist_ok=True)
open(os.path.join(ROOT,'halloween','index.html'),'w',encoding='utf-8',newline='\n').write("""<!doctype html><html><head><meta charset="utf-8"><title>CAVEBUILD</title>
<script>location.replace('../'+encodeURIComponent('할로윈')+'/'+location.search+location.hash);</script></head><body style="background:#111;color:#fff">🎃 <a href="../할로윈/" style="color:#ffb44a">할로윈 모드</a></body></html>
""")
print('halloween stub ok')
# 🗓 이달의 모드: 같은 게임을 모드 주소마다 (게임이 주소로 모드를 알아내고, 세계는 모드마다 따로 저장) · 폴더 이름은 한국어
for ev in ['할로윈','크리스마스','설날','개학만우절','어린이날','현충일','제헌절','광복절','추석','농업인의날']:
    os.makedirs(os.path.join(ROOT,ev),exist_ok=True)
    open(os.path.join(ROOT,ev,'index.html'),'w',encoding='utf-8',newline='\n').write(g)
print('events ok')
