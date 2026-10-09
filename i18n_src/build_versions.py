# 옛 버전 게임 파일 만들기: git 기록에서 각 버전(v26.N)의 마지막 커밋을 꺼내 versions/v26.N/index.html 로 저장
# 런처에서 옛 버전을 고르면 이 파일로 실행. 이 버전에 없는 아이템·블록은 잠시 숨기고(최신 세계는 그대로) 실행함
import subprocess,os,re,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def git(*a):return subprocess.run(['git',*a],cwd=ROOT,capture_output=True).stdout
log=git('log','--format=%h %s').decode('utf-8','replace').splitlines()
M={}
for line in log: # 최신 커밋부터 → 버전마다 처음 만난 커밋이 그 버전의 마지막 모습
    m=re.match(r'([0-9a-f]+) v26\.(\d+)\b',line)
    if m and not line.split(' ',1)[1].startswith('v26.3.0'):M.setdefault(int(m.group(2)),m.group(1))
EARLY={1:'16e4aa4',2:'a246b69',3:'a246b69',4:'a246b69',5:'7157d38',6:'b1bd90e',7:'56b51e8'} # 버전 번호를 붙이기 전 커밋
for k,v in EARLY.items():M[k]=v
latest=max(M)
SHIM=r'''<script>/* 옛 버전 실행기: 이 버전에 없는 아이템 · 블록은 잠시 숨김 (최신 버전의 세계는 그대로) */
(function(){try{if(typeof startWorld!=='function')return;var _sw=startWorld;
startWorld=function(sv,ok){try{if(sv){if(typeof fromPortable==='function')sv=fromPortable(sv);
 var hasI=function(id){try{return id>0&&!!info(id);}catch(e){return false;}},hasB=function(id){return id===0||(typeof BL!=='undefined'&&!!BL[id]);};
 var fx=function(a){return (a||[]).map(function(s){return s&&hasI(s.id)?s:null;});};
 sv.inv=fx(sv.inv);if(sv.armor)sv.armor=fx(sv.armor);
 if(sv.md)for(var d in sv.md)for(var k in sv.md[d]){var a=sv.md[d][k];if(a&&a.length)for(var i=1;i<a.length;i+=2)if(!hasB(a[i]))a[i]=0;}
 if(sv.containers)for(var c in sv.containers){var C=sv.containers[c];if(Array.isArray(C))sv.containers[c]=fx(C);else if(C&&Array.isArray(C.slots))C.slots=fx(C.slots);}
 sv.items=(sv.items||[]).filter(function(it){return it&&it.s&&hasI(it.s.id);});}}catch(e){}return _sw(sv,ok);};}catch(e){}})();</script>
'''
made=[]
for n in sorted(M):
    if n==latest:continue # 최신 버전은 게임 그대로
    html=git('show',M[n]+':index.html').decode('utf-8','replace')
    if '</body>' not in html:continue
    i=html.rindex('</body>');html=html[:i]+SHIM+html[i:]
    d=os.path.join(ROOT,'versions',f'v26.{n}');os.makedirs(d,exist_ok=True)
    open(os.path.join(d,'index.html'),'w',encoding='utf-8',newline='\n').write(html)
    made.append(n)
print('latest v26.%d · made %d versions: %s'%(latest,len(made),' '.join(map(str,made))))
