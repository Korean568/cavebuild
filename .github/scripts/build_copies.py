# 배포할 때 index.html 에서 모드 복사본 · 버전 안내 페이지를 만듦 (로컬 배포 스크립트와 같은 내용)
import os, sys

prev = sys.argv[1]
raw = open('index.html', 'rb').read()
g = raw.decode('utf-8').replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="../">', 1)
MODES = ['noejeol', 'speedrun', '멀티', '할로윈', '크리스마스', '설날', '개학', '만우절', '한글날', '어린이날', '현충일', '제헌절', '광복절', '추석', '농업인의날']
for m in MODES:
    os.makedirs(m, exist_ok=True)
    open(m + '/index.html', 'wb').write(g.replace('<base href="../">', '<base href="../">\n<meta name="cavebuild-mode" content="' + m + '">', 1).encode('utf-8'))
STUB = '''<!doctype html><html><head><meta charset="utf-8"><title>CAVEBUILD</title>
<script>try{sessionStorage.setItem('cb-play','1');}catch(e){}location.replace('../../?play=1');</script></head>
<body style="background:#111;color:#fff;font-family:sans-serif">Loading the latest version… <a href="../../?play=1" style="color:#8cf">CAVEBUILD</a></body></html>
'''
os.makedirs(f'versions/v26.{prev}', exist_ok=True)
open(f'versions/v26.{prev}/index.html', 'w', encoding='utf-8').write(STUB)
print('built', len(MODES), 'copies')
