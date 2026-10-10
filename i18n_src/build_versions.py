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
